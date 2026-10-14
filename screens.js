/* Screens: home (pick Spanish or English), level map, practice cards, the reward
   screen (stars, then coins flying into your coin box), and the car shop.
   Parent shortcuts: ?unlock=all opens every level for this visit, ?reset wipes progress,
   ?restore=es10 (or en12) marks levels 1-10 done again if progress was ever lost (never lowers
   stars; add &coins=50 to top coins back up), ?save=test plays on a separate throwaway save. */
const q0 = new URLSearchParams(location.search);
const SAVE_KEY = 'cdp-save' + (q0.get('save') ? '-' + q0.get('save').replace(/\W/g, '') : '');
const SAVE = (() => {
  // vocab: what he knows per Spanish word · esPath: quizzes and generated levels after level 10
  const blank = () => ({ stars: { es: {}, en: {} }, coins: 0, car: 0, owned: [0], lang: 'es', vocab: {}, esPath: [] });
  let s = blank();
  try {
    const q = q0;
    if (q.has('reset')) { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(SAVE_KEY + '-backup'); }
    // every save is also kept in a backup slot; if the main one ever goes missing, use the backup
    const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(SAVE_KEY + '-backup');
    const saved = JSON.parse(raw || '{}');
    if (saved.stars && !saved.stars.es) saved.stars = { es: saved.stars, en: {} }; // older saves were Spanish-only
    s = { ...s, ...saved, stars: { ...s.stars, ...(saved.stars || {}) } };
    if (s.enLayout !== 2) { // four first-sound levels were added at 15: old English 15-20 are now 19-24
      const moved = {};
      for (const [k, v] of Object.entries(s.stars.en)) moved[+k >= 15 ? +k + 4 : +k] = v;
      s.stars.en = moved; s.enLayout = 2;
    }
    for (const r of q.getAll('restore')) { // e.g. es10: levels 1-10 of Spanish count as done again
      const m = /^(es|en)(\d+)$/.exec(r);
      if (m) for (let lvl = 1; lvl <= +m[2]; lvl++) s.stars[m[1]][lvl] = 3;
    }
    if (q.has('coins')) s.coins = Math.max(s.coins, +q.get('coins') || 0);
    if (q.get('unlock') === 'all') s.unlockAll = true;
  } catch {}
  return s;
})();
function persist() {
  try {
    const { unlockAll, ...keep } = SAVE, json = JSON.stringify(keep);
    localStorage.setItem(SAVE_KEY, json); localStorage.setItem(SAVE_KEY + '-backup', json);
  } catch {}
}
if (q0.has('restore') || q0.has('coins')) persist(); // keep a restore even if he closes the page right away

const SCREENS = ['home', 'menu', 'learn', 'race', 'reward', 'shop', 'pick', 'checkup'];
function show(id) { for (const s of SCREENS) $(s).classList.toggle('hidden', s !== id); }
// generated Spanish levels exist only once he has reached them
const isUnlocked = (lang, lvl) => (lang === 'es' && lvl > ES_FIXED ? !!esLevel(lvl)
  : lvl === 1 || !!SAVE.unlockAll || SAVE.stars[lang][lvl - 1] === 3);
const starText = n => '⭐'.repeat(n) + '☆'.repeat(3 - n);
const COIN = '<span class="coin"></span>';
const nextCarIdx = () => CARS.findIndex((c, i) => !SAVE.owned.includes(i));
const canBuyCar = () => { const i = nextCarIdx(); return i >= 0 && SAVE.coins >= CARS[i].price; };
function updateBank() {
  document.querySelectorAll('.bank-count').forEach(e => { e.textContent = SAVE.coins; });
  document.querySelectorAll('.shop-btn').forEach(e => e.classList.toggle('glow', canBuyCar()));
}

/* ---------- home: pick a language ---------- */
function renderHome() { updateBank(); show('home'); }
for (const lang of ['es', 'en']) {
  $(lang === 'es' ? 'modeEs' : 'modeEn').onclick = () => { ensureAudio(); SFX.click(); SAVE.lang = lang; persist(); renderMenu(); };
}

/* ---------- level map ---------- */
const renderLevelThumb = (canvas, lang, lvl) => renderObstacleThumb(canvas, levelObstacle(lang, lvl));
function mapNodes(lang) {
  const nodes = Array.from({ length: levelCount(lang) }, (_, i) => ({ type: 'level', lvl: i + 1 }));
  if (lang !== 'es') return nodes;
  syncEsPath();
  return [...nodes, ...SAVE.esPath, { type: 'mystery' }];
}
function renderMenu() {
  const lang = SAVE.lang, t = MODE_INFO[lang].t;
  $('mapTitle').textContent = lang === 'es' ? '🇪🇸 Español' : '🔤 English';
  $('mapSub').textContent = t.subtitle;
  updateBank(); show('menu');
  const nodes = mapNodes(lang);
  const open = n => (n.type === 'quiz' ? true : n.type === 'level' && isUnlocked(lang, n.lvl));
  const done = n => (n.type === 'quiz' ? n.done : n.type === 'level' && (SAVE.stars[lang][n.lvl] || 0) === 3);
  const frontier = nodes.find(n => open(n) && !done(n));
  const wrap = $('levels'); wrap.innerHTML = '';
  for (const n of nodes) {
    const b = document.createElement('button'), isOpen = open(n);
    b.className = 'lvl' + (n.type !== 'level' ? ' ' + n.type : '') + (isOpen ? '' : ' locked') + (n === frontier ? ' next' : '');
    if (n.type === 'quiz') {
      b.innerHTML = `<div class="num">🏆 ${n.q}</div><div class="big-emoji">🏆</div><div class="nm">Prueba</div>
        <div class="st">${n.done ? `✔ ${n.score} / ${n.total}` : '¡Ahora!'}</div>`;
      b.onclick = () => { ensureAudio(); SFX.click(); openCheckup(n); };
    } else if (n.type === 'mystery') {
      b.innerHTML = '<div class="num">?</div><div class="big-emoji">❓</div><div class="nm">…</div><div class="st">⭐⭐⭐</div><div class="lock">🔒</div>';
      b.onclick = () => { SFX.bonk(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); Voice.say(MODE_INFO[lang].clip.need3); };
    } else {
      const lvl = n.lvl, stars = SAVE.stars[lang][lvl] || 0, gen = lang === 'es' && lvl > ES_FIXED;
      b.innerHTML = `<div class="num">${lvl}</div><canvas class="thumb"></canvas><div class="nm">${isOpen || !gen ? levelName(lang, lvl) : '…'}</div>
        <div class="st">${isOpen ? starText(stars) : '⭐⭐⭐'}</div>${isOpen ? '' : '<div class="lock">🔒</div>'}`;
      b.onclick = () => {
        ensureAudio();
        if (isOpen) return openLearn(lang, lvl);
        SFX.bonk(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
        Voice.say(MODE_INFO[lang].clip.need3);
      };
    }
    wrap.appendChild(b);
    if (n.type === 'level') {
      const canvas = b.querySelector('canvas');
      if (lang === 'es' && n.lvl > ES_FIXED && !esLevel(n.lvl).pick) renderObstacleThumb(canvas, 'custom', '🎲'); // he picks the obstacle
      else renderLevelThumb(canvas, lang, n.lvl);
    }
  }
  const f = wrap.querySelector('.next'); if (f) f.scrollIntoView({ block: 'nearest' });
}
$('mapBack').onclick = () => { Voice.stop(); renderHome(); };

/* ---------- practice before the race ---------- */
let current = { lang: 'es', lvl: 1 };
function openLearn(lang, lvl) {
  current = { lang, lvl };
  const t = MODE_INFO[lang].t, cards = learnCards(lang, lvl);
  $('learnTitle').textContent = `${t.level} ${lvl}: ${levelName(lang, lvl)}`;
  $('learnHint').textContent = t.learnHint;
  $('hearAll').textContent = t.hearAll; $('goRace').textContent = t.race;
  const wrap = $('words'); wrap.innerHTML = '';
  cards.forEach(cd => {
    const c = document.createElement('button');
    c.className = 'word';
    c.innerHTML = (cd.tag ? `<div class="tag">${cd.tag === 'new' ? '✨' : '🔁'}</div>` : '') + `<div class="pic${cd.letter ? ` letter len${Math.min(3, [...cd.big].length)}` : ''}">${cd.big}</div>`
      + (cd.title ? `<div class="es${lang === 'en' ? ' abc' : ''}">${cd.title}</div>` : '')
      + (cd.sub ? `<div class="en">${cd.sub}</div>` : '') + '<div class="spk">🔊</div>';
    c.onclick = () => {
      ensureAudio();
      document.querySelectorAll('.word.playing').forEach(x => x.classList.remove('playing'));
      c.classList.add('playing', 'heard');
      Voice.seq(cd.clips, () => c.classList.remove('playing'));
    };
    c.dataset.clips = cd.clips.join(',');
    wrap.appendChild(c);
  });
  Voice.preload(cards.flatMap(c => c.clips));
  show('learn'); $('learn').scrollTop = 0;
}
$('learnBack').onclick = () => { Voice.stop(); renderMenu(); };
$('hearAll').onclick = () => {
  ensureAudio();
  const cards = [...document.querySelectorAll('.word')];
  let i = 0;
  const next = () => {
    cards.forEach(c => c.classList.remove('playing'));
    if (i >= cards.length || $('learn').classList.contains('hidden')) return;
    const c = cards[i++]; c.classList.add('playing', 'heard');
    c.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    Voice.seq(c.dataset.clips.split(','), () => setTimeout(next, 350));
  };
  next();
};
$('goRace').onclick = () => {
  ensureAudio(); Voice.stop();
  if (current.lang === 'es' && current.lvl > ES_FIXED) openPicker(current.lvl); else startRace(current.lang, current.lvl);
};
$('raceHome').onclick = () => { stopRace(); renderMenu(); };

/* ---------- reward: stars, then coins fly into the coin box ---------- */
// Where "next" goes after a level, if he can go there now (Spanish nodes exist only once reached).
function nextOpen(lang, lvl) {
  if (lang === 'es' && lvl >= ES_FIXED) return esNextAfter(lvl);
  return lvl < levelCount(lang) && isUnlocked(lang, lvl + 1) ? { type: 'level', lvl: lvl + 1 } : null;
}
function showReward(sum) {
  const { lang, lvl, result } = sum, info = MODE_INFO[lang], t = info.t;
  const won = result === 'win', missed = sum.asked - sum.correct;
  const stars = won ? (missed === 0 ? 3 : missed <= 2 ? 2 : 1) : 0;
  const hadNext = !!nextOpen(lang, lvl);
  if (stars > (SAVE.stars[lang][lvl] || 0)) SAVE.stars[lang][lvl] = stars;
  const nx = nextOpen(lang, lvl), unlockedNow = !hadNext && !!nx;
  const hasMore = lang === 'es' || lvl < levelCount(lang);
  const coins = 2 + stars * 2 + (unlockedNow ? 5 : 0); // 2 for trying, 2 per star, 5 bonus for a new level
  const startBank = SAVE.coins;
  SAVE.coins += coins; persist();
  stopRace();
  current = { lang, lvl };

  $('rwTitle').textContent = won ? t.congrats : result === 'gas' ? t.out : t.close;
  $('rwScore').textContent = `✔ ${sum.correct} / ${sum.asked}`;
  $('rwEarned').innerHTML = `+${coins} ${COIN}`; $('rwEarned').classList.remove('show');
  $('rwBank').textContent = startBank;
  for (const id of ['rwNeed', 'rwUnlock', 'rwButtons']) $(id).classList.add('hidden');
  $('rwUnlockNum').textContent = nx ? (nx.type === 'quiz' ? '🏆' : nx.lvl) : '';
  const starEls = [...$('rwStars').children];
  starEls.forEach(s => s.classList.remove('on'));
  show('reward');
  renderCarThumb($('rwCar'), CARS[SAVE.car], false);
  $('rwCar').classList.toggle('sad', !won);
  Voice.say(won ? info.clip.congrats : result === 'gas' ? info.clip.out : info.clip.close);
  if (won) { SFX.win(); confetti(); } else SFX.lose();

  const T = 900;
  for (let i = 0; i < stars; i++) setTimeout(() => { starEls[i].classList.add('on'); SFX.coin(); }, T + i * 450);
  setTimeout(() => flyCoins(coins, startBank, () => {
    if (unlockedNow) { $('rwUnlock').classList.remove('hidden'); SFX.unlock(); Voice.say(nx.type === 'quiz' ? 'p_prueba' : info.clip.unlocked); }
    else if (won && stars < 3 && hasMore) { $('rwNeed').classList.remove('hidden'); Voice.say(info.clip.need3); }
    // The big button is always the obvious next step: forward if you can, otherwise try again.
    const canNext = !!nx;
    $('rwNext').classList.toggle('hidden', !canNext);
    $('rwAgain').className = canNext ? 'round-btn' : 'big-btn primary';
    $('rwAgain').innerHTML = canNext ? '🔁' : `🔁 ${t.again}`;
    $('rwNextLabel').textContent = nx && nx.type === 'quiz' ? '¡Prueba!' : t.next;
    REWARD_NEXT = nx;
    $('rwButtons').classList.remove('hidden');
    updateBank();
  }), T + stars * 450 + 300);
}
function flyCoins(n, start, done) {
  const box = $('rwBox').getBoundingClientRect(), from = $('rwCar').getBoundingClientRect();
  $('rwEarned').classList.add('show');
  let landed = 0;
  for (let i = 0; i < n; i++) setTimeout(() => {
    const c = document.createElement('div');
    const sx = from.left + from.width / 2 + (Math.random() - 0.5) * 120, sy = from.top + from.height * 0.4;
    c.className = 'coin flying';
    c.style.left = sx - 18 + 'px'; c.style.top = sy - 18 + 'px';
    c.style.setProperty('--dx', box.left + box.width / 2 - sx + 'px');
    c.style.setProperty('--dy', box.top + box.height / 2 - sy + 'px');
    document.body.appendChild(c);
    setTimeout(() => {
      c.remove(); landed++;
      $('rwBank').textContent = start + landed; SFX.coin();
      $('rwBox').classList.remove('bump'); void $('rwBox').offsetWidth; $('rwBox').classList.add('bump');
      if (landed === n) setTimeout(done, 350);
    }, 700);
  }, i * 160);
}
function confetti() {
  const bits = ['🎉', '⭐', '🎊', '🏁', '✨'];
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('div');
    s.className = 'confetti'; s.textContent = bits[i % bits.length];
    s.style.left = Math.random() * 100 + 'vw';
    s.style.animationDuration = 2 + Math.random() * 2 + 's';
    s.style.animationDelay = Math.random() * 0.8 + 's';
    document.body.appendChild(s); setTimeout(() => s.remove(), 5000);
  }
}
let REWARD_NEXT = null;
$('rwNext').onclick = () => { SFX.click(); if (REWARD_NEXT.type === 'quiz') openCheckup(REWARD_NEXT); else openLearn(current.lang, REWARD_NEXT.lvl); };
$('rwAgain').onclick = () => { SFX.click(); openLearn(current.lang, current.lvl); };
$('rwHome').onclick = () => { SFX.click(); renderMenu(); };

/* ---------- car shop ---------- */
let shopReturn = 'home', shopSheet = 0;
const SHEET_SIZE = 8, SHEET_ICONS = ['🚗', '🚒', '🦖']; // shop pages: starter cars, hero trucks, epic cars
function openShop(from) {
  const t = MODE_INFO[SAVE.lang].t, nextBuy = nextCarIdx();
  if (from) { shopReturn = from; shopSheet = Math.floor((nextBuy >= 0 ? nextBuy : SAVE.car) / SHEET_SIZE); }
  $('shopTitle').textContent = t.shop;
  updateBank(); show('shop');
  const tabs = $('sheets'); tabs.innerHTML = '';
  SHEET_ICONS.forEach((icon, k) => {
    const tab = document.createElement('button');
    tab.className = 'sheet-tab' + (k === shopSheet ? ' on' : '');
    const reached = nextBuy < 0 || nextBuy >= k * SHEET_SIZE;
    tab.innerHTML = icon + (reached ? '' : '<span class="tab-lock">🔒</span>');
    tab.setAttribute('aria-label', `Page ${k + 1}`);
    tab.onclick = () => { SFX.click(); shopSheet = k; openShop(); };
    tabs.appendChild(tab);
  });
  const wrap = $('cars'); wrap.innerHTML = '';
  CARS.forEach((car, i) => {
    if (Math.floor(i / SHEET_SIZE) !== shopSheet) return;
    const owned = SAVE.owned.includes(i), isNext = i === nextBuy, locked = !owned && !isNext;
    const card = document.createElement('button');
    card.className = 'car' + (SAVE.car === i ? ' selected' : '') + (locked ? ' locked' : '') + (isNext ? ' is-next' : '');
    card.innerHTML = `<canvas class="car-thumb"></canvas><div class="car-name">${locked ? '?' : car.name}</div><div class="car-foot"></div>`;
    wrap.appendChild(card);
    renderCarThumb(card.querySelector('canvas'), car, locked);
    const foot = card.querySelector('.car-foot');
    if (owned) {
      foot.innerHTML = SAVE.car === i ? '<span class="drive-on">✅</span>' : '<span class="drive">🚗</span>';
      card.onclick = () => { SAVE.car = i; persist(); SFX.horn(); openShop(); };
    } else if (isNext && SAVE.coins >= car.price) {
      foot.innerHTML = `<span class="buy-btn">${COIN} ${car.price}</span>`;
      card.classList.add('can-buy');
      card.onclick = () => buyCar(i);
    } else if (isNext) {
      foot.innerHTML = `<div class="save-bar"><div style="width:${Math.min(100, SAVE.coins / car.price * 100)}%"></div></div>
        <div class="price">${COIN} ${SAVE.coins} / ${car.price}</div>`;
      card.onclick = () => { SFX.bonk(); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); };
    } else {
      foot.innerHTML = `<div class="price">🔒 ${COIN} ${car.price}</div>`;
      card.onclick = () => SFX.bonk();
    }
  });
}
function buyCar(i) {
  SAVE.coins -= CARS[i].price; SAVE.owned.push(i); SAVE.car = i; persist();
  SFX.unlock(); confetti(); Voice.say(MODE_INFO[SAVE.lang].clip.newcar);
  openShop();
  $('cars').children[i % SHEET_SIZE].classList.add('pop');
}
document.querySelectorAll('.shop-btn').forEach(b => {
  b.onclick = () => { ensureAudio(); SFX.click(); Voice.say(MODE_INFO[SAVE.lang].clip.shop); openShop(b.dataset.from); };
});
$('shopBack').onclick = () => {
  SFX.click();
  if (shopReturn === 'menu') renderMenu(); else if (shopReturn === 'reward') { updateBank(); show('reward'); } else renderHome();
};

/* ---------- pick the obstacle (generated Spanish levels) ---------- */
function openPicker(lvl) {
  $('pickTitle').textContent = '¿Qué obstáculo quieres?';
  show('pick'); $('pick').scrollTop = 0;
  const picks = $('picks'), emojis = $('emojiPick');
  picks.innerHTML = ''; emojis.innerHTML = ''; picks.classList.remove('hidden'); emojis.classList.add('hidden');
  const go = pick => { SFX.click(); Voice.stop(); startRace('es', lvl, pick); };
  const tile = (wrap, kind, name, emoji, onTap) => {
    const b = document.createElement('button');
    b.className = 'pick' + (kind === 'custom' ? ' invent' : '');
    b.innerHTML = `<canvas></canvas><div class="nm">${name}</div>`;
    wrap.appendChild(b);
    renderObstacleThumb(b.querySelector('canvas'), kind, emoji);
    b.onclick = onTap;
  };
  for (const [kind, name] of OBSTACLE_PICKS) tile(picks, kind, name, null, () => go({ kind }));
  tile(picks, 'custom', '¡Inventa!', '✨', () => { // invent your own: any picture becomes the obstacle
    SFX.click(); Voice.say('p_inventa');
    picks.classList.add('hidden'); emojis.classList.remove('hidden'); $('pickTitle').textContent = '¡Inventa tu obstáculo!';
    for (const e of CUSTOM_EMOJI) {
      const b = document.createElement('button');
      b.className = 'pick emoji'; b.textContent = e;
      b.onclick = () => go({ kind: 'custom', emoji: e });
      emojis.appendChild(b);
    }
  });
  Voice.say('p_elige');
}
$('pickBack').onclick = () => { SFX.click(); openLearn('es', current.lvl); };

/* ---------- check-in quiz: what does he know, what does he keep missing? ---------- */
let CK = null;
function openCheckup(node) {
  CK = { node, qs: makeCheckup(node), i: 0, right: 0, missed: [] };
  show('checkup'); updateBank();
  $('ckIntro').classList.remove('hidden'); $('ckAsk').classList.add('hidden'); $('ckDone').classList.add('hidden');
  $('ckTitle').textContent = `¡Prueba ${node.q}!`;
  $('ckSub').textContent = `${CK.qs.length} palabras`;
  $('ckDots').innerHTML = CK.qs.map(() => '<span class="ck-dot"></span>').join('');
  Voice.say('p_prueba');
}
$('ckStart').onclick = () => { ensureAudio(); SFX.click(); ckAsk(); };
$('ckBack').onclick = () => { SFX.click(); Voice.stop(); renderMenu(); };
function ckAsk() {
  const q = CK.qs[CK.i], dots = $('ckDots').children;
  $('ckIntro').classList.add('hidden'); $('ckAsk').classList.remove('hidden');
  dots[CK.i].classList.add('now');
  $('ckPrompt').innerHTML = q.prompt; $('ckFeedback').textContent = '';
  const box = $('ckChoices'); box.innerHTML = '';
  let answered = false;
  q.options.forEach(opt => {
    const b = document.createElement('button');
    b.className = 'choice'; b.textContent = q.tile(opt); b.setAttribute('aria-label', q.aria(opt));
    b.onclick = () => {
      if (answered) return; answered = true;
      const right = opt === q.answer;
      noteAnswer(q.answer, right);
      dots[CK.i].classList.remove('now'); dots[CK.i].classList.add(right ? 'ok' : 'miss');
      if (right) {
        CK.right++; SAVE.coins++; persist(); updateBank(); SFX.coin();
        b.classList.add('right'); [...box.children].forEach(c => c !== b && c.classList.add('faded'));
        $('ckFeedback').textContent = '¡Sí! 🎉';
        Voice.say(MODE_INFO.es.praise[Math.random() * 2 | 0]);
        setTimeout(ckNext, 1000);
      } else {
        CK.missed.push(q.answer); SFX.wrong();
        b.classList.add('wrong'); box.children[q.options.indexOf(q.answer)].classList.add('right');
        $('ckFeedback').textContent = q.revealText;
        let moved = false;
        const go = () => { if (!moved) { moved = true; setTimeout(ckNext, 400); } };
        Voice.seq(q.reveal, go); setTimeout(go, 6000);
      }
    };
    box.appendChild(b);
  });
  $('ckSay').onclick = () => Voice.seq(q.replay);
  Voice.seq(q.ask);
}
function ckNext() { if ($('checkup').classList.contains('hidden')) return; CK.i++; if (CK.i < CK.qs.length) ckAsk(); else ckFinish(); }
function ckFinish() {
  const node = CK.node, W = VOCAB.words, missed = [...new Set(CK.missed)];
  Object.assign(node, { done: true, score: CK.right, total: CK.qs.length, missed });
  SAVE.coins += 3; persist(); updateBank(); // 3 bonus coins for finishing
  syncEsPath(); // builds the next level now, from what he just showed
  const nxt = SAVE.esPath[SAVE.esPath.indexOf(node) + 1];
  $('ckAsk').classList.add('hidden'); $('ckDone').classList.remove('hidden');
  $('ckScore').textContent = `¡${CK.right} de ${CK.qs.length}!`;
  $('ckMissedRow').classList.toggle('hidden', !missed.length);
  $('ckMissed').textContent = missed.map(id => W[id].pic).join('');
  $('ckNew').textContent = nxt.fresh.map(id => W[id].pic).join('') || '🔁';
  const known = introducedWords().filter(isKnown).length;
  $('ckParent').textContent = `Para mamá y papá: acertó ${CK.right} de ${CK.qs.length}`
    + (missed.length ? `; practicará ${missed.map(id => `${W[id].es} (${W[id].en})`).join(', ')}` : '')
    + `. El nivel ${nxt.lvl} repasa ${nxt.review.length} y enseña ${nxt.fresh.length} palabras nuevas`
    + (nxt.fresh.length ? ` (${nxt.fresh.map(id => W[id].es).join(', ')})` : '') + `. Palabras comprobadas que ya sabe: ${known}.`;
  $('ckNext').onclick = () => { SFX.click(); openLearn('es', nxt.lvl); };
  SFX.win(); confetti();
  Voice.seq(['p_sabes', ...(missed.length ? ['p_practicar'] : []), 'p_nuevas']);
}

renderHome();
