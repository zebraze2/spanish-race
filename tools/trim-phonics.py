"""Prepare the human-recorded letter sounds for the game.

The source recordings (one mp3 per letter, from Sound City Reading,
soundcityreading.net, by Kathryn J. Davis; free for parents and teachers) have
about a second of silence on each side. This trims it, evens out the volume,
and writes audio/phonics/<letter>.m4a so the sounds can sit inside spoken
prompts ("What does bear start with? /b/, /b/, bear").

    python3 tools/trim-phonics.py ../abc-blast/public/sounds
"""
import os
import struct
import subprocess
import sys
import tempfile

SRC = sys.argv[1] if len(sys.argv) > 1 else '../abc-blast/public/sounds'
OUT = os.path.join(os.path.dirname(__file__), '..', 'audio', 'phonics')
RATE = 44100
PEAK = 24000          # about the level of the recorded voice lines
LEAD, TAIL = 0.05, 0.15  # seconds kept before the sound starts / after it ends


def read_wav(path):
    b = open(path, 'rb').read()
    i = b.index(b'data')
    n = struct.unpack('<I', b[i + 4:i + 8])[0]
    return list(struct.unpack('<%dh' % (n // 2), b[i + 8:i + 8 + n]))


def write_wav(path, samples):
    data = struct.pack('<%dh' % len(samples), *samples)
    header = b'RIFF' + struct.pack('<I', 36 + len(data)) + b'WAVEfmt ' + struct.pack(
        '<IHHIIHH', 16, 1, 1, RATE, RATE * 2, 2, 16) + b'data' + struct.pack('<I', len(data))
    open(path, 'wb').write(header + data)


os.makedirs(OUT, exist_ok=True)
tmp = tempfile.mkdtemp()
for letter in 'abcdefghijklmnopqrstuvwxyz':
    src = os.path.join(SRC, letter + '.mp3')
    raw = os.path.join(tmp, letter + '.wav')
    subprocess.run(['afconvert', '-f', 'WAVE', '-d', f'LEI16@{RATE}', '-c', '1', src, raw], check=True)
    s = read_wav(raw)
    win = RATE // 100  # 10 ms windows
    env = [(sum(x * x for x in s[k:k + win]) / win) ** 0.5 for k in range(0, len(s) - win, win)]
    # grow outward from the loudest moment, so stray clicks or breaths far away are dropped
    thresh, gap = max(env) * 0.04, 8  # allow quiet dips of up to 80 ms inside the sound
    lo = hi = env.index(max(env))
    while lo > 0 and any(e > thresh for e in env[max(0, lo - gap):lo]):
        lo -= 1
    while hi < len(env) - 1 and any(e > thresh for e in env[hi + 1:hi + 1 + gap]):
        hi += 1
    start = max(0, lo * win - int(LEAD * RATE))
    end = min(len(s), (hi + 1) * win + int(TAIL * RATE))
    clip = s[start:end]
    gain = PEAK / max(abs(x) for x in clip)
    clip = [max(-32767, min(32767, int(x * gain))) for x in clip]
    fade = int(0.03 * RATE)  # soften the cut edges
    for k in range(min(fade, len(clip))):
        clip[k] = int(clip[k] * k / fade)
        clip[-1 - k] = int(clip[-1 - k] * k / fade)
    trimmed = os.path.join(tmp, letter + '-t.wav')
    write_wav(trimmed, clip)
    subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '96000', trimmed,
                    os.path.join(OUT, letter + '.m4a')], check=True)
    print(f'{letter}: {len(s) / RATE:.2f}s -> {len(clip) / RATE:.2f}s')
