/* Obstacles on the player's lane, one kind per level, getting wilder as you go.
   `w` is how much road it covers. Gator obstacles live in art-gators.js. */
const KINDS = {
  banana: { w: 40, icon: '🍌', drawn: true },
  puddle: { w: 116, icon: '💦', drawn: true },
  cone: { w: 44, icon: '🚧', drawn: true },
  log: { w: 52, icon: '🪵', drawn: true },
  fire: { w: 74, icon: '🔥', drawn: true },
  spikes: { w: 96, icon: '📌', drawn: true },
  pit: { w: 130, icon: '🐊', drawn: true },
  drawbridge: { w: 150, icon: '🌉', drawn: true },
  gatorbridge: { w: 300, icon: '🐊', drawn: true },
};

function drawBanana(x, y, o) {
  if (o.state === 'squished') { // flattened after a spin-out
    poly([x - 30, y + 2, x - 8, y - 5, x + 10, y - 4, x + 32, y + 2, x + 6, y + 4], '#e0b82a');
    poly([x - 8, y - 5, x + 10, y - 4, x + 6, y + 1, x - 6, y + 1], '#f7d23b');
    return;
  }
  shadowAt(x, y + 2, 26, 5);
  poly([x - 5, y - 6, x - 27, y - 2, x - 32, y + 3, x - 8, y + 2], '#f2c62c');
  poly([x + 5, y - 6, x + 25, y - 1, x + 31, y + 4, x + 7, y + 2], '#dcae1c');
  poly([x - 9, y + 2, x - 8, y - 17, x + 8, y - 17, x + 9, y + 2], '#ffe066');
  poly([x + 1, y + 2, x + 1, y - 17, x + 8, y - 17, x + 9, y + 2], '#f2c62c');
  poly([x - 8, y - 17, x - 3, y - 28, x + 3, y - 28, x + 8, y - 17], '#f7d23b');
  poly([x - 2, y - 28, x + 3, y - 28, x + 2, y - 34, x - 1, y - 34], '#7a5a2a');
  ngon(x - 20, y, 2, 5, 0, '#8a6a2a'); ngon(x + 18, y + 1, 2, 5, 0, '#8a6a2a');
}

function blob(x, y, rx, ry, n, wobble, fill) {
  const pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const k = 1 + Math.sin(i * 2.3) * wobble; pts.push(x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k); }
  poly(pts, fill);
}
function drawPuddle(x, y, o, t) {
  blob(x, y - 2, 60, 14, 10, 0.08, '#8a6a45');
  blob(x + 2, y - 3, 50, 10, 10, 0.06, o.state === 'splashed' ? '#9fc9d6' : '#79c3e3');
  poly([x - 32, y - 6, x - 6, y - 8, x - 10, y - 4, x - 36, y - 2], 'rgba(255,255,255,.65)');
  const r = 8 + ((t * 14) % 16);
  ctx.strokeStyle = `rgba(255,255,255,${0.6 - r / 40})`; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x + 16, y - 3, r, r * 0.25, 0, 0, Math.PI * 2); ctx.stroke();
}

function drawCone(x, y, o) {
  const f = o.fly;
  if (f && f.x > 600) return;
  ctx.save(); ctx.translate(x + (f ? f.x : 0), y + (f ? f.y : 0)); if (f) ctx.rotate(f.rot);
  if (!f) shadowAt(0, 2, 26, 5);
  poly([-24, 0, 24, 0, 22, -7, -22, -7], '#e25c00');
  poly([-16, -7, -5, -54, 5, -54, 16, -7], '#ff7a1a');
  poly([0, -7, 0, -54, 5, -54, 16, -7], '#e8650f');
  poly([-12, -22, 12, -22, 10, -30, -10, -30], '#ffffff');
  poly([-8, -38, 8, -38, 6.5, -45, -6.5, -45], '#ffffff');
  ctx.restore();
}

function drawLog(x, y, o) {
  if (o.state === 'broken') return;
  shadowAt(x, y + 2, 30, 5);
  poly([x - 10, y - 50, x + 26, y - 62, x + 40, y - 18, x + 4, y - 4], '#6b4022'); // the log's side, going back
  ngon(x, y - 26, 27, 10, 0.1, '#7a4a28');
  ngon(x, y - 26, 21, 10, 0.1, '#e8b87a');
  ngon(x, y - 26, 14, 10, 0.3, '#d49a5c');
  ngon(x, y - 26, 7, 8, 0, '#e8b87a');
  ngon(x, y - 26, 2.5, 6, 0, '#b07840');
  poly([x + 14, y - 58, x + 24, y - 70, x + 22, y - 57], '#6cc44f');
}

function drawFire(x, y, o, t) {
  const out = o.state === 'out';
  shadowAt(x, y + 2, 42, 6);
  if (!out) { ctx.globalAlpha = 0.25; ngon(x, y - 34, 52 + Math.sin(t * 9) * 4, 10, 0, '#ffb020'); ctx.globalAlpha = 1; }
  for (let i = -3; i <= 3; i++) ngon(x + i * 11, y - 3, 6, 6, i, i % 2 ? '#9aa3ad' : '#b8c0c8');
  poly([x - 30, y - 6, x + 26, y - 18, x + 30, y - 11, x - 26, y + 1], out ? '#3a2a22' : '#8a5a2b');
  poly([x - 26, y - 18, x + 30, y - 6, x + 26, y + 1, x - 30, y - 11], out ? '#2b1f1a' : '#7a4a28');
  if (out) {
    for (let i = 0; i < 4; i++) if (Math.sin(t * 7 + i * 2) > 0.2) ngon(x - 12 + i * 8, y - 10, 2.5, 5, 0, '#ff7a1a');
    return;
  }
  const f = k => 1 + Math.sin(t * 14 + k) * 0.13;
  poly([x - 26, y - 10, x - 14, y - 58 * f(0), x - 2, y - 40, x + 6, y - 80 * f(1), x + 16, y - 44, x + 26, y - 62 * f(2), x + 28, y - 10], '#ff6a2a');
  poly([x - 16, y - 10, x - 8, y - 42 * f(3), x + 2, y - 30, x + 8, y - 58 * f(4), x + 16, y - 32, x + 20, y - 10], '#ffb020');
  poly([x - 6, y - 10, x + 2, y - 34 * f(5), x + 12, y - 10], '#fff3a0');
}

function drawSpikes(x, y, o) {
  shadowAt(x, y + 2, 52, 5);
  poly([x - 48, y, x + 48, y, x + 46, y - 7, x - 46, y - 7], '#4b5563');
  for (let i = 0; i < 8; i++) {
    const sx = x - 42 + i * 12;
    poly([sx - 5, y - 7, sx, y - 28, sx + 5, y - 7], '#dfe3e8');
    poly([sx, y - 28, sx + 5, y - 7, sx, y - 7], '#9aa3ad');
  }
  for (const ex of [x - 52, x + 46]) {
    poly([ex, y + 1, ex + 6, y + 1, ex + 6, y - 9, ex, y - 9], '#ffd23f');
    poly([ex, y - 3, ex + 6, y - 7, ex + 6, y - 5, ex, y - 1], '#3a2a22');
  }
}

/* ---------- which layer each obstacle draws in ---------- */
function drawObstacleGround(o, sx, G) { // flat things under the cars
  if (sx < -420 || sx > VIEW.w + 420) return;
  if (o.kind === 'puddle') drawPuddle(sx, YOU_GY, o, G.t);
  else if (o.kind === 'pit' || o.kind === 'drawbridge') drawPit(sx, YOU_GY, o, G.t);
  else if (o.kind === 'gatorbridge') drawRiver(sx, o, G.t);
}
function drawObstacleUpright(o, sx, G) { // standing things on your lane
  if (sx < -300 || sx > VIEW.w + 300) return;
  if (o.kind === 'banana') drawBanana(sx, YOU_GY, o);
  else if (o.kind === 'cone') drawCone(sx, YOU_GY, o);
  else if (o.kind === 'log') drawLog(sx, YOU_GY, o);
  else if (o.kind === 'fire') drawFire(sx, YOU_GY, o, G.t);
  else if (o.kind === 'spikes') drawSpikes(sx, YOU_GY, o);
  else if (o.kind === 'drawbridge') drawDrawbridge(sx, YOU_GY, o);
}
function drawObstacleFront(o, sx, G) { // gators lunging out, in front of your car
  if (sx < -420 || sx > VIEW.w + 420) return;
  if (o.kind === 'pit' || o.kind === 'drawbridge') drawPitChomp(sx, YOU_GY, o);
  else if (o.kind === 'gatorbridge') drawRiverGators(sx, o, G.t);
}

/* Level-card preview: the obstacle on a little strip of road. */
function renderObstacleThumb(canvas, kind) {
  withCtx(canvas, (w, h) => {
    const s = Math.min(w / 170, h / 90);
    ctx.save(); ctx.translate(w / 2, h * 0.8); ctx.scale(s, s);
    poly([-110, -16, 110, -16, 110, 16, -110, 16], PAL.road);
    const o = { kind, w: KINDS[kind].w, state: 'ready', bridge: 1, chompT: 0.25 };
    if (kind === 'banana') drawBanana(0, 4, o);
    else if (kind === 'puddle') drawPuddle(0, 4, o, 0);
    else if (kind === 'cone') drawCone(0, 4, o);
    else if (kind === 'log') drawLog(0, 4, o);
    else if (kind === 'fire') drawFire(0, 4, o, 0);
    else if (kind === 'spikes') drawSpikes(0, 4, o);
    else if (kind === 'pit') { blob(0, -2, 70, 16, 9, 0.08, '#4a3222'); gatorHead(20, -4, 0.62, 0.9, -1); }
    else if (kind === 'drawbridge') { blob(10, -2, 60, 14, 9, 0.08, '#4a3222'); drawDrawbridge(-50, 4, { w: 110, bridge: 0.75 }); }
    else if (kind === 'gatorbridge') { poly([-110, -16, 110, -16, 110, 16, -110, 16], '#5fbfd0'); gatorHead(40, -8, 0.95, 1, -1); }
    ctx.restore();
  });
}
