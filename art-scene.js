/* Canvas scene in a cute low-poly toy style: faceted hills, trees and rocks,
   a racetrack road with red/white curbs. The scene is designed 600 units tall;
   taller screens get extra sky and grass (VIEW.offY). */
const cv = document.getElementById('cv');
let ctx = cv.getContext('2d'); // swapped by withCtx() to draw thumbnails
function withCtx(canvas, draw) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2), w = canvas.clientWidth || canvas.width, h = canvas.clientHeight || canvas.height;
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  const old = ctx; ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  try { draw(w, h); } finally { ctx = old; }
}
const VIEW = { w: 1000, h: 600, s: 1, offY: 0 };
const DESIGN_H = 600, MIN_W = 760;
const HORIZON = 250, ROAD_TOP = 372, ROAD_BOT = 572, DIVIDER_Y = 468, CPU_GY = 448, YOU_GY = 544;

const PAL = {
  sky1: '#8fd9f0', sky2: '#e3f7ef',
  mesa: '#eaa877', mesaLight: '#f4bf92', mesaShade: '#d38a58', mesaTop: '#f7d3ae',
  hill1: '#a5de83', hill2: '#8fd26c', hill3: '#7cc45a',
  grass: '#8fd46b', grassDark: '#74bd55', grassLight: '#a8e285',
  road: '#6f7682', roadLight: '#7d8591', roadDark: '#5c626d',
  curbA: '#ff6b5a', curbB: '#ffffff', curbShadeA: '#d4503f', curbShadeB: '#cfd4db',
  dash: '#ffd23f',
  pine: '#43b06b', pineDark: '#318f55', leaf: '#6cc44f', leafDark: '#52a83a', trunk: '#9a6035',
  rock: '#e8844a', rockLight: '#f5a26a', rockDark: '#c0602f',
  ink: '#3a2a22', shadow: 'rgba(38,62,40,.22)',
};

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = cv.clientWidth, H = cv.clientHeight;
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  VIEW.s = Math.min(H / DESIGN_H, W / MIN_W) * dpr;
  VIEW.w = cv.width / VIEW.s; VIEW.h = cv.height / VIEW.s;
  VIEW.offY = (VIEW.h - DESIGN_H) * 0.6;
}

/* ---------- helpers ---------- */
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function shade(hex, f) { // f > 0 lightens toward white, f < 0 darkens toward black
  const n = parseInt(hex.slice(1), 16), t = f < 0 ? 0 : 255, p = Math.abs(f);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v + (t - v) * p));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
function poly(pts, fill) {
  ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}
function ngon(cx, cy, r, n, rot, fill, sy = 1) {
  ctx.beginPath();
  for (let i = 0; i < n; i++) { const a = rot + i * Math.PI * 2 / n; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * sy); }
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}
function rrectPath(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function shadowAt(x, y, rx, ry = 7) { ctx.fillStyle = PAL.shadow; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
function label(text, x, y, size, fill, stroke = PAL.ink) {
  ctx.font = `${size}px "Lilita One", "Baloo 2", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.22; ctx.strokeStyle = stroke; ctx.strokeText(text, x, y);
  ctx.fillStyle = fill; ctx.fillText(text, x, y);
}
function visibleRange(cam, par, sp) { const first = Math.floor(cam * par / sp) - 1; return [first, first + Math.ceil(VIEW.w / sp) + 3]; }

/* ---------- background ---------- */
function drawSky(cam, top) {
  const g = ctx.createLinearGradient(0, top, 0, HORIZON + 40);
  g.addColorStop(0, PAL.sky1); g.addColorStop(1, PAL.sky2);
  ctx.fillStyle = g; ctx.fillRect(0, top, VIEW.w, HORIZON + 40 - top);
  ngon(VIEW.w - 140, 96, 40, 8, 0.2, '#ffe36b'); ngon(VIEW.w - 140, 96, 28, 8, 0, '#fff08f');
  const [a, b] = visibleRange(cam, 0.06, 380);
  for (let n = a; n < b; n++) {
    if (hash(n) < 0.3) continue;
    const x = n * 380 - cam * 0.06 + hash(n + 7) * 120, y = 60 + hash(n + 3) * 90, k = 0.7 + hash(n + 5) * 0.6;
    poly([x - 34 * k, y + 10 * k, x + 112 * k, y + 10 * k, x + 100 * k, y + 24 * k, x - 22 * k, y + 24 * k], '#e1eff2');
    ngon(x, y, 34 * k, 6, 0.3, '#fff'); ngon(x + 40 * k, y - 14 * k, 42 * k, 6, 0.1, '#fff'); ngon(x + 82 * k, y, 30 * k, 6, 0.5, '#fff');
  }
}
function drawMesas(cam) {
  const [a, b] = visibleRange(cam, 0.12, 300);
  for (let n = a; n < b; n++) {
    if (hash(n * 3.1) < 0.45) continue;
    const w = 90 + hash(n + 11) * 150, h = 40 + hash(n + 17) * 70;
    const x = n * 300 - cam * 0.12 + hash(n + 23) * 80, base = HORIZON + 34, tl = x + w * 0.18, tr = x + w * 0.8;
    poly([x, base, tl, base - h, tr, base - h, x + w, base], PAL.mesa);
    poly([x, base, tl, base - h, x + w * 0.3, base], PAL.mesaLight);
    poly([tr, base - h, x + w, base, x + w * 0.62, base], PAL.mesaShade);
    poly([tl, base - h, tr, base - h, tr - 8, base - h - 7, tl + 6, base - h - 7], PAL.mesaTop);
  }
}
function drawHills(cam) {
  const sp = 120, base = 344, [a, b] = visibleRange(cam, 0.3, sp), pts = [];
  for (let n = a; n <= b; n++) pts.push([n * sp - cam * 0.3, base - 34 - hash(n * 1.7) * 70]);
  ctx.beginPath(); ctx.moveTo(pts[0][0], base + 40);
  for (const [x, y] of pts) ctx.lineTo(x, y);
  ctx.lineTo(pts[pts.length - 1][0], base + 40); ctx.closePath(); ctx.fillStyle = PAL.hill2; ctx.fill();
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    poly([x1, y1, x2, y2, (x1 + x2) / 2, base + 6], (a + i) % 2 ? PAL.hill1 : PAL.hill3);
  }
}
function drawBackGrass(cam) {
  ctx.fillStyle = PAL.grass; ctx.fillRect(0, 338, VIEW.w, ROAD_TOP - 338);
  const [a, b] = visibleRange(cam, 1, 90);
  for (let n = a; n < b; n++) {
    const x = n * 90 - cam, y = 344 + hash(n * 4.1) * 16;
    poly([x, y, x + 50, y + 4, x + 22, y + 16], hash(n) < 0.5 ? PAL.grassLight : PAL.grassDark);
  }
}
function pine(x, y, k) {
  poly([x - 4 * k, y, x + 4 * k, y, x + 4 * k, y - 14 * k, x - 4 * k, y - 14 * k], PAL.trunk);
  for (let i = 0; i < 3; i++) {
    const by = y - 10 * k - i * 17 * k, w = (30 - i * 7) * k, h = 30 * k;
    poly([x - w, by, x, by - h, x, by], PAL.pine);
    poly([x, by - h, x + w, by, x, by], PAL.pineDark);
  }
}
function roundTree(x, y, k) {
  poly([x - 5 * k, y, x + 5 * k, y, x + 4 * k, y - 26 * k, x - 4 * k, y - 26 * k], PAL.trunk);
  const cy = y - 46 * k, r = 28 * k;
  ngon(x, cy, r, 7, 0.2, PAL.leaf);
  poly([x, cy - r, x + r * 0.95, cy - r * 0.3, x + r * 0.8, cy + r * 0.6, x, cy + r], PAL.leafDark);
  ngon(x - r * 0.35, cy - r * 0.35, r * 0.35, 5, 0, shade(PAL.leaf, 0.2));
}
function boulder(x, y, k) {
  const w = 34 * k, h = 30 * k;
  poly([x - w, y, x - w * 0.7, y - h * 0.8, x - w * 0.1, y - h, x + w * 0.6, y - h * 0.75, x + w, y], PAL.rock);
  poly([x - w * 0.1, y - h, x + w * 0.6, y - h * 0.75, x + w, y, x + w * 0.2, y], PAL.rockDark);
  poly([x - w, y, x - w * 0.7, y - h * 0.8, x - w * 0.1, y - h, x - w * 0.3, y - h * 0.4], PAL.rockLight);
}
function drawBackProps(cam) {
  const [a, b] = visibleRange(cam, 1, 150);
  for (let n = a; n < b; n++) {
    const r = hash(n * 5.3); if (r < 0.2) continue;
    const x = n * 150 - cam + hash(n + 2) * 60, y = ROAD_TOP - 10 - hash(n + 9) * 24, k = 0.8 + hash(n + 4) * 0.5;
    if (r < 0.55) pine(x, y, k); else if (r < 0.86) roundTree(x, y, k); else boulder(x, y, k);
  }
}
function flower(x, y, c) {
  poly([x, y, x + 2, y - 12, x + 3, y], PAL.grassDark);
  for (let i = 0; i < 5; i++) ngon(x + 2 + Math.cos(i * 1.26) * 5, y - 14 + Math.sin(i * 1.26) * 5, 3.6, 5, 0, c);
  ngon(x + 2, y - 14, 3, 5, 0, '#ffd23f');
}

/* ---------- road ---------- */
function drawRoad(cam) {
  const w = VIEW.w;
  ctx.fillStyle = PAL.road; ctx.fillRect(0, ROAD_TOP, w, ROAD_BOT - ROAD_TOP);
  ctx.fillStyle = PAL.roadLight; ctx.fillRect(0, ROAD_TOP, w, 14);
  ctx.fillStyle = PAL.roadDark; ctx.fillRect(0, ROAD_BOT - 8, w, 8);
  const cw = 36;
  for (let n = Math.floor(cam / cw) - 1; n * cw - cam < w + cw; n++) {
    const x = n * cw - cam, a = n % 2 === 0;
    poly([x, ROAD_TOP + 2, x + cw, ROAD_TOP + 2, x + cw + 4, ROAD_TOP - 8, x + 4, ROAD_TOP - 8], a ? PAL.curbA : PAL.curbB);
    poly([x, ROAD_BOT - 2, x + cw, ROAD_BOT - 2, x + cw - 3, ROAD_BOT + 6, x - 3, ROAD_BOT + 6], a ? PAL.curbA : PAL.curbB);
    poly([x - 3, ROAD_BOT + 6, x + cw - 3, ROAD_BOT + 6, x + cw - 3, ROAD_BOT + 12, x - 3, ROAD_BOT + 12], a ? PAL.curbShadeA : PAL.curbShadeB);
  }
  ctx.fillStyle = PAL.dash;
  for (let n = Math.floor(cam / 80) - 1; n * 80 - cam < w + 80; n++) ctx.fillRect(n * 80 - cam, DIVIDER_Y - 3, 42, 6);
}
function drawFrontGrass(cam, bottom) {
  ctx.fillStyle = PAL.grass; ctx.fillRect(0, ROAD_BOT + 12, VIEW.w, bottom - ROAD_BOT);
  const [a, b] = visibleRange(cam, 1, 70);
  for (let n = a; n < b; n++) {
    const r = hash(n * 2.7), x = n * 70 - cam + hash(n + 1) * 40, y = ROAD_BOT + 30 + hash(n + 5) * 22;
    if (r < 0.35) { poly([x - 8, y, x - 3, y - 14, x, y], PAL.grassDark); poly([x - 2, y, x + 4, y - 18, x + 8, y], PAL.grassDark); }
    else if (r < 0.6) flower(x, y, ['#ffffff', '#ff8fb1', '#ffb347'][Math.abs(n) % 3]);
    else if (r < 0.68) boulder(x, y + 4, 0.5);
  }
}

/* ---------- gas station + finish ---------- */
function drawStationBack(st, sx) {
  if (sx < -220 || sx > VIEW.w + 220) return;
  const b = ROAD_TOP - 8, x0 = sx - 40;
  poly([x0 - 70, b, x0 - 70, b - 62, x0 + 30, b - 62, x0 + 30, b], '#fff3dc');
  poly([x0 + 30, b, x0 + 30, b - 62, x0 + 44, b - 70, x0 + 44, b - 8], '#e9d6b4');
  poly([x0 - 56, b, x0 - 56, b - 38, x0 - 34, b - 38, x0 - 34, b], '#5aa9e6');
  poly([x0 - 22, b - 44, x0 + 18, b - 44, x0 + 18, b - 22, x0 - 22, b - 22], '#bfeaff');
  poly([x0 - 80, b - 62, x0 + 38, b - 62, x0 + 52, b - 80, x0 - 66, b - 80], '#e8453c');
  poly([x0 - 80, b - 62, x0 + 38, b - 62, x0 + 38, b - 54, x0 - 80, b - 54], '#b8342c');
  poly([sx + 58, b, sx + 64, b, sx + 64, b - 100, sx + 58, b - 100], '#9aa3ad');
  ctx.fillStyle = PAL.ink; rrectPath(sx + 24, b - 150, 76, 56, 14); ctx.fill();
  ctx.fillStyle = '#ffd23f'; rrectPath(sx + 28, b - 150, 68, 49, 11); ctx.fill();
  ctx.font = '32px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('⛽', sx + 62, b - 125);
}
function drawStationFront(st, sx, G) {
  if (sx < -200 || sx > VIEW.w + 200) return;
  const px = sx - 34, b = ROAD_BOT + 24;
  shadowAt(px + 4, b, 26, 6);
  if (st.filling) { // hose to the car's fuel cap
    const cx = G.p.x - G.cam - 58, cy = YOU_GY - 40;
    ctx.strokeStyle = '#2b2d33'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(px + 16, b - 40); ctx.quadraticCurveTo((px + cx) / 2 + 10, b + 6, cx, cy); ctx.stroke();
    poly([cx - 6, cy - 5, cx + 6, cy - 5, cx + 6, cy + 5, cx - 6, cy + 5], '#2b2d33');
  }
  poly([px - 17, b, px - 17, b - 64, px + 17, b - 64, px + 17, b], '#e8453c');
  poly([px + 17, b, px + 17, b - 64, px + 25, b - 70, px + 25, b - 6], '#b8342c');
  poly([px - 17, b - 64, px + 17, b - 64, px + 25, b - 70, px - 9, b - 70], '#ff8a7c');
  poly([px - 11, b - 56, px + 11, b - 56, px + 11, b - 40, px - 11, b - 40], st.filling ? '#c6ffb3' : '#eef6ff');
  if (!st.filling) poly([px + 17, b - 44, px + 25, b - 48, px + 25, b - 30, px + 17, b - 28], '#2b2d33');
}
function drawFinishBack(sx) {
  if (sx < -240 || sx > VIEW.w + 240) return;
  const b = ROAD_TOP - 6;
  for (const px of [sx - 92, sx + 84]) {
    poly([px, b, px + 8, b, px + 8, 200, px, 200], '#aab2bc');
    poly([px + 8, b, px + 11, b - 2, px + 11, 198, px + 8, 200], '#7b848e');
  }
  ctx.fillStyle = PAL.ink; rrectPath(sx - 118, 142, 236, 68, 16); ctx.fill();
  ctx.fillStyle = '#f28c38'; rrectPath(sx - 112, 142, 224, 58, 12); ctx.fill();
  label('META', sx, 173, 42, '#fff');
  for (const fx of [sx - 100, sx + 100]) {
    poly([fx, 142, fx + 3, 142, fx + 3, 96, fx, 96], PAL.ink);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++)
      poly([fx + 3 + c * 8, 96 + r * 8, fx + 11 + c * 8, 96 + r * 8, fx + 11 + c * 8, 104 + r * 8, fx + 3 + c * 8, 104 + r * 8], (r + c) % 2 ? '#222' : '#fff');
  }
}
function drawFinishLine(sx) {
  if (sx < -60 || sx > VIEW.w + 60) return;
  const sq = 12.5, rows = Math.round((ROAD_BOT - ROAD_TOP) / sq);
  for (let r = 0; r < rows; r++) {
    const y = ROAD_TOP + r * sq, k = (ROAD_BOT - y) * 0.1;
    for (let c = 0; c < 3; c++) {
      const x = sx - 19 + c * sq + k;
      poly([x, y, x + sq, y, x + sq - 1.25, y + sq, x - 1.25, y + sq], (r + c) % 2 ? '#222' : '#fff');
    }
  }
}

/* ---------- effects ---------- */
function drawParticles(G, cam) {
  for (const q of G.parts) {
    const a = Math.max(0, 1 - q.t / q.life), x = q.x - cam;
    ctx.globalAlpha = q.type === 'chip' ? Math.min(1, a * 3) : a;
    if (q.type === 'puff') ngon(x, q.y, q.size * (1 + q.t * 2), 6, q.rot, q.color);
    else if (q.type === 'flame') poly([x - q.size, q.y, x, q.y - q.size * 2.4 * a, x + q.size, q.y], q.color);
    else if (q.type === 'spark') ngon(x, q.y, q.size * a + 1, 4, q.rot, q.color);
    else if (q.type === 'chip') {
      ctx.save(); ctx.translate(x, q.y); ctx.rotate(q.rot);
      ctx.fillStyle = q.color; ctx.fillRect(-q.size, -q.size / 3, q.size * 2, q.size * 0.66); ctx.restore();
    } else ngon(x, q.y, q.size, 5, q.rot, q.color); // drop / bubble
  }
  ctx.globalAlpha = 1;
}
function drawFloaters(G, cam) {
  for (const f of G.floaters) {
    ctx.globalAlpha = Math.min(1, 2.4 - f.t * 1.7);
    label(f.text, f.x - cam, f.y - f.t * 46, 36, f.color);
  }
  ctx.globalAlpha = 1;
}
function drawDizzy(x, y, t) {
  for (let i = 0; i < 3; i++) {
    const a = t * 6 + i * 2.09, sx = x + Math.cos(a) * 36, sy = y + Math.sin(a) * 9;
    ctx.beginPath();
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 4 : 10, ang = -Math.PI / 2 + k * Math.PI / 5; ctx.lineTo(sx + Math.cos(ang) * r, sy + Math.sin(ang) * r); }
    ctx.closePath(); ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = PAL.ink; ctx.stroke();
  }
}
function drawCpuArrow() {
  const x = VIEW.w - 100, y = CPU_GY - 70;
  ctx.fillStyle = PAL.ink; rrectPath(x - 3, y - 3, 92, 52, 26); ctx.fill();
  ctx.fillStyle = '#3f7fe0'; rrectPath(x, y, 86, 46, 23); ctx.fill();
  ctx.font = '24px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🤖➡️', x + 43, y + 24);
}
function drawPlayer(G, cam) {
  const p = G.p, x = p.x - cam;
  let angle = 0, h = p.h;
  if (p.spinT > 0) { const k = 1 - p.spinT / p.spinDur; angle = -k * Math.PI * 2; h += Math.sin(k * Math.PI) * 50; }
  else if (h > 0) angle = Math.max(-0.28, Math.min(0.28, -p.vy / 2600));
  else if (p.flatT > 0) angle = Math.sin(G.t * 28) * 0.035;
  else if (p.backT > 0) angle = Math.sin(G.t * 40) * 0.05;
  drawCar(CARS[G.carIdx], x, YOU_GY, { h, angle, wheel: p.wheel, boost: p.boostT > 0, flat: p.flatT > 0,
    soot: p.sootT > 0 ? 'rgba(38,30,30,.55)' : p.mudT > 0 ? 'rgba(110,72,36,.5)' : null, t: G.t });
  if (p.slowT > 0 && p.spinT <= 0) drawDizzy(x, YOU_GY - h - 118, G.t);
}

/* ---------- one full frame ---------- */
function drawFrame(G) {
  const cam = G.cam, top = -VIEW.offY, bottom = VIEW.h - VIEW.offY;
  ctx.setTransform(VIEW.s, 0, 0, VIEW.s, 0, VIEW.offY * VIEW.s);
  drawSky(cam, top); drawMesas(cam); drawHills(cam); drawBackGrass(cam); drawBackProps(cam);
  for (const st of G.stations) drawStationBack(st, st.x - cam);
  drawFinishBack(G.len - cam);
  drawRoad(cam); drawFrontGrass(cam, bottom);
  for (const o of G.obs) drawObstacleGround(o, o.x - cam, G);
  drawFinishLine(G.len - cam);
  const cpuX = G.cpu.x - cam;
  drawCar(ROBOT_CAR, cpuX, CPU_GY, { wheel: G.cpu.wheel, scale: 0.88, t: G.t });
  if (cpuX > VIEW.w + 70) drawCpuArrow();
  for (const o of G.obs) drawObstacleUpright(o, o.x - cam, G);
  drawPlayer(G, cam);
  for (const o of G.obs) drawObstacleFront(o, o.x - cam, G);
  for (const st of G.stations) drawStationFront(st, st.x - cam, G);
  drawParticles(G, cam); drawFloaters(G, cam);
}
