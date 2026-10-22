// Bouwt van een 2D-kaart (MAPS) een blokkenwereld in Three.js. 1 tegel = 1 meter; x = kolom, z = rij.
const W3 = {
  texCache: new Map(),
  tex(canvas, repeat) {
    const key = canvas;
    if (!repeat && this.texCache.has(key)) return this.texCache.get(key);
    const t = new THREE.CanvasTexture(canvas);
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
    if (!repeat) this.texCache.set(key, t);
    return t;
  },
  mat(canvas, extra) { return new THREE.MeshLambertMaterial({ map: this.tex(canvas), ...(extra || {}) }); },
};

// hoogte van blokken die boven de grond uitsteken
const TILE_H = { wall: 3, dark: 3, counter: 1, hay: 1, schap: 2, kast: 2, hedge: 1 };
const GROUND_UNDER = { tree: 'grass', fence: 'grass', block: 'grass', hedge: 'grass', tall: 'grass', wall: 'floor', counter: 'floor', table: 'floor', chair: 'floor', hay: 'straw', schap: 'tegel', kast: 'floor', dark: null, water: null, deep: null };

function makeCanvas(w, h, fn) { const [c, x] = mk(w, h); fn(x); return c; }
const SIDE_CANVAS = {
  grass: makeCanvas(16, 16, (x) => { px(x, 0, 0, 16, 16, '#7a5a34'); for (let i = 0; i < 10; i++) px(x, (i * 7) % 16, 5 + (i * 5) % 11, 2, 1, i % 2 ? '#6a4a2a' : '#8a6a44'); px(x, 0, 0, 16, 4, '#5f9e3c'); for (let i = 0; i < 16; i += 2) px(x, i, 4, 1, 1 + (i % 3), '#5f9e3c'); }),
};
const TALL_CANVAS = makeCanvas(16, 16, (x) => { for (let i = 0; i < 7; i++) { const bx = 1 + i * 2, by = 3 + ((i * 5) % 6); px(x, bx, by, 1, 16 - by, i % 2 ? '#3b7024' : '#4f8a31'); px(x, bx, by, 1, 1, '#9fd06a'); } });
const LEAF_CANVAS = makeCanvas(16, 16, (x) => { px(x, 0, 0, 16, 16, '#2f6a2a'); for (let i = 0; i < 26; i++) px(x, (i * 7) % 16, (i * 11) % 16, 2, 2, i % 3 ? '#3f8a36' : '#24521f'); });
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

function buildingMesh(b) {
  const g = new THREE.Group();
  const W = b.w, D = b.h;
  const cx = b.x + W / 2, cz = b.y + D / 2;
  const canvas = renderBuilding(b);
  const brick = W3.mat(brickCanvas(b.wall || '#a24b34'));
  const roofMat = new THREE.MeshLambertMaterial({ color: b.roof || '#2f3340' });
  const kind = b.kind || 'normaal';
  const front = (cv, w, h, y) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: W3.tex(cv), transparent: true, alphaTest: 0.5 }));
    m.position.set(cx, y, b.y + D + 0.01);
    return m;
  };
  if (kind === 'aframe') {
    const H = 4.6;
    const body = new THREE.Mesh(roofGeometry(W, D - 0.02, H, true), roofMat);
    body.position.set(cx, 0, cz); g.add(body);
    g.add(front(canvas, W, H, H / 2));
  } else if (kind === 'tiny') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(W - 0.4, 1.1, D - 0.2), W3.mat(solidCanvas('#f4f1ea')));
    body.position.set(cx, 0.55, cz); g.add(body);
    const roof = new THREE.Mesh(roofGeometry(W - 0.2, D, 0.7, false), new THREE.MeshLambertMaterial({ color: '#c23b2e' }));
    roof.position.set(cx, 1.1, cz); g.add(roof);
    g.add(front(canvas, W, D, 1));
  } else if (kind === 'shop' || kind === 'casino') {
    const H = 3.2;
    const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), new THREE.MeshLambertMaterial({ color: kind === 'casino' ? '#3a1f4a' : '#e8e6e0' }));
    body.position.set(cx, H / 2, cz); g.add(body);
    g.add(front(canvas, W, H, H / 2));
  } else {
    // gewoon huis: muren + zadeldak; voorgevel uit de 2D-tekening (zonder dak)
    const H = kind === 'church' ? 4 : 3;
    const roofH = Math.floor(canvas.height * (kind === 'church' ? 0.55 : 0.45));
    const cropTop = Math.max(0, roofH - 12);
    const facade = makeCanvas(canvas.width, canvas.height - cropTop, (x) => x.drawImage(canvas, 0, -cropTop));
    const mats = [brick, brick, roofMat, roofMat, W3.mat(facade), brick];
    const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), mats);
    body.position.set(cx, H / 2, cz); g.add(body);
    const roof = new THREE.Mesh(roofGeometry(W + 0.3, D + 0.3, kind === 'church' ? 2.4 : Math.min(2.2, D * 0.45), false), roofMat);
    roof.position.set(cx, H, cz); g.add(roof);
    if (kind === 'church') {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(1.6, 8, 1.6), brick);
      tower.position.set(cx, 4, b.y + D - 0.6); g.add(tower);
      const spire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3, 4), roofMat);
      spire.position.set(cx, 9.5, b.y + D - 0.6); spire.rotation.y = Math.PI / 4; g.add(spire);
    }
    if (b.chimney) {
      const ch = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.4, 0.4), brick);
      ch.position.set(b.x + W - 1, H + 1.2, cz); g.add(ch);
    }
  }
  return g;
}

// ---------- binnenruimtes: behang, plafond, deur ----------
const WALLPAPER = { cafe: ['#d8c7a0', '#6e4a2c'], eka: ['#eceae4', '#9aa0aa'], casino: ['#4a1f5a', '#2a0f30'], kringloop: ['#a8b88a', '#5a4a2a'], schuur: ['#8a6a44', '#5a3a20'], dorpshuis: ['#c8d0d8', '#6a5a4a'], dwerg: ['#f0b0c8', '#a85a7a'] };
const CEIL_H = { dwerg: 1.8 };
const ceilH = (m) => CEIL_H[m.id] || 3;
function wallCanvas(m) {
  const [paper, wood] = WALLPAPER[m.id] || ['#d8c7a0', '#6e4a2c'];
  return makeCanvas(16, 48, (x) => {
    px(x, 0, 0, 16, 48, paper);
    for (let i = 0; i < 4; i++) px(x, i * 4 + 1, 0, 1, 36, shade(paper, -14));
    if (m.id === 'schuur') for (let i = 0; i < 12; i++) px(x, 0, i * 4 + 3, 16, 1, shade(paper, -25));
    px(x, 0, 36, 16, 12, wood); px(x, 0, 36, 16, 1, shade(wood, 25)); px(x, 0, 47, 16, 1, shade(wood, -25));
  });
}
function ceilingCanvas(m) {
  const wood = m.id === 'schuur' || m.id === 'dwerg';
  return makeCanvas(16, 16, (x) => {
    px(x, 0, 0, 16, 16, wood ? '#7a5a34' : '#ece6d8');
    if (wood) for (let i = 0; i < 4; i++) px(x, 0, i * 4 + 3, 16, 1, '#5a3a20');
    else { px(x, 0, 0, 16, 2, '#8a6a44'); px(x, 0, 2, 16, 1, '#6e4a2c'); }
  });
}
function interiorExtras(m, root) {
  const H = ceilH(m);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(m.w, m.h), new THREE.MeshLambertMaterial({ map: W3.tex(ceilingCanvas(m), [m.w, m.h]) }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(m.w / 2, H, m.h / 2);
  root.add(ceil);
  // deur naar buiten in de onderste muur
  for (const d of m.doors) {
    const dh = Math.min(2.1, H - 0.05);
    root.add(box(0.9, dh, 0.08, cmat('#6e4a2c'), d.x + 0.5, dh / 2, d.y + 0.98));
    root.add(box(0.08, 0.08, 0.06, cmat('#f2c22e'), d.x + 0.82, dh * 0.5, d.y + 0.92));
    root.add(box(0.9, 0.3, 0.06, cmat('#9ab4d0'), d.x + 0.5, dh * 0.8, d.y + 0.93));
    if (H - dh > 0.05) root.add(box(1, H - dh, 1, W3.mat(wallCanvas(m)), d.x + 0.5, dh + (H - dh) / 2, d.y + 0.5));
  }
  // lampen aan het plafond
  const lamps = m.w * m.h > 90 ? [[m.w * 0.3, m.h * 0.55], [m.w * 0.7, m.h * 0.55]] : [[m.w / 2, m.h / 2]];
  for (const [x, z] of lamps) {
    root.add(box(0.5, 0.08, 0.5, new THREE.MeshBasicMaterial({ color: '#fff2c8' }), x, H - 0.05, z));
    const l = new THREE.PointLight(0xffd8a0, 0.9, 14, 1.4); l.position.set(x, H - 0.3, z); root.add(l);
  }
}

// ---------- de hele kaart ----------
function buildWorld(m) {
  const root = new THREE.Group();
  const groups = new Map(); // key -> [{x,y}]
  const add = (key, x, y) => { if (!groups.has(key)) groups.set(key, []); groups.get(key).push([x, y]); };
  const extras = { tree: [], tall: [], fence: [], water: [], table: [], chair: [], tall3: [] };
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    let t = m.tiles[y][x];
    if (t === 'mat_out') t = m.inside ? 'mat' : 'path';
    if (t === 'water' || t === 'deep') { extras.water.push([x, y]); continue; }
    if (t === 'bridge' || t === 'steiger') { extras.water.push([x, y]); add('plank:' + t, x, y); continue; }
    if (extras[t]) extras[t].push([x, y]);
    const under = t in GROUND_UNDER ? GROUND_UNDER[t] : t;
    if (under) add('ground:' + under + ':' + ((x * 31 + y * 17) % 4), x, y);
    if (TILE_H[t]) add('block:' + t, x, y);
  }
  const dummy = new THREE.Object3D();
  const inst = (geo, mat, list, place) => {
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach(([x, y], i) => { dummy.position.set(0, 0, 0); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1); place(dummy, x, y); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); });
    root.add(im);
    return im;
  };
  for (const [key, list] of groups) {
    const [kind, t, v] = key.split(':');
    if (kind === 'ground') {
      const top = W3.mat(getTile(t, +v, (+v * 3) % 4));
      const side = SIDE_CANVAS[t] ? W3.mat(SIDE_CANVAS[t]) : top;
      inst(new THREE.BoxGeometry(1, 1, 1), [side, side, top, side, side, side], list, (d, x, y) => d.position.set(x + 0.5, -0.5, y + 0.5));
    } else if (kind === 'block') {
      const wallLike = m.inside && (t === 'wall' || t === 'dark');
      const h = wallLike ? ceilH(m) : TILE_H[t];
      const mat = wallLike ? W3.mat(wallCanvas(m)) : t === 'dark' ? new THREE.MeshBasicMaterial({ color: '#0d0b12' }) : W3.mat(getTile(t, 0, 0));
      inst(new THREE.BoxGeometry(1, h, 1), mat, list, (d, x, y) => d.position.set(x + 0.5, h / 2, y + 0.5));
    } else if (kind === 'plank') {
      inst(new THREE.BoxGeometry(1, 0.15, 1), W3.mat(getTile('plank', 0, 0)), list, (d, x, y) => d.position.set(x + 0.5, -0.08, y + 0.5));
    }
  }
  if (extras.water.length) {
    const wm = new THREE.MeshLambertMaterial({ color: '#3a6fb0', transparent: true, opacity: 0.85 });
    inst(new THREE.BoxGeometry(1, 0.8, 1), wm, extras.water, (d, x, y) => d.position.set(x + 0.5, -0.65, y + 0.5));
    inst(new THREE.BoxGeometry(1, 0.5, 1), new THREE.MeshLambertMaterial({ color: '#4a3a2a' }), extras.water, (d, x, y) => d.position.set(x + 0.5, -1.3, y + 0.5));
  }
  if (extras.tree.length) {
    inst(new THREE.BoxGeometry(0.35, 2, 0.35), W3.mat(BARK_CANVAS), extras.tree, (d, x, y) => d.position.set(x + 0.5, 1, y + 0.5));
    inst(new THREE.BoxGeometry(1.7, 1.5, 1.7), W3.mat(LEAF_CANVAS), extras.tree, (d, x, y) => { d.position.set(x + 0.5, 2.6 + ((x * 7 + y) % 3) * 0.15, y + 0.5); d.rotation.y = ((x + y) % 4) * 0.2; });
  }
  if (extras.tall.length) {
    const tm = new THREE.MeshLambertMaterial({ map: W3.tex(TALL_CANVAS), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
    const pg = new THREE.PlaneGeometry(1.1, 0.9);
    inst(pg, tm, extras.tall, (d, x, y) => { d.position.set(x + 0.5, 0.45, y + 0.5); d.rotation.y = Math.PI / 4; });
    inst(pg, tm, extras.tall, (d, x, y) => { d.position.set(x + 0.5, 0.45, y + 0.5); d.rotation.y = -Math.PI / 4; });
  }
  if (extras.fence.length) {
    const fm = new THREE.MeshLambertMaterial({ color: '#f4efe0' });
    inst(new THREE.BoxGeometry(1, 0.12, 0.1), fm, extras.fence, (d, x, y) => d.position.set(x + 0.5, 0.45, y + 0.5));
    inst(new THREE.BoxGeometry(1, 0.12, 0.1), fm, extras.fence, (d, x, y) => d.position.set(x + 0.5, 0.75, y + 0.5));
    inst(new THREE.BoxGeometry(0.14, 0.95, 0.14), fm, extras.fence, (d, x, y) => d.position.set(x + 0.15, 0.47, y + 0.5));
  }
  if (extras.table.length) {
    inst(new THREE.BoxGeometry(0.85, 0.08, 0.85), new THREE.MeshLambertMaterial({ color: '#8c5a32' }), extras.table, (d, x, y) => d.position.set(x + 0.5, 0.75, y + 0.5));
    inst(new THREE.BoxGeometry(0.12, 0.75, 0.12), new THREE.MeshLambertMaterial({ color: '#4a2c18' }), extras.table, (d, x, y) => d.position.set(x + 0.5, 0.37, y + 0.5));
  }
  if (extras.chair.length) inst(new THREE.BoxGeometry(0.5, 0.45, 0.5), new THREE.MeshLambertMaterial({ color: '#7a4c2a' }), extras.chair, (d, x, y) => d.position.set(x + 0.5, 0.22, y + 0.5));
  for (const b of m.buildings) root.add(buildingMesh(b));
  if (m.inside) interiorExtras(m, root);
  // decor als "papieren" sprites; op muren als bordje tegen de muur
  const props = [];
  for (const p of m.props) {
    const t = tileAt(m, p.x, p.y);
    const tex = W3.tex(getProp(p.name));
    let obj;
    if (t === 'wall') {
      obj = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshLambertMaterial({ map: tex, transparent: true, alphaTest: 0.5 }));
      obj.position.set(p.x + 0.5, Math.min(1.7, ceilH(m) - 0.5), p.y + 1.02);
    } else {
      obj = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, alphaTest: 0.5 }));
      const base = t === 'counter' ? 1 : t === 'table' ? 0.8 : 0;
      const big = { tractor: 1.6, bushalte: 1.8, koe: 1.3, plaatsbord: 1.4, bord: 1.3, lamp: 2.2, goal: 1.6, gokkast: 1.4, container: 1.2, piano: 1.3 }[p.name] || 1;
      obj.scale.set(big, big, 1);
      obj.position.set(p.x + 0.5, base + big / 2, p.y + 0.5);
    }
    obj.userData.prop = p;
    root.add(obj); props.push(obj);
  }
  root.userData.props = props;
  return root;
}
