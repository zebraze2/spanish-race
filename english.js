/* English mode: letter names → letter sounds → first/last sounds → tiny words → 3-letter words.
   Letter sounds are human recordings (audio/phonics); `say` is only the spelling a browser
   reads aloud if a recording can't load. Letter names are spoken as the letter itself ("A!"). */
window.ENGLISH = {
  letters: {
    a: { say: 'aah',  word: 'apple',    pic: '🍎' },
    b: { say: 'buh',  word: 'bear',     pic: '🐻' },
    c: { say: 'kuh',  word: 'cat',      pic: '🐱' },
    d: { say: 'duh',  word: 'dog',      pic: '🐶' },
    e: { say: 'eh',   word: 'egg',      pic: '🥚' },
    f: { say: 'fff',  word: 'fish',     pic: '🐟' },
    g: { say: 'guh',  word: 'goat',     pic: '🐐' },
    h: { say: 'huh',  word: 'hat',      pic: '🎩' },
    i: { say: 'ih',   word: 'insect',   pic: '🐞' },
    j: { say: 'juh',  word: 'juice',    pic: '🧃' },
    k: { say: 'kuh',  word: 'kite',     pic: '🪁' },
    l: { say: 'lll',  word: 'lion',     pic: '🦁' },
    m: { say: 'mmm',  word: 'monkey',   pic: '🐒' },
    n: { say: 'nnn',  word: 'nose',     pic: '👃' },
    o: { say: 'ah',   word: 'octopus',  pic: '🐙' },
    p: { say: 'puh',  word: 'pig',      pic: '🐷' },
    q: { say: 'kwuh', word: 'queen',    pic: '👸' },
    r: { say: 'rrr',  word: 'rainbow',  pic: '🌈' },
    s: { say: 'sss',  word: 'snake',    pic: '🐍' },
    t: { say: 'tuh',  word: 'turtle',   pic: '🐢' },
    u: { say: 'uh',   word: 'umbrella', pic: '☂️' },
    v: { say: 'vvv',  word: 'volcano',  pic: '🌋' },
    w: { say: 'wuh',  word: 'whale',    pic: '🐳' },
    x: { say: 'ks',   word: 'fox',      pic: '🦊' },
    y: { say: 'yuh',  word: 'yo-yo',    pic: '🪀' },
    z: { say: 'zzz',  word: 'zebra',    pic: '🦓' },
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
    moon: '🌙', leaf: '🍃', rocket: '🚀', horse: '🐴', van: '🚐', zombie: '🧟',
    ball: '⚽', duck: '🦆', pizza: '🍕', tiger: '🐯', car: '🚗', gorilla: '🦍', key: '🔑', jet: '🛩️',
    ant: '🐜', elephant: '🐘', otter: '🦦', up: '⬆️', cake: '🎂', guitar: '🎸', sock: '🧦', lemon: '🍋',
    crocodile: '🐊', dinosaur: '🦖', helicopter: '🚁', robot: '🤖', banana: '🍌', penguin: '🐧', kangaroo: '🦘', ghost: '👻',
  },

  // Things to spell. `alt` = hand-picked wrong answers, trickiest first.
  spell: {
    at: { alt: ['it', 'ta', 'an', 'am'] },  in: { alt: ['on', 'ni', 'it', 'an'] },
    on: { alt: ['in', 'no', 'an', 'up'] },  up: { alt: ['pu', 'us', 'on', 'it'] },
    it: { alt: ['at', 'ti', 'is', 'in'] }, am: { alt: ['an', 'ma', 'at', 'is'] },
    an: { alt: ['am', 'na', 'in', 'on'] }, is: { alt: ['it', 'si', 'as', 'in'] },
    sa: { alt: ['as', 'si', 'ma', 'so'] }, ma: { alt: ['am', 'mo', 'na', 'sa'] },
    pa: { alt: ['ap', 'ba', 'pi', 'ta'] }, ta: { alt: ['at', 'da', 'tu', 'pa'] },
    la: { alt: ['al', 'le', 'ta', 'lo'] }, so: { alt: ['os', 'su', 'sa', 'zo'] },
    mo: { alt: ['om', 'ma', 'no', 'mu'] }, tu: { alt: ['ut', 'ta', 'du', 'to'] },
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
  // letter does the picture start/end with? · bits: which letters make these sounds? · spell: which one spells it?
  levels: [
    { name: 'Letters A B C',         type: 'name',  n: 3, upper: true, items: 'abcosx' },
    { name: 'Letters M T E',         type: 'name',  n: 3, upper: true, items: 'mtehlp' },
    { name: 'Letters D G J',         type: 'name',  n: 3, upper: true, items: 'dgjknruw' },
    { name: 'Tricky Big Letters',    type: 'name',  n: 4, upper: true, items: 'fiqvyzep', tricky: true },
    { name: 'Little Letters',        type: 'name',  n: 4, items: 'aceosmtx' },
    { name: 'Tricky Little Letters', type: 'name',  n: 4, items: 'bdpqgjil', tricky: true },
    { name: 'More Little Letters',   type: 'name',  n: 4, items: 'fhknruwy', tricky: true },
    { name: 'Sounds: mmm sss',       type: 'sound', n: 3, items: 'msflrz' },
    { name: 'Sounds: b d t',         type: 'sound', n: 4, items: 'bdtpcg' },
    { name: 'Vowel Sounds',          type: 'sound', n: 4, items: 'aeoumstb' },
    { name: 'More Sounds',           type: 'sound', n: 4, items: 'hjkvxdlg', tricky: true },
    // First sounds: lots of practice, with new words and new mixes of letters each level.
    // Every word starts with the plain letter sound (no sh/ch/th, no tr/dr).
    { name: 'First Sounds 1',        type: 'first', n: 4, items: ['snake', 'monkey', 'fish', 'lion', 'nose', 'rainbow'] },
    { name: 'First Sounds 2',        type: 'first', n: 4, items: ['bear', 'dog', 'pig', 'turtle', 'cat', 'goat', 'kite', 'juice'], tricky: true },
    { name: 'First Sounds 3',        type: 'first', n: 4, items: ['apple', 'egg', 'octopus', 'umbrella', 'volcano', 'whale', 'yo-yo', 'zebra'], tricky: true },
    { name: 'First Sounds 4',        type: 'first', n: 4, items: ['sun', 'moon', 'fox', 'leaf', 'rocket', 'horse', 'van', 'zombie'] },
    { name: 'First Sounds 5',        type: 'first', n: 4, items: ['ball', 'duck', 'pizza', 'tiger', 'car', 'gorilla', 'key', 'jet'], tricky: true },
    { name: 'First Sounds 6',        type: 'first', n: 4, items: ['ant', 'elephant', 'otter', 'up', 'cake', 'guitar', 'sock', 'lemon'], tricky: true },
    { name: 'First Sounds Mix',      type: 'first', n: 4, items: ['crocodile', 'dinosaur', 'helicopter', 'robot', 'banana', 'penguin', 'kangaroo', 'ghost'], tricky: true },
    { name: 'Last Sounds',           type: 'last',  n: 4, items: ['cat', 'dog', 'sun', 'bus', 'fox', 'cup', 'bed', 'drum'], tricky: true },
    { name: 'Tiny Words',            type: 'spell', n: 4, items: ['at', 'in', 'on', 'up', 'it', 'am', 'an', 'is'] },
    { name: 'Sound Bits',            type: 'bits',  n: 4, items: ['sa', 'ma', 'pa', 'ta', 'la', 'so', 'mo', 'tu'] },
    { name: '3-Letter Words: cat',   type: 'spell', n: 4, items: ['cat', 'hat', 'bat', 'map', 'van', 'bag', 'pig', 'six'] },
    { name: '3-Letter Words: dog',   type: 'spell', n: 5, items: ['dog', 'box', 'sun', 'bus', 'bug', 'bed', 'hen', 'net'] },
    { name: 'Word Master',           type: 'spell', n: 5, items: ['pin', 'fox', 'cup', 'ten', 'pen', 'jet', 'cat', 'pig'], tricky: true },
  ],
};
