// Uitbreiding van de wereld: Meedhuizen echter (kerk op de wierde met beuken, school, kanaal), binnenruimtes voor alle huizen
// en het paleis van Daniël. Delfzijl staat in delfzijl.js. Gedeeld door de 2D- en 3D-versie.

// ---------- nieuwe tegels ----------
Object.assign(TILE_DEF, {
  wierde: { walk: true }, beuk: { walk: false }, marmer: { walk: true }, loper: { walk: true },
  kade: { walk: true }, dijk: { walk: true }, zee: { walk: false, anim: true }, steen: { walk: true },
});
Object.assign(TILE_DRAW, {
  wierde(x, gx, gy) { grassBase(x, gx, gy, '#6aa846'); px(x, 0, 15, 16, 1, '#4e8a30'); },
  beuk(x, gx, gy) {
    grassBase(x, gx, gy, '#6aa846');
    px(x, 2, 14, 12, 2, 'rgba(0,0,0,.25)'); px(x, 7, 8, 2, 7, '#6a5a4a');
    px(x, 1, 0, 14, 10, '#3a6a24'); px(x, 2, 0, 12, 11, '#3a6a24'); px(x, 3, 1, 6, 4, '#5a8a34'); px(x, 10, 5, 4, 3, '#2a5a1c');
  },
  marmer(x, gx, gy) { px(x, 0, 0, 16, 16, '#ece8e0'); px(x, 0, 0, 16, 1, '#d8d0c4'); px(x, 0, 0, 1, 16, '#d8d0c4'); for (let i = 0; i < 3; i++) px(x, (gx * 5 + i * 6) % 15, (gy * 3 + i * 5) % 15, 3, 1, '#c8c0b8'); },
  loper(x) { px(x, 0, 0, 16, 16, '#a81e28'); px(x, 0, 0, 2, 16, '#e0b030'); px(x, 14, 0, 2, 16, '#e0b030'); for (let i = 0; i < 4; i++) px(x, 7, i * 4 + 1, 2, 2, '#c83a3a'); },
  kade(x, gx, gy) { px(x, 0, 0, 16, 16, '#8a8a90'); for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) px(x, c * 8 + (r % 2 ? 4 : 0), r * 4, 7, 3, hash(gx + c, gy + r) < 0.5 ? '#9a9aa2' : '#7a7a82'); },
  dijk(x, gx, gy) { grassBase(x, gx, gy, '#7ab04a'); for (let i = 0; i < 3; i++) px(x, i * 5 + 1, 12, 3, 1, '#6a9a3a'); },
  zee(x, gx, gy, f) { px(x, 0, 0, 16, 16, '#3a5a7a'); for (let i = 0; i < 3; i++) px(x, ((hash(gx, gy, i) * 12 | 0) + f * 3) % 14, 3 + i * 5, 4, 1, '#7aa0c0'); },
  steen(x, gx, gy) { px(x, 0, 0, 16, 16, '#b8b0a4'); px(x, 0, 7, 16, 1, '#9a9288'); px(x, 7, 0, 1, 7, '#9a9288'); px(x, 3, 8, 1, 8, '#9a9288'); },
});

// ---------- nieuwe meubels en decor (2D-tekeningen; de 3D-versie heeft eigen modellen) ----------
Object.assign(PROP_DRAW, {
  sofa(x) { px(x, 1, 5, 14, 9, '#1b1420'); px(x, 2, 6, 12, 4, '#7a3a5a'); px(x, 2, 10, 12, 3, '#9a4a6a'); px(x, 1, 6, 2, 8, '#6a2a4a'); px(x, 13, 6, 2, 8, '#6a2a4a'); },
  tv(x) { px(x, 2, 3, 12, 8, '#1b1420'); px(x, 3, 4, 10, 6, '#3a7ac8'); px(x, 5, 6, 3, 2, '#7ad46a'); px(x, 6, 11, 4, 3, '#3a3a44'); },
  plant(x) { px(x, 5, 10, 6, 5, '#b05a30'); px(x, 7, 3, 2, 8, '#2e7a3a'); px(x, 3, 4, 4, 3, '#3f8a36'); px(x, 9, 2, 4, 4, '#3f8a36'); px(x, 4, 7, 3, 2, '#2e6a2a'); },
  bed(x) { px(x, 2, 1, 12, 14, '#5a3720'); px(x, 3, 2, 10, 3, '#f4f1ea'); px(x, 3, 5, 10, 9, '#3a6ac8'); },
  boekenkast(x) { px(x, 1, 0, 14, 16, '#5a3720'); for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) px(x, 2 + i * 2, 1 + r * 5, 2, 4, ['#c23b2e', '#2e7a3a', '#3a6aa6', '#f2c22e'][(i + r) % 4]); },
  kerkbank(x) { px(x, 0, 5, 16, 3, '#6e4424'); px(x, 0, 8, 16, 4, '#8c5a32'); px(x, 1, 12, 2, 3, '#4a2c18'); px(x, 13, 12, 2, 3, '#4a2c18'); },
  orgel(x) { px(x, 1, 2, 14, 13, '#5a3720'); for (let i = 0; i < 6; i++) px(x, 2 + i * 2, 0, 1, 8 - (i % 3), '#c0c0c8'); px(x, 2, 10, 12, 2, '#f4f1ea'); },
  schoolbord(x) { px(x, 1, 2, 14, 9, '#5a3720'); px(x, 2, 3, 12, 7, '#2a4a3a'); px(x, 3, 5, 6, 1, '#f4f1ea'); px(x, 3, 7, 8, 1, '#f4f1ea'); },
  aanrecht(x) { px(x, 0, 4, 16, 11, '#d8d8e0'); px(x, 0, 4, 16, 2, '#9a9aa2'); px(x, 6, 6, 4, 2, '#5a8ab0'); px(x, 2, 9, 4, 5, '#c8c8d0'); px(x, 10, 9, 4, 5, '#c8c8d0'); },
  kaars(x) { px(x, 7, 6, 2, 8, '#f4f1ea'); px(x, 7, 3, 2, 3, '#ffb03a'); px(x, 6, 13, 4, 2, '#e0b030'); },
  pilaar(x) { px(x, 3, 0, 10, 2, '#e0b030'); px(x, 4, 2, 8, 12, '#f4efe0'); px(x, 6, 2, 1, 12, '#d8d0c0'); px(x, 3, 14, 10, 2, '#e0b030'); },
  fontein(x) { px(x, 1, 8, 14, 6, '#c8c0b8'); px(x, 2, 9, 12, 3, '#5a9ad0'); px(x, 7, 2, 2, 7, '#c8c0b8'); px(x, 6, 1, 4, 2, '#8ac0f0'); },
  monitors(x) { for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { px(x, c * 4, r * 4, 4, 4, '#1b1420'); px(x, c * 4 + 1, r * 4 + 1, 2, 2, (r + c) % 2 ? '#3a8a3a' : '#7a5a3a'); } },
  bureau(x) { px(x, 0, 5, 16, 3, '#2a2a30'); px(x, 1, 8, 2, 7, '#1b1b1f'); px(x, 13, 8, 2, 7, '#1b1b1f'); px(x, 5, 3, 6, 2, '#3a3a44'); px(x, 6, 4, 4, 1, '#7ad46a'); },
  gamestoel(x) { px(x, 4, 0, 8, 10, '#c23b2e'); px(x, 5, 1, 6, 8, '#1b1420'); px(x, 4, 10, 8, 3, '#c23b2e'); px(x, 7, 13, 2, 3, '#555'); },
  aquarium(x) { px(x, 0, 2, 16, 12, '#1b1420'); px(x, 1, 3, 14, 10, '#3a8ac8'); px(x, 4, 6, 3, 2, '#f2a22e'); px(x, 10, 9, 3, 2, '#e8433a'); px(x, 1, 11, 14, 2, '#c8b080'); },
  schip(x) { px(x, 0, 8, 16, 5, '#1b2a4a'); px(x, 1, 8, 14, 1, '#c23b2e'); px(x, 9, 3, 6, 5, '#f4f1ea'); px(x, 10, 4, 4, 2, '#5a8ab0'); px(x, 3, 5, 5, 3, '#e8833a'); },
  kraan(x) { px(x, 6, 2, 3, 14, '#e8b030'); px(x, 2, 2, 13, 2, '#e8b030'); px(x, 13, 4, 1, 6, '#333'); px(x, 5, 13, 5, 3, '#555'); },
  maigret(x) { px(x, 4, 12, 8, 4, '#8a8a90'); px(x, 6, 3, 4, 9, '#3a3a2a'); px(x, 6, 0, 4, 3, '#2a2a20'); px(x, 5, 2, 6, 1, '#2a2a20'); px(x, 9, 5, 2, 1, '#6a4a2a'); },
  schoorsteen(x) { px(x, 5, 0, 6, 16, '#c8c0b8'); px(x, 5, 2, 6, 2, '#c23b2e'); px(x, 5, 7, 6, 2, '#c23b2e'); px(x, 4, 14, 8, 2, '#8a8a90'); },
  fabriek(x) { px(x, 0, 4, 16, 12, '#8a8a90'); px(x, 2, 7, 3, 3, '#5a8ab0'); px(x, 8, 7, 3, 3, '#5a8ab0'); px(x, 12, 0, 2, 6, '#9a9aa2'); },
  zeehond(x) { px(x, 2, 8, 12, 6, '#8a8a92'); px(x, 10, 5, 5, 5, '#8a8a92'); px(x, 12, 6, 1, 1, '#1b1420'); px(x, 1, 12, 3, 2, '#6a6a72'); },
  bordje(x) { px(x, 7, 7, 2, 8, '#6e4a2c'); px(x, 2, 2, 12, 6, '#f4f1ea'); px(x, 3, 3, 10, 4, '#2e6a3a'); },
});

// ---------- Meedhuizen echter maken ----------
(function () {
  const m = MAPS.dorp;
  // de kerk staat op een wierde met hoge beuken eromheen
  rect(m, 31, 1, 2, 11, 'wierde');
  [[31, 2], [31, 5], [31, 8], [32, 11], [30, 3]].forEach(([x, y]) => setT(m, x, y, 'beuk'));
  // het Afwateringskanaal van Duurswold is breder dan een sloot, met een echte brug
  rect(m, 1, 27, 38, 1, 'water');
  setT(m, 30, 26, 'bridge'); setT(m, 30, 27, 'bridge');
  const koe = m.props.find((p) => p.id === 'koe1'); if (koe) koe.y = 29;
  prop(m, 26, 25, 'bordje', true, 'kanaalbord');
  // de school uit 1936 aan de noordkant
  building(m, { id: 'school', x: 14, y: 1, w: 6, h: 4, door: 16, label: 'SCHOOL', wall: '#a8553a', roof: '#3a3f4a', shutter: '#2a4a7a' });
  setT(m, 16, 5, 'path');
  // de boerderij van Jansen is een echte Oldambtster boerderij
  const boer = m.buildings.find((b) => b.id === 'boerderij'); if (boer) boer.kind = 'oldambt';
  // de Meedhuizerweg loopt naar het noorden, richting Delfzijl
  rect(m, 11, 0, 2, 5, 'road');
  m.doors.push({ x: 11, y: 0, id: 'naar_delfzijl' }, { x: 12, y: 0, id: 'naar_delfzijl' });
  prop(m, 13, 2, 'bord', true, 'borddelfzijl');
  // meer bankjes
  prop(m, 24, 13, 'bank', true, 'bank');
  prop(m, 20, 25, 'bank', true, 'bank');
})();
// bankjes elders
prop(MAPS.oost, 16, 12, 'bank', true, 'bank');

// ---------- binnenruimtes voor alle huizen ----------
function house(id, name, w, h, floor, door, furn) {
  const m = interior(id, name, w, h, floor);
  setT(m, door, h - 1, 'mat_out');
  m.doors.push({ x: door, y: h - 1, id: 'uit_' + id });
  for (const [x, y, n, solid, pid] of furn) prop(m, x, y, n, solid !== false, pid);
  MAPS[id] = m;
  return m;
}
house('huis_henk', 'Huis van Henk', 10, 8, 'floor', 5, [[1, 2, 'sofa'], [2, 2, 'sofa'], [4, 2, 'tv', true, 'henk_tv'], [8, 2, 'plant'], [3, 1, 'poster', true, 'henk_poster'], [8, 5, 'boekenkast']]);
house('huis_bakker', 'Huis van mevrouw Bakker', 10, 8, 'floor', 4, [[1, 2, 'kabouter', true, 'kabouters'], [2, 2, 'kabouter', true, 'kabouters'], [3, 2, 'kabouter', true, 'kabouters'], [6, 2, 'sofa'], [8, 2, 'plant'], [8, 5, 'kast'], [5, 1, 'klok']]);
house('huis_boer', 'Boerderij Jansen', 14, 10, 'floor', 6, [[1, 2, 'aanrecht'], [2, 2, 'aanrecht'], [10, 2, 'sofa'], [12, 2, 'tv'], [12, 6, 'plant'], [6, 1, 'klok']]);
(function () {
  const m = MAPS.huis_boer;
  setT(m, 5, 4, 'table'); setT(m, 4, 4, 'chair'); setT(m, 6, 4, 'chair');
})();
house('kerk_binnen', 'Laurentiuskerk', 12, 16, 'steen', 6, [[5, 2, 'orgel', true, 'orgel'], [6, 2, 'orgel', true, 'orgel'], [2, 4, 'kaars', true], [9, 4, 'kaars', true],
  ...[6, 8, 10, 12].flatMap((y) => [[2, y, 'kerkbank'], [3, y, 'kerkbank'], [4, y, 'kerkbank'], [7, y, 'kerkbank'], [8, y, 'kerkbank'], [9, y, 'kerkbank']])]);
house('aframe_0', 'A-frame van de buren', 8, 10, 'floor', 4, [[1, 2, 'bed'], [6, 2, 'kast'], [1, 6, 'sofa'], [6, 6, 'tv'], [3, 1, 'foto']]);
house('aframe_1', 'A-frame van Thijs', 8, 10, 'floor', 4, [[1, 2, 'bed'], [6, 2, 'poster', true, 'thijs_poster'], [1, 6, 'sofa'], [6, 6, 'tv'], [3, 1, 'poster', true, 'thijs_poster']]);
house('aframe_3', 'A-frame van het oude stel', 8, 10, 'floor', 4, [[1, 2, 'bed'], [6, 2, 'boekenkast'], [1, 6, 'sofa'], [6, 6, 'plant'], [3, 1, 'klok']]);
house('kantine_binnen', 'Kantine VV Meedhuizen', 10, 8, 'tegel', 5, [[7, 5, 'biervat'], [1, 1, 'poster', true, 'kantineposter'], [8, 1, 'klok'], [1, 6, 'doos', true, 'frikandelzakjes']]);
(function () { const m = MAPS.kantine_binnen; rect(m, 2, 3, 5, 1, 'counter'); setT(m, 3, 5, 'table'); setT(m, 2, 5, 'chair'); setT(m, 4, 5, 'chair'); })();
house('school_binnen', 'Klaslokaal', 12, 9, 'floor', 6, [[5, 1, 'schoolbord', true, 'schoolbord'], [6, 1, 'schoolbord', true, 'schoolbord'], [1, 7, 'boekenkast'], [10, 7, 'plant']]);
(function () { const m = MAPS.school_binnen; for (const y of [4, 6]) for (const x of [2, 4, 7, 9]) { setT(m, x, y, 'table'); setT(m, x, y + 1, 'chair'); } setT(m, 5, 3, 'table'); setT(m, 6, 3, 'table'); })();

// ---------- het paleis van Daniël (van binnen groter dan van buiten) ----------
(function () {
  const m = interior('paleis', 'Het paleis van Daniël', 22, 26, 'marmer');
  m.palace = true;
  rect(m, 10, 4, 2, 21, 'loper');
  setT(m, 11, 25, 'mat_out');
  m.doors.push({ x: 11, y: 25, id: 'uit_paleis' });
  for (const y of [6, 10, 14, 18, 22]) { prop(m, 6, y, 'pilaar', true, 'pilaar'); prop(m, 15, y, 'pilaar', true, 'pilaar'); }
  prop(m, 3, 12, 'fontein', true, 'fontein'); prop(m, 18, 12, 'fontein', true, 'fontein');
  prop(m, 2, 3, 'plant'); prop(m, 19, 3, 'plant'); prop(m, 2, 23, 'plant'); prop(m, 19, 23, 'plant');
  // achterin: het bureau met de computer en zestien monitoren aan de muur
  rect(m, 9, 2, 4, 1, 'counter');
  prop(m, 10, 1, 'monitors', true, 'monitors'); prop(m, 11, 1, 'monitors', true, 'monitors');
  prop(m, 11, 3, 'gamestoel', false);
  MAPS.paleis = m;
})();
