// Blokpoppetjes in Minecraft-stijl, opgebouwd uit dezelfde look-objecten als de 2D-sprites.
function faceCanvas(L) {
  return makeCanvas(8, 8, (x) => {
    const ex = L.extra || [];
    px(x, 0, 0, 8, 8, L.skin);
    const H = L.hair;
    if (L.style !== 'bald') px(x, 0, 0, 8, 1, H);
    px(x, 2, 3, 1, 1, '#1b1420'); px(x, 5, 3, 1, 1, '#1b1420');
    px(x, 3, 6, 2, 1, shade(L.skin, -40));
    if (ex.includes('glasses')) { px(x, 1, 3, 2, 1, '#2a2a3a'); px(x, 4, 3, 2, 1, '#2a2a3a'); px(x, 3, 3, 1, 1, '#2a2a3a'); }
    if (ex.includes('beard')) px(x, 1, 5, 6, 3, H);
    if (ex.includes('mustache')) px(x, 2, 5, 4, 1, H);
    if (ex.includes('blush')) { px(x, 1, 4, 1, 1, '#e88'); px(x, 6, 4, 1, 1, '#e88'); }
    if (ex.includes('freckles')) { px(x, 1, 4, 1, 1, shade(L.skin, -45)); px(x, 6, 4, 1, 1, shade(L.skin, -45)); px(x, 2, 5, 1, 1, shade(L.skin, -45)); }
    if (ex.includes('pimples')) [[1, 2], [6, 1], [1, 5], [6, 4], [4, 5]].forEach(([a, b]) => px(x, a, b, 1, 1, '#d8343a'));
    if (ex.includes('tired')) { px(x, 2, 4, 1, 1, '#a07090'); px(x, 5, 4, 1, 1, '#a07090'); }
  });
}
const _matCache = new Map();
function cmat(col) { if (!_matCache.has(col)) _matCache.set(col, new THREE.MeshLambertMaterial({ color: col })); return _matCache.get(col); }
function box(w, h, d, mat, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; }

// look -> THREE.Group, kijkt naar +z. Onderdelen in userData voor de loopanimatie.
function buildFigure(L) {
  const g = new THREE.Group();
  if (L.dog) return buildDog(L);
  const ex = L.extra || [];
  const shoes = 'shoes' in L ? (L.shoes || L.skin) : '#2a2020';
  // benen draaien vanuit de heup
  const legs = [-0.11, 0.11].map((x) => {
    const pivot = new THREE.Group(); pivot.position.set(x, 0.72, 0);
    pivot.add(box(0.2, 0.62, 0.22, cmat(L.pants), 0, -0.31, 0));
    if (L.cut === 'kort') pivot.add(box(0.205, 0.3, 0.225, cmat(L.skin), 0, -0.47, 0));
    pivot.add(box(0.21, 0.1, 0.26, cmat(shoes), 0, -0.67, 0.02));
    g.add(pivot); return pivot;
  });
  const bodyW = ex.includes('belly') ? 0.56 : 0.46, bodyD = ex.includes('belly') ? 0.36 : 0.26;
  g.add(box(bodyW, 0.6, bodyD, cmat(L.shirt), 0, 1.02, 0));
  if (ex.includes('apron')) g.add(box(0.36, 0.5, 0.02, cmat('#f1ece0'), 0, 0.98, bodyD / 2 + 0.01));
  if (ex.includes('overall')) g.add(box(0.34, 0.45, 0.02, cmat('#3d5fa0'), 0, 0.95, bodyD / 2 + 0.01));
  if (L.pat === 'tracksuit') { g.add(box(0.03, 0.6, bodyD + 0.01, cmat('#f4f1ea'), -bodyW / 2, 1.02, 0)); g.add(box(0.03, 0.6, bodyD + 0.01, cmat('#f4f1ea'), bodyW / 2, 1.02, 0)); }
  if (L.pat === 'logo' || L.pat === 'rendier') g.add(box(0.12, 0.12, 0.02, cmat(L.pat === 'logo' ? '#e0b030' : '#8a5a2a'), 0, 1.08, bodyD / 2 + 0.01));
  if (L.pat === 'jacket') g.add(box(0.12, 0.58, 0.02, cmat('#c8463a'), 0, 1.02, bodyD / 2 + 0.01));
  // armen draaien vanuit de schouder
  const arms = [-1, 1].map((s) => {
    const pivot = new THREE.Group(); pivot.position.set(s * (bodyW / 2 + 0.09), 1.3, 0);
    pivot.add(box(0.17, 0.46, 0.2, cmat(L.shirt), 0, -0.23, 0));
    pivot.add(box(0.17, 0.12, 0.2, cmat(L.skin), 0, -0.52, 0));
    g.add(pivot); return pivot;
  });
  // hoofd met gezicht op de voorkant
  const skin = cmat(L.skin);
  const faceMat = new THREE.MeshLambertMaterial({ map: W3.tex(faceCanvas(L)) });
  const head = box(0.42, 0.42, 0.42, [skin, skin, skin, skin, faceMat, skin], 0, 1.54, 0);
  g.add(head);
  const H = cmat(L.hair);
  const st = L.style || 'short';
  if (st !== 'bald') {
    g.add(box(0.46, 0.1, 0.46, H, 0, 1.78, 0));
    g.add(box(0.46, st === 'long' ? 0.6 : 0.36, 0.06, H, 0, st === 'long' ? 1.46 : 1.6, -0.21));
    if (st === 'curly') g.add(box(0.52, 0.14, 0.52, H, 0, 1.8, 0));
    if (st === 'messy') { g.add(box(0.1, 0.08, 0.1, H, 0.1, 1.86, 0.05)); g.add(box(0.08, 0.08, 0.08, H, -0.12, 1.86, -0.08)); }
    if (st === 'bun') g.add(box(0.16, 0.14, 0.16, H, 0, 1.88, -0.12));
    if (st === 'long') { g.add(box(0.06, 0.5, 0.42, H, -0.23, 1.5, 0)); g.add(box(0.06, 0.5, 0.42, H, 0.23, 1.5, 0)); }
  }
  const hat = L.hat || (st === 'cap' ? { t: 'pet', c: L.cap || '#c23b2e' } : null);
  if (hat) {
    const C = cmat(hat.c);
    if (hat.t === 'pet') { g.add(box(0.46, 0.14, 0.46, C, 0, 1.8, 0)); g.add(box(0.44, 0.04, 0.2, C, 0, 1.75, 0.3)); }
    else if (hat.t === 'muts' || hat.t === 'propeller') {
      g.add(box(0.47, 0.2, 0.47, C, 0, 1.82, 0));
      if (hat.t === 'muts') g.add(box(0.12, 0.1, 0.12, cmat('#f4f1ea'), 0, 1.97, 0));
      else { g.add(box(0.04, 0.12, 0.04, cmat('#888'), 0, 1.98, 0)); g.add(box(0.4, 0.02, 0.06, cmat('#f2c22e'), 0, 2.05, 0)); }
    } else if (hat.t === 'hoedje') { g.add(box(0.44, 0.16, 0.44, C, 0, 1.84, 0)); g.add(box(0.66, 0.04, 0.66, C, 0, 1.76, 0)); }
    else if (hat.t === 'kegel') { const k = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.6, 4), C); k.position.set(0, 2.05, 0); k.rotation.y = Math.PI / 4; g.add(k); g.add(box(0.5, 0.06, 0.5, cmat('#333'), 0, 1.77, 0)); }
  }
  // censuurbalk bij geen broek
  if (L.naked) {
    const w = [0, 0.1, 0.18, 0.28, 0.5][L.naked] || 0.18;
    g.add(box(w, 0.1, 0.03, cmat('#000000'), 0, 0.7, bodyD / 2 + 0.03));
  }
  if (ex.includes('vape')) arms[1].add(box(0.06, 0.16, 0.06, cmat('#5ad0f0'), 0, -0.62, 0.08));
  g.userData = { legs, arms, rightHand: arms[1] };
  if (L.small) g.scale.setScalar(0.62);
  return g;
}

function buildDog(L) {
  const g = new THREE.Group();
  const F = cmat(L.fur || '#d8b88a'), D = cmat(shade(L.fur || '#d8b88a', -30));
  g.add(box(0.36, 0.32, 0.7, F, 0, 0.45, 0));
  const head = box(0.32, 0.3, 0.3, F, 0, 0.66, 0.42); g.add(head);
  g.add(box(0.12, 0.08, 0.1, cmat('#3a2a2a'), 0, 0.62, 0.6));
  g.add(box(0.08, 0.16, 0.08, D, -0.17, 0.66, 0.4)); g.add(box(0.08, 0.16, 0.08, D, 0.17, 0.66, 0.4));
  g.add(box(0.04, 0.04, 0.02, cmat('#1b1420'), -0.08, 0.72, 0.58)); g.add(box(0.04, 0.04, 0.02, cmat('#1b1420'), 0.08, 0.72, 0.58));
  const tail = box(0.08, 0.08, 0.26, F, 0, 0.62, -0.42); tail.rotation.x = 0.6; g.add(tail);
  const legs = [[-0.12, 0.25], [0.12, 0.25], [-0.12, -0.25], [0.12, -0.25]].map(([x, z]) => {
    const p = new THREE.Group(); p.position.set(x, 0.3, z); p.add(box(0.1, 0.3, 0.1, D, 0, -0.15, 0)); g.add(p); return p;
  });
  g.userData = { legs, arms: [], tail };
  return g;
}

function animateFigure(g, t, moving) {
  const u = g.userData; if (!u) return;
  const a = moving ? Math.sin(t * 9) * 0.6 : 0;
  (u.legs || []).forEach((l, i) => { l.rotation.x = i % 2 ? -a : a; });
  (u.arms || []).forEach((l, i) => { l.rotation.x = i % 2 ? a * 0.8 : -a * 0.8; });
  if (u.tail) u.tail.rotation.y = Math.sin(t * 12) * 0.5;
}

// wapen in de rechterhand van een poppetje
function setHeld(g, id) {
  const u = g.userData; if (!u || !u.rightHand) return;
  if (u.heldId === id) return;
  if (u.held) { u.rightHand.remove(u.held); u.held = null; }
  u.heldId = id;
  if (!id) return;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshLambertMaterial({ map: W3.tex(heldIcon(id)), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }));
  m.position.set(0, -0.62, 0.22); m.rotation.y = Math.PI / 2;
  u.rightHand.add(m); u.held = m;
}

// naamkaartje boven het hoofd
function textSprite(text, col = '#f4f1ea') {
  const c = document.createElement('canvas');
  const x = c.getContext('2d');
  x.font = '16px Silkscreen, monospace';
  const w = Math.ceil(x.measureText(text).width) + 12;
  c.width = w; c.height = 22;
  x.font = '16px Silkscreen, monospace'; x.textBaseline = 'top';
  x.fillStyle = 'rgba(10,8,20,.75)'; x.fillRect(0, 0, w, 22);
  x.fillStyle = col; x.fillText(text, 6, 2);
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false }));
  s.scale.set(w / 70, 22 / 70, 1);
  s.renderOrder = 10;
  return s;
}

// naamkaartje met twee regels: naam, en daaronder level, class en geld
function textSprite2(top, bottom, col2) {
  const c = document.createElement('canvas'), x = c.getContext('2d');
  x.font = '16px Silkscreen, monospace'; const w1 = x.measureText(top).width;
  x.font = '13px Silkscreen, monospace'; const w2 = x.measureText(bottom).width;
  const w = Math.ceil(Math.max(w1, w2)) + 14;
  c.width = w; c.height = 40;
  x.fillStyle = 'rgba(10,8,20,.78)'; x.fillRect(0, 0, w, 40);
  x.textBaseline = 'top'; x.textAlign = 'center';
  x.font = '16px Silkscreen, monospace'; x.fillStyle = '#f4f1ea'; x.fillText(top, w / 2, 3);
  x.font = '13px Silkscreen, monospace'; x.fillStyle = col2 || '#ffd25a'; x.fillText(bottom, w / 2, 22);
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false }));
  s.scale.set(w / 70, 40 / 70, 1); s.renderOrder = 10;
  return s;
}

// dampwolk rond een vaper (k = hoe dik; in Delfzijl zijn ze veel dikker)
function vapeCloud(col, k = 1) {
  const g = new THREE.Group();
  const mat = new THREE.SpriteMaterial({ map: W3.tex(PUFF_CANVAS), color: col, transparent: true, depthWrite: false });
  const n = Math.round(9 * Math.max(1, k * 0.9));
  for (let i = 0; i < n; i++) { const s = new THREE.Sprite(mat.clone()); s.userData.seed = i / n; g.add(s); }
  g.userData.k = k;
  return g;
}
function animateCloud(g, t) {
  const k = g.userData.k || 1;
  for (const s of g.children) {
    const life = (t * 0.35 + s.userData.seed) % 1, a = s.userData.seed * Math.PI * 2 + t * 0.4;
    const r = (0.35 + life * 0.4) * k;
    s.position.set(Math.cos(a) * r, 1.2 + life * 1.1 * Math.sqrt(k), Math.sin(a) * r);
    const sc = (0.4 + life * 0.7) * k; s.scale.set(sc, sc, 1);
    s.material.opacity = (k > 1 ? 0.55 : 0.7) * (1 - life);
  }
}
