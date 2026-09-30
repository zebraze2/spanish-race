/* Every spoken line in the game, keyed by clip id (recorded as audio/<id>.m4a).
   [[ipa|spelling]] marks a speech sound: tools/make-audio.swift voices the IPA,
   the browser fallback voice just reads the spelling. */
const CLIPS = (() => {
  const C = {};
  const add = (id, lang, text) => { C[id] = { lang, text }; };

  // Spanish mode
  for (const [id, w] of Object.entries(VOCAB.words)) add('w_' + id, 'es', w.say || w.es);
  for (const [id, t] of Object.entries(VOCAB.phrases.es)) add('p_' + id, 'es', t);

  // English mode
  const E = ENGLISH, L = E.letters;
  const snd = l => `[[${L[l].ipa}|${L[l].say}]]`;
  const sayIt = w => (E.spell[w].ipa ? `[[${E.spell[w].ipa}|${w}]]` : w);
  for (const l of Object.keys(L)) {
    add('e_name_' + l, 'en', `Which one is the letter ${L[l].name}?`);
    add('e_sound_' + l, 'en', `Which letter makes the sound ${snd(l)}?`);
    add('e_learn_' + l, 'en', `${L[l].name}. ${snd(l)}, ${snd(l)}, ${L[l].word}!`);
  }
  for (const lv of E.levels) {
    for (const it of lv.items) {
      if (lv.type === 'first') {
        add('e_first_' + it, 'en', `What does ${it} start with? ${snd(it[0])}, ${snd(it[0])}, ${it}.`);
        add('e_lfirst_' + it, 'en', `${it}. ${it} starts with ${L[it[0]].name}.`);
      } else if (lv.type === 'last') {
        const last = it[it.length - 1];
        add('e_last_' + it, 'en', `What does ${it} end with? ${it}.`);
        add('e_llast_' + it, 'en', `${it}. ${it} ends with ${L[last].name}.`);
      } else if (lv.type === 'spell') {
        add('e_spell_' + it, 'en', `Which one spells ${sayIt(it)}?`);
        add('e_lspell_' + it, 'en', `${[...it].map(c => L[c].name).join(', ')}. ${sayIt(it)}!`);
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
