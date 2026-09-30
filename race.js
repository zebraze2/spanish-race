/* The race: drive toward each obstacle, answer the question to get past it
   (jump it, or lower the bridge), choose when to stop for gas, beat the robot. */
const BASE_SPEED = 110, BOOST_MULT = 2.2, BOOST_TIME = 1.6, SLOW_SPEED = 45;
const CAR_FRONT = 72, CAR_BACK = 72;
const QUIZ_AHEAD = 60;      // the quiz pops up when the car's nose is this close to an obstacle
const JUMP_PEAK = 150;
const GAS_PER_LEG = 0.42;   // each station-to-station leg burns 42%: skip two stations in a row and you run dry
const BRIDGES = ['drawbridge', 'gatorbridge']; // crossed on a bridge instead of jumped

let G = null, raf = 0, lastT = 0;

/* One obstacle per question; a gas station after every other obstacle. */
function buildTrack(lang, lvl) {
  const qs = makeQuestions(lang, lvl), kind = levelObstacle(lang, lvl), w = KINDS[kind].w, obs = [], stations = [];
  let x = 520;
  qs.forEach((q, i) => {
    obs.push({ x: x + w / 2, w, kind, q, state: 'ready', asked: false, bridge: 1, chompT: 0 });
    x += w;
    if (i % 2 === 0 && i < qs.length - 1) { stations.push({ x: x + 300 }); x += 600; }
    else x += 420;
  });
  return { obs, stations, len: x + 120 };
}

// lang: 'es' (Spanish words) or 'en' (English letters & spelling)
function startRace(lang, lvl) {
  const T = buildTrack(lang, lvl);
  const boostGain = (BOOST_MULT - 1) * BASE_SPEED * BOOST_TIME;
  const tBest = (T.len - T.obs.length * boostGain) / BASE_SPEED + T.stations.length * (0.8 + 2.2 * GAS_PER_LEG);
  const lastSt = T.stations[T.stations.length - 1];
  G = {
    lang, lvl, ...T, info: MODE_INFO[lang],
    legs: [0, ...T.stations.map(s => s.x)],
    avgLeg: lastSt ? lastSt.x / T.stations.length : 1000,
    cpuSpeed: T.len / (tBest * cpuMargin(lang, lvl)),
    carIdx: SAVE.car || 0,
    p: { x: 0, h: 0, vy: 0, g: 1500, v: 0, boostT: 0, backT: 0, slowT: 0, spinT: 0, spinDur: 1,
         flatT: 0, sootT: 0, mudT: 0, wheel: 0, gas: 1, out: false, outT: 0 },
    cpu: { x: 0, wheel: 0 },
    cam: 0, mode: 'countdown', t: 0, correct: 0, asked: 0, parts: [], floaters: [], fill: null, glugT: 0, dustT: 0,
  };
  $('lvlTag').textContent = `${G.info.t.level} ${lvl}`;
  $('gasTitle').textContent = G.info.t.gas;
  for (const id of ['quiz', 'gasAsk']) $(id).classList.add('hidden');
  show('race'); resizeCanvas();
  G.cam = G.p.x - VIEW.w * 0.3;
  Voice.preload([...G.info.countClips, ...G.obs.flatMap(o => [...o.q.ask, ...o.q.reveal])]);
  countdown();
  cancelAnimationFrame(raf); lastT = performance.now(); raf = requestAnimationFrame(loop);
}
function stopRace() { G = null; cancelAnimationFrame(raf); Voice.stop(); }

function countdown() {
  const el = $('count'), seq = G.info.count, keys = G.info.countClips;
  let i = 0;
  const step = () => {
    if (!G || G.mode !== 'countdown') return;
    if (i === seq.length) { el.classList.add('hidden'); G.mode = 'race'; return; }
    el.textContent = seq[i]; el.classList.remove('hidden', 'pop'); void el.offsetWidth; el.classList.add('pop');
    SFX.beep(i === 3); Voice.say(keys[i]);
    i++; setTimeout(step, i === seq.length ? 700 : 950);
  };
  step();
}

/* ---------- helpers ---------- */
function floater(text, color) { G.floaters.push({ x: G.p.x, y: YOU_GY - 150 - G.p.h, text, color, t: 0 }); }
function addPart(type, x, y, o = {}) {
  G.parts.push({ type, x, y, vx: o.vx || 0, vy: o.vy || 0, g: o.g || 0, life: o.life || 0.6, t: 0,
    size: o.size || 6, color: o.color || '#fff', rot: Math.random() * 6, vr: o.vr || 0 });
}
function burst(type, x, y, n, colors, o = {}) {
  for (let i = 0; i < n; i++) addPart(type, x + (Math.random() - 0.5) * (o.spread || 30), y, {
    vx: (Math.random() - 0.5) * (o.vx || 260), vy: -(o.up || 200) - Math.random() * (o.up || 200) * 0.8,
    g: o.g ?? 900, life: o.life || 0.8, size: o.size || 5, vr: (Math.random() - 0.5) * 14,
    color: colors[i % colors.length] });
}
function gasRate(x) {
  for (let i = G.legs.length - 1; i >= 0; i--) {
    if (x >= G.legs[i]) return GAS_PER_LEG / (i < G.legs.length - 1 ? G.legs[i + 1] - G.legs[i] : G.avgLeg);
  }
  return GAS_PER_LEG / G.avgLeg;
}
const gasColor = g => (g > 0.5 ? '#5cc16b' : g > 0.25 ? '#ffc53d' : '#e8453c');

/* ---------- quiz: right answer = get past it, wrong answer = run into it ---------- */
function startQuiz(o) {
  const q = o.q;
  G.mode = 'quiz'; o.asked = true; G.asked++;
  $('qPrompt').innerHTML = q.prompt;
  $('qFeedback').textContent = '';
  const box = $('choices'); box.innerHTML = '';
  let answered = false;
  q.options.forEach(opt => {
    const b = document.createElement('button'), label = q.tile(opt);
    b.className = 'choice' + (q.text ? ` txt len${Math.min(3, [...label].length)}` : '');
    b.textContent = label; b.setAttribute('aria-label', q.aria(opt));
    b.onclick = () => {
      if (answered) return; answered = true;
      if (opt === q.answer) {
        b.classList.add('right'); [...box.children].forEach(c => c !== b && c.classList.add('faded'));
        $('qFeedback').textContent = G.info.t.right;
        SFX.right(); Voice.say(G.info.praise[Math.random() * G.info.praise.length | 0]); G.correct++;
        setTimeout(() => endQuiz(o, true), 900);
      } else {
        b.classList.add('wrong'); box.children[q.options.indexOf(q.answer)].classList.add('right');
        $('qFeedback').textContent = q.revealText;
        SFX.wrong(); Voice.seq(q.reveal);
        setTimeout(() => endQuiz(o, false), 2600);
      }
    };
    box.appendChild(b);
  });
  $('qSay').onclick = () => Voice.seq(q.replay);
  $('quiz').classList.remove('hidden');
  Voice.seq(q.ask);
}
function endQuiz(o, ok) {
  if (!G) return;
  $('quiz').classList.add('hidden');
  G.mode = 'race';
  if (!ok) return; // keep driving... straight into it
  const p = G.p;
  o.state = 'cleared'; p.boostT = BOOST_TIME;
  floater(G.info.t.turbo, '#2f9e44');
  if (o.kind === 'drawbridge') { o.state = 'lowering'; o.lowerRate = 4; SFX.creak(); return; }
  if (o.kind === 'gatorbridge') return;
  // a jump sized so the whole car clears the obstacle
  const T = ((o.x + o.w / 2 + 16) - (p.x - CAR_BACK)) / (BASE_SPEED * BOOST_MULT);
  p.g = 8 * JUMP_PEAK / (T * T); p.vy = 4 * JUMP_PEAK / T; p.h = 0.01;
  SFX.jump();
}

function failHit(o) {
  const p = G.p;
  p.boostT = 0;
  const say = (text, color = '#e8453c') => floater(text, color);
  switch (o.kind) {
    case 'banana':
      o.state = 'squished'; p.spinDur = p.spinT = 0.9; p.slowT = 0.9; SFX.slip(); say('🍌 !!', '#e8a100');
      burst('spark', o.x, YOU_GY - 10, 8, ['#ffd23f', '#fff3a0']); break;
    case 'puddle':
      o.state = 'splashed'; p.mudT = 2.5; p.slowT = 1.4; SFX.splash(); say('💦 Splash!', '#3f7fe0');
      burst('drop', o.x - 20, YOU_GY - 6, 18, ['#7a5a3a', '#8fd0ff', '#a07850'], { vx: 320, up: 260 }); break;
    case 'cone':
      o.state = 'knocked'; o.fly = { x: 0, y: 0, vx: 300, vy: -420, rot: 0 };
      p.backT = 0.35; p.slowT = 0.8; SFX.bonk(); say('Bonk!'); break;
    case 'log':
      o.state = 'broken'; p.backT = 0.5; p.slowT = 0.9; SFX.bonk(); say('Bonk!');
      burst('chip', o.x, YOU_GY - 24, 12, ['#9a6035', '#c48a55', '#7a4a28'], { vx: 300, up: 280 }); break;
    case 'fire':
      o.state = 'out'; p.sootT = 2.6; p.backT = 0.5; p.slowT = 0.8; SFX.sizzle(); say('🔥 ¡Ay!');
      burst('puff', o.x, YOU_GY - 30, 10, ['rgba(90,90,90,.7)', 'rgba(140,140,140,.6)'], { vx: 120, up: 90, g: -40, life: 1.1, size: 9 }); break;
    case 'spikes':
      o.state = 'popped'; p.flatT = 2.2; SFX.pop(); say('POP!');
      burst('puff', p.x - 40, YOU_GY - 16, 6, ['rgba(255,255,255,.8)'], { vx: 100, up: 60, g: 0, life: 0.6, size: 6 }); break;
    case 'pit': case 'drawbridge':
      o.state = o.kind === 'pit' ? 'planked' : 'lowering'; o.lowerRate = 0.9; o.chompT = 0.001;
      p.backT = 0.5; p.slowT = 1.3; SFX.chomp(); say('🐊 ¡Ñam!', '#2f9e44'); break;
    case 'volcano':
      o.state = 'stoned'; o.chompT = 0.001; p.sootT = 2.6;
      p.backT = 0.5; p.slowT = 1.3; SFX.sizzle(); SFX.bonk(); say('🌋 ¡Ay!'); break;
    case 'gatorbridge':
      o.state = 'passed'; o.leap = { t: 0, x: p.x + 40, hit: true };
      p.backT = 0.6; p.slowT = 1.2; SFX.roar(); setTimeout(() => SFX.chomp(), 300); say('🐊 ¡ÑAM!', '#2f9e44'); break;
  }
}

function updateObstacle(o, dt) {
  const p = G.p;
  if (o.chompT > 0 && (o.chompT += dt) > 0.7) o.chompT = 0;
  if (o.state === 'lowering' && (o.bridge = Math.max(0, o.bridge - dt * o.lowerRate)) === 0) o.state = 'down';
  if (o.fly) {
    const f = o.fly; f.vy += 1400 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += 10 * dt;
    if (f.y > 0) { f.y = 0; f.vy *= -0.3; f.vx *= 0.5; }
  }
  if (o.leap && (o.leap.t += dt) > 1.5) o.leap = null;
  // near misses: the gator snaps (or the volcano spits fire) as you fly past
  if ((o.kind === 'pit' || o.kind === 'volcano') && o.state === 'cleared' && !o.snapped && Math.abs(p.x - o.x) < 50) {
    o.snapped = true; o.chompT = 0.001; if (o.kind === 'pit') SFX.chomp(); else SFX.sizzle();
  }
  if (o.kind === 'gatorbridge' && o.state === 'cleared' && !o.leapt && p.x > o.x - 10) { o.leapt = true; o.leap = { t: 0, x: p.x - 110, hit: false }; SFX.roar(); }
}

/* ---------- gas ---------- */
function askGas(st) {
  st.asked = true; G.mode = 'gasask'; G.askSt = st;
  const gas = G.p.gas, low = gas < 0.3;
  $('gasBigFill').style.width = (gas * 100).toFixed(0) + '%';
  $('gasBigFill').style.background = gasColor(gas);
  $('gasYes').classList.toggle('pulse', low);
  $('gasAsk').classList.remove('hidden');
  Voice.say(low ? G.info.clip.gaslow : G.info.clip.gas);
}
function answerGas(yes) {
  if (!G || G.mode !== 'gasask') return;
  $('gasAsk').classList.add('hidden');
  G.askSt.want = yes; G.mode = 'race'; SFX.click();
}
$('gasYes').onclick = () => answerGas(true);
$('gasNo').onclick = () => answerGas(false);

/* ---------- finish ---------- */
function finish(result) {
  if (G.mode === 'done') return;
  G.mode = 'done';
  const sum = { lang: G.lang, lvl: G.lvl, result, correct: G.correct, asked: G.asked };
  setTimeout(() => { if (G) showReward(sum); }, result === 'win' ? 800 : 1400);
}

/* ---------- simulation ---------- */
function update(dt) {
  G.t += dt;
  const p = G.p;
  if (G.mode === 'race' || G.mode === 'filling') {
    G.cpu.x += G.cpuSpeed * dt; G.cpu.wheel += G.cpuSpeed * dt / 17;
  }
  if (G.mode === 'filling') {
    const f = G.fill; f.t += dt;
    p.gas = f.from + (1 - f.from) * Math.min(1, Math.max(0, (f.t - 0.3) / (f.dur - 0.3)));
    if ((G.glugT -= dt) <= 0) {
      G.glugT = 0.5; SFX.glug();
      addPart('drop', f.st.x - 30, ROAD_BOT - 40, { vy: -60, life: 0.8, size: 4, color: '#bfeaff' });
    }
    if (f.t >= f.dur) {
      f.st.filling = false; f.st.done = true; p.gas = 1; G.mode = 'race';
      floater(G.info.t.full, '#2f9e44'); Voice.say(G.info.clip.full);
    }
    if (G.cpu.x >= G.len) finish('lose');
  }
  if (G.mode === 'race') {
    let v;
    if (p.out) v = Math.max(0, p.v - 120 * dt);
    else if (p.backT > 0) { p.backT -= dt; v = -150; }
    else if (p.spinT > 0) { p.spinT -= dt; v = 30; }
    else if (p.boostT > 0) { p.boostT -= dt; v = BASE_SPEED * BOOST_MULT; }
    else if (p.slowT > 0) { p.slowT -= dt; v = SLOW_SPEED; }
    else v = BASE_SPEED;
    if (p.flatT > 0) { p.flatT -= dt; v = Math.min(v, SLOW_SPEED); }
    for (const k of ['sootT', 'mudT']) if (p[k] > 0) p[k] -= dt;
    const stop = G.stations.find(s => s.want && !s.done && !s.filling);
    if (stop && !p.out) v = Math.min(v, 30 + (stop.x - p.x) * 1.6); // ease in to the pump
    p.v = v;
    const before = p.x;
    p.x = Math.max(0, p.x + v * dt);
    for (const o of G.obs) { // a raised drawbridge is a wall
      if (o.kind === 'drawbridge' && o.bridge > 0.04) p.x = Math.min(p.x, Math.max(before, o.x - o.w / 2 - CAR_FRONT));
    }
    p.wheel += (p.x - before) / 17;

    if (!p.out && p.x > before) {
      p.gas -= (p.x - before) * gasRate(p.x);
      if (p.gas <= 0) { p.gas = 0; p.out = true; SFX.sputter(); floater(G.info.t.out, '#e8453c'); Voice.say(G.info.clip.out); }
    }
    if (p.out && p.v === 0 && (p.outT += dt) > 0.8) return finish('gas');

    if (p.h > 0) {
      p.vy -= p.g * dt; p.h += p.vy * dt;
      if (p.h <= 0) {
        p.h = 0; p.vy = 0; SFX.land();
        for (let i = 0; i < 5; i++) addPart('puff', p.x - 40 + i * 20, YOU_GY - 4, { vx: (i - 2) * 30, vy: -20, life: 0.5, size: 6, color: 'rgba(255,255,255,.8)' });
      }
    }
    if (p.boostT > 0 && Math.random() < 0.6) addPart('flame', p.x - 70, YOU_GY - 26 - p.h, { vx: -90, life: 0.25, size: 6, color: Math.random() < 0.5 ? '#ffb020' : '#ff6a2a' });
    if (p.sootT > 0 && Math.random() < 0.15) addPart('puff', p.x, YOU_GY - 90, { vx: -20, vy: -40, life: 0.8, size: 6, color: 'rgba(90,90,90,.45)' });
    if (v > 60 && p.h === 0 && (G.dustT -= dt) <= 0) { G.dustT = 0.14; addPart('puff', p.x - 56, YOU_GY - 4, { vx: -30, vy: -12, life: 0.45, size: 4, color: 'rgba(255,255,255,.6)' }); }

    for (const o of G.obs) {
      updateObstacle(o, dt);
      if (o.state !== 'ready') continue;
      const gap = o.x - o.w / 2 - (p.x + CAR_FRONT);
      if (!o.asked && gap <= QUIZ_AHEAD && p.h === 0 && p.backT <= 0 && p.spinT <= 0 && !p.out) { startQuiz(o); return; }
      if (o.asked && gap <= (o.kind === 'drawbridge' ? 0.5 : -4) && p.h < 20) failHit(o);
    }
    for (const st of G.stations) {
      if (!st.asked && st.x - p.x <= 170 && p.h === 0 && !p.out) { askGas(st); return; }
      if (st.want && !st.done && !st.filling && p.x >= st.x - 2) {
        G.mode = 'filling'; st.filling = true; p.v = 0;
        G.fill = { st, t: 0, from: p.gas, dur: 0.8 + 2.2 * (1 - p.gas) };
      }
    }
    if (p.x >= G.len) return finish('win');
    if (G.cpu.x >= G.len) return finish('lose');
  } else {
    for (const o of G.obs) updateObstacle(o, dt);
  }
  G.cam += (p.x - VIEW.w * 0.3 - G.cam) * Math.min(1, dt * 5);
  G.floaters = G.floaters.filter(f => (f.t += dt) < 1.4);
  G.parts = G.parts.filter(q => {
    q.t += dt; q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt;
    return q.t < q.life;
  });
}

function updateHud() {
  const pct = x => Math.min(1, Math.max(0, x / G.len));
  $('mkYou').style.left = `calc(20px + (100% - 68px) * ${pct(G.p.x)})`;
  $('mkCpu').style.left = `calc(20px + (100% - 68px) * ${pct(G.cpu.x)})`;
  const gas = G.p.gas;
  $('gasFill').style.width = (gas * 100).toFixed(1) + '%';
  $('gasFill').style.background = gasColor(gas);
  $('gas').classList.toggle('low', gas <= 0.25);
}

function loop(now) {
  if (!G) return;
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  update(dt);
  if (!G) return;
  drawFrame(G); updateHud();
  raf = requestAnimationFrame(loop);
}

window.addEventListener('resize', () => { if (G) resizeCanvas(); });
cv.addEventListener('pointerdown', () => { if (G && G.mode === 'race') { ensureAudio(); SFX.horn(); } });
window.addEventListener('keydown', e => {
  if (!G) return;
  if (G.mode === 'quiz' && /^[1-5]$/.test(e.key)) { const b = $('choices').children[+e.key - 1]; if (b) b.click(); }
  if (G.mode === 'gasask' && (e.key === 'y' || e.key === 'n')) answerGas(e.key === 'y');
});
