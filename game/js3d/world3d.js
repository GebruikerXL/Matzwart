// Bouwt van een 2D-kaart (MAPS) een ruime blokkenwereld in Three.js.
// Buiten is 1 tegel 2 bij 2 meter, binnen 1,4 meter (S); hoogtes zijn gewoon meters. x = kolom, z = rij.
const W3 = {
  texCache: new Map(),
  tex(canvas, repeat) {
    if (!repeat && this.texCache.has(canvas)) return this.texCache.get(canvas);
    const t = new THREE.CanvasTexture(canvas);
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
    else this.texCache.set(canvas, t);
    return t;
  },
  mat(canvas, extra) { return new THREE.MeshLambertMaterial({ map: this.tex(canvas), ...(extra || {}) }); },
};
const mapScale = (m) => (!m.inside ? 2 : m.id === 'dwerg' ? 1 : m.palace ? 1.6 : 1.4);
const CEIL_H = { dwerg: 1.8, paleis: 6.5, kerk_binnen: 5.5, centrumkerk_binnen: 5, molen_binnen: 4 };
const ceilH = (m) => CEIL_H[m.id] || 3.2;
// blokken die boven de grond uitsteken, en verhoogde grond (de wierde en de zeedijk)
const BLOCK_H = { counter: 1.05, hay: 1.0, schap: 2.0, kast: 2.0, hedge: 1.2 };
const GROUND_H = { wierde: 0.5, dijk: 0.9, beuk: 0.5 };
const groundH = (m, tx, ty) => GROUND_H[tileAt(m, tx, ty)] || 0;
// waar je op kunt springen: decor (bovenkant in meters), heggen en platte daken
const CLIMB_H = { kliko: 1.03, kratten: 1.8, kist: 2.6, steiger: 3.4, container: 1.34, hay: 0.9, biervat: 0.9, emmer: 0.35, doos: 0.5, sokkel: 0.25 };
const FLAT_H = 3.85;
const roofAt = (m, tx, ty) => m.buildings.find((b) => b.flat && tx >= b.x && tx < b.x + b.w && ty >= b.y && ty < b.y + b.h);

// ramen die 's avonds gloeien: dezelfde tekening, maar alleen het glas
const GLASS = new Set(['154,180,208', '94,127,166', '247,220,138']);
const glowCache = new Map();
function glowCanvas(cv) {
  if (glowCache.has(cv)) return glowCache.get(cv);
  const c = makeCanvas(cv.width, cv.height, (x) => {
    const src = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    const img = x.createImageData(cv.width, cv.height);
    for (let i = 0; i < src.length; i += 4) if (src[i + 3] > 0 && GLASS.has(`${src[i]},${src[i + 1]},${src[i + 2]}`)) { img.data[i] = 255; img.data[i + 1] = 200; img.data[i + 2] = 120; img.data[i + 3] = 255; }
    else img.data[i + 3] = 255;
    x.putImageData(img, 0, 0);
  });
  glowCache.set(cv, c);
  return c;
}
const GLOW_MATS = new Set();
function glowMat(cv, extra) {
  const m = new THREE.MeshLambertMaterial({ map: W3.tex(cv), emissive: new THREE.Color('#ffffff'), emissiveMap: W3.tex(glowCanvas(cv)), emissiveIntensity: 0, ...(extra || {}) });
  GLOW_MATS.add(m);
  return m;
}
const POOL_CANVAS = makeCanvas(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(255,220,150,.9)'); g.addColorStop(0.5, 'rgba(255,200,120,.35)'); g.addColorStop(1, 'rgba(255,190,110,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });
const GROUND_UNDER = { tree: 'grass', beuk: 'wierde', fence: 'grass', block: 'grass', hedge: 'grass', tall: 'grass', wall: 'floor', counter: 'floor', table: 'floor', chair: 'floor', hay: 'straw', schap: 'tegel', kast: 'floor', dark: null, water: null, deep: null, zee: null };

function makeCanvas(w, h, fn) { const [c, x] = mk(w, h); fn(x); return c; }
const SIDE_CANVAS = {
  grass: makeCanvas(16, 16, (x) => { px(x, 0, 0, 16, 16, '#7a5a34'); for (let i = 0; i < 10; i++) px(x, (i * 7) % 16, 5 + (i * 5) % 11, 2, 1, i % 2 ? '#6a4a2a' : '#8a6a44'); px(x, 0, 0, 16, 4, '#5f9e3c'); for (let i = 0; i < 16; i += 2) px(x, i, 4, 1, 1 + (i % 3), '#5f9e3c'); }),
};
SIDE_CANVAS.wierde = SIDE_CANVAS.dijk = SIDE_CANVAS.grass;
const TALL_CANVAS = makeCanvas(16, 16, (x) => { for (let i = 0; i < 7; i++) { const bx = 1 + i * 2, by = 3 + ((i * 5) % 6); px(x, bx, by, 1, 16 - by, i % 2 ? '#3b7024' : '#4f8a31'); px(x, bx, by, 1, 1, '#9fd06a'); } });
const LEAF_CANVAS = makeCanvas(16, 16, (x) => { px(x, 0, 0, 16, 16, '#2f6a2a'); for (let i = 0; i < 26; i++) px(x, (i * 7) % 16, (i * 11) % 16, 2, 2, i % 3 ? '#3f8a36' : '#24521f'); });
const BEECH_CANVAS = makeCanvas(16, 16, (x) => { px(x, 0, 0, 16, 16, '#3a6a24'); for (let i = 0; i < 26; i++) px(x, (i * 5) % 16, (i * 9) % 16, 2, 2, i % 3 ? '#5a8a34' : '#2a5a1c'); });
const BARK_CANVAS = makeCanvas(16, 16, (x) => { px(x, 0, 0, 16, 16, '#5b3a1e'); for (let i = 0; i < 6; i++) px(x, i * 3, 0, 1, 16, '#4a2e16'); });
const PUFF_CANVAS = makeCanvas(32, 32, (x) => { const g = x.createRadialGradient(16, 16, 2, 16, 16, 15); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); });

function brickCanvas(col) {
  return makeCanvas(16, 16, (x) => {
    px(x, 0, 0, 16, 16, col);
    for (let r = 0; r < 5; r++) { px(x, 0, r * 3 + 2, 16, 1, shade(col, -28)); for (let c = 0; c < 3; c++) px(x, c * 6 + (r % 2 ? 3 : 0), r * 3, 1, 2, shade(col, -20)); }
  });
}
function solidCanvas(col) { return makeCanvas(4, 4, (x) => px(x, 0, 0, 4, 4, col)); }

// een prisma (zadeldak) met de nok langs x, of langs z
function roofGeometry(w, d, h, alongZ) {
  const s = new THREE.Shape();
  const span = alongZ ? w : d;
  s.moveTo(-span / 2, 0); s.lineTo(span / 2, 0); s.lineTo(0, h); s.lineTo(-span / 2, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: alongZ ? d : w, bevelEnabled: false });
  if (alongZ) g.translate(0, 0, -d / 2);
  else { g.translate(0, 0, -w / 2); g.rotateY(Math.PI / 2); }
  return g;
}

function buildingMesh(b, S, anim) {
  const g = new THREE.Group();
  const W = b.w * S, D = b.h * S;
  const cx = b.x * S + W / 2, cz = b.y * S + D / 2, front = b.y * S + D;
  const canvas = renderBuilding(b);
  const brick = W3.mat(brickCanvas(b.wall || '#a24b34'));
  const roofMat = new THREE.MeshLambertMaterial({ color: b.roof || '#2f3340' });
  const kind = b.kind || 'normaal';
  const facePlane = (cv, w, h, y) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glowMat(cv, { transparent: true, alphaTest: 0.5 }));
    m.position.set(cx, y, front + 0.02); g.add(m); return m;
  };
  const door = (x, z) => { g.add(box(1.1, 2.2, 0.1, cmat('#5a3720'), x, 1.1, z)); g.add(box(0.08, 0.08, 0.06, cmat('#f2c22e'), x + 0.38, 1.1, z + 0.07)); };
  if (kind === 'aframe') {
    const H = 7.5;
    const body = new THREE.Mesh(roofGeometry(W, D - 0.1, H, true), roofMat); body.position.set(cx, 0, cz); g.add(body);
    facePlane(canvas, W, H, H / 2);
  } else if (kind === 'tiny') {
    // het dwerghuisje blijft echt piepklein, midden op zijn plek
    const hx = cx, hz = front - 1.0;
    g.add(box(1.6, 1.2, 1.6, W3.mat(solidCanvas('#f4f1ea')), hx, 0.6, hz));
    const r = new THREE.Mesh(roofGeometry(1.9, 1.8, 0.8, false), new THREE.MeshLambertMaterial({ color: '#c23b2e' })); r.position.set(hx, 1.2, hz); g.add(r);
    g.add(box(0.2, 0.6, 0.2, cmat('#7a2e22'), hx + 0.5, 1.7, hz - 0.2));
    g.add(box(0.4, 0.8, 0.04, cmat('#2e7a3a'), hx - 0.35, 0.4, hz + 0.81));
    g.add(box(0.36, 0.3, 0.04, cmat('#9ab4d0'), hx + 0.35, 0.75, hz + 0.81));
  } else if (kind === 'shop' || kind === 'casino') {
    const H = 4.4;
    g.add(box(W, H, D, new THREE.MeshLambertMaterial({ color: kind === 'casino' ? '#3a1f4a' : '#e8e6e0' }), cx, H / 2, cz));
    g.add(box(W + 0.3, 0.3, D + 0.3, cmat('#5a5e68'), cx, H + 0.15, cz));
    facePlane(canvas, W, H, H / 2);
  } else if (b.flat) {
    // plat dak (het dorpshuis): daar kun je op staan
    const H = FLAT_H - 0.05;
    const roofH = Math.floor(canvas.height * 0.45);
    const crop = Math.max(0, roofH - 12);
    const facade = makeCanvas(canvas.width, canvas.height - crop, (x) => x.drawImage(canvas, 0, -crop));
    const top = W3.mat(makeCanvas(16, 16, (x) => { px(x, 0, 0, 16, 16, '#4a4a50'); for (let i = 0; i < 20; i++) px(x, (i * 7) % 16, (i * 5) % 16, 1, 1, i % 2 ? '#5a5a62' : '#3a3a40'); }));
    g.add(box(W, H, D, [brick, brick, top, roofMat, glowMat(facade), brick], cx, H / 2, cz));
    for (const [w, d, x, z] of [[W, 0.25, cx, b.y * S + 0.12], [W, 0.25, cx, front - 0.12], [0.25, D, b.x * S + 0.12, cz], [0.25, D, b.x * S + W - 0.12, cz]]) g.add(box(w, 0.35, d, cmat('#d8d4c8'), x, H + 0.17, z));
    g.add(box(1.2, 0.8, 1.2, cmat('#9aa0aa'), cx + W * 0.25, H + 0.4, cz - D * 0.2));
  } else if (kind === 'molen') {
    // molen Adam: bakstenen onderbouw, stelling, achtkantige romp, kap en draaiende wieken
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.8, 4.5, 8), brick); base.position.set(cx, 2.25, cz); g.add(base);
    g.add(box(9.5, 0.25, 9.5, cmat('#6e4a2c'), cx, 4.6, cz));
    M3.cyl(g, 1.9, 3.1, 10, '#34342e', cx, 9.7, cz, 8);
    const cap = M3.cyl(g, 2.1, 2.1, 1.8, '#26261f', cx, 15.6, cz, 8); cap.scale.z = 1.3;
    const sails = new THREE.Group(); sails.position.set(cx, 15.3, cz + 2.9);
    const sail = new THREE.MeshLambertMaterial({ color: '#e8e0d0', transparent: true, opacity: 0.9, side: THREE.DoubleSide });
    for (let i = 0; i < 4; i++) {
      const arm = new THREE.Group(); arm.rotation.z = i * Math.PI / 2;
      arm.add(box(0.28, 11, 0.28, cmat('#5a3a20'), 0, 5.5, 0));
      arm.add(box(1.7, 8.5, 0.05, sail, 1.0, 6.2, 0));
      sails.add(arm);
    }
    g.add(box(0.5, 0.5, 1.4, cmat('#5a3a20'), cx, 15.3, cz + 2.2));
    g.add(sails);
    anim.push((t) => { sails.rotation.z = -t * 0.7; });
    door(cx, cz + 3.5);
    g.add(box(2.4, 0.6, 0.06, M3.text(b.label || 'ADAM', 2.4, 0.6, '#1b1420', '#f2c22e'), cx, 3.0, cz + 3.6));
  } else {
    const church = kind === 'church', oldambt = kind === 'oldambt';
    const H = church ? 6.5 : oldambt ? 3.2 : 3.8;
    const roofH = Math.floor(canvas.height * (church ? 0.55 : 0.45));
    const crop = Math.max(0, roofH - 12);
    const facade = makeCanvas(canvas.width, canvas.height - crop, (x) => x.drawImage(canvas, 0, -crop));
    g.add(box(W, H, D, [brick, brick, roofMat, roofMat, glowMat(facade), brick], cx, H / 2, cz));
    if (oldambt) {
      // Oldambtster boerderij: klein voorhuis, daarachter een enorme schuur onder één groot dak
      const roof = new THREE.Mesh(roofGeometry(W + 0.8, D + 0.8, 8, false), roofMat); roof.position.set(cx, H, cz); g.add(roof);
      g.add(box(W + 0.82, 0.3, D + 0.82, cmat('#f4f1ea'), cx, H, cz));
      g.add(box(0.1, 3.0, 3.2, cmat('#4a6a3a'), b.x * S + W + 0.06, 1.5, cz - 1.5));
      g.add(box(0.1, 3.0, 0.15, cmat('#f4f1ea'), b.x * S + W + 0.08, 1.5, cz - 1.5));
    } else {
      const roof = new THREE.Mesh(roofGeometry(W + 0.5, D + 0.5, church ? 4.5 : Math.min(4, D * 0.45), false), roofMat); roof.position.set(cx, H, cz); g.add(roof);
    }
    if (church) {
      // de Laurentiuskerk: zadeldaktoren aan de voorkant
      g.add(box(3, 15, 3, brick, cx, 7.5, front - 1.6));
      const spire = new THREE.Mesh(roofGeometry(3.3, 3.3, 3.5, true), roofMat); spire.position.set(cx, 15, front - 1.6); g.add(spire);
      g.add(box(1.5, 1.5, 0.05, W3.mat(makeCanvas(16, 16, (x) => { px(x, 0, 0, 16, 16, '#f4f1ea'); px(x, 0, 0, 16, 1, '#1b1420'); px(x, 7, 3, 2, 6, '#111'); px(x, 7, 7, 5, 2, '#111'); })), cx, 11.5, front - 0.08));
      for (const s of [-1, 1]) g.add(box(0.08, 2.2, 0.9, cmat('#9ab4d0'), cx + s * (W / 2 + 0.01), 3.2, cz - 1));
    }
    if (b.chimney) g.add(box(0.7, 2.2, 0.7, brick, b.x * S + W - 1.5, H + 1.6, cz));
  }
  return g;
}

// ---------- binnenruimtes: behang, plafond, deur ----------
const WALLPAPER = { cafe: ['#d8c7a0', '#6e4a2c'], eka: ['#eceae4', '#9aa0aa'], casino: ['#4a1f5a', '#2a0f30'], kringloop: ['#a8b88a', '#5a4a2a'], schuur: ['#8a6a44', '#5a3a20'], dorpshuis: ['#c8d0d8', '#6a5a4a'], dwerg: ['#f0b0c8', '#a85a7a'],
  paleis: ['#f4ead0', '#c8a030'], kerk_binnen: ['#e8e4dc', '#8a8a90'], centrumkerk_binnen: ['#e8e4dc', '#8a8a90'], huis_henk: ['#b8c890', '#5a4a2a'], huis_bakker: ['#f0d0d8', '#8a5a6a'], huis_boer: ['#e8dcc0', '#5a3a20'],
  snackbar_binnen: ['#f4e0b0', '#c23b2e'], muzee_binnen: ['#2a4a6a', '#1b2a3a'], molen_binnen: ['#8a6a44', '#5a3a20'], school_binnen: ['#e8e0c8', '#6a8a5a'], kantine_binnen: ['#e8e6e0', '#2a4a9a'],
  aframe_0: ['#e0d8c8', '#6e4a2c'], aframe_1: ['#3a3a44', '#1b1b20'], aframe_3: ['#e8d8b8', '#7a5a34'] };
function wallCanvas(m) {
  const [paper, wood] = WALLPAPER[m.id] || ['#d8c7a0', '#6e4a2c'];
  return makeCanvas(16, 48, (x) => {
    px(x, 0, 0, 16, 48, paper);
    for (let i = 0; i < 4; i++) px(x, i * 4 + 1, 0, 1, 36, shade(paper, -14));
    if (m.id === 'schuur' || m.id === 'molen_binnen') for (let i = 0; i < 12; i++) px(x, 0, i * 4 + 3, 16, 1, shade(paper, -25));
    px(x, 0, 36, 16, 12, wood); px(x, 0, 36, 16, 1, shade(wood, 25)); px(x, 0, 47, 16, 1, shade(wood, -25));
  });
}
function ceilingCanvas(m) {
  const wood = ['schuur', 'dwerg', 'molen_binnen', 'huis_boer'].includes(m.id);
  return makeCanvas(16, 16, (x) => {
    px(x, 0, 0, 16, 16, m.palace ? '#f4ead0' : wood ? '#7a5a34' : '#ece6d8');
    if (wood) for (let i = 0; i < 4; i++) px(x, 0, i * 4 + 3, 16, 1, '#5a3a20');
    else if (m.palace) { px(x, 0, 0, 16, 1, '#c8a030'); px(x, 0, 0, 1, 16, '#c8a030'); px(x, 7, 7, 2, 2, '#e0b030'); }
    else { px(x, 0, 0, 16, 2, '#8a6a44'); px(x, 0, 2, 16, 1, '#6e4a2c'); }
  });
}
// RuneScape-achtige schermpjes voor Daniël, elk met iets anders
function drawScreen(x, i, t) {
  const sk = ['wc', 'fish', 'fight', 'bank'][i % 4];
  px(x, 0, 0, 64, 40, '#3a6a2a');
  for (let k = 0; k < 12; k++) px(x, (k * 23 + i * 7) % 64, (k * 13 + i * 3) % 30, 3, 2, '#4a7a34');
  px(x, 0, 30, 64, 10, '#5a4a3a'); px(x, 0, 30, 64, 1, '#7a6a5a');
  for (let k = 0; k < 6; k++) px(x, 2 + k * 10, 32, 8, 6, '#3a2e24');
  const bob = Math.floor(t * 4 + i) % 2;
  if (sk === 'wc') { px(x, 38, 6, 4, 18, '#5b3a1e'); px(x, 30, 2, 20, 10, '#2e6a24'); px(x, 26, 14, 4, 9, '#c8a030'); px(x, 30, 15 + bob * 2, 6, 2, '#a0a0a8'); }
  if (sk === 'fish') { px(x, 30, 8, 34, 14, '#3a6ab0'); px(x, 24, 14, 4, 9, '#c8a030'); px(x, 28, 13, 8, 1, '#ddd'); px(x, 42 + bob * 2, 15, 3, 2, '#f4f1ea'); }
  if (sk === 'fight') { px(x, 18, 14, 4, 9, '#c8a030'); px(x, 36, 12, 6, 11, '#8a2a2a'); px(x, 22 + bob * 4, 16, 6, 2, '#d8d8e0'); px(x, 34, 6, 10, 2, '#e8433a'); px(x, 34, 6, 3 + ((t * 2 + i) % 7), 2, '#7ad46a'); if (bob) px(x, 38, 8, 5, 4, '#e8433a'); }
  if (sk === 'bank') { px(x, 16, 4, 34, 24, '#5a3a20'); for (let k = 0; k < 15; k++) px(x, 18 + (k % 5) * 6, 6 + Math.floor(k / 5) * 7, 4, 5, ['#e0b030', '#c0c0c8', '#3a8a3a'][(k + i) % 3]); }
  // XP-druppels die omhoog zweven
  const y = 26 - ((t * 20 + i * 9) % 24);
  px(x, 4, y, 14, 6, '#1b1420'); px(x, 5, y + 1, 4, 4, '#f2c22e'); px(x, 10, y + 2, 7, 2, '#f4f1ea');
  px(x, 52, 2, 10, 10, '#1b1420'); px(x, 53, 3, 8, 8, '#5a7a4a'); px(x, 56, 6, 2, 2, '#f4f1ea');
}
function interiorExtras(m, root, S, anim) {
  const H = ceilH(m), W = m.w * S, D = m.h * S;
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshLambertMaterial({ map: W3.tex(ceilingCanvas(m), [m.w, m.h]) }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(W / 2, H, D / 2); root.add(ceil);
  // deur naar buiten in de onderste muur
  for (const d of m.doors) {
    const dh = Math.min(2.2, H - 0.05), cx = (d.x + 0.5) * S, fz = (d.y + 1) * S;
    root.add(box(Math.min(1.1, S * 0.8), dh, 0.1, cmat('#6e4a2c'), cx, dh / 2, fz - 0.05));
    root.add(box(0.08, 0.08, 0.06, cmat('#f2c22e'), cx + 0.38, dh * 0.5, fz - 0.12));
    root.add(box(0.7, 0.35, 0.06, cmat('#9ab4d0'), cx, dh * 0.8, fz - 0.11));
    if (H - dh > 0.05) root.add(box(S, H - dh, S, W3.mat(wallCanvas(m)), cx, dh + (H - dh) / 2, (d.y + 0.5) * S));
  }
  // lampen aan het plafond
  const lamps = m.palace ? [] : m.w * m.h > 90 ? [[W * 0.3, D * 0.55], [W * 0.7, D * 0.55]] : [[W / 2, D / 2]];
  for (const [x, z] of lamps) {
    root.add(box(0.6, 0.08, 0.6, new THREE.MeshBasicMaterial({ color: '#fff2c8' }), x, H - 0.05, z));
    const l = new THREE.PointLight(0xffd8a0, 0.9, 18, 1.4); l.position.set(x, H - 0.4, z); root.add(l);
  }
  if (m.palace) {
    // kroonluchters, gouden lijsten en achterin de muur met zestien monitoren
    for (const [tx, tz] of [[11, 7], [11, 13], [11, 19], [4, 8], [18, 8], [4, 18], [18, 18]]) {
      const ch = new THREE.Group();
      ch.add(box(0.06, 1.2, 0.06, cmat('#c8a030'), 0, 0.6, 0));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.06, 6, 20), cmat('#e0b030')); ring.rotation.x = Math.PI / 2; ch.add(ring);
      const flame = new THREE.MeshBasicMaterial({ color: '#fff6d0' });
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ch.add(box(0.1, 0.2, 0.1, flame, Math.cos(a) * 0.8, 0.12, Math.sin(a) * 0.8)); }
      ch.position.set(tx * S, H - 1.3, tz * S); root.add(ch);
      const l = new THREE.PointLight(0xfff0c8, 0.6, 20, 1.5); l.position.set(tx * S, H - 1.5, tz * S); root.add(l);
    }
    for (const z of [2 * S + 0.02]) root.add(box(W - 2 * S, 0.25, 0.06, cmat('#e0b030'), W / 2, H - 0.4, z));
    const cx0 = 11 * S, wallZ = 2 * S + 0.06;
    root.add(box(4.6, 3.0, 0.1, cmat('#1b1420'), cx0, 2.6, wallZ));
    const screens = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const cv = makeCanvas(64, 40, (x) => drawScreen(x, r * 4 + c, 0));
      const tex = new THREE.CanvasTexture(cv); tex.magFilter = THREE.NearestFilter;
      const sm = new THREE.Mesh(new THREE.PlaneGeometry(1.04, 0.66), new THREE.MeshBasicMaterial({ map: tex }));
      sm.position.set(cx0 - 1.65 + c * 1.1, 3.65 - r * 0.7, wallZ + 0.07);
      root.add(sm); screens.push({ cv, tex, i: r * 4 + c });
    }
    let last = -1;
    anim.push((t) => { if (t - last < 0.25) return; last = t; for (const s of screens) { drawScreen(s.cv.getContext('2d'), s.i, t); s.tex.needsUpdate = true; } });
    const glow = new THREE.PointLight(0x7ad4ff, 0.9, 10, 1.6); glow.position.set(cx0, 2.6, wallZ + 1.6); root.add(glow);
  }
}

// ---------- de hele kaart ----------
function buildWorld(m) {
  const S = mapScale(m);
  const root = new THREE.Group();
  const anim = [];
  root.userData = { S, anim, props: [], smoke: [], lamps: [] };
  GLOW_MATS.clear();
  const groups = new Map(); // key -> [[x,y]]
  const add = (key, x, y) => { if (!groups.has(key)) groups.set(key, []); groups.get(key).push([x, y]); };
  const extras = { tree: [], beuk: [], tall: [], fence: [], water: [], zee: [], table: [], chair: [] };
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    let t = m.tiles[y][x];
    if (t === 'mat_out') t = m.inside ? 'mat' : 'path';
    if (t === 'zee') { extras.zee.push([x, y]); continue; }
    if (t === 'water' || t === 'deep') { extras.water.push([x, y]); continue; }
    if (t === 'bridge' || t === 'steiger') { extras.water.push([x, y]); add('plank:' + t, x, y); continue; }
    if (extras[t]) extras[t].push([x, y]);
    const under = t in GROUND_UNDER ? GROUND_UNDER[t] : t;
    if (under) add('ground:' + under + ':' + ((x * 31 + y * 17) % 4), x, y);
    if (BLOCK_H[t] || t === 'dark' || (m.inside && t === 'wall')) add('block:' + t, x, y);
  }
  const dummy = new THREE.Object3D();
  const inst = (geo, mat, list, place) => {
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach(([x, y], i) => { dummy.position.set(0, 0, 0); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1); place(dummy, x, y); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); });
    root.add(im);
    return im;
  };
  const c = (v) => (v + 0.5) * S;
  for (const [key, list] of groups) {
    const [kind, t, v] = key.split(':');
    if (kind === 'ground') {
      const top = W3.mat(getTile(t, +v, (+v * 3) % 4));
      const side = SIDE_CANVAS[t] ? W3.mat(SIDE_CANVAS[t]) : top;
      const h = GROUND_H[t] || 0;
      inst(new THREE.BoxGeometry(S, 1 + h, S), [side, side, top, side, side, side], list, (d, x, y) => d.position.set(c(x), (h - 1) / 2, c(y)));
    } else if (kind === 'block') {
      const wallLike = m.inside && (t === 'wall' || t === 'dark');
      const h = wallLike ? ceilH(m) : t === 'dark' ? 4 : BLOCK_H[t];
      const mat = wallLike ? W3.mat(wallCanvas(m)) : t === 'dark' ? new THREE.MeshBasicMaterial({ color: '#0d0b12' }) : W3.mat(getTile(t, 0, 0));
      inst(new THREE.BoxGeometry(S, h, S), mat, list, (d, x, y) => d.position.set(c(x), h / 2, c(y)));
    } else if (kind === 'plank') {
      inst(new THREE.BoxGeometry(S, 0.2, S), W3.mat(getTile('plank', 0, 0)), list, (d, x, y) => d.position.set(c(x), -0.1, c(y)));
    }
  }
  const wet = extras.water.concat(extras.zee);
  if (wet.length) {
    if (extras.water.length) inst(new THREE.BoxGeometry(S, 0.8, S), new THREE.MeshLambertMaterial({ color: '#3a6fb0', transparent: true, opacity: 0.85 }), extras.water, (d, x, y) => d.position.set(c(x), -0.65, c(y)));
    if (extras.zee.length) {
      // de Eems: grijsgroen wad-water met een beetje deining
      const zee = inst(new THREE.BoxGeometry(S, 0.8, S), new THREE.MeshLambertMaterial({ color: '#4a6a7a', transparent: true, opacity: 0.9 }), extras.zee, (d, x, y) => d.position.set(c(x), -0.7, c(y)));
      anim.push((t) => { zee.position.y = Math.sin(t * 0.7) * 0.08; });
      // achter de kaart loopt de Eems door tot aan de horizon
      if (extras.zee.some(([, y]) => y === 0)) {
        const sea = new THREE.Mesh(new THREE.PlaneGeometry(900, 450), new THREE.MeshLambertMaterial({ color: '#4a6a7a' }));
        sea.rotation.x = -Math.PI / 2; sea.position.set(m.w * S / 2, -0.32, -225); root.add(sea);
      }
    }
    inst(new THREE.BoxGeometry(S, 0.5, S), new THREE.MeshLambertMaterial({ color: '#4a3a2a' }), wet, (d, x, y) => d.position.set(c(x), -1.3, c(y)));
  }
  if (extras.tree.length) {
    inst(new THREE.BoxGeometry(0.45, 3, 0.45), W3.mat(BARK_CANVAS), extras.tree, (d, x, y) => d.position.set(c(x), 1.5, c(y)));
    inst(new THREE.BoxGeometry(2.6, 2.2, 2.6), W3.mat(LEAF_CANVAS), extras.tree, (d, x, y) => { d.position.set(c(x), 3.9 + ((x * 7 + y) % 3) * 0.25, c(y)); d.rotation.y = ((x + y) % 4) * 0.2; });
  }
  if (extras.beuk.length) {
    // de hoge beuken rond de kerk op de wierde
    inst(new THREE.BoxGeometry(0.7, 7, 0.7), W3.mat(BARK_CANVAS), extras.beuk, (d, x, y) => d.position.set(c(x), 0.5 + 3.5, c(y)));
    inst(new THREE.BoxGeometry(4.4, 3.4, 4.4), W3.mat(BEECH_CANVAS), extras.beuk, (d, x, y) => { d.position.set(c(x), 7.8, c(y)); d.rotation.y = ((x + y) % 3) * 0.3; });
    inst(new THREE.BoxGeometry(3, 2.2, 3), W3.mat(BEECH_CANVAS), extras.beuk, (d, x, y) => { d.position.set(c(x), 10.2, c(y)); d.rotation.y = 0.4; });
  }
  if (extras.tall.length) {
    const tm = new THREE.MeshLambertMaterial({ map: W3.tex(TALL_CANVAS), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
    const pg = new THREE.PlaneGeometry(S * 0.7, 1.0);
    for (const [ox, oz] of [[-0.22, -0.22], [0.22, 0.22]]) for (const r of [Math.PI / 4, -Math.PI / 4]) inst(pg, tm, extras.tall, (d, x, y) => { d.position.set(c(x) + ox * S, 0.5, c(y) + oz * S); d.rotation.y = r; });
  }
  if (extras.fence.length) {
    const fm = cmat('#f4efe0');
    for (const yy of [0.45, 0.8]) inst(new THREE.BoxGeometry(S, 0.12, 0.1), fm, extras.fence, (d, x, y) => d.position.set(c(x), yy, c(y)));
    inst(new THREE.BoxGeometry(0.14, 1.0, 0.14), fm, extras.fence, (d, x, y) => d.position.set(x * S + 0.2, 0.5, c(y)));
  }
  if (extras.table.length) {
    inst(new THREE.BoxGeometry(1.0, 0.08, 1.0), cmat('#8c5a32'), extras.table, (d, x, y) => d.position.set(c(x), 0.76, c(y)));
    inst(new THREE.BoxGeometry(0.12, 0.76, 0.12), cmat('#4a2c18'), extras.table, (d, x, y) => d.position.set(c(x), 0.38, c(y)));
  }
  if (extras.chair.length) {
    inst(new THREE.BoxGeometry(0.5, 0.06, 0.5), cmat('#7a4c2a'), extras.chair, (d, x, y) => d.position.set(c(x), 0.46, c(y)));
    inst(new THREE.BoxGeometry(0.5, 0.5, 0.06), cmat('#6a3c1a'), extras.chair, (d, x, y) => d.position.set(c(x), 0.74, c(y) - 0.22));
    inst(new THREE.BoxGeometry(0.4, 0.43, 0.4), cmat('#5a3c1a'), extras.chair, (d, x, y) => d.position.set(c(x), 0.22, c(y)));
  }
  for (const b of m.buildings) root.add(buildingMesh(b, S, anim));
  if (m.inside) interiorExtras(m, root, S, anim);
  // decor: echte 3D-modellen; platte dingen (posters, klokken) tegen de muur
  for (const p of m.props) {
    const t = tileAt(m, p.x, p.y);
    let obj;
    if (t === 'wall' || WALL_PROPS.has(p.name)) {
      if (p.name === 'monitors' && m.palace) { obj = new THREE.Group(); obj.position.set(c(p.x), 0, c(p.y)); }
      else {
        const sz = Math.min(1.2, S * 0.7);
        obj = new THREE.Mesh(new THREE.PlaneGeometry(p.name === 'schoolbord' ? S : sz, sz), new THREE.MeshLambertMaterial({ map: W3.tex(getProp(p.name)), transparent: true, alphaTest: 0.5 }));
        obj.position.set(c(p.x), Math.min(1.8, ceilH(m) - 0.6), (p.y + 1) * S + 0.03);
      }
    } else {
      const base = roofAt(m, p.x, p.y) ? FLAT_H : groundH(m, p.x, p.y);
      obj = propModel(p);
      if (obj && p.name === 'lamp' && !m.inside) {
        // 's avonds: gloed om de lamp en een lichtkring op de straat
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: W3.tex(PUFF_CANVAS), color: 0xffd890, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
        halo.scale.set(2.4, 2.4, 1); halo.position.y = 3.1; obj.add(halo);
        const pool = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: W3.tex(POOL_CANVAS), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
        pool.rotation.x = -Math.PI / 2; pool.position.y = 0.03; obj.add(pool);
        root.userData.lamps.push({ pos: new THREE.Vector3(c(p.x), base + 3.0, c(p.y)), halo, pool });
      }
      if (obj) {
        obj.position.set(c(p.x), base, c(p.y));
        if (p.name === 'bank' && !(TILE_DEF[tileAt(m, p.x, p.y + 1)] || {}).walk) obj.rotation.y = Math.PI;
        if (p.name === 'goal') obj.rotation.y = p.x < m.w / 2 ? Math.PI : 0;
        if (p.name === 'gamestoel') obj.rotation.y = Math.PI;
        if (p.name === 'kraan') obj.rotation.y = Math.PI / 2;
        if (p.name === 'bmwL' || p.name === 'autoL') { obj.rotation.y = Math.PI / 2; obj.position.x = (p.x + 1) * S + 0.9; }
        const u = obj.userData;
        if (u.bob) { const o = obj, ph = p.x + p.y; anim.push((tt) => { o.position.y = Math.sin(tt * 0.8 + ph) * 0.12 - 0.3; o.rotation.z = Math.sin(tt * 0.6 + ph) * 0.02; }); }
        if (u.spin) { const s = u.spin; anim.push((tt) => { s.rotation.y = tt * 1.5; }); }
        if (u.smoke) root.userData.smoke.push(new THREE.Vector3(c(p.x), u.smoke, c(p.y)));
      } else {
        obj = new THREE.Sprite(new THREE.SpriteMaterial({ map: W3.tex(getProp(p.name)), alphaTest: 0.5 }));
        const onTop = t === 'counter' ? 1.05 : t === 'table' ? 0.8 : 0;
        obj.scale.set(1.2, 1.2, 1); obj.position.set(c(p.x), base + onTop + 0.6, c(p.y));
      }
    }
    obj.userData.prop = p;
    obj.userData.baseY = obj.position.y;
    root.add(obj); root.userData.props.push(obj);
  }
  return root;
}
