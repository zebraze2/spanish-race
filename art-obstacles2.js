/* Ten more obstacles to pick from (plus "invent your own"), for the adaptive Spanish levels.
   Each kind says how it's drawn and what happens on a wrong answer (`fail`, used in race.js). */

function drawDino(x, y, o, t) { // a T-rex facing the car
  const G1 = '#5cc16b', G2 = '#3d8b40', bob = Math.sin(t * 3) * 2;
  shadowAt(x + 6, y + 2, 56, 7);
  poly([x + 4, y - 22, x + 14, y - 22, x + 16, y, x + 2, y], G2);
  poly([x - 14, y - 22, x - 4, y - 22, x - 2, y, x - 16, y], G2);
  poly([x - 26, y - 26, x - 18, y - 54, x + 14, y - 60, x + 40, y - 42, x + 70, y - 30 - Math.sin(t * 4) * 4, x + 40, y - 26, x + 10, y - 18, x - 14, y - 18], G1);
  poly([x - 20, y - 30, x + 10, y - 24, x + 4, y - 40, x - 16, y - 46], '#b5e08a');
  for (let i = 0; i < 4; i++) poly([x - 4 + i * 12, y - 58 + i * 3, x + 2 + i * 12, y - 68 + i * 3, x + 8 + i * 12, y - 57 + i * 3], '#ff8a1f');
  const hy = y - 60 + bob, open = o.state === 'roared' || Math.sin(t * 2) > 0.6 ? 1 : 0;
  poly([x - 18, hy + 6, x - 26, hy - 14, x - 50, hy - 18, x - 64, hy - 8, x - 62, hy + 2, x - 30, hy + 8], G1);
  poly([x - 30, hy + 8 + open * 4, x - 60, hy + 4 + open * 10, x - 58, hy + 10 + open * 12, x - 26, hy + 14], G2);
  if (open) for (let i = 0; i < 4; i++) poly([x - 56 + i * 7, hy + 2, x - 53 + i * 7, hy + 7, x - 50 + i * 7, hy + 2], '#ffffff');
  ngon(x - 40, hy - 10, 4, 6, 0, '#ffffff'); ngon(x - 41, hy - 10, 2, 5, 0, '#1f2a1f');
  poly([x - 22, y - 42, x - 32, y - 38, x - 26, y - 34], G2);
}

function sharkHead(x, y, s, open, dir) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  ctx.save(); ctx.rotate(open * 0.5);
  poly([-6, 0, 80, 4, 74, 14, -4, 16], '#e8eef3');
  for (let i = 0; i < 6; i++) poly([10 + i * 11, 4, 14 + i * 11, -3, 18 + i * 11, 4], '#ffffff');
  ctx.restore();
  ctx.save(); ctx.rotate(-open * 0.4);
  poly([-10, 2, -6, -24, 30, -34, 70, -20, 96, -4, 84, 2], '#6f8fa8');
  poly([20, -32, 34, -62, 44, -28], '#56718a');
  for (let i = 0; i < 6; i++) poly([10 + i * 11, 2, 14 + i * 11, 9, 18 + i * 11, 2], '#ffffff');
  ngon(60, -14, 4, 6, 0, '#1f2a1f');
  ctx.restore(); ctx.restore();
}
function drawSharkPool(x, y, o, t) {
  const rx = o.w / 2;
  blob(x, y - 22, rx + 8, 44, 11, 0.07, '#9aa3ad');
  blob(x, y - 22, rx, 38, 11, 0.07, '#2f8fc4');
  blob(x + 4, y - 16, rx * 0.8, 22, 9, 0.05, '#4fb3e0');
  if (!(o.chompT > 0)) {
    const fx = x + Math.sin(t * 1.6) * rx * 0.5;
    poly([fx - 12, y - 18, fx + 2, y - 46, fx + 12, y - 18], '#6f8fa8');
    poly([fx + 2, y - 46, fx + 12, y - 18, fx + 4, y - 18], '#56718a');
  }
  if (o.state === 'planked') {
    poly([x - rx - 14, y - 8, x + rx + 14, y - 8, x + rx + 14, y + 4, x - rx - 14, y + 4], '#b07a45');
    for (let px = x - rx; px < x + rx; px += 22) poly([px, y - 8, px + 2, y - 8, px + 2, y + 4, px, y + 4], '#8a5a2b');
  }
}
function drawSharkChomp(x, y, o) {
  if (!(o.chompT > 0)) return;
  const k = o.chompT / 0.7, lift = Math.sin(k * Math.PI);
  const open = k < 0.45 ? Math.min(1, k / 0.2) : Math.max(0, 1 - (k - 0.45) / 0.08);
  sharkHead(x + 14, y - 16 - lift * 80, 0.85, open, -1);
}

function drawBoulder(x, y, o, t) {
  if (o.state === 'broken') return;
  const r = 30, pts = [];
  shadowAt(x, y + 2, 34, 6);
  ctx.save(); ctx.translate(x, y - r); ctx.rotate(-t * 0.8);
  for (let i = 0; i < 7; i++) { const a = i * Math.PI * 2 / 7; pts.push(Math.cos(a) * r * (0.9 + (i % 2) * 0.1), Math.sin(a) * r * (0.9 + (i % 2) * 0.1)); }
  poly(pts, '#9aa3ad');
  poly([0, 0, pts[0], pts[1], pts[2], pts[3], pts[4], pts[5]], '#b8c0c8');
  poly([0, 0, pts[8], pts[9], pts[10], pts[11]], '#7d848e');
  ctx.restore();
}

function drawSnowman(x, y, o, t) {
  blob(x, y - 2, 58, 12, 10, 0.06, '#cfefff');
  poly([x - 34, y - 6, x - 8, y - 8, x - 12, y - 4, x - 38, y - 2], 'rgba(255,255,255,.85)');
  if (o.state === 'melted') { // knocked over: snowballs, a carrot and a hat on the ice
    ngon(x + 8, y - 8, 12, 8, 0, '#ffffff'); ngon(x + 26, y - 6, 9, 8, 0, '#ffffff'); ngon(x - 8, y - 6, 8, 8, 0, '#ffffff');
    poly([x + 34, y - 4, x + 48, y - 2, x + 34, y], '#ff8a1f'); poly([x - 30, y - 2, x - 14, y - 2, x - 16, y - 14, x - 28, y - 14], '#2d2d3a');
    return;
  }
  shadowAt(x, y, 24, 5);
  for (const [cy, r] of [[y - 20, 22], [y - 54, 16], [y - 80, 12]]) { ngon(x, cy, r, 10, 0, '#ffffff'); poly([x + r * 0.2, cy - r, x + r, cy, x + r * 0.2, cy + r], '#e3f2fb'); }
  ngon(x - 5, y - 84, 1.8, 5, 0, '#2d2d3a'); ngon(x + 3, y - 84, 1.8, 5, 0, '#2d2d3a');
  poly([x - 2, y - 80, x - 18, y - 77, x - 2, y - 76], '#ff8a1f');
  for (const by of [y - 50, y - 58]) ngon(x - 2, by, 2, 5, 0, '#2d2d3a');
  poly([x - 12, y - 70, x + 12, y - 70, x + 12, y - 65, x - 12, y - 65], '#e8453c');
  poly([x + 4, y - 66, x + 10, y - 66, x + 12, y - 52, x + 6, y - 52], '#e8453c');
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x - 14, y - 56); ctx.lineTo(x - 34, y - 66 + Math.sin(t * 3) * 3); ctx.moveTo(x + 14, y - 56); ctx.lineTo(x + 32, y - 68); ctx.stroke();
  poly([x - 14, y - 90, x + 14, y - 90, x + 14, y - 94, x - 14, y - 94], '#2d2d3a');
  poly([x - 9, y - 94, x + 9, y - 94, x + 8, y - 110, x - 8, y - 110], '#2d2d3a');
}

function drawCactus(x, y, o, t) {
  const G = '#43a047', D = '#2e7d32';
  blob(x, y - 1, 28, 6, 8, 0.1, '#e8c48a');
  shadowAt(x, y + 2, 26, 5);
  poly([x - 9, y, x - 9, y - 62, x - 4, y - 70, x + 4, y - 70, x + 9, y - 62, x + 9, y], G);
  poly([x + 2, y, x + 2, y - 70, x + 4, y - 70, x + 9, y - 62, x + 9, y], D);
  poly([x - 9, y - 30, x - 22, y - 30, x - 26, y - 34, x - 26, y - 52, x - 20, y - 56, x - 16, y - 52, x - 16, y - 38, x - 9, y - 38], G);
  poly([x + 9, y - 40, x + 20, y - 40, x + 24, y - 44, x + 24, y - 60, x + 18, y - 64, x + 14, y - 60, x + 14, y - 48, x + 9, y - 48], D);
  for (const [sx, sy] of [[-5, -20], [5, -34], [-5, -48], [4, -58], [-22, -44], [20, -52]]) ngon(x + sx, y + sy, 1.6, 4, 0, '#f4f6f8');
  for (let i = 0; i < 5; i++) ngon(x + Math.cos(i * 1.26) * 4, y - 73 + Math.sin(i * 1.26) * 4, 3, 5, 0, '#ff8fb1');
  ngon(x, y - 73, 2, 5, 0, '#ffd23f');
}

function drawSlime(x, y, o, t) {
  blob(x, y - 2, 60, 14, 10, 0.1, '#3fbf3f');
  blob(x + 3, y - 4, 48, 9, 10, 0.08, '#7be35f');
  for (let i = 0; i < 4; i++) {
    const k = (t * 0.8 + i * 0.3) % 1;
    ngon(x - 36 + i * 22, y - 4 - k * 14, 3 + k * 5, 6, 0, `rgba(190,255,150,${1 - k})`);
  }
  if (o.state !== 'splatted') for (const ex of [x - 10, x + 10]) { ngon(ex, y - 10, 6, 8, 0, '#ffffff'); ngon(ex - 1, y - 10, 3, 6, 0, '#1f2a1f'); }
}

function drawTornado(x, y, o, t) {
  shadowAt(x, y + 2, 30, 6);
  const sway = Math.sin(t * 2) * 6;
  for (let i = 0; i < 8; i++) {
    const k = i / 7, cx = x + sway * k + Math.sin(t * 6 + i) * 3;
    ngon(cx, y - 8 - i * 14, 8 + k * 30, 8, t * 3 + i, i % 2 ? '#b8c0c8' : '#9aa3ad', 0.35);
  }
  for (let i = 0; i < 3; i++) {
    const a = t * 4 + i * 2.1, lx = x + Math.cos(a) * 30, ly = y - 40 - i * 22 + Math.sin(a) * 6;
    poly([lx, ly, lx + 6, ly - 4, lx + 3, ly + 3], '#6cc44f');
  }
}

function drawCow(x, y, o, t) {
  shadowAt(x + 4, y + 2, 48, 7);
  for (const lx of [-24, -10, 16, 30]) { poly([lx + x - 4, y - 22, lx + x + 4, y - 22, lx + x + 4, y - 4, lx + x - 4, y - 4], '#f4f6f8'); poly([lx + x - 4, y - 4, lx + x + 4, y - 4, lx + x + 4, y, lx + x - 4, y], '#3a2a22'); }
  poly([x - 32, y - 22, x - 34, y - 52, x + 36, y - 52, x + 40, y - 24], '#ffffff');
  poly([x - 34, y - 52, x + 36, y - 52, x + 32, y - 56, x - 30, y - 56], '#eef2f6');
  ngon(x - 6, y - 40, 9, 7, 0.3, '#2d2d3a'); ngon(x + 20, y - 32, 7, 7, 1, '#2d2d3a'); ngon(x + 26, y - 48, 5, 6, 0, '#2d2d3a');
  ngon(x + 6, y - 22, 5, 6, 0, '#ffb3c6');
  ctx.strokeStyle = '#3a2a22'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x + 38, y - 48); ctx.lineTo(x + 46 + Math.sin(t * 5) * 4, y - 24); ctx.stroke();
  const hb = Math.sin(t * 2.5) * 2;
  poly([x - 30, y - 50 + hb, x - 52, y - 62 + hb, x - 58, y - 40 + hb, x - 40, y - 34 + hb], '#ffffff');
  poly([x - 56, y - 50 + hb, x - 66, y - 44 + hb, x - 60, y - 34 + hb, x - 50, y - 36 + hb], '#ffb3c6');
  ngon(x - 61, y - 43 + hb, 1.6, 5, 0, '#3a2a22'); ngon(x - 46, y - 52 + hb, 2.4, 6, 0, '#1f2a1f');
  poly([x - 40, y - 60 + hb, x - 36, y - 70 + hb, x - 34, y - 60 + hb], '#f4e1c1');
  poly([x - 34, y - 56 + hb, x - 24, y - 60 + hb, x - 30, y - 52 + hb], '#2d2d3a');
}

function drawWeb(x, y, o, t) {
  for (const px of [x - 34, x + 30]) poly([px, y, px + 6, y, px + 6, y - 96, px, y - 96], '#8a5a2b');
  const cx = x, cy = y - 52, torn = o.state === 'torn';
  ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 2;
  const spokes = torn ? [0, 3, 5] : [0, 1, 2, 3, 4, 5, 6, 7];
  ctx.beginPath();
  for (const i of spokes) { const a = i * Math.PI / 4; ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 31, cy + Math.sin(a) * 44); }
  if (!torn) for (const r of [0.35, 0.65, 0.95]) {
    for (let i = 0; i <= 8; i++) { const a = i * Math.PI / 4, px = cx + Math.cos(a) * 31 * r, py = cy + Math.sin(a) * 44 * r; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  }
  ctx.stroke();
  const sy = cy - 34 + Math.sin(t * 2) * 6;
  ctx.beginPath(); ctx.moveTo(cx + 10, y - 96); ctx.lineTo(cx + 10, sy); ctx.stroke();
  ctx.strokeStyle = '#2d2d3a';
  ctx.beginPath(); for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { ctx.moveTo(cx + 10, sy + 2); ctx.lineTo(cx + 10 + s * 10, sy - 4 + k * 5); } ctx.stroke();
  ngon(cx + 10, sy + 4, 6, 8, 0, '#2d2d3a'); ngon(cx + 10, sy - 2, 4, 8, 0, '#2d2d3a');
  ngon(cx + 8.5, sy - 3, 1.4, 5, 0, '#ffffff'); ngon(cx + 11.5, sy - 3, 1.4, 5, 0, '#ffffff');
}

function drawBubbles(x, y, o, t) {
  if (o.state === 'popped') { for (let i = 0; i < 5; i++) ngon(x - 20 + i * 10, y - 4, 2.5, 6, 0, '#9fe3ff'); return; }
  for (const [dx, r, ph] of [[-22, 22, 0], [16, 28, 1.3], [-2, 16, 2.6]]) {
    const by = y - r - 4 - Math.abs(Math.sin(t * 2 + ph)) * 10;
    ctx.globalAlpha = 0.35; ngon(x + dx, by, r, 16, 0, '#9fe3ff'); ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x + dx, by, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,143,177,.6)';
    ctx.beginPath(); ctx.arc(x + dx, by, r - 4, 3.6, 4.6); ctx.stroke();
    ngon(x + dx - r * 0.4, by - r * 0.4, r * 0.18, 6, 0, '#ffffff');
  }
}

function drawCustom(x, y, o, t) { // "invent your own": any picture he chose, on the road
  const f = o.fly;
  if (f && f.x > 600) return;
  ctx.save(); ctx.translate(x + (f ? f.x : 0), y + (f ? f.y : 0)); if (f) ctx.rotate(f.rot);
  if (!f) shadowAt(0, 2, 32, 6);
  ctx.font = '64px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(o.emoji || '⭐', 0, -8 - (f ? 0 : Math.abs(Math.sin(t * 3)) * 5));
  ctx.restore();
}

// fail: bonk (bounce back), spin, slow (slime), flat (tire), chomp (pit), stuck (web), float (lifted), fly (knocked away)
Object.assign(KINDS, {
  dino:    { w: 140, tall: 80, icon: '🦖', drawn: true, draw: drawDino, fail: 'bonk', after: 'roared', sfx: 'roar', ouch: '🦖 ¡RAWR!' },
  shark:   { w: 130, icon: '🦈', drawn: true, ground: drawSharkPool, front: drawSharkChomp, fail: 'chomp', ouch: '🦈 ¡ÑAM!', ouchColor: '#3f7fe0' },
  boulder: { w: 64, icon: '🪨', drawn: true, draw: drawBoulder, fail: 'bonk', after: 'broken', chips: ['#9aa3ad', '#7d848e', '#b8c0c8'], ouch: '¡PUM!' },
  snowman: { w: 116, tall: 112, icon: '⛄', drawn: true, draw: drawSnowman, fail: 'spin', after: 'melted', ouch: '⛄ ¡Uy!', ouchColor: '#3f7fe0' },
  cactus:  { w: 56, tall: 76, icon: '🌵', drawn: true, draw: drawCactus, fail: 'flat', ouch: '🌵 ¡Ay!' },
  slime:   { w: 116, icon: '🟢', drawn: true, ground: drawSlime, fail: 'slow', after: 'splatted', ouch: '¡Splat!', ouchColor: '#2f9e44' },
  tornado: { w: 80, tall: 112, icon: '🌪️', drawn: true, draw: drawTornado, fail: 'float', ouch: '🌪️ ¡Uaaa!', ouchColor: '#6b7280' },
  cow:     { w: 112, tall: 72, icon: '🐄', drawn: true, draw: drawCow, fail: 'bonk', sfx: 'moo', ouch: '🐮 ¡Muuu!', ouchColor: '#3a2a22' },
  web:     { w: 76, tall: 96, icon: '🕸️', drawn: true, draw: drawWeb, fail: 'stuck', after: 'torn', ouch: '🕸️ ¡Pegado!', ouchColor: '#6b7280' },
  bubbles: { w: 84, tall: 76, icon: '🫧', drawn: true, draw: drawBubbles, fail: 'float', after: 'popped', ouch: '¡Pop!', ouchColor: '#3f7fe0' },
  custom:  { w: 70, tall: 72, icon: '✨', drawn: true, draw: drawCustom, fail: 'fly', ouch: '¡Bonk!' },
});
