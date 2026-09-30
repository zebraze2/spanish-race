/* Screens: home (pick Spanish or English), level map, practice cards, the reward
   screen (stars, then coins flying into your coin box), and the car shop.
   Parent shortcuts: ?unlock=all opens every level for this visit, ?reset wipes progress. */
const SAVE = (() => {
  const blank = () => ({ stars: { es: {}, en: {} }, coins: 0, car: 0, owned: [0], lang: 'es' });
  let s = blank();
  try {
    const q = new URLSearchParams(location.search);
    if (q.has('reset')) localStorage.removeItem('cdp-save');
    const saved = JSON.parse(localStorage.getItem('cdp-save') || '{}');
    if (saved.stars && !saved.stars.es) saved.stars = { es: saved.stars, en: {} }; // older saves were Spanish-only
    s = { ...s, ...saved, stars: { ...s.stars, ...(saved.stars || {}) } };
    if (q.get('unlock') === 'all') s.unlockAll = true;
  } catch {}
  return s;
})();
function persist() {
  try { const { unlockAll, ...keep } = SAVE; localStorage.setItem('cdp-save', JSON.stringify(keep)); } catch {}
}

const SCREENS = ['home', 'menu', 'learn', 'race', 'reward', 'shop'];
function show(id) { for (const s of SCREENS) $(s).classList.toggle('hidden', s !== id); }
const isUnlocked = (lang, lvl) => lvl === 1 || !!SAVE.unlockAll || SAVE.stars[lang][lvl - 1] === 3;
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
function renderLevelThumb(canvas, lang, lvl) {
  const kind = lvl === levelCount(lang) ? 'trophy' : levelObstacles(lang, lvl)[0];
  if (kind !== 'trophy' && KINDS[kind].drawn) return renderObstacleThumb(canvas, kind);
  withCtx(canvas, (w, h) => {
    ctx.font = `${h * 0.66}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(kind === 'trophy' ? '🏆' : KINDS[kind].icon, w / 2, h / 2 + 2);
  });
}
function renderMenu() {
  const lang = SAVE.lang, t = MODE_INFO[lang].t, n = levelCount(lang);
  $('mapTitle').textContent = lang === 'es' ? '🇪🇸 Español' : '🔤 English';
  $('mapSub').textContent = t.subtitle;
  updateBank(); show('menu');
  let frontier = 0;
  for (let lvl = 1; lvl <= n && !frontier; lvl++) if (isUnlocked(lang, lvl) && (SAVE.stars[lang][lvl] || 0) < 3) frontier = lvl;
  const wrap = $('levels'); wrap.innerHTML = '';
  for (let lvl = 1; lvl <= n; lvl++) {
    const open = isUnlocked(lang, lvl), stars = SAVE.stars[lang][lvl] || 0;
    const b = document.createElement('button');
    b.className = 'lvl' + (open ? '' : ' locked') + (lvl === frontier ? ' next' : '');
    b.innerHTML = `<div class="num">${lvl}</div><canvas class="thumb"></canvas><div class="nm">${levelName(lang, lvl)}</div>
      <div class="st">${open ? starText(stars) : '⭐⭐⭐'}</div>${open ? '' : '<div class="lock">🔒</div>'}`;
    wrap.appendChild(b);
    renderLevelThumb(b.querySelector('canvas'), lang, lvl);
    b.onclick = () => {
      ensureAudio();
      if (open) return openLearn(lang, lvl);
      SFX.bonk(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
      Voice.say(MODE_INFO[lang].clip.need3);
    };
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
    c.innerHTML = `<div class="pic${cd.letter ? ` letter len${Math.min(3, [...cd.big].length)}` : ''}">${cd.big}</div>`
      + (cd.title ? `<div class="es${lang === 'en' ? ' abc' : ''}">${cd.title}</div>` : '')
      + (cd.sub ? `<div class="en">${cd.sub}</div>` : '') + '<div class="spk">🔊</div>';
    c.onclick = () => {
      ensureAudio();
      document.querySelectorAll('.word.playing').forEach(x => x.classList.remove('playing'));
      c.classList.add('playing', 'heard');
      Voice.say(cd.clip, () => c.classList.remove('playing'));
    };
    c.dataset.clip = cd.clip;
    wrap.appendChild(c);
  });
  Voice.preload(cards.map(c => c.clip));
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
    Voice.say(c.dataset.clip, () => setTimeout(next, 350));
  };
  next();
};
$('goRace').onclick = () => { ensureAudio(); Voice.stop(); startRace(current.lang, current.lvl); };
$('raceHome').onclick = () => { stopRace(); renderMenu(); };

/* ---------- reward: stars, then coins fly into the coin box ---------- */
function showReward(sum) {
  const { lang, lvl, result } = sum, info = MODE_INFO[lang], t = info.t;
  const won = result === 'win', missed = sum.asked - sum.correct;
  const stars = won ? (missed === 0 ? 3 : missed <= 2 ? 2 : 1) : 0;
  const next = lvl + 1, hadNext = isUnlocked(lang, next);
  if (stars > (SAVE.stars[lang][lvl] || 0)) SAVE.stars[lang][lvl] = stars;
  const unlockedNow = !hadNext && next <= levelCount(lang) && isUnlocked(lang, next);
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
  $('rwUnlockNum').textContent = next;
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
    if (unlockedNow) { $('rwUnlock').classList.remove('hidden'); SFX.unlock(); Voice.say(info.clip.unlocked); }
    else if (won && stars < 3 && next <= levelCount(lang)) { $('rwNeed').classList.remove('hidden'); Voice.say(info.clip.need3); }
    // The big button is always the obvious next step: forward if you can, otherwise try again.
    const canNext = next <= levelCount(lang) && isUnlocked(lang, next);
    $('rwNext').classList.toggle('hidden', !canNext);
    $('rwAgain').className = canNext ? 'round-btn' : 'big-btn primary';
    $('rwAgain').innerHTML = canNext ? '🔁' : `🔁 ${t.again}`;
    $('rwNextLabel').textContent = t.next;
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
$('rwNext').onclick = () => { SFX.click(); openLearn(current.lang, current.lvl + 1); };
$('rwAgain').onclick = () => { SFX.click(); openLearn(current.lang, current.lvl); };
$('rwHome').onclick = () => { SFX.click(); renderMenu(); };

/* ---------- car shop ---------- */
let shopReturn = 'home';
function openShop(from) {
  if (from) shopReturn = from;
  const t = MODE_INFO[SAVE.lang].t, nextBuy = nextCarIdx();
  $('shopTitle').textContent = t.shop;
  updateBank(); show('shop');
  const wrap = $('cars'); wrap.innerHTML = '';
  CARS.forEach((car, i) => {
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
  $('cars').children[i].classList.add('pop');
}
document.querySelectorAll('.shop-btn').forEach(b => {
  b.onclick = () => { ensureAudio(); SFX.click(); Voice.say(MODE_INFO[SAVE.lang].clip.shop); openShop(b.dataset.from); };
});
$('shopBack').onclick = () => {
  SFX.click();
  if (shopReturn === 'menu') renderMenu(); else if (shopReturn === 'reward') { updateBank(); show('reward'); } else renderHome();
};

renderHome();
