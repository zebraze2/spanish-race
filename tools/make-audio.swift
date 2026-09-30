// Records every spoken line in the game to audio/<id>.m4a with the best Apple
// voice installed on this Mac, and writes audio/manifest.json (the game plays
// those clips and falls back to the browser's voice for anything missing).
//
//   cd spanish-race && swift tools/make-audio.swift            # English + Spanish (if a good voice exists)
//   swift tools/make-audio.swift --lang en                      # just one language
//   swift tools/make-audio.swift --force                        # re-record everything
//
// Spanish is only recorded with an Enhanced/Premium voice (System Settings →
// Accessibility → Spoken Content → System voice → Manage Voices… → Spanish).
// [[ipa|spelling]] in a line is voiced from the IPA, so letter sounds are exact.
import AVFoundation
import Foundation
import JavaScriptCore

let args = CommandLine.arguments
let force = args.contains("--force")
let onlyLang: String? = args.firstIndex(of: "--lang").flatMap { $0 + 1 < args.count ? args[$0 + 1] : nil }
let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let audioDir = root.appendingPathComponent("audio")
guard FileManager.default.fileExists(atPath: root.appendingPathComponent("clips.js").path) else {
  print("Run this from the spanish-race folder."); exit(1)
}

// ---- load the clip catalog by running the game's own data files ----
let js = JSContext()!
js.exceptionHandler = { _, e in print("JS error:", e?.toString() ?? "?"); exit(1) }
js.evaluateScript("var window = this;")
for f in ["words.js", "english.js", "clips.js"] {
  js.evaluateScript(try! String(contentsOf: root.appendingPathComponent(f), encoding: .utf8))
}
let clipsJSON = js.evaluateScript("JSON.stringify(window.CLIPS)")!.toString()!
let clips = try! JSONSerialization.jsonObject(with: clipsJSON.data(using: .utf8)!) as! [String: [String: String]]

// ---- pick voices ----
func pickVoice(_ lang: String) -> AVSpeechSynthesisVoice? {
  let prefs = lang == "en" ? ["en-US"] : ["es-MX", "es-US", "es-419", "es-ES"]
  let voices = AVSpeechSynthesisVoice.speechVoices().filter { v in prefs.contains(v.language) && !v.identifier.contains("eloquence") && !v.identifier.contains("speech.synthesis") }
  func score(_ v: AVSpeechSynthesisVoice) -> Int {
    var s = v.identifier.contains("siri") ? 300 : 0
    s += v.quality == .premium ? 200 : v.quality == .enhanced ? 100 : 0
    s += (prefs.count - (prefs.firstIndex(of: v.language) ?? prefs.count)) * 10
    return s
  }
  guard let best = voices.max(by: { score($0) < score($1) }) else { return nil }
  if lang == "es" && best.quality == .default && !force { return nil } // compact Spanish voices sound robotic
  return best
}

// ---- manifest: skip clips already recorded with the same text + voice ----
let manifestURL = audioDir.appendingPathComponent("manifest.json")
var manifest: [String: Any] = (try? JSONSerialization.jsonObject(with: Data(contentsOf: manifestURL))) as? [String: Any] ?? [:]
var voicesUsed = manifest["voices"] as? [String: String] ?? [:]
var texts = manifest["texts"] as? [String: String] ?? [:]
try? FileManager.default.createDirectory(at: audioDir, withIntermediateDirectories: true)

let synth = AVSpeechSynthesizer()
func attributed(_ text: String) -> NSAttributedString {
  let out = NSMutableAttributedString()
  var rest = Substring(text)
  while let open = rest.range(of: "[["), let close = rest.range(of: "]]", range: open.upperBound..<rest.endIndex) {
    out.append(NSAttributedString(string: String(rest[rest.startIndex..<open.lowerBound])))
    let parts = rest[open.upperBound..<close.lowerBound].split(separator: "|", maxSplits: 1).map(String.init)
    let key = NSAttributedString.Key(AVSpeechSynthesisIPANotationAttribute)
    out.append(NSAttributedString(string: parts.count > 1 ? parts[1] : parts[0], attributes: [key: parts[0]]))
    rest = rest[close.upperBound...]
  }
  out.append(NSAttributedString(string: String(rest)))
  return out
}
func render(_ text: String, voice: AVSpeechSynthesisVoice, rate: Float, to caf: URL) -> Bool {
  let u = AVSpeechUtterance(attributedString: attributed(text))
  u.voice = voice; u.rate = rate
  var file: AVAudioFile?; var frames: AVAudioFrameCount = 0; var finished = false
  synth.write(u) { buf in
    guard let pcm = buf as? AVAudioPCMBuffer else { return }
    if pcm.frameLength == 0 { finished = true; return }
    if file == nil { file = try? AVAudioFile(forWriting: caf, settings: pcm.format.settings, commonFormat: pcm.format.commonFormat, interleaved: pcm.format.isInterleaved) }
    try? file?.write(from: pcm); frames += pcm.frameLength
  }
  let deadline = Date().addingTimeInterval(20)
  while !finished && Date() < deadline { RunLoop.current.run(until: Date().addingTimeInterval(0.02)) }
  file = nil
  return frames > 0
}
func toM4A(_ caf: URL, _ m4a: URL) -> Bool {
  let p = Process()
  p.executableURL = URL(fileURLWithPath: "/usr/bin/afconvert")
  p.arguments = ["-f", "m4af", "-d", "aac", "-b", "64000", caf.path, m4a.path]
  try? p.run(); p.waitUntilExit()
  return p.terminationStatus == 0
}

var done = 0, skipped = 0, failed: [String] = []
for lang in ["en", "es"] where onlyLang == nil || onlyLang == lang {
  guard let voice = pickVoice(lang) else {
    print("[\(lang)] no good voice installed: skipping (the game will use the browser's voice)"); continue
  }
  print("[\(lang)] voice: \(voice.name) (\(voice.identifier))")
  let rate: Float = lang == "es" ? 0.42 : 0.47
  // clips with their own "src" (the human-recorded letter sounds) are never synthesized
  for (id, clip) in clips.sorted(by: { $0.key < $1.key }) where clip["lang"] == lang && clip["src"] == nil {
    let text = clip["text"]!, m4a = audioDir.appendingPathComponent(id + ".m4a")
    if !force && texts[id] == text && voicesUsed[lang] == voice.identifier && FileManager.default.fileExists(atPath: m4a.path) { skipped += 1; continue }
    let caf = FileManager.default.temporaryDirectory.appendingPathComponent(id + ".caf")
    if render(text, voice: voice, rate: rate, to: caf) && toM4A(caf, m4a) { texts[id] = text; done += 1 } else { failed.append(id) }
    try? FileManager.default.removeItem(at: caf)
    if done % 25 == 0 && done > 0 { print("  \(done) recorded…") }
  }
  voicesUsed[lang] = voice.identifier
}

// delete recordings of lines the game no longer uses
for name in (try? FileManager.default.contentsOfDirectory(atPath: audioDir.path)) ?? [] where name.hasSuffix(".m4a") {
  let id = String(name.dropLast(4))
  if clips[id] == nil || clips[id]?["src"] != nil { try? FileManager.default.removeItem(at: audioDir.appendingPathComponent(name)) }
}
let files = clips.keys.filter { clips[$0]?["src"] == nil && FileManager.default.fileExists(atPath: audioDir.appendingPathComponent($0 + ".m4a").path) }.sorted()
manifest = ["voices": voicesUsed, "files": files, "texts": texts.filter { files.contains($0.key) }]
let data = try! JSONSerialization.data(withJSONObject: manifest, options: [.prettyPrinted, .sortedKeys])
try! data.write(to: manifestURL)
print("recorded \(done), unchanged \(skipped), failed \(failed.count) \(failed.prefix(10)); manifest lists \(files.count) clips")
