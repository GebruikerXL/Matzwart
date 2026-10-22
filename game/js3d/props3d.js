// Echte 3D-modellen voor al het decor (in meters, staand op y=0, voorkant naar +z). Onbekend decor blijft een plaatje.
const M3 = {
  b(g, w, h, d, col, x, y, z, extra) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof col === 'string' ? cmat(col) : col); m.position.set(x || 0, y || 0, z || 0); if (extra) extra(m); g.add(m); return m; },
  cyl(g, rt, rb, h, col, x, y, z, seg = 10) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), cmat(col)); m.position.set(x || 0, y || 0, z || 0); g.add(m); return m; },
  glow(col) { return new THREE.MeshBasicMaterial({ color: col }); },
  glass() { return new THREE.MeshLambertMaterial({ color: '#a8d0e8', transparent: true, opacity: 0.45 }); },
  text(t, w, h, bg, fg, font = 'bold 28px Silkscreen, monospace') {
    const c = document.createElement('canvas'); c.width = 256; c.height = Math.round(256 * h / w);
    const x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = fg; x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle';
    const lines = t.split('\n'); lines.forEach((l, i) => x.fillText(l, c.width / 2, c.height / 2 + (i - (lines.length - 1) / 2) * 34));
    const tex = new THREE.CanvasTexture(c); tex.magFilter = THREE.LinearFilter;
    return new THREE.MeshLambertMaterial({ map: tex });
  },
};
const SIGN_TEXT = { plaatsbord: 'MEEDHUIZEN', dz_plaatsbord: 'DELFZIJL', bordoost: 'A-framestraat →\nEKA', bordzuid: '↓ Voetbalveld\nZwemsteiger', borddelfzijl: '↑ Delfzijl', kanaalbord: 'Afwateringskanaal\nvan Duurswold', damsterdiep: 'Damsterdiep', steigerbord: 'ZWEMSTEIGER\nNiet duiken', dakbord: 'VERBODEN\nOP HET DAK', zw_bord: 'ZWOLLE\n☠ WILDERNIS ☠' };

const PROP3D = {
  lamp(g) { M3.cyl(g, 0.06, 0.09, 3.2, '#3a3a44', 0, 1.6, 0); M3.b(g, 0.5, 0.18, 0.5, '#3a3a44', 0, 3.25, 0); M3.b(g, 0.4, 0.06, 0.4, M3.glow('#ffe9a0'), 0, 3.14, 0); },
  bank(g) {
    for (const x of [-0.65, 0.65]) M3.b(g, 0.08, 0.45, 0.45, '#2a2a30', x, 0.22, 0);
    M3.b(g, 1.6, 0.06, 0.48, '#8c5a32', 0, 0.47, 0); M3.b(g, 1.6, 0.35, 0.06, '#8c5a32', 0, 0.75, -0.24);
  },
  bushalte(g) {
    M3.b(g, 2.6, 0.08, 1.3, '#3a4a6a', 0, 2.4, 0); M3.b(g, 2.6, 2.3, 0.05, M3.glass(), 0, 1.2, -0.6);
    for (const x of [-1.25, 1.25]) M3.b(g, 0.08, 2.4, 0.08, '#5a6a8a', x, 1.2, -0.6);
    M3.b(g, 1.6, 0.06, 0.4, '#8c5a32', 0, 0.48, -0.35);
    M3.b(g, 0.5, 0.6, 0.04, M3.text('BUS\n2×/dag', 0.5, 0.6, '#f2c22e', '#1b1420', 'bold 40px Silkscreen'), 0.9, 1.7, -0.56);
  },
  bord(g, p) {
    M3.cyl(g, 0.05, 0.05, 2.2, '#6e6e78', 0, 1.1, 0);
    M3.b(g, 1.5, 0.6, 0.06, M3.text(SIGN_TEXT[p.id] || '→', 1.5, 0.6, '#2a5aa0', '#f4f1ea', 'bold 30px Silkscreen'), 0, 2.0, 0.05);
  },
  bordje(g, p) { M3.cyl(g, 0.05, 0.05, 1.4, '#6e4a2c', 0, 0.7, 0); M3.b(g, 1.3, 0.55, 0.05, M3.text(SIGN_TEXT[p.id] || '', 1.3, 0.55, '#2e6a3a', '#f4f1ea', 'bold 26px Silkscreen'), 0, 1.35, 0.05); },
  plaatsbord(g, p) {
    for (const x of [-0.7, 0.7]) M3.cyl(g, 0.05, 0.05, 2.2, '#6e6e78', x, 1.1, 0);
    M3.b(g, 1.9, 0.7, 0.06, M3.text(SIGN_TEXT[p.id] || 'MEEDHUIZEN', 1.9, 0.7, '#f2c22e', '#1b1420', 'bold 40px Silkscreen'), 0, 1.9, 0.05);
  },
  tractor(g) {
    M3.b(g, 1.3, 0.8, 2.4, '#2e8b3a', 0, 1.0, 0.1); M3.b(g, 1.2, 1.1, 1.0, '#2e8b3a', 0, 1.85, -0.5);
    M3.b(g, 1.1, 0.8, 0.9, M3.glass(), 0, 1.95, -0.5); M3.cyl(g, 0.06, 0.06, 0.8, '#555', 0.35, 1.9, 0.7);
    for (const s of [-1, 1]) { const w = M3.cyl(g, 0.75, 0.75, 0.45, '#1b1b1b', s * 0.75, 0.75, -0.6, 14); w.rotation.z = Math.PI / 2; const f = M3.cyl(g, 0.4, 0.4, 0.3, '#1b1b1b', s * 0.65, 0.4, 1.0, 12); f.rotation.z = Math.PI / 2; }
  },
  koe(g) { // Groninger blaarkop: rood met een witte kop
    M3.b(g, 0.8, 0.75, 1.7, '#8a2a20', 0, 1.0, 0); M3.b(g, 0.45, 0.45, 0.5, '#f4f1ea', 0, 1.25, 1.05);
    M3.b(g, 0.3, 0.2, 0.1, '#e8a0a0', 0, 1.1, 1.32); M3.b(g, 0.6, 0.06, 0.06, '#ddd', 0, 1.52, 1.0);
    for (const [x, z] of [[-0.28, 0.6], [0.28, 0.6], [-0.28, -0.6], [0.28, -0.6]]) M3.b(g, 0.16, 0.65, 0.16, '#5a1a14', x, 0.33, z);
    M3.b(g, 0.3, 0.15, 0.3, '#f0b0b0', 0, 0.6, -0.4); M3.b(g, 0.35, 0.3, 0.02, '#f4f1ea', 0, 1.1, 0.86);
  },
  kliko(g) { M3.b(g, 0.6, 1.0, 0.7, '#2a6a3a', 0, 0.5, 0); M3.b(g, 0.64, 0.06, 0.76, '#1f5a2c', 0, 1.03, 0); },
  biervat(g) { M3.cyl(g, 0.32, 0.32, 0.9, '#8c5a32', 0, 0.45, 0, 12); for (const y of [0.15, 0.75]) M3.cyl(g, 0.335, 0.335, 0.05, '#555', 0, y, 0, 12); },
  emmer(g) { M3.cyl(g, 0.2, 0.15, 0.35, '#7a8a9a', 0, 0.18, 0, 10); },
  tap(g) { M3.b(g, 0.3, 0.06, 0.15, '#c0c0c8', 0, 1.03, 0); for (const x of [-0.08, 0.08]) M3.cyl(g, 0.025, 0.025, 0.35, '#c0c0c8', x, 1.25, 0); M3.b(g, 0.06, 0.08, 0.06, '#f2c22e', -0.08, 1.45, 0); },
  piano(g) { M3.b(g, 1.5, 1.2, 0.6, '#1b1414', 0, 0.6, 0); M3.b(g, 1.4, 0.05, 0.25, '#f4f1ea', 0, 0.78, 0.38); },
  kaartjes(g) { M3.b(g, 0.12, 0.01, 0.17, '#f4f1ea', -0.1, 0.81, 0); M3.b(g, 0.12, 0.01, 0.17, '#f4f1ea', 0.08, 0.81, 0.05); },
  kassa(g) { M3.b(g, 0.45, 0.25, 0.4, '#3a3e48', 0, 1.12, 0); M3.b(g, 0.35, 0.25, 0.04, M3.glow('#7ad46a'), 0, 1.38, -0.05); },
  mestvork(g) { M3.cyl(g, 0.025, 0.025, 1.6, '#8c5a32', 0, 0.8, 0); for (const x of [-0.12, 0, 0.12]) M3.b(g, 0.025, 0.3, 0.025, '#888', x, 1.7, 0); M3.b(g, 0.3, 0.03, 0.03, '#888', 0, 1.56, 0); },
  kabouter(g) {
    M3.b(g, 0.26, 0.24, 0.2, '#2f6aa6', 0, 0.12, 0); M3.b(g, 0.2, 0.18, 0.18, '#f0c9a0', 0, 0.33, 0); M3.b(g, 0.18, 0.12, 0.04, '#f4f1ea', 0, 0.28, 0.1);
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 6), cmat('#c23b2e')); c.position.y = 0.56; g.add(c);
  },
  sokkel(g) { M3.b(g, 0.4, 0.25, 0.4, '#9a9aa2', 0, 0.12, 0); },
  bmwL(g) {
    M3.b(g, 1.8, 0.65, 4.2, '#1b2a44', 0, 0.55, -0.9); M3.b(g, 1.6, 0.55, 2.0, M3.glass(), 0, 1.15, -1.1);
    M3.b(g, 1.6, 0.06, 2.0, '#1b2a44', 0, 1.44, -1.1);
    for (const [x, z] of [[-0.85, 0.4], [0.85, 0.4], [-0.85, -2.2], [0.85, -2.2]]) { const w = M3.cyl(g, 0.34, 0.34, 0.25, '#111', x, 0.34, z, 12); w.rotation.z = Math.PI / 2; }
    for (const x of [-0.6, 0.6]) M3.b(g, 0.3, 0.12, 0.04, M3.glow('#fff2c8'), x, 0.65, 1.21);
    M3.b(g, 0.14, 0.14, 0.02, '#f4f1ea', 0, 0.75, 1.21);
  },
  bmwR() {},
  goal(g) {
    for (const z of [-1.4, 1.4]) M3.b(g, 0.1, 2.2, 0.1, '#f4f1ea', 0, 1.1, z);
    M3.b(g, 0.1, 0.1, 2.9, '#f4f1ea', 0, 2.2, 0);
    M3.b(g, 0.02, 2.2, 2.8, new THREE.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: 0.25 }), 0.7, 1.1, 0);
  },
  container(g) { M3.b(g, 1.6, 1.3, 1.1, '#3a6a4a', 0, 0.65, 0); M3.b(g, 1.66, 0.08, 1.16, '#2a4a3a', 0, 1.34, 0); },
  winkelwagen(g) { M3.b(g, 0.55, 0.45, 0.85, new THREE.MeshLambertMaterial({ color: '#c8ccd4', wireframe: true }), 0, 0.7, 0); M3.b(g, 0.55, 0.05, 0.05, '#c23b2e', 0, 1.0, -0.5); for (const [x, z] of [[-0.22, 0.35], [0.22, 0.35], [-0.22, -0.35], [0.22, -0.35]]) M3.b(g, 0.06, 0.06, 0.06, '#222', x, 0.05, z); },
  tomatenplant(g) { M3.cyl(g, 0.18, 0.14, 0.25, '#b05a30', 0, 0.12, 0); M3.cyl(g, 0.02, 0.02, 0.8, '#2e7a3a', 0, 0.6, 0); for (const [x, y] of [[0.1, 0.5], [-0.1, 0.7], [0.08, 0.85]]) { const t = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), cmat('#e8433a')); t.position.set(x, y, 0.05); g.add(t); } },
  minibed(g) { M3.b(g, 0.6, 0.25, 1.0, '#7a4c2a', 0, 0.12, 0); M3.b(g, 0.5, 0.06, 0.8, '#e86fb0', 0, 0.27, 0.05); M3.b(g, 0.4, 0.08, 0.2, '#f4f1ea', 0, 0.3, -0.35); },
  bed(g) { M3.b(g, 1.3, 0.4, 2.0, '#5a3720', 0, 0.2, 0); M3.b(g, 1.2, 0.15, 1.6, '#3a6ac8', 0, 0.47, 0.15); M3.b(g, 1.0, 0.12, 0.35, '#f4f1ea', 0, 0.47, -0.75); M3.b(g, 1.3, 0.8, 0.08, '#5a3720', 0, 0.6, -1.0); },
  sofa(g) { M3.b(g, 1.8, 0.45, 0.8, '#7a3a5a', 0, 0.22, 0); M3.b(g, 1.8, 0.5, 0.2, '#6a2a4a', 0, 0.65, -0.3); for (const x of [-0.9, 0.9]) M3.b(g, 0.2, 0.6, 0.8, '#6a2a4a', x, 0.3, 0); },
  tv(g) { M3.b(g, 1.2, 0.5, 0.45, '#5a3720', 0, 0.25, 0); M3.b(g, 1.1, 0.65, 0.06, '#1b1420', 0, 0.85, 0); M3.b(g, 1.0, 0.56, 0.02, M3.glow('#5a9ad0'), 0, 0.85, 0.04); },
  plant(g) { M3.cyl(g, 0.2, 0.16, 0.35, '#b05a30', 0, 0.18, 0); for (let i = 0; i < 5; i++) M3.b(g, 0.3, 0.3, 0.3, '#3f8a36', Math.sin(i * 1.3) * 0.15, 0.55 + i * 0.12, Math.cos(i * 1.3) * 0.15); },
  boekenkast(g) { M3.b(g, 1.2, 2.0, 0.4, '#5a3720', 0, 1.0, 0); for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) M3.b(g, 0.14, 0.32, 0.25, ['#c23b2e', '#2e7a3a', '#3a6aa6', '#f2c22e'][(i + r) % 4], -0.45 + i * 0.18, 0.3 + r * 0.45, 0.06); },
  kast(g) { M3.b(g, 1.2, 1.8, 0.5, '#6e4a2c', 0, 0.9, 0); M3.b(g, 0.02, 1.7, 0.02, '#3a2a1a', 0, 0.9, 0.26); for (const x of [-0.08, 0.08]) M3.b(g, 0.04, 0.12, 0.04, '#f2c22e', x, 0.95, 0.27); },
  kerkbank(g) { M3.b(g, 2.0, 0.08, 0.45, '#8c5a32', 0, 0.45, 0); M3.b(g, 2.0, 0.5, 0.08, '#6e4424', 0, 0.75, -0.22); for (const x of [-0.95, 0.95]) M3.b(g, 0.08, 0.95, 0.5, '#6e4424', x, 0.47, 0); },
  orgel(g) { M3.b(g, 1.8, 1.6, 0.8, '#5a3720', 0, 0.8, 0); for (let i = 0; i < 9; i++) M3.cyl(g, 0.06, 0.06, 1.2 + (i % 4) * 0.35, '#c0c0c8', -0.8 + i * 0.2, 2.0 + (i % 4) * 0.17, -0.2, 8); M3.b(g, 1.6, 0.06, 0.25, '#f4f1ea', 0, 0.9, 0.42); },
  aanrecht(g) { M3.b(g, 1.4, 0.9, 0.6, '#d8d8e0', 0, 0.45, 0); M3.b(g, 1.45, 0.05, 0.65, '#5a5a62', 0, 0.92, 0); M3.b(g, 0.4, 0.06, 0.35, '#5a8ab0', 0.2, 0.93, 0); },
  kaars(g) { M3.cyl(g, 0.15, 0.2, 0.9, '#e0b030', 0, 0.45, 0); M3.cyl(g, 0.04, 0.04, 0.3, '#f4f1ea', 0, 1.05, 0); M3.b(g, 0.05, 0.08, 0.05, M3.glow('#ffb03a'), 0, 1.25, 0); },
  pilaar(g) { M3.b(g, 1.0, 0.3, 1.0, '#e0b030', 0, 0.15, 0); M3.cyl(g, 0.38, 0.38, 5.4, '#f4efe0', 0, 3.0, 0, 16); M3.b(g, 1.0, 0.3, 1.0, '#e0b030', 0, 5.85, 0); },
  fontein(g) { M3.cyl(g, 1.1, 1.2, 0.5, '#c8c0b8', 0, 0.25, 0, 16); M3.cyl(g, 1.0, 1.0, 0.05, '#5a9ad0', 0, 0.48, 0, 16); M3.cyl(g, 0.15, 0.2, 1.5, '#c8c0b8', 0, 1.0, 0); M3.cyl(g, 0.5, 0.3, 0.15, '#c8c0b8', 0, 1.75, 0, 12); M3.b(g, 0.08, 0.5, 0.08, new THREE.MeshLambertMaterial({ color: '#8ac0f0', transparent: true, opacity: 0.7 }), 0, 2.05, 0); },
  bureau(g) { M3.b(g, 1.8, 0.06, 0.8, '#2a2a30', 0, 0.75, 0); for (const x of [-0.85, 0.85]) M3.b(g, 0.06, 0.75, 0.75, '#1b1b1f', x, 0.37, 0); M3.b(g, 0.5, 0.03, 0.18, M3.glow('#c23bff'), 0, 0.79, 0.15); },
  gamestoel(g) { M3.b(g, 0.6, 0.12, 0.6, '#1b1420', 0, 0.5, 0); M3.b(g, 0.6, 0.9, 0.12, '#c23b2e', 0, 1.0, 0.3); M3.b(g, 0.3, 0.9, 0.13, '#1b1420', 0, 1.0, 0.31); M3.cyl(g, 0.04, 0.04, 0.45, '#555', 0, 0.22, 0); },
  aquarium(g) { M3.b(g, 1.6, 0.8, 0.6, '#1b1420', 0, 0.4, 0); M3.b(g, 1.5, 1.0, 0.55, new THREE.MeshLambertMaterial({ color: '#3a8ac8', transparent: true, opacity: 0.6 }), 0, 1.3, 0); for (const [x, y, c] of [[-0.3, 1.3, '#f2a22e'], [0.4, 1.1, '#e8433a'], [0.1, 1.5, '#f4f1ea']]) M3.b(g, 0.16, 0.08, 0.04, c, x, y, 0.1); },
  schip(g) {
    M3.b(g, 3.2, 1.6, 9, '#1b2a4a', 0, 0.2, 0); M3.b(g, 3.25, 0.3, 9.05, '#c23b2e', 0, -0.4, 0);
    M3.b(g, 2.4, 2.2, 2.4, '#f4f1ea', 0, 2.1, -3); M3.b(g, 2.2, 0.5, 0.05, M3.glass(), 0, 2.6, -1.78);
    M3.cyl(g, 0.35, 0.35, 1.8, '#e8833a', 0, 3.9, -3.5); for (let i = 0; i < 4; i++) M3.b(g, 1.2, 1.0, 2.0, ['#c23b2e', '#2e6aa6', '#2e8a5a', '#e0b030'][i], i % 2 ? 0.6 : -0.6, 1.5, 0.5 + Math.floor(i / 2) * 2.2);
    g.userData.bob = true;
  },
  kraan(g) {
    for (const [x, z] of [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) M3.b(g, 0.25, 8, 0.25, '#e8b030', x, 4, z);
    M3.b(g, 3, 1.2, 3, '#e8b030', 0, 8.4, 0); M3.b(g, 1.6, 1.2, 1.6, M3.glass(), 0, 9.6, 0.6);
    M3.b(g, 0.6, 0.6, 14, '#e8b030', 0, 9.3, 5); M3.cyl(g, 0.03, 0.03, 5, '#333', 0, 6.5, 10); M3.b(g, 0.6, 0.3, 0.6, '#333', 0, 4, 10);
  },
  schoorsteen(g) { M3.cyl(g, 0.7, 0.9, 16, '#c8c0b8', 0, 8, 0, 14); for (const y of [12, 14.5]) M3.cyl(g, 0.74, 0.74, 0.8, '#c23b2e', 0, y, 0, 14); g.userData.smoke = 16.5; },
  maigret(g) {
    M3.b(g, 1.0, 1.0, 1.0, '#8a8a90', 0, 0.5, 0);
    const br = '#5a4a2a';
    M3.b(g, 0.5, 0.9, 0.3, br, 0, 1.45, 0); M3.b(g, 0.55, 0.7, 0.35, br, 0, 2.2, 0);
    M3.b(g, 0.35, 0.35, 0.35, br, 0, 2.75, 0); M3.b(g, 0.5, 0.06, 0.5, '#3a2a1a', 0, 2.95, 0); M3.b(g, 0.32, 0.15, 0.32, '#3a2a1a', 0, 3.04, 0);
    M3.b(g, 0.04, 0.04, 0.2, '#3a2a1a', 0.08, 2.7, 0.25); // pijp
  },
  fabriek(g) { M3.b(g, 4, 3, 4, '#8a8a90', 0, 1.5, 0); },
  ijsco(g) { M3.b(g, 1.6, 1.8, 1.2, '#f4f1ea', 0, 0.9, 0); M3.b(g, 1.8, 0.2, 1.4, '#3a6aa6', 0, 1.9, 0); M3.b(g, 0.6, 0.6, 0.04, M3.text('IJS', 0.6, 0.6, '#e8a0c0', '#1b1420', 'bold 60px Silkscreen'), 0, 1.2, 0.62); },
  boei(g) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.12, 8, 16), cmat('#e8433a')); t.rotation.x = Math.PI / 2; t.position.y = 0.05; g.add(t); },
  dug(g) { M3.b(g, 3, 0.1, 1.2, '#2a2a3a', 0, 1.9, 0); M3.b(g, 3, 1.9, 0.08, M3.glass(), 0, 0.95, -0.55); M3.b(g, 2.6, 0.08, 0.45, '#3a6aa6', 0, 0.45, -0.25); },
  gokkast(g) { M3.b(g, 0.8, 1.7, 0.6, '#c23b2e', 0, 0.85, 0); M3.b(g, 0.6, 0.35, 0.04, M3.glow('#f4f1ea'), 0, 1.3, 0.31); for (const x of [-0.18, 0, 0.18]) M3.b(g, 0.12, 0.2, 0.02, M3.glow(['#c23b2e', '#f2c22e', '#2e7a3a'][Math.round(x * 5.5 + 1)]), x, 1.3, 0.33); M3.b(g, 0.8, 0.12, 0.6, '#f2c22e', 0, 1.76, 0); M3.cyl(g, 0.03, 0.03, 0.6, '#888', 0.45, 1.2, 0); const k = new THREE.Mesh(new THREE.SphereGeometry(0.07), cmat('#e8433a')); k.position.set(0.45, 1.52, 0); g.add(k); },
  roulL(g) { M3.b(g, 1.6, 0.8, 1.2, '#1f6a3a', 0, 0.4, 0); M3.cyl(g, 0.45, 0.45, 0.12, '#5a3720', 0, 0.86, 0, 20); const w = M3.cyl(g, 0.38, 0.38, 0.06, '#1b1420', 0, 0.94, 0, 20); g.userData.spin = w; },
  roulR(g) { M3.b(g, 1.6, 0.8, 1.2, '#1f6a3a', 0, 0.4, 0); for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) M3.b(g, 0.2, 0.01, 0.25, (r + c) % 2 ? '#c23b2e' : '#1b1420', -0.6 + c * 0.24, 0.81, -0.35 + r * 0.32); },
  kaarttafel(g) { M3.b(g, 1.4, 0.8, 1.0, '#1f6a3a', 0, 0.4, 0); M3.b(g, 0.14, 0.01, 0.2, '#f4f1ea', -0.15, 0.81, 0); M3.b(g, 0.14, 0.01, 0.2, '#3a6aa6', 0.15, 0.81, 0); },
  rek(g) { M3.cyl(g, 0.02, 0.02, 1.6, '#888', 0, 1.5, 0).rotation.z = Math.PI / 2; for (const x of [-0.8, 0.8]) M3.b(g, 0.04, 1.5, 0.04, '#888', x, 0.75, 0); for (let i = 0; i < 6; i++) M3.b(g, 0.04, 0.8, 0.5, ['#c23b2e', '#3ab0c0', '#c8a02a', '#7a3ac8', '#e86fb0', '#2e8a5a'][i], -0.6 + i * 0.24, 1.05, 0); },
  spiegel(g) { M3.b(g, 0.9, 1.9, 0.08, '#6e4a2c', 0, 0.95, 0); M3.b(g, 0.75, 1.75, 0.02, new THREE.MeshLambertMaterial({ color: '#d8e8f4', emissive: '#334455' }), 0, 0.95, 0.05); },
  doos(g) { M3.b(g, 0.8, 0.5, 0.6, '#a8784a', 0, 0.25, 0); M3.b(g, 0.3, 0.2, 0.3, '#c86a9a', -0.15, 0.55, 0); M3.b(g, 0.3, 0.15, 0.3, '#3ab0c0', 0.2, 0.55, 0); },
  kegelprop(g) { M3.b(g, 0.6, 0.06, 0.6, '#3a3a3a', 0, 0.03, 0); const c = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 12), cmat('#ff7a2a')); c.position.y = 0.4; g.add(c); M3.cyl(g, 0.15, 0.17, 0.12, '#f4f1ea', 0, 0.42, 0, 12); },
  jute(g) { M3.b(g, 0.6, 0.7, 0.4, '#b08a50', 0, 0.35, 0); M3.b(g, 0.62, 0.08, 0.42, '#8a6a3a', 0, 0.55, 0); },
  // de fatbike van Otto: dikke banden, een accu en een zadel; voorkant naar +z
  fatbike(g) {
    for (const z of [-0.55, 0.55]) { const w = M3.cyl(g, 0.36, 0.36, 0.2, '#1b1b1b', 0, 0.36, z, 14); w.rotation.z = Math.PI / 2; const r = M3.cyl(g, 0.2, 0.2, 0.21, '#888', 0, 0.36, z, 10); r.rotation.z = Math.PI / 2; }
    M3.b(g, 0.07, 0.07, 1.0, '#c23b2e', 0, 0.62, 0, (m) => { m.rotation.x = 0.1; });
    M3.b(g, 0.07, 0.5, 0.07, '#c23b2e', 0, 0.62, -0.3, (m) => { m.rotation.x = -0.3; });
    M3.b(g, 0.07, 0.6, 0.07, '#c23b2e', 0, 0.75, 0.48, (m) => { m.rotation.x = 0.25; });
    M3.b(g, 0.6, 0.05, 0.05, '#2a2a2a', 0, 1.08, 0.56);
    M3.b(g, 0.16, 0.06, 0.3, '#1b1b1b', 0, 0.92, -0.38);
    M3.b(g, 0.16, 0.18, 0.4, '#3a3a44', 0, 0.55, 0.05);
    M3.b(g, 0.08, 0.06, 0.04, M3.glow('#fff2c8'), 0, 0.95, 0.66);
  },
  // de auto van Koen: verlaagd, felgroen, met een spoiler als een strijkplank (lengte langs z, voorkant naar +z)
  autoL(g) {
    M3.b(g, 1.8, 0.6, 4.2, '#8ad030', 0, 0.45, -0.9); M3.b(g, 1.6, 0.5, 2.0, M3.glass(), 0, 0.98, -1.2);
    M3.b(g, 1.6, 0.06, 2.0, '#6ab020', 0, 1.25, -1.2);
    M3.b(g, 1.9, 0.06, 0.4, '#1b1b1b', 0, 1.15, -2.95); for (const x of [-0.7, 0.7]) M3.b(g, 0.06, 0.4, 0.1, '#1b1b1b', x, 0.95, -2.9);
    for (const [x, z] of [[-0.85, 0.3], [0.85, 0.3], [-0.85, -2.1], [0.85, -2.1]]) { const w = M3.cyl(g, 0.3, 0.3, 0.25, '#111', x, 0.3, z, 12); w.rotation.z = Math.PI / 2; }
    for (const x of [-0.6, 0.6]) M3.b(g, 0.3, 0.1, 0.04, M3.glow('#fff2c8'), x, 0.55, 1.21);
    for (const x of [-0.5, 0.5]) { const u = M3.cyl(g, 0.08, 0.08, 0.3, '#666', x, 0.3, -3.05, 8); u.rotation.x = Math.PI / 2; }
  },
  autoR() {},
  // de roestige Opel Kadett van Kjell en Jornt
  opelL(g) {
    M3.b(g, 1.7, 0.6, 4.0, '#c8783a', 0, 0.5, -0.9); M3.b(g, 1.55, 0.55, 2.0, M3.glass(), 0, 1.07, -1.1); M3.b(g, 1.55, 0.06, 2.0, '#a8602a', 0, 1.37, -1.1);
    M3.b(g, 0.6, 0.3, 0.02, '#7a4a2a', 0.86, 0.55, -0.4); M3.b(g, 0.4, 0.25, 0.02, '#6a3a1a', -0.86, 0.6, -1.6);
    for (const [x, z] of [[-0.8, 0.3], [0.8, 0.3], [-0.8, -2.0], [0.8, -2.0]]) { const w = M3.cyl(g, 0.3, 0.3, 0.22, '#111', x, 0.3, z, 12); w.rotation.z = Math.PI / 2; }
    for (const x of [-0.55, 0.55]) M3.b(g, 0.28, 0.12, 0.04, M3.glow('#fff2c8'), x, 0.55, 1.11);
    for (let i = 0; i < 6; i++) M3.cyl(g, 0.04, 0.04, 0.12, ['#c8ccd4', '#2e7a3a', '#c23b2e'][i % 3], -0.5 + i * 0.2, 0.86, -2.2 + (i % 2) * 0.3, 8);
  },
  opelR() {},
  // Café Josje: alles kapot
  kots(g) { M3.b(g, 1.1, 0.03, 0.8, '#a8b83a', 0, 0.015, 0); M3.b(g, 0.6, 0.04, 0.5, '#c8c84a', 0.2, 0.02, 0.1); M3.b(g, 0.08, 0.05, 0.08, '#e8833a', -0.2, 0.03, 0.1); M3.b(g, 0.06, 0.05, 0.06, '#e8833a', 0.3, 0.03, -0.2); },
  plas(g) { M3.b(g, 1.3, 0.02, 0.9, new THREE.MeshLambertMaterial({ color: '#d8a83a', transparent: true, opacity: 0.7 }), 0, 0.01, 0); M3.b(g, 0.3, 0.025, 0.2, '#f4f1ea', -0.3, 0.015, 0.1); },
  scherven(g) { for (let i = 0; i < 9; i++) M3.b(g, 0.08 + (i % 3) * 0.04, 0.02, 0.05 + (i % 2) * 0.05, new THREE.MeshLambertMaterial({ color: '#c8e0f0', transparent: true, opacity: 0.8 }), Math.sin(i * 2.3) * 0.5, 0.01, Math.cos(i * 1.7) * 0.4, (m) => { m.rotation.y = i; }); M3.cyl(g, 0.05, 0.05, 0.15, '#2e7a3a', 0.2, 0.05, 0.2, 8).rotation.z = Math.PI / 2; },
  kapottafel(g) { const top = M3.b(g, 1.0, 0.08, 1.0, '#8c5a32', 0, 0.35, 0); top.rotation.z = 0.6; M3.b(g, 0.1, 0.7, 0.1, '#4a2c18', -0.35, 0.35, 0.3, (m) => { m.rotation.z = 0.6; }); M3.b(g, 0.1, 0.35, 0.1, '#4a2c18', 0.4, 0.08, -0.3, (m) => { m.rotation.x = Math.PI / 2; }); },
  kapotstoel(g) { M3.b(g, 0.5, 0.06, 0.5, '#7a4c2a', 0, 0.25, 0, (m) => { m.rotation.x = Math.PI / 2; }); M3.b(g, 0.5, 0.5, 0.06, '#6a3c1a', 0, 0.03, -0.25); M3.b(g, 0.06, 0.4, 0.06, '#5a3c1a', 0.2, 0.2, 0.25, (m) => { m.rotation.z = 1.2; }); },
  box(g) { M3.b(g, 0.8, 1.6, 0.7, '#1b1b20', 0, 0.8, 0); for (const [y, r] of [[1.25, 0.2], [0.6, 0.3]]) { const c = M3.cyl(g, r, r, 0.04, '#3a3a44', 0, y, 0.36, 14); c.rotation.x = Math.PI / 2; } },
  discobal_kapot(g) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), new THREE.MeshLambertMaterial({ color: '#c8ccd4', emissive: '#556070', flatShading: true })); s.position.y = 0.3; s.scale.y = 0.8; g.add(s); for (let i = 0; i < 7; i++) M3.b(g, 0.07, 0.02, 0.07, '#c8ccd4', Math.sin(i * 2.1) * 0.6, 0.01, Math.cos(i * 1.6) * 0.5); M3.cyl(g, 0.01, 0.01, 0.8, '#888', 0.3, 0.02, 0.2, 6).rotation.z = Math.PI / 2; },
  discobal(g) { M3.cyl(g, 0.01, 0.01, 1.2, '#888', 0, 3.0, 0, 6); const s = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), new THREE.MeshLambertMaterial({ color: '#c8ccd4', emissive: '#556070', flatShading: true })); s.position.y = 2.3; g.add(s); g.userData.spin = s; },
  // spullen in huizen
  koelkast(g) { M3.b(g, 0.75, 1.85, 0.7, '#e8e6e0', 0, 0.92, 0); M3.b(g, 0.76, 0.02, 0.71, '#b8b6b0', 0, 1.25, 0); M3.b(g, 0.04, 0.3, 0.04, '#888', 0.3, 1.5, 0.37); M3.b(g, 0.04, 0.4, 0.04, '#888', 0.3, 0.9, 0.37); M3.b(g, 0.14, 0.1, 0.01, '#e8433a', -0.15, 1.0, 0.36); },
  dressoir(g) { M3.b(g, 1.3, 0.85, 0.5, '#8c5a32', 0, 0.42, 0); for (const y of [0.25, 0.6]) { M3.b(g, 1.2, 0.3, 0.02, '#6e4424', 0, y, 0.26); M3.b(g, 0.12, 0.04, 0.03, '#f2c22e', 0, y, 0.28); } M3.cyl(g, 0.1, 0.08, 0.2, '#e8e6e0', -0.4, 0.95, 0); M3.b(g, 0.25, 0.25, 0.25, '#3a8a3a', -0.4, 1.15, 0); },
  kluis(g) { M3.b(g, 0.7, 0.8, 0.6, '#5a5a62', 0, 0.4, 0); M3.b(g, 0.6, 0.7, 0.02, '#6e6e78', 0, 0.4, 0.31); const d = M3.cyl(g, 0.1, 0.1, 0.04, '#3a3a44', 0, 0.45, 0.33, 12); d.rotation.x = Math.PI / 2; M3.b(g, 0.08, 0.06, 0.01, '#f2c22e', 0.15, 0.6, 0.33); },
  tas(g) { M3.b(g, 0.8, 0.35, 0.4, '#2a4a9a', 0, 0.18, 0); M3.b(g, 0.82, 0.05, 0.41, '#f4f1ea', 0, 0.22, 0); M3.b(g, 0.3, 0.06, 0.06, '#1b1b1b', 0, 0.42, 0); },
  // klimstapels voor de jump puzzles: hoogte uit het decor zelf (p.h)
  stapel(g, p) { const h = p.h || 1; let y = 0, i = 0; while (y < h - 0.01) { const s = Math.min(0.45, h - y); M3.b(g, 1.5 - (i % 2) * 0.1, s, 1.5 - (i % 2) * 0.1, i % 2 ? '#a8784a' : '#8c5a32', (i % 3 - 1) * 0.08, y + s / 2, 0); M3.b(g, 1.52, 0.04, 1.52, '#5a3720', 0, y + s - 0.02, 0); y += s; i++; } },
  cstapel(g, p) { const h = p.h || 1; const cols = ['#c23b2e', '#2e6aa6', '#2e8a5a', '#e0b030', '#e8833a']; let y = 0, i = 0; while (y < h - 0.01) { const s = Math.min(0.9, h - y); M3.b(g, 1.9, s, 1.9, cols[(i + Math.round(h * 3)) % cols.length], 0, y + s / 2, 0); for (const x of [-0.6, 0, 0.6]) M3.b(g, 0.06, s * 0.9, 1.92, '#1b1b20', x, y + s / 2, 0); y += s; i++; } },
  hooi(g, p) { const h = p.h || 1; let y = 0, i = 0; while (y < h - 0.01) { const s = Math.min(0.5, h - y); M3.b(g, 1.6, s, 1.2, i % 2 ? '#d9b24e' : '#c8a040', 0, y + s / 2, (i % 2) * 0.1); y += s; i++; } },
  dakbuit(g) {
    M3.b(g, 0.7, 0.45, 0.5, '#8c5a32', 0, 0.22, 0); M3.b(g, 0.72, 0.08, 0.52, '#f2c22e', 0, 0.42, 0); M3.b(g, 0.1, 0.12, 0.04, '#f2c22e', 0, 0.3, 0.26);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: W3.tex(PUFF_CANVAS), color: 0xfff0a0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.set(1.6, 1.6, 1); s.position.y = 0.4; g.add(s);
  },
  // de jump puzzle achter het dorpshuis
  kratten(g) { for (let i = 0; i < 6; i++) { const y = 0.15 + i * 0.3; M3.b(g, 1.3, 0.3, 1.3, i % 2 ? '#e8b030' : '#d89a20', (i % 2) * 0.06, y, 0); M3.b(g, 1.32, 0.06, 1.32, '#a86a10', (i % 2) * 0.06, y + 0.1, 0); } },
  kist(g) { M3.b(g, 1.6, 1.3, 1.5, '#8c5a32', 0, 0.65, 0); M3.b(g, 1.4, 1.3, 1.3, '#a8784a', 0.05, 1.95, 0.05); for (const y of [0.3, 1.0, 1.6, 2.3]) M3.b(g, 1.62, 0.08, 1.52, '#5a3720', 0, y, 0); },
  steiger(g) {
    for (const [x, z] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) M3.b(g, 0.08, 3.4, 0.08, '#9aa0aa', x, 1.7, z);
    for (const y of [1.1, 2.25]) { M3.b(g, 1.7, 0.06, 0.06, '#9aa0aa', 0, y, 0.8); M3.b(g, 1.7, 0.06, 0.06, '#9aa0aa', 0, y, -0.8); }
    M3.b(g, 1.8, 0.08, 1.8, '#b08a50', 0, 3.36, 0); M3.b(g, 0.3, 0.4, 0.3, '#f4f1ea', 0.5, 3.6, 0.5); M3.b(g, 0.04, 0.5, 0.04, '#8c5a32', 0.5, 3.9, 0.5);
  },
  paashaas(g) {
    for (const x of [-0.12, 0.12]) { M3.b(g, 0.1, 0.45, 0.06, '#f4f1ea', x, 0.33, 0); M3.b(g, 0.05, 0.32, 0.02, '#f0a0b8', x, 0.33, 0.035); }
    M3.b(g, 0.42, 0.08, 0.2, '#d8d0c0', 0, 0.08, 0);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: W3.tex(PUFF_CANVAS), color: 0xfff0a0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.set(1.2, 1.2, 1); s.position.y = 0.3; g.add(s);
  },
  hay(g) { M3.b(g, 1.2, 0.9, 0.9, '#d9b24e', 0, 0.45, 0); },
  bal(g) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), cmat('#f4f1ea')); s.position.y = 0.12; g.add(s); },
  brief(g) { M3.b(g, 0.3, 0.01, 0.2, '#f4f1ea', 0, 0.01, 0); },
};
const WALL_PROPS = new Set(['poster', 'klok', 'foto', 'jackpot', 'schoolbord', 'monitors']);

function propModel(p) {
  const fn = PROP3D[p.name];
  if (!fn) return null;
  const g = new THREE.Group();
  fn(g, p);
  return g;
}
