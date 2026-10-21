// Pixel art, all drawn in code. 16x16 tiles, 16x16 characters.
const TS = 16;
const SPR = {};

function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  return [c, x];
}
function px(x, X, Y, W, H, col) { x.fillStyle = col; x.fillRect(X, Y, W, H); }
function hash(a, b, s = 0) {
  let h = (a * 374761393 + b * 668265263 + s * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ---------- Tiles ----------
const TILE_DEF = {
  grass:   { walk: true },
  tall:    { walk: true },
  road:    { walk: true },
  path:    { walk: true },
  dirt:    { walk: true },
  water:   { walk: false, anim: true },
  bridge:  { walk: true },
  tree:    { walk: false },
  fence:   { walk: false },
  flower:  { walk: true },
  hedge:   { walk: false },
  block:   { walk: false, under: 'grass' },
  floor:   { walk: true },
  wall:    { walk: false },
  counter: { walk: false },
  table:   { walk: false },
  chair:   { walk: true },
  hay:     { walk: false },
  stage:   { walk: true },
  mat:     { walk: true },
  dark:    { walk: false },
  straw:   { walk: true },
};

function grassBase(x, gx, gy, base = '#5f9e3c') {
  px(x, 0, 0, 16, 16, base);
  for (let i = 0; i < 7; i++) {
    const a = hash(gx, gy, i), b = hash(gx, gy, i + 20);
    px(x, (a * 16) | 0, (b * 16) | 0, 1, 2, i % 2 ? '#4e8a30' : '#79b94c');
  }
}

const TILE_DRAW = {
  grass(x, gx, gy) { grassBase(x, gx, gy); },
  tall(x, gx, gy) {
    grassBase(x, gx, gy, '#4f8a31');
    for (let i = 0; i < 6; i++) {
      const bx = 1 + i * 2.6 | 0, by = 4 + (hash(gx, gy, i) * 6 | 0);
      px(x, bx, by, 1, 16 - by, '#3b7024');
      px(x, bx + 1, by + 2, 1, 14 - by, '#6fae43');
      px(x, bx, by - 1, 1, 1, '#9fd06a');
    }
  },
  road(x, gx, gy) {
    // Gronings klinkerwegje: rode bakstenen in keperverband
    px(x, 0, 0, 16, 16, '#6e3a2c');
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
      const off = (r + gy) % 2 ? 4 : 0;
      const bx = (c * 8 + off) % 16, by = r * 4;
      const t = hash(gx * 2 + c, gy * 4 + r);
      const col = t < .33 ? '#a35a42' : t < .66 ? '#9a503b' : '#ad654a';
      px(x, bx, by, 7, 3, col);
      if (bx + 7 > 16) px(x, 0, by, bx + 7 - 16, 3, col);
      px(x, bx, by, 7, 1, '#b97558');
    }
  },
  path(x, gx, gy) {
    px(x, 0, 0, 16, 16, '#c9b48a');
    for (let i = 0; i < 9; i++) px(x, hash(gx, gy, i) * 15 | 0, hash(gx, gy, i + 9) * 15 | 0, 2, 1, i % 2 ? '#b09a70' : '#ddca9f');
  },
  dirt(x, gx, gy) {
    px(x, 0, 0, 16, 16, '#9a7a4e');
    for (let i = 0; i < 8; i++) px(x, hash(gx, gy, i) * 15 | 0, hash(gx, gy, i + 9) * 15 | 0, 2, 1, i % 2 ? '#7f6340' : '#b39062');
  },
  water(x, gx, gy, f) {
    px(x, 0, 0, 16, 16, '#356aa6');
    px(x, 0, 0, 16, 2, '#2a5488');
    for (let i = 0; i < 3; i++) {
      const wx = ((hash(gx, gy, i) * 12 | 0) + f * 2) % 14, wy = 4 + i * 4;
      px(x, wx, wy, 3, 1, '#6aa0d8');
    }
  },
  bridge(x) {
    px(x, 0, 0, 16, 16, '#356aa6');
    for (let i = 0; i < 4; i++) { px(x, 1, i * 4, 14, 3, '#9a6a3c'); px(x, 1, i * 4, 14, 1, '#b8844f'); }
    px(x, 0, 0, 1, 16, '#5a3a1c'); px(x, 15, 0, 1, 16, '#5a3a1c');
  },
  tree(x, gx, gy) {
    grassBase(x, gx, gy);
    px(x, 3, 13, 10, 2, 'rgba(0,0,0,.25)');
    px(x, 7, 10, 2, 5, '#5b3a1e');
    px(x, 2, 2, 12, 9, '#2f6a2a'); px(x, 3, 1, 10, 11, '#2f6a2a'); px(x, 1, 4, 14, 5, '#2f6a2a');
    px(x, 4, 2, 6, 4, '#3f8a36'); px(x, 3, 4, 3, 3, '#3f8a36'); px(x, 5, 2, 3, 2, '#5aa84a');
    px(x, 10, 7, 3, 3, '#24521f');
  },
  fence(x, gx, gy) {
    grassBase(x, gx, gy);
    px(x, 0, 6, 16, 2, '#e9e1cc'); px(x, 0, 10, 16, 2, '#e9e1cc');
    px(x, 2, 4, 2, 10, '#f4efe0'); px(x, 11, 4, 2, 10, '#f4efe0');
    px(x, 2, 13, 2, 1, '#9c937c'); px(x, 11, 13, 2, 1, '#9c937c');
  },
  flower(x, gx, gy) {
    grassBase(x, gx, gy);
    const cols = ['#e8433a', '#f2c22e', '#e86fb0', '#f4f1ea'];
    for (let i = 0; i < 5; i++) {
      const fx = 1 + (hash(gx, gy, i) * 13 | 0), fy = 2 + (hash(gx, gy, i + 5) * 11 | 0);
      px(x, fx, fy + 2, 1, 3, '#2f6a2a');
      px(x, fx - 1, fy, 3, 2, cols[(hash(gx, gy, i + 9) * 4) | 0]);
    }
  },
  hedge(x, gx, gy) {
    px(x, 0, 0, 16, 16, '#2c5e27');
    for (let i = 0; i < 10; i++) px(x, hash(gx, gy, i) * 14 | 0, hash(gx, gy, i + 10) * 14 | 0, 2, 2, i % 2 ? '#3f7d35' : '#214a1d');
    px(x, 0, 14, 16, 2, '#1c3d18');
  },
  floor(x, gx, gy) {
    px(x, 0, 0, 16, 16, '#9a6b42');
    for (let i = 0; i < 4; i++) { px(x, 0, i * 4 + 3, 16, 1, '#7a5132'); px(x, ((gx * 7 + i * 5) % 16), i * 4, 1, 3, '#7a5132'); }
  },
  wall(x, gx, gy) {
    px(x, 0, 0, 16, 16, '#d8c7a0');
    for (let i = 0; i < 4; i++) px(x, i * 4 + 1, 0, 1, 10, '#c4b089');
    px(x, 0, 10, 16, 6, '#6e4a2c'); px(x, 0, 10, 16, 1, '#8c6340'); px(x, 0, 15, 16, 1, '#4a301b');
  },
  counter(x) {
    px(x, 0, 0, 16, 16, '#5a3720');
    px(x, 0, 0, 16, 4, '#8c5a32'); px(x, 0, 0, 16, 1, '#b07a48');
    for (let i = 0; i < 3; i++) px(x, 2 + i * 5, 6, 3, 8, '#4a2c18');
  },
  table(x, gx, gy) {
    TILE_DRAW.floor(x, gx, gy);
    px(x, 2, 12, 12, 2, 'rgba(0,0,0,.25)');
    px(x, 2, 3, 12, 8, '#6e4424'); px(x, 2, 3, 12, 2, '#9c6838');
    px(x, 3, 11, 2, 3, '#4a2c18'); px(x, 11, 11, 2, 3, '#4a2c18');
    px(x, 5, 4, 2, 3, '#f2c22e'); px(x, 5, 4, 2, 1, '#fff'); // biertje
  },
  chair(x, gx, gy) {
    TILE_DRAW.floor(x, gx, gy);
    px(x, 4, 4, 8, 3, '#5a3720'); px(x, 4, 7, 8, 4, '#7a4c2a'); px(x, 4, 11, 1, 3, '#4a2c18'); px(x, 11, 11, 1, 3, '#4a2c18');
  },
  hay(x) {
    px(x, 0, 0, 16, 16, '#7a5a2e');
    px(x, 1, 1, 14, 14, '#d9b24e');
    for (let i = 0; i < 6; i++) px(x, 2 + i * 2, 2, 1, 12, '#c09636');
    px(x, 1, 5, 14, 1, '#8c5a20'); px(x, 1, 10, 14, 1, '#8c5a20');
  },
  straw(x, gx, gy) {
    px(x, 0, 0, 16, 16, '#8a6a3c');
    for (let i = 0; i < 10; i++) px(x, hash(gx, gy, i) * 14 | 0, hash(gx, gy, i + 3) * 15 | 0, 3, 1, i % 2 ? '#d9b24e' : '#b8913f');
  },
  stage(x, gx) {
    px(x, 0, 0, 16, 16, '#6b2a2a');
    for (let i = 0; i < 4; i++) px(x, 0, i * 4 + 3, 16, 1, '#4e1c1c');
    px(x, (gx * 5) % 16, 0, 1, 16, '#4e1c1c');
  },
  mat(x, gx, gy) {
    TILE_DRAW.floor(x, gx, gy);
    px(x, 1, 3, 14, 10, '#3a5a3a'); px(x, 2, 4, 12, 8, '#4c7a4c');
  },
  dark(x) { px(x, 0, 0, 16, 16, '#0d0b12'); },
};

const tileCache = {};
function getTile(type, gx, gy, frame = 0) {
  const def = TILE_DEF[type] || {};
  const v = (gx * 31 + gy * 17) % 4; // 4 variaties per tile-soort
  const f = def.anim ? frame : 0;
  const key = type + v + '_' + f;
  if (!tileCache[key]) {
    const [c, x] = mk(TS, TS);
    (TILE_DRAW[type] || TILE_DRAW.dark)(x, v, v * 3 + 1, f);
    tileCache[key] = c;
  }
  return tileCache[key];
}

// ---------- Characters ----------
// look: { skin, hair, style, shirt, pants, extra: [] }
function drawCharInto(x, L, dir, frame) {
  const O = '#1b1420';
  const ex = L.extra || [];
  // legs
  const lA = frame === 1 ? -1 : 0, lB = frame === 2 ? -1 : 0;
  px(x, 4, 12, 8, 4, O);
  px(x, 5, 12 + lA, 2, 3, L.pants); px(x, 9, 12 + lB, 2, 3, L.pants);
  px(x, 5, 15 + lA, 2, 1, '#2a2020'); px(x, 9, 15 + lB, 2, 1, '#2a2020');
  // body
  px(x, 3, 8, 10, 6, O);
  px(x, 4, 9, 8, 4, L.shirt);
  px(x, 4, 9, 8, 1, shade(L.shirt, 30));
  if (ex.includes('overall')) { px(x, 5, 9, 6, 4, '#3d5fa0'); px(x, 5, 9, 1, 2, '#3d5fa0'); }
  if (ex.includes('apron')) px(x, 5, 10, 6, 3, '#f1ece0');
  if (ex.includes('belly')) { px(x, 3, 10, 10, 3, L.shirt); px(x, 2, 10, 1, 3, O); px(x, 13, 10, 1, 3, O); }
  // arms
  const swing = frame === 0 ? 0 : (frame === 1 ? 1 : -1);
  if (dir === 'down' || dir === 'up') {
    px(x, 2, 9 + swing, 2, 4, O); px(x, 12, 9 - swing, 2, 4, O);
    px(x, 2, 9 + swing, 1, 3, L.shirt); px(x, 13, 9 - swing, 1, 3, L.shirt);
    px(x, 2, 12 + swing, 1, 1, L.skin); px(x, 13, 12 - swing, 1, 1, L.skin);
  } else {
    const ax = dir === 'left' ? 7 : 8;
    px(x, ax, 9 + swing, 2, 4, shade(L.shirt, -25)); px(x, ax, 12 + swing, 2, 1, L.skin);
  }
  // head
  px(x, 3, 0, 10, 9, O);
  px(x, 4, 1, 8, 7, L.skin);
  const H = L.hair;
  const st = L.style || 'short';
  if (dir === 'up') {
    if (st !== 'bald') px(x, 4, 1, 8, st === 'long' ? 7 : 6, H);
    else px(x, 4, 1, 8, 2, shade(L.skin, -20));
  } else {
    // haar boven
    if (st === 'short' || st === 'messy' || st === 'long' || st === 'bun' || st === 'curly') {
      px(x, 4, 1, 8, 2, H);
      if (dir === 'down') { px(x, 4, 3, 1, 1, H); px(x, 11, 3, 1, 1, H); }
      if (dir === 'left') px(x, 9, 3, 3, 2, H);
      if (dir === 'right') px(x, 4, 3, 3, 2, H);
    }
    if (st === 'messy') { px(x, 5, 0, 1, 1, H); px(x, 8, 0, 2, 1, H); px(x, 11, 1, 1, 1, O); }
    if (st === 'curly') { px(x, 3, 1, 1, 3, H); px(x, 12, 1, 1, 3, H); px(x, 5, 0, 6, 1, H); }
    if (st === 'long') { if (dir !== 'right') px(x, 4, 3, 1, 5, H); if (dir !== 'left') px(x, 11, 3, 1, 5, H); }
    if (st === 'bun') { px(x, 6, 0, 4, 1, H); px(x, 7, 0, 2, 1, shade(H, 20)); }
    if (st === 'cap') {
      px(x, 4, 1, 8, 2, L.cap || '#c23b2e');
      if (dir === 'down') px(x, 3, 3, 10, 1, shade(L.cap || '#c23b2e', -30));
      if (dir === 'left') px(x, 2, 3, 5, 1, shade(L.cap || '#c23b2e', -30));
      if (dir === 'right') px(x, 9, 3, 5, 1, shade(L.cap || '#c23b2e', -30));
    }
    if (st === 'bald') px(x, 4, 1, 8, 1, shade(L.skin, 15));
    // gezicht
    const E = '#1b1420';
    if (dir === 'down') {
      px(x, 6, 4, 1, 2, E); px(x, 9, 4, 1, 2, E);
      if (ex.includes('tired')) { px(x, 6, 6, 1, 1, '#a07090'); px(x, 9, 6, 1, 1, '#a07090'); }
      px(x, 7, 7, 2, 1, shade(L.skin, -40));
      if (ex.includes('glasses')) { px(x, 5, 4, 3, 2, '#2a2a3a'); px(x, 8, 4, 3, 2, '#2a2a3a'); px(x, 6, 4, 1, 1, '#9ad'); px(x, 9, 4, 1, 1, '#9ad'); }
      if (ex.includes('beard')) px(x, 4, 6, 8, 2, H);
      if (ex.includes('mustache')) px(x, 6, 6, 4, 1, H);
      if (ex.includes('blush')) { px(x, 5, 6, 1, 1, '#e88'); px(x, 10, 6, 1, 1, '#e88'); }
    } else {
      const fx = dir === 'left' ? 5 : 10;
      px(x, fx, 4, 1, 2, E);
      if (ex.includes('glasses')) px(x, dir === 'left' ? 4 : 9, 4, 3, 2, '#2a2a3a');
      if (ex.includes('beard')) px(x, dir === 'left' ? 4 : 7, 6, 5, 2, H);
      if (ex.includes('mustache')) px(x, dir === 'left' ? 4 : 9, 6, 3, 1, H);
    }
  }
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

const charCache = {};
function getChar(look, dir, frame) {
  const key = JSON.stringify(look) + dir + frame;
  if (!charCache[key]) {
    const [c, x] = mk(16, 16);
    drawCharInto(x, look, dir, frame);
    charCache[key] = c;
  }
  return charCache[key];
}

// ---------- Props (decor objects, drawn on top of tiles) ----------
const PROP_DRAW = {
  kabouter(x) {
    px(x, 5, 13, 6, 2, 'rgba(0,0,0,.3)');
    px(x, 6, 1, 4, 1, '#c23b2e'); px(x, 5, 2, 6, 3, '#c23b2e');
    px(x, 6, 5, 4, 3, '#f0c9a0'); px(x, 6, 6, 4, 3, '#f4f1ea');
    px(x, 5, 9, 6, 4, '#2f6aa6'); px(x, 5, 13, 2, 1, '#3a2a1a'); px(x, 9, 13, 2, 1, '#3a2a1a');
  },
  fietsSloot(x) {
    px(x, 2, 7, 5, 5, '#222'); px(x, 3, 8, 3, 3, '#356aa6');
    px(x, 10, 8, 4, 4, '#222'); px(x, 11, 9, 2, 2, '#356aa6');
    px(x, 5, 7, 7, 1, '#2a8f5a'); px(x, 7, 5, 1, 3, '#2a8f5a'); px(x, 6, 4, 3, 1, '#333');
  },
  fiets(x) {
    px(x, 1, 9, 5, 5, '#222'); px(x, 2, 10, 3, 3, '#9a7a4e');
    px(x, 10, 9, 5, 5, '#222'); px(x, 11, 10, 3, 3, '#9a7a4e');
    px(x, 4, 8, 9, 1, '#2a8f5a'); px(x, 6, 6, 1, 3, '#2a8f5a'); px(x, 5, 5, 3, 1, '#333'); px(x, 11, 5, 3, 1, '#333');
  },
  bushalte(x) {
    px(x, 0, 2, 16, 2, '#3a4a6a'); px(x, 1, 4, 1, 11, '#5a6a8a'); px(x, 14, 4, 1, 11, '#5a6a8a');
    px(x, 2, 4, 12, 7, 'rgba(180,210,240,.45)'); px(x, 3, 11, 10, 2, '#7a5a3a');
  },
  bord(x) {
    px(x, 7, 6, 2, 9, '#6e6e78');
    px(x, 1, 1, 14, 6, '#f4f1ea'); px(x, 2, 2, 12, 4, '#2a5aa0');
    px(x, 3, 3, 10, 2, '#f4f1ea');
  },
  plaatsbord(x) {
    px(x, 2, 7, 1, 8, '#6e6e78'); px(x, 13, 7, 1, 8, '#6e6e78');
    px(x, 0, 1, 16, 7, '#f2c22e'); px(x, 1, 2, 14, 5, '#1b1420'); px(x, 2, 3, 12, 3, '#f2c22e');
    for (let i = 0; i < 5; i++) px(x, 3 + i * 2, 4, 1, 1, '#1b1420');
  },
  lamp(x) { px(x, 7, 3, 2, 12, '#3a3a44'); px(x, 5, 1, 6, 3, '#3a3a44'); px(x, 6, 3, 4, 1, '#ffe9a0'); },
  bank(x) { px(x, 1, 7, 14, 2, '#8c5a32'); px(x, 1, 10, 14, 2, '#8c5a32'); px(x, 2, 12, 1, 3, '#333'); px(x, 13, 12, 1, 3, '#333'); },
  tractor(x) {
    px(x, 1, 6, 12, 6, '#2e8b3a'); px(x, 8, 1, 6, 6, '#2e8b3a'); px(x, 9, 2, 4, 3, '#a8d0e8');
    px(x, 0, 9, 7, 7, '#1b1b1b'); px(x, 2, 11, 3, 3, '#f2c22e');
    px(x, 11, 11, 5, 5, '#1b1b1b'); px(x, 12, 12, 3, 3, '#f2c22e'); px(x, 3, 2, 1, 4, '#555');
  },
  koe(x) { // Groninger blaarkop: rood met witte kop
    px(x, 2, 12, 12, 2, 'rgba(0,0,0,.25)');
    px(x, 2, 5, 10, 6, '#8a2a20'); px(x, 5, 6, 3, 3, '#f4f1ea');
    px(x, 11, 4, 4, 5, '#f4f1ea'); px(x, 12, 5, 1, 1, '#1b1420'); px(x, 11, 3, 1, 1, '#ddd'); px(x, 14, 3, 1, 1, '#ddd');
    px(x, 13, 8, 2, 1, '#e8a0a0');
    px(x, 3, 11, 1, 3, '#5a1a14'); px(x, 5, 11, 1, 3, '#5a1a14'); px(x, 9, 11, 1, 3, '#5a1a14'); px(x, 11, 11, 1, 3, '#5a1a14');
  },
  kliko(x) { px(x, 4, 3, 8, 11, '#2a6a3a'); px(x, 3, 2, 10, 2, '#1f5a2c'); px(x, 5, 14, 2, 1, '#111'); px(x, 9, 14, 2, 1, '#111'); },
  biervat(x) { px(x, 3, 3, 10, 12, '#8c5a32'); px(x, 3, 5, 10, 1, '#555'); px(x, 3, 12, 10, 1, '#555'); px(x, 4, 3, 2, 12, '#a87040'); },
  tap(x) { px(x, 6, 0, 4, 8, '#c0c0c8'); px(x, 7, 2, 2, 2, '#f2c22e'); px(x, 5, 8, 6, 2, '#888'); },
  piano(x) { px(x, 0, 2, 16, 12, '#2a1a12'); px(x, 1, 8, 14, 3, '#f4f1ea'); for (let i = 0; i < 5; i++) px(x, 2 + i * 3, 8, 1, 2, '#111'); },
  klok(x) { px(x, 4, 2, 8, 8, '#f4f1ea'); px(x, 7, 4, 1, 3, '#111'); px(x, 7, 6, 3, 1, '#111'); px(x, 3, 1, 10, 1, '#5a3720'); },
  poster(x) { px(x, 3, 1, 10, 8, '#f2c22e'); px(x, 4, 2, 8, 2, '#c23b2e'); px(x, 4, 5, 8, 1, '#333'); px(x, 4, 7, 6, 1, '#333'); },
  kaartjes(x) { px(x, 4, 5, 3, 4, '#fff'); px(x, 8, 6, 3, 4, '#fff'); px(x, 5, 6, 1, 1, '#c23b2e'); px(x, 9, 7, 1, 1, '#111'); },
  emmer(x) { px(x, 5, 6, 6, 8, '#7a8a9a'); px(x, 5, 6, 6, 1, '#aab'); px(x, 6, 3, 4, 1, '#555'); },
  hark(x) { px(x, 7, 1, 1, 12, '#8c5a32'); px(x, 4, 12, 7, 1, '#777'); for (let i = 0; i < 4; i++) px(x, 4 + i * 2, 13, 1, 2, '#777'); },
};
const propCache = {};
function getProp(name) {
  if (!propCache[name]) {
    const [c, x] = mk(16, 16);
    (PROP_DRAW[name] || (() => {}))(x);
    propCache[name] = c;
  }
  return propCache[name];
}

// ---------- Buildings ----------
// b: { x, y, w, h, wall, roof, door, label, kind }
function renderBuilding(b) {
  const W = b.w * TS, H = b.h * TS;
  const [c, x] = mk(W, H);
  const roofH = b.kind === 'church' ? Math.floor(H * 0.55) : Math.floor(H * 0.45);
  const wallTop = roofH;
  const wall = b.wall || '#a24b34';
  // muur van baksteen
  px(x, 0, wallTop, W, H - wallTop, wall);
  for (let r = 0; r < (H - wallTop) / 3; r++) {
    const yy = wallTop + r * 3;
    px(x, 0, yy + 2, W, 1, shade(wall, -28));
    for (let cc = 0; cc < W / 6 + 1; cc++) px(x, cc * 6 + (r % 2 ? 3 : 0), yy, 1, 2, shade(wall, -20));
  }
  px(x, 0, H - 2, W, 2, '#3a2a24');
  // dak
  const roof = b.roof || '#2f3340';
  if (b.kind === 'church') {
    px(x, 2, wallTop - roofH * 0.55, W - 4, roofH * 0.55, roof);
    const tw = 18, tx = (W - tw) / 2;
    px(x, tx, 6, tw, wallTop, shade(wall, -10));
    for (let i = 0; i < 6; i++) px(x, tx + 9 - i * 1.5 - 1, i * 1, i * 3 + 2, 1, roof);
    px(x, tx - 2, 4, tw + 4, 4, roof);
    px(x, W / 2 - 1, 0, 2, 5, '#f2c22e'); px(x, W / 2 - 3, 1, 6, 1, '#f2c22e');
    px(x, W / 2 - 3, 14, 6, 8, '#1b1420'); px(x, W / 2 - 2, 15, 4, 6, '#3a3a4a');
    // klok
    px(x, W / 2 - 4, 26, 8, 8, '#f4f1ea'); px(x, W / 2, 27, 1, 4, '#111'); px(x, W / 2, 30, 3, 1, '#111');
  } else {
    for (let r = 0; r < roofH; r++) {
      const inset = Math.max(0, Math.floor((roofH - r) * 0.25));
      px(x, inset, r, W - inset * 2, 1, r % 3 === 0 ? shade(roof, -18) : roof);
    }
    for (let i = 4; i < W; i += 6) px(x, i, 2, 1, roofH - 2, shade(roof, 12));
    px(x, 0, roofH - 2, W, 2, shade(roof, -35));
    if (b.chimney) { px(x, W - 18, 0, 6, 8, shade(wall, -10)); px(x, W - 19, 0, 8, 2, '#3a2a24'); }
  }
  // ramen (wit kozijn, groene luiken)
  const doorX = (b.door - b.x) * TS;
  const winY = wallTop + 5;
  for (let wx = 6; wx + 12 < W; wx += 22) {
    if (Math.abs(wx + 6 - (doorX + 8)) < 14) continue;
    px(x, wx - 3, winY, 3, 11, b.shutter || '#2e6b3e');
    px(x, wx + 12, winY, 3, 11, b.shutter || '#2e6b3e');
    px(x, wx, winY, 12, 11, '#f4f1ea');
    px(x, wx + 1, winY + 1, 10, 9, b.lit ? '#f7dc8a' : '#5e7fa6');
    px(x, wx + 5, winY + 1, 2, 9, '#f4f1ea'); px(x, wx + 1, winY + 5, 10, 1, '#f4f1ea');
  }
  // deur
  const dy = H - 22;
  px(x, doorX + 2, dy, 12, 22, '#f4f1ea');
  px(x, doorX + 3, dy + 1, 10, 21, b.doorCol || '#2e6b3e');
  px(x, doorX + 4, dy + 3, 8, 5, b.lit ? '#f7dc8a' : '#9ab4d0');
  px(x, doorX + 10, dy + 12, 1, 2, '#f2c22e');
  // uithangbord
  if (b.label) {
    x.font = '8px Silkscreen, monospace';
    x.textBaseline = 'top';
    const tw = Math.ceil(x.measureText(b.label).width) + 6;
    const lx = Math.round((W - tw) / 2), ly = wallTop - 11;
    px(x, lx, ly, tw, 11, '#1b1420');
    px(x, lx + 1, ly + 1, tw - 2, 9, b.signCol || '#f4f1ea');
    x.fillStyle = '#1b1420';
    x.fillText(b.label, lx + 3, ly + 1);
  }
  return c;
}
