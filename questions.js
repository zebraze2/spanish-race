/* Modes and levels: builds each level's quiz questions and practice cards.
   Spanish (es): pick the picture for a Spanish word.
   English (en): letter names → letter sounds → first/last sounds → spelling. */
const $ = id => document.getElementById(id);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* Everything the player sees or hears is in the mode's language (Spanish mode is all Spanish). */
const MODE_INFO = {
  es: {
    count: ['3', '2', '1', '¡Vamos!'], countClips: ['p_tres', 'p_dos', 'p_uno', 'p_vamos'], praise: ['p_muybien', 'p_excelente'],
    clip: { gas: 'p_gas', gaslow: 'p_gaslow', full: 'p_lleno', out: 'p_singas', congrats: 'p_felicidades', close: 'p_casi',
            need3: 'p_todas', unlocked: 'p_nuevonivel', coins: 'p_monedas', newcar: 'p_carronuevo', shop: 'p_tienda' },
    t: { title: 'Español', level: 'Nivel', subtitle: '¡Corre y aprende palabras!', learnHint: '¡Toca cada dibujo para escuchar! 👂',
         hearAll: '🔊 Escuchar', race: '🏁 ¡A correr!', right: '¡Sí! 🎉', turbo: '¡TURBO! 🚀', gas: '¿Gasolina?',
         full: '¡Lleno! ⛽', out: '¡Sin gasolina!', congrats: '¡Felicidades!', close: '¡Casi!', need3: '¡Acierta todas!',
         unlocked: '¡Nuevo nivel!', next: 'Siguiente', again: 'Otra vez', shop: 'Tienda de carros', buy: 'Comprar',
         soon: 'Pronto' },
  },
  en: {
    count: ['3', '2', '1', 'Go!'], countClips: ['en_three', 'en_two', 'en_one', 'en_go'], praise: ['en_great', 'en_yes'],
    clip: { gas: 'en_gas', gaslow: 'en_gaslow', full: 'en_full', out: 'en_outofgas', congrats: 'en_congrats', close: 'en_soclose',
            need3: 'en_need3', unlocked: 'en_unlocked', coins: 'en_coins', newcar: 'en_newcar', shop: 'en_shop' },
    t: { title: 'English', level: 'Level', subtitle: 'Race and learn letters and spelling!', learnHint: 'Tap each card to hear it! 👂',
         hearAll: '🔊 Hear them all', race: '🏁 Race!', right: 'Yes! 🎉', turbo: 'TURBO! 🚀', gas: 'Gas?',
         full: 'Full! ⛽', out: 'Out of gas!', congrats: 'You did it!', close: 'So close!', need3: 'Get them all right!',
         unlocked: 'New level!', next: 'Next', again: 'Again', shop: 'Car Shop', buy: 'Buy', soon: 'Soon' },
  },
};
const CHOICES_ES = [3, 3, 3, 4, 4, 4, 4, 5, 5, 5];
const OBSTACLE_TRACK = ['banana', 'puddle', 'cone', 'log', 'fire', 'spikes', 'pit', 'drawbridge', 'gatorbridge', 'volcano'];

const levelList = mode => (mode === 'es' ? VOCAB.levels : ENGLISH.levels);
const levelCount = mode => levelList(mode).length;
const levelName = (mode, lvl) => levelList(mode)[lvl - 1].name;
// One kind of obstacle per level, wilder each level (English spreads the 10 kinds over its levels).
const levelObstacle = (mode, lvl) => (mode === 'es' ? VOCAB.levels[lvl - 1].obstacle
  : OBSTACLE_TRACK[Math.floor((lvl - 1) * OBSTACLE_TRACK.length / ENGLISH.levels.length)]);
// Robot's finish time vs. a perfect run: easy at level 1, tight at the top level.
const cpuMargin = (mode, lvl) => 1.6 - 0.48 * (lvl - 1) / (levelCount(mode) - 1);

const makeQuestions = (mode, lvl) => (mode === 'es' ? esQuestions(lvl) : enQuestions(lvl));

function esQuestions(lvl) {
  const words = VOCAB.levels[lvl - 1].words, n = CHOICES_ES[lvl - 1], W = VOCAB.words;
  return shuffle(words).map(id => ({
    answer: id, text: false, tile: o => W[o].pic, aria: o => W[o].en,
    options: shuffle([id, ...shuffle(words.filter(w => w !== id)).slice(0, n - 1)]),
    prompt: `¿Cuál es <span class="q-word">${W[id].es}</span>?`,
    ask: ['p_cual', 'w_' + id], replay: ['w_' + id],
    reveal: ['p_uy', 'w_' + id], revealText: `👉 ${W[id].es}`,
  }));
}

/* Wrong letters: easy levels draw from the level's own letters; tricky levels lead
   with look-alikes (or sound-alikes). Never offers two letters that make the same sound. */
function pickLetters(answer, pool, twins, n, tricky, same = '') {
  const out = [], bad = answer + same;
  const add = c => { if (c && !bad.includes(c) && !out.includes(c) && out.length < n) out.push(c); };
  const t = shuffle([...twins]), p = shuffle([...pool]);
  (tricky ? [...t, ...p] : [...p, t[0]]).forEach(add);
  shuffle([...'abcdefghijklmnopqrstuvwxyz']).forEach(add);
  return out;
}

function enQuestions(lvl) {
  const E = ENGLISH, lv = E.levels[lvl - 1], n = lv.n;
  const up = s => (lv.upper ? s.toUpperCase() : s);
  return shuffle([...lv.items]).map(it => {
    const base = { text: true, tile: up, aria: o => o };
    if (lv.type === 'spell' || lv.type === 'bits') {
      const sp = E.spell[it], word = lv.type === 'spell', out = soundOut(it);
      const ask = word ? ['e_spell_' + it, ...(out.length ? [...out, 'e_word_' + it] : [])] : ['e_bitsq', ...out];
      return { ...base, answer: it, options: shuffle([it, ...(lv.tricky ? sp.alt : shuffle(sp.alt)).slice(0, n - 1)]),
        prompt: word ? `<span class="q-pic">${sp.pic || '🔊'}</span> Which one spells it?` : '<span class="q-pic">👂</span> Which one makes these sounds?',
        ask, replay: word ? ask : out,
        reveal: ['en_oops', ...spellLesson(it, word)], revealText: `This one ${word ? 'spells' : 'is'} “${it}” 👉` };
    }
    const first = lv.type === 'first', last = lv.type === 'last';
    const letter = first ? it[0] : last ? it[it.length - 1] : it;
    const pool = first ? lv.items.map(w => w[0]).join('') : last ? lv.items.map(w => w[w.length - 1]).join('') : lv.items;
    const byShape = lv.type === 'name';
    const options = shuffle([letter, ...pickLetters(letter, pool, (byShape ? E.shapeTwins : E.soundTwins)[letter],
      n - 1, lv.tricky, byShape ? '' : E.sameSound[letter] || '')]);
    const q = { ...base, answer: letter, options, reveal: ['en_oops', ...letterLesson(letter)], revealText: `This one is ${up(letter)} 👉` };
    if (byShape) return { ...q, prompt: '<span class="q-pic">🔊</span> Which letter?', ask: ['e_whichletter', 'e_nm_' + letter], replay: ['e_nm_' + letter] };
    if (lv.type === 'sound') return { ...q, prompt: '<span class="q-pic">👂</span> Which letter makes this sound?', ask: ['e_soundq', 'ph_' + letter], replay: ['ph_' + letter] };
    // first sounds: "What does bear start with?" /b/ /b/ "Bear!" · last sounds: "What does drum end with?" "Drum!" /m/ /m/
    const ph = sound(letter), ask = first ? [`e_firstq_${it}`, ...ph, ...ph, `e_word_${it}`] : [`e_lastq_${it}`, `e_word_${it}`, ...ph, ...ph];
    return { ...q, prompt: `<span class="q-pic">${E.pics[it]}</span> ${first ? 'starts' : 'ends'} with…?`,
      ask, replay: ask, reveal: ['en_oops', `e_${lv.type}is_${it}`, 'e_nm_' + letter, ...ph] };
  });
}

// A letter's recorded sound, or nothing for the letters whose recordings ABC Blast skips.
const sound = l => (ENGLISH.soundSkip.includes(l) ? [] : ['ph_' + l]);
// Sound a word out with the recordings (only if every letter has a usable recording).
const soundOut = w => ([...w].every(c => sound(c).length) ? [...w].map(c => 'ph_' + c) : []);
// "A!… /a/… Apple!": the letter's name, its recorded sound, then its picture word.
const letterLesson = l => ['e_nm_' + l, ...sound(l), 'e_word_' + ENGLISH.letters[l].word];
// "C! A! T!… /k/ /a/ /t/… Cat!"
const spellLesson = (w, word) => [...[...w].map(c => 'e_nm_' + c), ...soundOut(w), ...(word ? ['e_word_' + w] : [])];

/* Practice cards shown before the race: tap to hear. */
function learnCards(mode, lvl) {
  if (mode === 'es') {
    return VOCAB.levels[lvl - 1].words.map(id => { const w = VOCAB.words[id]; return { big: w.pic, title: w.es, sub: w.en, clips: ['w_' + id] }; });
  }
  const E = ENGLISH, lv = E.levels[lvl - 1], up = s => (lv.upper ? s.toUpperCase() : s);
  return [...new Set(lv.items)].map(it => {
    if (lv.type === 'name' || lv.type === 'sound') {
      const L = E.letters[it];
      return { big: up(it), letter: true, title: '', sub: `${L.pic} ${L.word}`, clips: letterLesson(it) };
    }
    if (lv.type === 'first' || lv.type === 'last') {
      const l = lv.type === 'first' ? it[0] : it[it.length - 1];
      return { big: E.pics[it], title: it, sub: `${lv.type === 'first' ? 'starts' : 'ends'} with ${l}`, clips: [`e_${lv.type}is_${it}`, 'e_nm_' + l, ...sound(l)] };
    }
    const sp = E.spell[it], clips = spellLesson(it, lv.type === 'spell');
    return sp.pic ? { big: sp.pic, title: it, sub: '', clips } : { big: it, letter: true, title: '', sub: '', clips };
  });
}
