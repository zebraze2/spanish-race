/* English mode: letter names → letter sounds → first/last sounds → tiny words → 3-letter words.
   `ipa` is how a speech sound is voiced by tools/make-audio.swift; `say` is the
   plain-text spelling browsers read when no recorded clip exists. */
window.ENGLISH = {
  letters: {
    a: { name: 'ay',         ipa: 'æ',   say: 'aah',  word: 'apple',    pic: '🍎' },
    b: { name: 'bee',        ipa: 'bə',  say: 'buh',  word: 'bear',     pic: '🐻' },
    c: { name: 'see',        ipa: 'kə',  say: 'kuh',  word: 'cat',      pic: '🐱' },
    d: { name: 'dee',        ipa: 'də',  say: 'duh',  word: 'dog',      pic: '🐶' },
    e: { name: 'ee',         ipa: 'ɛ',   say: 'eh',   word: 'egg',      pic: '🥚' },
    f: { name: 'eff',        ipa: 'fː',  say: 'fff',  word: 'fish',     pic: '🐟' },
    g: { name: 'jee',        ipa: 'ɡə',  say: 'guh',  word: 'goat',     pic: '🐐' },
    h: { name: 'aitch',      ipa: 'hə',  say: 'huh',  word: 'hat',      pic: '🎩' },
    i: { name: 'eye',        ipa: 'ɪ',   say: 'ih',   word: 'insect',   pic: '🐞' },
    j: { name: 'jay',        ipa: 'dʒə', say: 'juh',  word: 'juice',    pic: '🧃' },
    k: { name: 'kay',        ipa: 'kə',  say: 'kuh',  word: 'kite',     pic: '🪁' },
    l: { name: 'ell',        ipa: 'lː',  say: 'lll',  word: 'lion',     pic: '🦁' },
    m: { name: 'em',         ipa: 'mː',  say: 'mmm',  word: 'monkey',   pic: '🐒' },
    n: { name: 'en',         ipa: 'nː',  say: 'nnn',  word: 'nose',     pic: '👃' },
    o: { name: 'oh',         ipa: 'ɑ',   say: 'ah',   word: 'octopus',  pic: '🐙' },
    p: { name: 'pee',        ipa: 'pə',  say: 'puh',  word: 'pig',      pic: '🐷' },
    q: { name: 'cue',        ipa: 'kwə', say: 'kwuh', word: 'queen',    pic: '👸' },
    r: { name: 'ar',         ipa: 'ɹː',  say: 'rrr',  word: 'rainbow',  pic: '🌈' },
    s: { name: 'ess',        ipa: 'sː',  say: 'sss',  word: 'snake',    pic: '🐍' },
    t: { name: 'tee',        ipa: 'tə',  say: 'tuh',  word: 'turtle',   pic: '🐢' },
    u: { name: 'you',        ipa: 'ʌ',   say: 'uh',   word: 'umbrella', pic: '☂️' },
    v: { name: 'vee',        ipa: 'vː',  say: 'vvv',  word: 'volcano',  pic: '🌋' },
    w: { name: 'double you', ipa: 'wə',  say: 'wuh',  word: 'whale',    pic: '🐳' },
    x: { name: 'ex',         ipa: 'ks',  say: 'ks',   word: 'fox',      pic: '🦊' },
    y: { name: 'why',        ipa: 'jə',  say: 'yuh',  word: 'yo-yo',    pic: '🪀' },
    z: { name: 'zee',        ipa: 'zː',  say: 'zzz',  word: 'zebra',    pic: '🦓' },
  },

  // Look-alike letters (for letter-name levels) and sound-alike letters (for sound levels).
  shapeTwins: {
    a: 'eod', b: 'dpq', c: 'oeg', d: 'bpq', e: 'acf', f: 'tel', g: 'qjc', h: 'nkb', i: 'ljt', j: 'igu',
    k: 'hxr', l: 'itj', m: 'nwh', n: 'mhu', o: 'acq', p: 'qbd', q: 'pgo', r: 'npk', s: 'zc', t: 'fli',
    u: 'nvj', v: 'wuy', w: 'vm', x: 'kzy', y: 'vgj', z: 'sxn',
  },
  soundTwins: {
    a: 'eu', b: 'pd', c: 'gt', d: 'tb', e: 'ia', f: 'vs', g: 'cj', h: 'fw', i: 'ea', j: 'gy', k: 'gt',
    l: 'rn', m: 'nb', n: 'ml', o: 'ua', p: 'bt', q: 'gw', r: 'lw', s: 'zf', t: 'dp', u: 'oa', v: 'fw',
    w: 'rv', x: 'sz', y: 'jw', z: 'sv',
  },
  sameSound: { c: 'kq', k: 'cq', q: 'ck' }, // never offer two letters that make the same sound
  // Letter sounds are human recordings (audio/phonics, from Sound City Reading, as in ABC Blast).
  // These letters' recordings are confusing for a beginner, so (like ABC Blast) we never quiz
  // their sound and leave the sound out of prompts; they still appear as wrong choices.
  soundSkip: 'inqwy',

  // First/last-sound pictures (letter = first or last letter of the word).
  pics: {
    snake: '🐍', monkey: '🐒', fish: '🐟', lion: '🦁', nose: '👃', rainbow: '🌈', sun: '☀️',
    bear: '🐻', dog: '🐶', pig: '🐷', turtle: '🐢', cat: '🐱', goat: '🐐', kite: '🪁', juice: '🧃',
    apple: '🍎', egg: '🥚', octopus: '🐙', umbrella: '☂️', volcano: '🌋', whale: '🐳', 'yo-yo': '🪀', zebra: '🦓',
    bus: '🚌', fox: '🦊', cup: '☕', bed: '🛏️', drum: '🥁',
  },

  // Things to spell. `alt` = hand-picked wrong answers, trickiest first.
  spell: {
    at: { alt: ['it', 'ta', 'an', 'am'] },  in: { alt: ['on', 'ni', 'it', 'an'] },
    on: { alt: ['in', 'no', 'an', 'up'] },  up: { alt: ['pu', 'us', 'on', 'it'] },
    it: { alt: ['at', 'ti', 'is', 'in'] }, am: { alt: ['an', 'ma', 'at', 'is'] },
    an: { alt: ['am', 'na', 'in', 'on'] }, is: { alt: ['it', 'si', 'as', 'in'] },
    sa: { ipa: 'sæ', alt: ['as', 'si', 'ma', 'so'] }, ma: { ipa: 'mæ', alt: ['am', 'mo', 'na', 'sa'] },
    pa: { ipa: 'pæ', alt: ['ap', 'ba', 'pi', 'ta'] }, ta: { ipa: 'tæ', alt: ['at', 'da', 'tu', 'pa'] },
    mi: { ipa: 'mɪ', alt: ['im', 'ni', 'ma', 'me'] }, so: { ipa: 'sɑ', alt: ['os', 'su', 'sa', 'zo'] },
    nu: { ipa: 'nʌ', alt: ['un', 'mu', 'no', 'na'] }, be: { ipa: 'bɛ', alt: ['eb', 'de', 'bi', 'pe'] },
    cat: { pic: '🐱', alt: ['cot', 'bat', 'cap', 'cut'] }, hat: { pic: '🎩', alt: ['hot', 'mat', 'ham', 'hut'] },
    bat: { pic: '🦇', alt: ['dat', 'bet', 'bag', 'but'] }, map: { pic: '🗺️', alt: ['mop', 'nap', 'mat', 'cap'] },
    van: { pic: '🚐', alt: ['fan', 'vat', 'ven', 'pan'] }, bag: { pic: '👜', alt: ['dag', 'big', 'bat', 'bug'] },
    pig: { pic: '🐷', alt: ['big', 'peg', 'pit', 'dig'] }, six: { pic: '6️⃣', alt: ['sax', 'mix', 'sip', 'fix'] },
    pin: { pic: '📌', alt: ['pen', 'bin', 'pan', 'pig'] }, dog: { pic: '🐶', alt: ['bog', 'dig', 'dot', 'log'] },
    box: { pic: '📦', alt: ['dox', 'bux', 'fox', 'bax'] }, fox: { pic: '🦊', alt: ['vox', 'fix', 'box', 'fog'] },
    sun: { pic: '☀️', alt: ['sin', 'fun', 'run', 'sum'] }, bus: { pic: '🚌', alt: ['dus', 'bug', 'bat', 'bis'] },
    bug: { pic: '🐛', alt: ['dug', 'big', 'bag', 'rug'] }, cup: { pic: '☕', alt: ['cap', 'pup', 'cop', 'cut'] },
    bed: { pic: '🛏️', alt: ['deb', 'bad', 'bid', 'red'] }, hen: { pic: '🐔', alt: ['hem', 'ten', 'hin', 'pen'] },
    net: { pic: '🥅', alt: ['nut', 'met', 'not', 'pet'] }, ten: { pic: '🔟', alt: ['tin', 'hen', 'tan', 'pen'] },
    pen: { pic: '🖊️', alt: ['pan', 'ben', 'pin', 'hen'] }, jet: { pic: '✈️', alt: ['jot', 'get', 'jut', 'net'] },
  },

  // name: which letter is this? · sound: which letter makes this sound? · first/last: which
  // letter does the picture start/end with? · spell: which one spells it?
  levels: [
    { name: 'Letters A B C',        type: 'name',  upper: true, items: 'abcosx' },
    { name: 'Letters M T E',        type: 'name',  upper: true, items: 'mtehlp' },
    { name: 'Letters D G J',        type: 'name',  upper: true, items: 'dgjknruw' },
    { name: 'Tricky Big Letters',   type: 'name',  upper: true, items: 'fiqvyzep', tricky: true },
    { name: 'Little Letters',       type: 'name',  items: 'aceosmtx' },
    { name: 'Tricky Little Letters', type: 'name', items: 'bdpqgjil', tricky: true },
    { name: 'More Little Letters',  type: 'name',  items: 'fhknruwy', tricky: true },
    { name: 'Sounds: mmm sss',      type: 'sound', items: 'msflrz' },
    { name: 'Sounds: b d t',        type: 'sound', items: 'bdtpcg' },
    { name: 'Vowel Sounds',    type: 'sound', items: 'aeoumstb' },
    { name: 'More Sounds',          type: 'sound', items: 'hjkvxdlg', tricky: true },
    { name: 'First Sounds 1',       type: 'first', items: ['snake', 'monkey', 'fish', 'lion', 'nose', 'rainbow'] },
    { name: 'First Sounds 2',       type: 'first', items: ['bear', 'dog', 'pig', 'turtle', 'cat', 'goat', 'kite', 'juice'], tricky: true },
    { name: 'First Sounds 3',       type: 'first', items: ['apple', 'egg', 'octopus', 'umbrella', 'volcano', 'whale', 'yo-yo', 'zebra'], tricky: true },
    { name: 'Last Sounds',          type: 'last',  items: ['cat', 'dog', 'sun', 'bus', 'fox', 'cup', 'bed', 'drum'], tricky: true },
    { name: 'Tiny Words',           type: 'spell', items: ['at', 'in', 'on', 'up', 'it', 'am', 'an', 'is'] },
    { name: 'Sound Bits',           type: 'spell', items: ['sa', 'ma', 'pa', 'ta', 'mi', 'so', 'nu', 'be'] },
    { name: '3-Letter Words: cat',  type: 'spell', items: ['cat', 'hat', 'bat', 'map', 'van', 'bag', 'pig', 'six'] },
    { name: '3-Letter Words: dog',  type: 'spell', items: ['dog', 'box', 'sun', 'bus', 'bug', 'bed', 'hen', 'net'] },
    { name: 'Word Master',          type: 'spell', items: ['pin', 'fox', 'cup', 'ten', 'pen', 'jet', 'cat', 'pig'], tricky: true },
  ],
  choices: [3, 3, 3, 4, 4, 4, 4, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5],
};
