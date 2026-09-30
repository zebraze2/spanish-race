/* Gator obstacles: a pit with a snapping gator, a drawbridge over a gator pit,
   and a river bridge with giant leaping gators. Low-poly, friendly-scary. */
const GATOR = '#4caf50', GATOR_DARK = '#3d8b40', GATOR_LIGHT = '#6cc76f';

// A gator head; hinge at (x, y), snout pointing right (dir 1) or left (dir -1); open 0..1.
function gatorHead(x, y, s, open, dir = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  ctx.save(); ctx.rotate(open * 0.55);
  poly([-10, 0, 90, -2, 92, 9, -8, 15], GATOR_DARK);
  poly([0, 1, 86, -1, 84, 4, 0, 6], '#ff8fa3');
  for (let i = 0; i < 6; i++) poly([14 + i * 12, 1, 18 + i * 12, -6, 22 + i * 12, 1], '#ffffff');
  ctx.restore();
  ctx.save(); ctx.rotate(-open * 0.45);
  poly([-14, 0, -8, -26, 20, -30, 60, -20, 92, -12, 96, -2, 90, 2, -10, 4], GATOR);
  poly([-8, -26, 20, -30, 60, -20, 92, -12, 60, -15, 20, -21], GATOR_LIGHT);
  for (let i = 0; i < 6; i++) poly([14 + i * 12, 2, 18 + i * 12, 9, 22 + i * 12, 2], '#ffffff');
  for (let i = 0; i < 3; i++) poly([26 + i * 14, -25, 32 + i * 14, -33, 38 + i * 14, -24], GATOR_DARK);
  ngon(6, -30, 11, 7, 0, GATOR); ngon(7, -32, 7, 8, 0, '#ffffff'); ngon(9, -32, 3.4, 6, 0, '#1f2a1f');
  ngon(88, -12, 3, 5, 0, '#2f6b32');
  ctx.restore();
  ctx.restore();
}
// Just the eyes and nostrils poking out of the water.
function gatorPeek(x, y, s, t) {
  const bob = Math.sin(t * 3 + x * 0.01) * 2;
  ctx.save(); ctx.translate(x, y + bob); ctx.scale(s, s);
  for (const ex of [-12, 12]) { ngon(ex, 0, 10, 7, 0, GATOR); ngon(ex, -2, 6, 8, 0, '#ffffff'); ngon(ex + 1.5, -2, 3, 6, 0, '#1f2a1f'); }
  ngon(46, 4, 5, 6, 0, GATOR); ngon(46, 3, 1.6, 5, 0, '#2f6b32');
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(12, 9, 34, 5, 0, 0, Math.PI); ctx.stroke();
  ctx.restore();
}
// A whole gator leaping, body and tail behind the head.
function gatorLeaping(x, y, s, dir, open, tilt) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(dir, 1);
  poly([-40 * s, -18 * s, -230 * s, 0, -40 * s, 22 * s], GATOR_DARK);
  poly([-10 * s, -26 * s, -150 * s, -18 * s, -160 * s, 16 * s, -10 * s, 20 * s], GATOR);
  poly([-20 * s, 10 * s, -140 * s, 6 * s, -130 * s, 18 * s, -20 * s, 20 * s], '#b5e08a');
  for (let i = 0; i < 5; i++) poly([(-40 - i * 24) * s, -24 * s, (-30 - i * 24) * s, -36 * s, (-20 - i * 24) * s, -22 * s], GATOR_DARK);
  for (const lx of [-40, -120]) poly([lx * s, 16 * s, (lx + 12) * s, 34 * s, (lx + 24) * s, 16 * s], GATOR_DARK);
  ctx.restore();
  gatorHead(x, y, s, open, dir);
}

/* ---------- pit (also under the drawbridge) ---------- */
function drawPit(x, y, o, t) {
  const rx = o.w / 2;
  blob(x, y - 22, rx + 8, 44, 11, 0.07, '#9a7a52');
  blob(x, y - 22, rx, 38, 11, 0.07, '#4a3222');
  blob(x + 4, y - 14, rx * 0.8, 22, 9, 0.05, '#3f8f96');
  poly([x - rx * 0.5, y - 20, x - rx * 0.1, y - 22, x - rx * 0.2, y - 18], 'rgba(255,255,255,.5)');
  if (!(o.chompT > 0)) gatorPeek(x - 10, y - 18, 0.8, t);
  if (o.state === 'planked') { // a helper plank drops in after a gator bite
    poly([x - rx - 14, y - 8, x + rx + 14, y - 8, x + rx + 14, y + 4, x - rx - 14, y + 4], '#b07a45');
    for (let px = x - rx; px < x + rx; px += 22) poly([px, y - 8, px + 2, y - 8, px + 2, y + 4, px, y + 4], '#8a5a2b');
  }
}
function drawPitChomp(x, y, o) {
  if (!(o.chompT > 0)) return;
  const k = o.chompT / 0.7, lift = Math.sin(k * Math.PI);
  const open = k < 0.45 ? Math.min(1, k / 0.2) : Math.max(0, 1 - (k - 0.45) / 0.08);
  gatorHead(x + 10, y - 16 - lift * 78, 0.85, open, -1);
}
function drawDrawbridge(x, y, o) {
  const x0 = x - o.w / 2, L = o.w + 12, a = -o.bridge * 1.4;
  poly([x0 - 16, y + 2, x0 - 6, y + 2, x0 - 6, y - 124, x0 - 16, y - 124], '#8a5a2b');
  poly([x0 - 19, y - 124, x0 - 3, y - 124, x0 - 3, y - 132, x0 - 19, y - 132], '#6b4022');
  const tipX = x0 + Math.cos(a) * L, tipY = y - 6 + Math.sin(a) * L;
  ctx.save(); ctx.translate(x0, y - 6); ctx.rotate(a);
  poly([0, -6, L, -6, L, 6, 0, 6], '#b07a45');
  for (let px = 14; px < L; px += 18) poly([px, -6, px + 2, -6, px + 2, 6, px, 6], '#8a5a2b');
  poly([0, 4, L, 4, L, 6, 0, 6], '#8a5a2b');
  ctx.restore();
  ctx.strokeStyle = '#5b6470'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]);
  ctx.beginPath(); ctx.moveTo(x0 - 11, y - 120); ctx.lineTo(tipX, tipY); ctx.stroke(); ctx.setLineDash([]);
}

/* ---------- river with a wooden bridge and giant gators ---------- */
function drawRiver(x, o, t) {
  const x0 = x - o.w / 2, x1 = x + o.w / 2, bottom = VIEW.h - VIEW.offY;
  poly([x0, 334, x1, 334, x1, ROAD_TOP, x0, ROAD_TOP], '#5fbfd0');
  poly([x0, ROAD_BOT + 6, x1, ROAD_BOT + 6, x1, bottom, x0, bottom], '#5fbfd0');
  for (let i = 0; i < 6; i++) {
    const wx = x0 + ((i * 53 + t * 30) % o.w);
    poly([wx, 350 + (i % 3) * 7, wx + 22, 349 + (i % 3) * 7, wx + 18, 352 + (i % 3) * 7], '#8fdbe6');
    poly([wx, ROAD_BOT + 18 + (i % 2) * 8, wx + 26, ROAD_BOT + 17 + (i % 2) * 8, wx + 22, ROAD_BOT + 20 + (i % 2) * 8], '#8fdbe6');
  }
  gatorPeek(x - 40 + Math.sin(t * 0.8) * 50, 352, 0.7, t);
  if (!o.leap) gatorPeek(x + 60 + Math.cos(t * 0.6) * 30, ROAD_BOT + 26, 0.9, t);
  for (const bx of [x0, x1]) { boulder(bx, 344, 0.6); boulder(bx, ROAD_BOT + 30, 0.8); }
  // the bridge deck across both lanes, with railings
  poly([x0 - 6, ROAD_TOP - 8, x1 + 6, ROAD_TOP - 8, x1 + 6, ROAD_BOT + 8, x0 - 6, ROAD_BOT + 8], '#b07a45');
  for (let px = x0; px < x1; px += 18) poly([px, ROAD_TOP - 8, px + 2, ROAD_TOP - 8, px + 2, ROAD_BOT + 8, px, ROAD_BOT + 8], '#9a6535');
  poly([x0 - 6, ROAD_BOT + 8, x1 + 6, ROAD_BOT + 8, x1 + 6, ROAD_BOT + 16, x0 - 6, ROAD_BOT + 16], '#7a4a28');
  for (const ry of [ROAD_TOP - 8, ROAD_BOT - 4]) {
    for (let px = x0; px <= x1; px += 50) poly([px - 3, ry, px + 3, ry, px + 3, ry - 26, px - 3, ry - 26], '#7a4a28');
    poly([x0 - 6, ry - 26, x1 + 6, ry - 26, x1 + 6, ry - 20, x0 - 6, ry - 20], '#8a5a2b');
  }
}
function drawRiverGators(x, o, t) {
  const L = o.leap;
  if (!L) return;
  const k = Math.min(1, L.t / 1.2), base = ROAD_BOT + 60, peak = YOU_GY - 120;
  const lx = x + (L.x - o.x), ly = base - Math.sin(k * Math.PI) * (base - peak);
  const dir = L.hit ? -1 : 1;
  const open = k < 0.5 ? Math.min(1, k / 0.25) : Math.max(0, 1 - (k - 0.5) / 0.08);
  gatorLeaping(lx, ly, 1.2, dir, open, (k - 0.5) * 0.9 * dir);
  if (k < 0.2 || k > 0.8) for (let i = 0; i < 6; i++) ngon(lx - 40 + i * 16, ROAD_BOT + 12 - Math.abs(Math.sin(i + t * 10)) * 20, 4, 5, 0, '#ffffff');
}
