// Kaarten worden in code opgebouwd: eerst vlakken, dan gebouwen, dan decor.
function newMap(id, name, w, h, fill) {
  const tiles = [];
  for (let y = 0; y < h; y++) tiles.push(new Array(w).fill(fill));
  return { id, name, w, h, tiles, buildings: [], props: [], doors: [], encounters: false, inside: false };
}
function rect(m, x, y, w, h, t) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++)
    if (i >= 0 && j >= 0 && i < m.w && j < m.h) m.tiles[j][i] = t;
}
function setT(m, x, y, t) { if (m.tiles[y] && x >= 0 && x < m.w) m.tiles[y][x] = t; }
function building(m, b) {
  m.buildings.push(b);
  rect(m, b.x, b.y, b.w, b.h, 'block');
  setT(m, b.door, b.y + b.h - 1, 'mat_out');
  m.doors.push({ x: b.door, y: b.y + b.h - 1, id: b.id });
}
function prop(m, x, y, name, solid = true, id) { m.props.push({ x, y, name, solid, id }); }

const MAPS = {};

// ---------- Het dorp ----------
(function () {
  const m = newMap('dorp', 'Meedhuizen', 40, 32, 'grass');
  m.encounters = true;
  // bomenrand
  rect(m, 0, 0, 40, 1, 'tree'); rect(m, 0, 31, 40, 1, 'tree');
  rect(m, 0, 0, 1, 32, 'tree'); rect(m, 39, 0, 1, 32, 'tree');
  // noordelijk veld met hoog gras
  rect(m, 2, 1, 20, 4, 'tall');
  rect(m, 1, 5, 38, 1, 'hedge');
  setT(m, 11, 5, 'path'); setT(m, 12, 5, 'path');
  rect(m, 23, 1, 9, 4, 'grass');
  [[24, 2], [27, 1], [30, 3], [8, 2], [16, 3], [3, 4]].forEach(([x, y]) => setT(m, x, y, 'tree'));
  // achterpaadje tussen café en Henk
  rect(m, 11, 6, 2, 7, 'path');
  // stoep + Dorpsstraat
  rect(m, 1, 13, 38, 1, 'path');
  rect(m, 0, 14, 40, 2, 'road');
  rect(m, 1, 16, 38, 1, 'path');
  // tulpen van Henk
  rect(m, 19, 9, 2, 4, 'flower');
  rect(m, 21, 9, 1, 4, 'fence');
  // tuin van mevrouw Bakker
  rect(m, 8, 17, 4, 3, 'flower');
  rect(m, 8, 20, 4, 1, 'fence');
  // boerenerf
  rect(m, 24, 17, 2, 5, 'dirt');
  rect(m, 24, 22, 15, 3, 'dirt');
  // sloot en weiland
  rect(m, 1, 26, 38, 1, 'water');
  setT(m, 30, 26, 'bridge');
  rect(m, 1, 27, 38, 4, 'grass');
  rect(m, 3, 27, 14, 3, 'tall');
  rect(m, 20, 28, 9, 3, 'tall');
  rect(m, 32, 27, 6, 2, 'tall');
  [[18, 29], [31, 30], [2, 30]].forEach(([x, y]) => setT(m, x, y, 'tree'));
  [[2, 23], [22, 19], [23, 23], [38, 18], [21, 22]].forEach(([x, y]) => setT(m, x, y, 'tree'));

  building(m, { id: 'cafe', x: 3, y: 7, w: 8, h: 6, door: 6, label: 'DE GOUDEN KATER', wall: '#9c4530', roof: '#2a2e3a', lit: true, signCol: '#f2c22e', chimney: true });
  building(m, { id: 'henk', x: 13, y: 8, w: 6, h: 5, door: 15, wall: '#8e5a46', roof: '#4a3a36', doorCol: '#6b2a2a' });
  building(m, { id: 'dorpshuis', x: 22, y: 6, w: 9, h: 7, door: 26, label: 'DORPSHUIS', wall: '#a8553a', roof: '#33404f', shutter: '#2a4a7a' });
  building(m, { id: 'kerk', x: 33, y: 1, w: 6, h: 12, door: 35, kind: 'church', wall: '#9a4a34', roof: '#3a3f4a' });
  building(m, { id: 'bakker', x: 2, y: 17, w: 6, h: 5, door: 4, wall: '#b05a40', roof: '#7a2e22', chimney: true });
  building(m, { id: 'geelhuis', x: 14, y: 17, w: 6, h: 5, door: 16, wall: '#c9a24a', roof: '#3a3f4a', doorCol: '#2a4a7a', shutter: '#2a4a7a' });
  building(m, { id: 'boerderij', x: 26, y: 17, w: 8, h: 5, door: 29, label: 'JANSEN', wall: '#a24b34', roof: '#2f3340', chimney: true });
  building(m, { id: 'schuur', x: 35, y: 17, w: 4, h: 5, door: 36, wall: '#6e4a2c', roof: '#3a3a3a', doorCol: '#5a3720' });

  prop(m, 1, 13, 'plaatsbord', true, 'plaatsbord');
  prop(m, 38, 13, 'bord', true, 'bordoost');
  prop(m, 22, 16, 'bushalte', true, 'bushalte');
  prop(m, 33, 23, 'tractor', true, 'tractor');
  prop(m, 12, 26, 'fietsSloot', false, 'fiets');
  prop(m, 10, 18, 'sokkel', false, 'sokkel');
  prop(m, 2, 12, 'biervat', true);
  prop(m, 11, 12, 'kliko', true);
  prop(m, 37, 22, 'emmer', true);
  [[8, 13], [20, 13], [31, 13], [6, 16], [18, 16], [33, 16]].forEach(([x, y]) => prop(m, x, y, 'lamp', true));
  prop(m, 14, 13, 'bank', true, 'bank');
  [[6, 28], [14, 27], [25, 29], [35, 28]].forEach(([x, y], i) => prop(m, x, y, 'koe', true, 'koe' + i));
  // randen van de Dorpsstraat
  m.edges = [{ x: 0, y: 14 }, { x: 0, y: 15 }, { x: 39, y: 14 }, { x: 39, y: 15 }];
  MAPS.dorp = m;
})();

function interior(id, name, w, h, floor) {
  const m = newMap(id, name, w, h, floor);
  m.inside = true;
  rect(m, 0, 0, w, 2, 'wall');
  rect(m, 0, 0, 1, h, 'dark'); rect(m, w - 1, 0, 1, h, 'dark');
  rect(m, 0, h - 1, w, 1, 'dark');
  return m;
}

// ---------- De schuur ----------
(function () {
  const m = interior('schuur', 'Schuur van boer Jansen', 11, 9, 'straw');
  rect(m, 1, 2, 3, 2, 'hay'); rect(m, 8, 2, 2, 3, 'hay'); setT(m, 1, 6, 'hay'); setT(m, 9, 6, 'hay');
  setT(m, 5, 8, 'mat_out');
  m.doors.push({ x: 5, y: 8, id: 'uit_schuur' });
  prop(m, 6, 2, 'hark', true, 'hark');
  prop(m, 4, 2, 'emmer', true);
  MAPS.schuur = m;
})();

// ---------- Café De Gouden Kater ----------
(function () {
  const m = interior('cafe', 'Café De Gouden Kater', 13, 10, 'floor');
  rect(m, 1, 3, 7, 1, 'counter');
  setT(m, 8, 3, 'floor');
  [[9, 4], [11, 4], [9, 7], [3, 6]].forEach(([x, y]) => { setT(m, x, y, 'table'); setT(m, x - 1, y, 'chair'); setT(m, x + 1 < 12 ? x + 1 : x - 1, y, 'chair'); });
  setT(m, 6, 9, 'mat_out');
  m.doors.push({ x: 6, y: 9, id: 'uit_cafe' });
  prop(m, 3, 3, 'tap', true);
  prop(m, 6, 3, 'kaartjes', true, 'bonnenbak');
  prop(m, 2, 1, 'klok', true);
  prop(m, 10, 1, 'poster', true, 'cafeposter');
  prop(m, 1, 8, 'biervat', true);
  prop(m, 11, 8, 'piano', true, 'piano');
  MAPS.cafe = m;
})();

// ---------- Dorpshuis ----------
(function () {
  const m = interior('dorpshuis', 'Dorpshuis', 15, 11, 'floor');
  rect(m, 3, 2, 9, 2, 'stage');
  [[3, 6], [7, 6], [11, 6]].forEach(([x, y]) => { setT(m, x, y, 'table'); setT(m, x - 1, y, 'chair'); setT(m, x + 1, y, 'chair'); });
  rect(m, 2, 8, 3, 1, 'chair'); rect(m, 10, 8, 3, 1, 'chair');
  setT(m, 7, 10, 'mat_out');
  m.doors.push({ x: 7, y: 10, id: 'uit_dorpshuis' });
  prop(m, 2, 1, 'poster', true, 'klaverposter');
  prop(m, 12, 1, 'poster', true, 'prikbord');
  prop(m, 13, 3, 'biervat', true);
  MAPS.dorpshuis = m;
})();

// Extra tegels die pas hier bekend zijn
TILE_DEF.mat_out = { walk: true };
TILE_DRAW.mat_out = function (x, gx, gy) { TILE_DRAW.mat(x, gx, gy); };
PROP_DRAW.sokkel = function (x) { px(x, 4, 11, 8, 4, '#9a9aa2'); px(x, 4, 11, 8, 1, '#c4c4cc'); };

function tileAt(m, x, y) {
  if (x < 0 || y < 0 || x >= m.w || y >= m.h) return 'dark';
  return m.tiles[y][x];
}
