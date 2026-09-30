/* Voice + sound effects.
   Voice: plays pre-rendered clips from audio/<key>.m4a when they are listed in
   audio/manifest.json (made by tools/make-audio.swift). Anything without a clip
   falls back to the browser's best-sounding text-to-speech voice.
   Keys are clip ids from clips.js, e.g. "w_perro" or "e_name_s". */

let AC = null;
function ensureAudio() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}

const Voice = (() => {
  let files = new Set(), texts = {};
  const buffers = {};
  // no-cache: re-check the manifest every visit so newly recorded clips show up
  fetch('audio/manifest.json', { cache: 'no-cache' }).then(r => (r.ok ? r.json() : null))
    .then(m => { if (m && m.files) { files = new Set(m.files); texts = m.texts || {}; } }).catch(() => {});
  // version tag per clip (from its recorded text) so a re-recorded clip is never served stale
  const version = key => { let h = 0; for (const c of texts[key] || '') h = (h * 31 + c.charCodeAt(0)) | 0; return (h >>> 0).toString(36); };

  // ---- browser TTS fallback: rank voices so natural-sounding ones win ----
  const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|wobble|fred|good news|jester|junior|kathy|organ|superstar|ralph|trinoids|whisper|zarvox|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley/i;
  const best = { es: null, en: null };
  function score(v, want) {
    const lang = v.lang.replace('_', '-').toLowerCase();
    if (!lang.startsWith(want)) return -Infinity;
    const id = (v.name + ' ' + v.voiceURI).toLowerCase();
    let s = 0;
    if (/premium|natural|neural|enhanced|siri/.test(id)) s += 60;
    if (/google|online/.test(id)) s += 45;
    if (/super-compact/.test(id)) s -= 25;
    if (NOVELTY.test(v.name)) s -= 50;
    if (want === 'es' && /-(us|mx|419)/.test(lang)) s += 12;
    if (want === 'en' && lang === 'en-us') s += 12;
    if (/samantha|paulina|monica|mónica/.test(id)) s += 8;
    if (!v.localService) s += 4;
    return s;
  }
  function pickVoices() {
    const vs = speechSynthesis.getVoices();
    for (const want of ['es', 'en']) {
      let top = null, topScore = -Infinity;
      for (const v of vs) { const s = score(v, want); if (s > topScore) { top = v; topScore = s; } }
      best[want] = top;
    }
  }
  if ('speechSynthesis' in window) {
    pickVoices();
    speechSynthesis.addEventListener('voiceschanged', pickVoices);
  }

  function lookup(key) {
    const c = CLIPS[key];
    return c && { text: clipPlain(c.text), lang: c.lang };
  }
  const fileId = key => key;

  let token = 0, src = null;
  function stop() {
    token++;
    if (src) { try { src.stop(); } catch {} src = null; }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }

  async function load(key) {
    if (buffers[key]) return buffers[key];
    const ac = ensureAudio();
    const res = await fetch('audio/' + fileId(key) + '.m4a?v=' + version(key));
    if (!res.ok) throw new Error('missing clip ' + key);
    return (buffers[key] = await ac.decodeAudioData(await res.arrayBuffer()));
  }
  async function playClip(key, my) {
    const buf = await load(key);
    if (my !== token) return;
    await new Promise(done => {
      const s = AC.createBufferSource();
      s.buffer = buf; s.connect(AC.destination); s.onended = done; src = s; s.start();
    });
  }
  function speakTTS(key) {
    return new Promise(resolve => {
      let finished = false;
      const done = () => { if (!finished) { finished = true; resolve(); } };
      const item = lookup(key);
      if (!item || !('speechSynthesis' in window)) return setTimeout(done, 250);
      const u = new SpeechSynthesisUtterance(item.text);
      const v = best[item.lang];
      u.lang = v ? v.lang : (item.lang === 'es' ? 'es-MX' : 'en-US');
      if (v) u.voice = v;
      u.rate = item.lang === 'es' ? 0.85 : 1;
      u.onend = u.onerror = done;
      speechSynthesis.speak(u);
      setTimeout(done, 600 + item.text.length * 150); // Safari sometimes never fires onend
    });
  }

  async function seq(keys, onend) {
    stop();
    const my = token;
    for (const key of keys) {
      if (my !== token) return;
      try {
        if (files.has(fileId(key))) await playClip(key, my);
        else await speakTTS(key);
      } catch { if (my === token) await speakTTS(key); }
    }
    if (my === token && onend) onend();
  }

  return {
    say: (key, onend) => seq([key], onend),
    seq,
    stop,
    preload: keys => keys.forEach(k => { if (files.has(fileId(k))) load(k).catch(() => {}); }),
    hasClips: () => files.size > 0,
  };
})();

/* ---------------- sound effects (synthesized, no files) ---------------- */
function tone(freq, dur, type = 'sine', when = 0, vol = 0.12, slideTo) {
  const ac = ensureAudio(); if (!ac) return;
  const t = ac.currentTime + when, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
}
let noiseBuf = null;
function noise(dur, when = 0, vol = 0.2, freq = 1200, q = 1, type = 'bandpass') {
  const ac = ensureAudio(); if (!ac) return;
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ac.currentTime + when, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f).connect(g).connect(ac.destination); s.start(t); s.stop(t + dur + 0.05);
}
const SFX = {
  right:   () => [523, 659, 784, 1046].forEach((f, i) => tone(f, .18, 'triangle', i * .08)),
  wrong:   () => { tone(330, .25, 'sawtooth', 0, .06, 300); tone(262, .45, 'sawtooth', .22, .06, 200); },
  jump:    () => tone(300, .3, 'square', 0, .05, 900),
  land:    () => noise(.15, 0, .15, 400),
  bonk:    () => { tone(160, .2, 'square', 0, .1, 70); noise(.12, 0, .2, 800); },
  slip:    () => tone(900, .6, 'sine', 0, .08, 180),
  splash:  () => { noise(.5, 0, .3, 1500, .7); noise(.3, .05, .2, 3000, 1, 'highpass'); },
  sizzle:  () => noise(.8, 0, .18, 5000, .5, 'highpass'),
  pop:     () => { noise(.08, 0, .4, 2500, 1, 'highpass'); tone(420, .6, 'sawtooth', .05, .04, 110); },
  chomp:   () => { [0, .15].forEach(w => { tone(120, .08, 'square', w, .18, 55); noise(.1, w, .25, 900); }); },
  roar:    () => { tone(95, .7, 'sawtooth', 0, .1, 55); noise(.6, 0, .12, 300, .8); },
  creak:   () => tone(140, .5, 'sawtooth', 0, .05, 220),
  beep:    hi => tone(hi ? 880 : 440, hi ? .5 : .2, 'square', 0, .07),
  win:     () => [523, 659, 784, 659, 784, 1046].forEach((f, i) => tone(f, .22, 'triangle', i * .12)),
  lose:    () => [392, 330, 262].forEach((f, i) => tone(f, .3, 'triangle', i * .2)),
  coin:    (when = 0) => { tone(988, .08, 'square', when, .05); tone(1319, .25, 'square', when + .08, .05); },
  glug:    () => { for (let i = 0; i < 3; i++) tone(170 + Math.random() * 90, .12, 'sine', i * .16, .14, 90); },
  horn:    () => { tone(415, .14, 'square', 0, .05); tone(415, .2, 'square', .19, .05); },
  unlock:  () => [659, 784, 988, 1319, 1568].forEach((f, i) => tone(f, .25, 'triangle', i * .09, .1)),
  sputter: () => { for (let i = 0; i < 5; i++) tone(70 + Math.random() * 30, .08, 'square', i * .17, .1); },
  click:   () => tone(620, .05, 'square', 0, .04),
};
