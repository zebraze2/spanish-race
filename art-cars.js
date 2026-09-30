/* Cars for the shop, drawn as flat low-poly polygons in car-local coordinates
   (facing right, ground at y = 0, up is negative). All cars drive the same;
   they just look cooler as the price goes up.
   Part colors: b body, m body-light, l highlight, d shadow, g glass, a accent,
   w white, k dark trim, c chrome, y headlight, r taillight (or any CSS color). */
const GLINT = 'rgba(255,255,255,.7)';
const CARS = [
  { id: 'red', name: 'Rojito', price: 0, body: '#e8453c', accent: '#ffffff', decal: [-16, -36, '1'], helmet: [13, -70],
    wheels: [[-40, 17], [42, 17]], tail: [-66, -29], parts: [
      ['b', [-66, -20, -69, -42, -58, -52, 54, -52, 68, -42, 69, -20]], ['l', [-58, -52, 54, -52, 48, -57, -52, -57]],
      ['d', [-66, -20, 69, -20, 67, -28, -67, -28]], ['a', [-66, -38, 68, -38, 68, -33, -66, -33]],
      ['m', [-40, -56, -28, -88, 24, -88, 44, -56]], ['l', [-28, -88, 24, -88, 20, -93, -25, -93]],
      ['d', [-40, -56, -28, -88, -24, -88, -34, -56]], ['g', [-31, -60, -22, -82, -3, -82, -3, -60]],
      ['g', [3, -60, 3, -82, 20, -82, 35, -60]], [GLINT, [-20, -80, -15, -80, -24, -62, -29, -62]],
      ['y', [62, -44, 69, -42, 69, -34, 62, -35]], ['r', [-69, -42, -63, -44, -63, -35, -69, -34]]] },
  { id: 'zoom', name: 'Zum', price: 10, body: '#ff8a1f', accent: '#ffffff', decal: [-26, -41, '7'], helmet: [10, -66],
    wheels: [[-44, 17], [48, 17]], tail: [-72, -28], parts: [
      ['d', [-88, -68, -60, -68, -60, -62, -88, -62]], ['d', [-72, -62, -66, -62, -66, -50, -72, -50]],
      ['b', [-72, -18, -76, -40, -64, -50, 34, -52, 74, -38, 76, -18]], ['l', [-64, -50, 34, -52, 28, -57, -58, -55]],
      ['d', [-72, -18, 76, -18, 74, -26, -73, -26]], ['w', [-76, -36, 75, -34, 75, -30, -76, -32]],
      ['m', [-50, -52, -32, -80, 10, -80, 40, -52]], ['l', [-32, -80, 10, -80, 7, -85, -29, -85]],
      ['g', [-41, -56, -28, -76, -8, -76, -8, -56]], ['g', [-2, -56, -2, -76, 8, -76, 31, -56]],
      [GLINT, [-24, -74, -19, -74, -31, -58, -36, -58]],
      ['y', [68, -40, 76, -37, 76, -31, 68, -32]], ['r', [-76, -40, -70, -42, -70, -34, -76, -33]]] },
  { id: 'pickup', name: 'Camioneta', price: 15, body: '#3fae5a', accent: '#ffd23f', helmet: [16, -74], pup: [-44, -68],
    wheels: [[-50, 20], [52, 20]], tail: [-80, -32], parts: [
      ['b', [-80, -24, -80, -58, -10, -58, -10, -24]], ['d', [-80, -58, -10, -58, -14, -63, -76, -63]],
      ['b', [-10, -24, -10, -96, 28, -96, 46, -60, 80, -54, 82, -24]], ['l', [-10, -96, 28, -96, 24, -101, -8, -101]],
      ['l', [46, -60, 80, -54, 77, -59, 44, -65]], ['d', [-80, -24, 82, -24, 80, -32, -80, -32]],
      ['a', [-80, -44, 82, -40, 82, -36, -80, -40]], ['g', [-4, -62, -4, -90, 24, -90, 40, -62]],
      [GLINT, [2, -88, 8, -88, 2, -66, -2, -66]],
      ['y', [76, -50, 83, -48, 83, -40, 76, -41]], ['r', [-82, -54, -76, -54, -76, -44, -82, -44]]] },
  { id: 'jeep', name: 'Safari', price: 20, body: '#ffc93c', accent: '#3a2a22', helmet: [-4, -80], spare: [-86, -48],
    wheels: [[-46, 22], [48, 22]], knobby: true, tail: [-76, -34], parts: [
      ['b', [-76, -28, -76, -66, 72, -66, 78, -46, 78, -28]], ['l', [-76, -66, 72, -66, 68, -71, -72, -71]],
      ['d', [-76, -28, 78, -28, 76, -36, -76, -36]], ['a', [-76, -52, 78, -52, 78, -46, -76, -46]],
      ['k', [-50, -71, -44, -71, -36, -112, -42, -112]], ['k', [-42, -112, 22, -112, 22, -106, -42, -106]],
      ['k', [16, -106, 22, -106, 28, -71, 22, -71]], ['k', [28, -71, 34, -71, 44, -100, 38, -100]],
      ['g', [34, -71, 40, -71, 47, -94, 42, -94]], ['c', [78, -46, 88, -46, 88, -30, 78, -30]],
      ['y', [70, -62, 78, -60, 78, -52, 70, -54]], ['r', [-78, -62, -74, -62, -74, -54, -78, -54]]] },
  { id: 'racer', name: 'Bólido', price: 25, body: '#8b5cf6', accent: '#ffd23f', decal: [-40, -36, '5'], helmet: [-6, -66],
    wheels: [[-56, 20], [60, 17]], tail: [-84, -30], parts: [
      ['a', [-98, -88, -62, -88, -62, -77, -98, -77]], ['k', [-84, -77, -79, -77, -74, -46, -79, -46]],
      ['b', [-84, -20, -86, -42, -44, -46, -8, -60, 30, -58, 62, -40, 94, -30, 94, -20]],
      ['l', [-44, -46, -8, -60, 30, -58, 26, -63, -8, -65, -42, -51]], ['d', [-84, -20, 94, -20, 92, -26, -84, -26]],
      ['a', [-84, -34, 94, -28, 94, -24, -84, -30]], ['a', [70, -18, 100, -18, 100, -11, 70, -11]],
      ['k', [-24, -58, 14, -60, 10, -54, -20, -52]], ['y', [86, -34, 94, -31, 94, -27, 86, -28]]] },
  { id: 'rocket', name: 'Cohete', price: 30, body: '#dfe7ef', accent: '#3f7fe0', helmet: [4, -72], booster: true,
    wheels: [[-44, 18], [50, 18]], tail: [-106, -43], parts: [
      ['c', [-100, -56, -72, -56, -72, -30, -100, -30]], ['k', [-106, -51, -100, -51, -100, -35, -106, -35]],
      ['#e8453c', [-72, -58, -58, -58, -80, -98, -92, -98]],
      ['b', [-74, -20, -76, -46, -34, -60, 30, -60, 84, -36, 84, -20]], ['l', [-34, -60, 30, -60, 26, -65, -30, -65]],
      ['d', [-74, -20, 84, -20, 82, -27, -74, -27]], ['a', [-76, -40, 84, -32, 84, -27, -76, -34]],
      ['g', [-26, -62, -12, -88, 16, -88, 34, -62]], [GLINT, [-14, -84, -8, -84, -18, -64, -23, -64]],
      ['y', [78, -36, 86, -33, 86, -27, 78, -28]]] },
  { id: 'dragon', name: 'Dragón', price: 40, body: '#2d2d3a', accent: '#e8453c', helmet: [12, -72], glass: '#ffb3b3',
    spikes: true, hub: '#e8453c', wheels: [[-46, 19], [48, 19]], tail: [-78, -28], parts: [
      ['b', [-78, -20, -80, -46, -52, -58, 52, -58, 84, -42, 84, -20]], ['l', [-52, -58, 52, -58, 46, -63, -46, -63]],
      ['d', [-78, -20, 84, -20, 82, -28, -78, -28]],
      ['#ff7a1a', [-72, -28, -54, -48, -44, -36, -28, -52, -18, -38, 0, -52, 8, -34, 20, -44, 24, -28]],
      ['#ffd23f', [-58, -28, -48, -40, -40, -32, -28, -44, -20, -32, -6, -42, 2, -28]],
      ['m', [-40, -60, -26, -86, 22, -86, 42, -60]], ['g', [-32, -63, -22, -81, -2, -81, -2, -63]],
      ['g', [4, -63, 4, -81, 18, -81, 34, -63]], ['#ffe066', [68, -48, 84, -42, 84, -37, 72, -40]],
      ['w', [76, -22, 80, -29, 84, -22]], ['w', [68, -22, 72, -29, 76, -22]]] },
  { id: 'monster', name: 'Monstruo', price: 60, body: '#ff5a36', accent: '#ffd23f', helmet: [22, -110],
    wheels: [[-54, 34], [56, 34]], knobby: true, tail: [-80, -76], parts: [
      ['k', [-58, -34, -50, -34, -46, -66, -54, -66]], ['k', [52, -34, 60, -34, 56, -66, 48, -66]],
      ['k', [-66, -62, 70, -62, 70, -68, -66, -68]],
      ['c', [-30, -96, -24, -96, -24, -118, -30, -118]], ['c', [-18, -96, -12, -96, -12, -113, -18, -113]],
      ['b', [-80, -64, -82, -96, -12, -96, -4, -128, 40, -128, 58, -100, 86, -96, 86, -64]],
      ['l', [-4, -128, 40, -128, 36, -133, -1, -133]], ['d', [-80, -64, 86, -64, 84, -72, -80, -72]],
      ['#ffd23f', [-78, -72, -60, -92, -50, -80, -32, -96, -20, -82, 2, -94, 8, -74]],
      ['#ff9a1f', [-70, -72, -58, -84, -48, -74, -32, -86, -22, -74]],
      ['g', [2, -100, 6, -122, 36, -122, 50, -100]], [GLINT, [10, -120, 16, -120, 12, -102, 6, -102]],
      ['y', [0, -139, 8, -139, 8, -133, 0, -133]], ['y', [14, -139, 22, -139, 22, -133, 14, -133]],
      ['y', [28, -139, 36, -139, 36, -133, 28, -133]], ['y', [80, -92, 88, -90, 88, -82, 80, -83]],
      ['c', [86, -88, 94, -88, 94, -66, 86, -66]]] },
];
const ROBOT_CAR = { ...CARS[0], id: 'robot', body: '#3f7fe0', accent: '#ffd23f', decal: null, helmet: null, robot: true };

let CAR_SIL = null, CAR_TINT = null; // silhouette color (locked shop cars) / soot-or-mud overlay
function P(pts, c) { poly(pts, CAR_SIL || c); if (CAR_TINT && !CAR_SIL) poly(pts, CAR_TINT); }

function drawWheel(x, y, r, rot, flat, knobby, hub = '#d5d9df') {
  ctx.save(); ctx.translate(x, y);
  if (flat) { ctx.translate(0, r * 0.22); ctx.scale(1.12, 0.72); }
  if (knobby) for (let i = 0; i < 12; i++) { const a = rot + i * Math.PI / 6; ngon(Math.cos(a) * r, Math.sin(a) * r, r * 0.17, 4, a, CAR_SIL || '#2b2d33'); }
  ngon(0, 0, r, 10, rot, CAR_SIL || '#2b2d33');
  if (!CAR_SIL) {
    ngon(0, 0, r * 0.74, 10, rot, '#41444c'); ngon(0, 0, r * 0.46, 6, rot, hub); ngon(0, 0, r * 0.18, 6, rot, '#8f96a0');
  }
  ctx.restore();
}

function drawCar(spec, x, gy, o = {}) {
  const h = o.h || 0, k = o.scale || 1, body = spec.body;
  const C = { b: body, m: shade(body, 0.08), l: shade(body, 0.28), d: shade(body, -0.28), g: spec.glass || '#bfeeff',
    a: spec.accent, w: '#ffffff', k: '#3a2a22', c: '#c9d1db', y: '#fff3a0', r: '#ffb347' };
  if (!o.sil) shadowAt(x, gy + 2, 64 * k * Math.max(0.45, 1 - h / 320), 8 * k);
  ctx.save();
  ctx.translate(x, gy - h - 44 * k); ctx.rotate(o.angle || 0); ctx.translate(0, 44 * k); ctx.scale(k, k);
  CAR_SIL = o.sil || null; CAR_TINT = o.soot || null;
  const [tx, ty] = spec.tail;
  if (o.boost && !CAR_SIL) {
    const f = 26 + Math.random() * 22;
    poly([tx, ty - 7, tx - f, ty - 1, tx, ty + 7], '#ffb020');
    poly([tx, ty - 4, tx - f * 0.6, ty - 1, tx, ty + 3], '#fff3a0');
  }
  if (spec.booster && !CAR_SIL) { const f = 10 + Math.random() * 10; poly([tx, ty - 6, tx - f, ty, tx, ty + 6], '#7ee8ff'); }
  if (spec.spare) drawWheel(spec.spare[0], spec.spare[1], 15, 0, false, true);
  if (spec.spikes) for (let sx = -28; sx <= 18; sx += 12) P([sx, -86, sx + 6, -100, sx + 12, -86], C.a);
  for (const [c, pts] of spec.parts) P(pts, C[c] || c);
  if (!CAR_SIL) {
    if (spec.helmet) { const [hx, hy] = spec.helmet; ngon(hx, hy, 9, 8, 0, '#ffffff'); poly([hx, hy - 3, hx + 9, hy - 3, hx + 9, hy + 3, hx, hy + 3], '#3a2a22'); }
    if (spec.robot) { poly([4, -62, 4, -80, 22, -80, 22, -62], '#c9d1db'); ngon(9, -71, 2.6, 6, 0, '#27e0ff'); ngon(17, -71, 2.6, 6, 0, '#27e0ff'); }
    if (spec.decal) { const [dx, dy, txt] = spec.decal; ngon(dx, dy, 11, 10, 0, '#ffffff'); label(txt, dx, dy + 1, 15, '#3a2a22', '#ffffff'); }
    if (spec.robot) ngon(-16, -36, 7, 4, 0.78, spec.accent);
    if (spec.pup) { // a puppy riding in the pickup bed
      const [px, py] = spec.pup;
      ngon(px, py, 11, 7, 0, '#c68642'); poly([px - 11, py - 4, px - 6, py - 14, px - 3, py - 6], '#8a5a2b');
      poly([px + 3, py - 6, px + 6, py - 14, px + 11, py - 4], '#8a5a2b');
      ngon(px + 5, py - 1, 1.8, 5, 0, '#3a2a22'); ngon(px - 3, py - 1, 1.8, 5, 0, '#3a2a22'); ngon(px + 10, py + 3, 2.6, 5, 0, '#3a2a22');
    }
  }
  const dark = CAR_SIL || C.d;
  for (const [wx, r] of spec.wheels) if (r < 30) ngon(wx, -r, r + 4, 10, 0, dark);
  spec.wheels.forEach(([wx, r], i) => drawWheel(wx, -r, r, o.wheel || 0, o.flat && i === 0, spec.knobby, spec.hub));
  if (spec.robot && !CAR_SIL) {
    const bob = Math.sin((o.t || 0) * 8) * 3;
    ctx.strokeStyle = '#3a2a22'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-2, -93); ctx.lineTo(2 + bob, -114); ctx.stroke();
    ngon(2 + bob, -117, 6, 6, 0, '#ff5a4f');
  }
  CAR_SIL = CAR_TINT = null;
  ctx.restore();
}

function renderCarThumb(canvas, spec, locked) {
  withCtx(canvas, (w, h) => {
    const k = Math.min(w / 210, h / 160);
    drawCar(spec, w / 2 + 4 * k, h * 0.9, { scale: k, sil: locked ? '#5b4a40' : null });
  });
}
