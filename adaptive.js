/* Spanish mode after the 10 hand-made levels: check-in quizzes and levels that adapt.
   Every answer (in a race or a quiz) updates a memory for that word. A quiz comes after
   level 10 and then after every few new levels; each new level mixes the words he keeps
   missing with new words from VOCAB.bank, so the game never runs out of levels. */
const ES_FIXED = VOCAB.levels.length;   // the hand-made levels
const QUIZ_EVERY = 3;                   // new levels between check-in quizzes
const LEVEL_SIZE = 8, MAX_REVIEW = 4, MAX_FRESH = 5;
const QUIZ_FIRST = 15, QUIZ_SIZE = 12;

// The obstacles he can choose from before each new level (plus "invent your own").
const OBSTACLE_PICKS = [
  ['banana', 'Plátanos'], ['puddle', 'Charcos'], ['cone', 'Conos'], ['log', 'Troncos'], ['fire', 'Fuego'],
  ['spikes', 'Picos'], ['pit', 'Caimán'], ['drawbridge', 'Puente'], ['gatorbridge', 'Río'], ['volcano', 'Volcán'],
  ['dino', 'Dinosaurio'], ['shark', 'Tiburón'], ['boulder', 'Roca'], ['snowman', 'Nieve'], ['cactus', 'Cactus'],
  ['slime', 'Baba'], ['tornado', 'Tornado'], ['cow', 'Vaca'], ['web', 'Telaraña'], ['bubbles', 'Burbujas'],
];
const CUSTOM_EMOJI = ['🦄', '🐉', '👻', '🎃', '🍕', '🍔', '🍩', '🧁', '🦕', '🐙', '🐳', '🐧', '🦒', '🐼', '🐨', '🦊',
  '🐯', '🦩', '🦜', '🐞', '🦀', '🐌', '🦔', '🤖', '👽', '🛸', '🏰', '🎁', '🏀', '🪀', '🍉', '🍄', '🌻', '🍭', '🚁', '🚜',
  '☃️', '🧸', '🎸', '🌮'];

/* ---------- word memory: box 0 = just missed … 4 = solid ---------- */
function noteAnswer(id, right) {
  const m = SAVE.vocab[id] || (SAVE.vocab[id] = { box: 1, c: 0, w: 0, at: 0 });
  if (right) { m.c++; m.box = Math.min(4, m.box + 1); } else { m.w++; m.box = 0; }
  m.at = Date.now();
  persist();
}
const isWeak = id => { const m = SAVE.vocab[id]; return !!m && m.w > 0 && m.box <= 1; };
const isKnown = id => { const m = SAVE.vocab[id]; return !!m && m.box >= 2; };

/* ---------- the path after level 10: quiz, 3 levels, quiz, 3 levels, … ---------- */
function introducedWords() {
  const out = new Set(VOCAB.levels.flatMap(L => L.words));
  for (const n of SAVE.esPath) if (n.type === 'level') n.words.forEach(w => out.add(w));
  return [...out];
}
const nodeDone = n => (n.type === 'quiz' ? !!n.done : SAVE.stars.es[n.lvl] === 3);
const esLevel = lvl => SAVE.esPath.find(n => n.type === 'level' && n.lvl === lvl);

// Add the next node once everything before it is finished (new levels are built right then,
// from what he knows at that moment).
function syncEsPath() {
  if (!(SAVE.unlockAll || SAVE.stars.es[ES_FIXED] === 3)) return;
  for (;;) {
    const last = SAVE.esPath[SAVE.esPath.length - 1];
    if (last && !nodeDone(last)) return;
    const k = SAVE.esPath.length;
    SAVE.esPath.push(k % (QUIZ_EVERY + 1) === 0
      ? { type: 'quiz', q: SAVE.esPath.filter(n => n.type === 'quiz').length + 1, done: false }
      : { type: 'level', lvl: ES_FIXED + SAVE.esPath.filter(n => n.type === 'level').length + 1, ...makeLevelWords() });
    persist();
  }
}

// Up to 4 words he keeps missing, up to 5 new words, then older words he hasn't seen lately.
function makeLevelWords() {
  const intro = introducedWords(), at = id => (SAVE.vocab[id] ? SAVE.vocab[id].at : 0);
  const review = intro.filter(isWeak).sort((a, b) => SAVE.vocab[a].box - SAVE.vocab[b].box || at(b) - at(a)).slice(0, MAX_REVIEW);
  const fresh = VOCAB.bank.filter(id => !intro.includes(id)).slice(0, Math.min(MAX_FRESH, LEVEL_SIZE - review.length));
  const words = [...review, ...fresh];
  const spaced = intro.filter(id => !words.includes(id)).sort((a, b) => at(a) - at(b));
  while (words.length < LEVEL_SIZE && spaced.length) words.push(spaced.shift());
  return { words: shuffle(words), fresh, review };
}

// The questions for a check-in quiz: weak, recent and not-yet-checked words first.
function makeCheckup(node) {
  const intro = introducedWords();
  const recent = new Set(SAVE.esPath.filter(n => n.type === 'level').slice(-QUIZ_EVERY).flatMap(n => n.words));
  const score = id => {
    const m = SAVE.vocab[id];
    return (m ? (4 - m.box) * 0.5 : 3) + (isWeak(id) ? 4 : 0) + (recent.has(id) ? 3 : 0) + Math.random() * 1.5;
  };
  const rank = ids => ids.slice().sort((a, b) => score(b) - score(a));
  const pick = node.q === 1
    ? shuffle(VOCAB.levels.flatMap(L => rank(L.words).slice(0, 2))).slice(0, QUIZ_FIRST) // a couple from every level
    : rank(intro).slice(0, QUIZ_SIZE);
  return shuffle(pick).map(id => esQuestion(id, intro, 4));
}

// What comes after a Spanish level: the next level, or a quiz.
function esNextAfter(lvl) {
  if (lvl < ES_FIXED) return { type: 'level', lvl: lvl + 1 };
  syncEsPath();
  const i = lvl === ES_FIXED ? -1 : SAVE.esPath.findIndex(n => n.type === 'level' && n.lvl === lvl);
  return SAVE.esPath[i + 1] || null;
}
