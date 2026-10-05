/* Every spoken line in the game, keyed by clip id (recorded as audio/<id>.m4a, except the
   human letter sounds, which have their own `src`). */
const CLIPS = (() => {
  const C = {};
  const add = (id, lang, text, src) => { C[id] = src ? { lang, text, src } : { lang, text }; };

  // Spanish mode
  for (const [id, w] of Object.entries(VOCAB.words)) add('w_' + id, 'es', w.say || w.es);
  for (const [id, t] of Object.entries(VOCAB.phrases.es)) add('p_' + id, 'es', t);

  // English mode, done the way ABC Blast does it: letter sounds (ph_*) are always the human
  // recordings, and letter names are the letter on its own ("A!"), recorded once and stitched
  // into prompts — never spelled out ("ay" comes out as "eye") or said mid-sentence.
  // e.g. "What does drum end with?" + "drum!" + /m/ + /m/
  const E = ENGLISH, L = E.letters, cap = s => s[0].toUpperCase() + s.slice(1);
  for (const l of Object.keys(L)) {
    add('ph_' + l, 'en', L[l].say, `audio/phonics/${l}.m4a`);
    add('e_nm_' + l, 'en', `${l.toUpperCase()}!`);
    add('e_word_' + L[l].word, 'en', `${cap(L[l].word)}!`);
  }
  add('e_whichletter', 'en', 'Which one is the letter…');
  add('e_soundq', 'en', 'Which letter makes this sound?');
  add('e_bitsq', 'en', 'Which one makes these sounds?');
  for (const lv of E.levels) {
    for (const it of lv.items) {
      if (lv.type === 'first' || lv.type === 'last') {
        add('e_word_' + it, 'en', `${cap(it)}!`);
        add(`e_${lv.type}q_${it}`, 'en', `What does ${it} ${lv.type === 'first' ? 'start' : 'end'} with?`);
        add(`e_${lv.type}is_${it}`, 'en', `${cap(it)} ${lv.type === 'first' ? 'starts' : 'ends'} with…`);
      } else if (lv.type === 'spell') {
        add('e_spell_' + it, 'en', `Which one spells ${it}?`);
        add('e_word_' + it, 'en', `${cap(it)}!`);
      }
    }
  }
  const en = {
    great: 'Great job!', yes: 'Yes! You got it!', oops: 'Oops! It is this one.',
    three: 'Three', two: 'Two', one: 'One', go: 'Go!',
    gas: 'Want some gas?', gaslow: 'Your gas is low! Want some gas?', full: 'All full!',
    outofgas: 'Oh no! Out of gas!', congrats: 'Congratulations! You did it!', soclose: 'So close! Try again!',
    need3: 'Get them all right for three stars!', unlocked: 'New level!', coins: 'Coins!',
    newcar: 'Cool new car!', shop: 'The car shop!',
  };
  for (const [id, t] of Object.entries(en)) add('en_' + id, 'en', t);
  return C;
})();
window.CLIPS = CLIPS;

const clipPlain = text => text.replace(/\[\[[^|\]]*\|([^\]]*)\]\]/g, '$1');
