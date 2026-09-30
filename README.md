# Carrera de Palabras

A racing game for a preschooler: answer the question to jump the obstacle and beat the robot car.

- **Español** – 10 levels of everyday Spanish words (all prompts in Spanish).
- **English** – 20 levels: letter names → letter sounds → first/last sounds → 3-letter words.

Play it: https://zebraze2.github.io/spanish-race/

## Running locally

Any static file server works, e.g. `python3 -m http.server 5175` in this folder.
Parent shortcuts: `?unlock=all` opens every level for that visit, `?reset` clears saved progress.

## Audio

- `swift tools/make-audio.swift` records every spoken line in `clips.js` with the best Apple
  voice installed (English uses Siri's natural voice; Spanish needs an Enhanced/Premium voice).
- `python3 tools/trim-phonics.py <folder of a.mp3 … z.mp3>` prepares the letter sounds.
- `python3 tools/stamp-version.py` before each commit, so browsers never mix old and new files.

## Credits

Letter sounds (`audio/phonics/`) are human recordings from
[Sound City Reading](https://www.soundcityreading.net/) by Kathryn J. Davis, offered free to
parents, teachers and tutors. They are trimmed and volume-matched here.
