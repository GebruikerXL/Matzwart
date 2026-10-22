// Delfzijl, ten noorden van Meedhuizen: zeedijk aan de Eems, strand, haven, Damsterdiep, molen Adam, Centrumkerk,
// Muzeeaquarium, het standbeeld van Maigret, het Chemiepark en velden vol zware jongens.
PROP_DRAW.kast = function (x) { TILE_DRAW.kast(x); };
(function () {
  const m = newMap('delfzijl', 'Delfzijl', 64, 48, 'grass');
  m.encounters = true;
  m.warn = 'Je ruikt een hele dikke vape-lucht. Dit is Delfzijl. Hier zitten de zware jongens, met messen.';
  // zee, zeedijk, boulevard en strand
  rect(m, 0, 0, 64, 4, 'zee');
  rect(m, 0, 4, 64, 1, 'water');
  rect(m, 0, 5, 64, 2, 'dijk');
  rect(m, 0, 7, 64, 1, 'kade');
  rect(m, 3, 4, 10, 3, 'sand');
  // randen
  rect(m, 0, 8, 1, 40, 'tree'); rect(m, 63, 8, 1, 40, 'tree'); rect(m, 0, 47, 64, 1, 'tree');
  // Meedhuizerweg naar het zuiden
  rect(m, 30, 8, 2, 40, 'road');
  m.doors.push({ x: 30, y: 47, id: 'dz_naar_dorp' }, { x: 31, y: 47, id: 'dz_naar_dorp' });
  // straten en het Damsterdiep
  rect(m, 1, 8, 42, 1, 'path');
  rect(m, 1, 18, 42, 2, 'road');
  rect(m, 0, 20, 44, 2, 'water');
  rect(m, 30, 20, 2, 2, 'bridge'); rect(m, 10, 20, 1, 2, 'bridge');
  rect(m, 1, 22, 42, 2, 'road');
  rect(m, 1, 24, 42, 1, 'path');
  // Molenbergplein
  rect(m, 9, 9, 17, 9, 'kade');
  // haven met kade
  rect(m, 44, 9, 19, 32, 'water'); rect(m, 46, 11, 15, 28, 'zee');
  rect(m, 42, 8, 2, 33, 'kade');
  rect(m, 32, 22, 10, 2, 'road');
  // wildernis in het zuiden
  rect(m, 1, 30, 28, 16, 'tall');
  rect(m, 34, 30, 9, 10, 'tall');
  rect(m, 1, 26, 28, 3, 'grass');
  [[4, 33], [9, 38], [15, 31], [20, 42], [25, 35], [6, 44], [36, 33], [40, 38], [12, 27], [24, 27]].forEach(([x, y]) => setT(m, x, y, 'tree'));
  // Chemiepark (zuidoost), met hek
  rect(m, 44, 41, 19, 6, 'asfalt');
  rect(m, 44, 41, 19, 1, 'fence'); setT(m, 50, 41, 'asfalt');

  building(m, { id: 'molen_adam', x: 12, y: 11, w: 5, h: 6, door: 14, kind: 'molen', label: 'ADAM', wall: '#6a5a4a', roof: '#3a3a3a' });
  building(m, { id: 'centrumkerk', x: 19, y: 9, w: 6, h: 8, door: 21, kind: 'church', wall: '#a24b34', roof: '#3a3f4a' });
  building(m, { id: 'muzee', x: 33, y: 10, w: 8, h: 7, door: 37, kind: 'shop', label: 'MUZEEAQUARIUM', signCol: '#2a6ac8' });
  building(m, { id: 'snackbar', x: 2, y: 11, w: 6, h: 6, door: 5, kind: 'shop', label: 'SNACKBAR', signCol: '#e8833a' });
  building(m, { id: 'dz_huis1', x: 2, y: 25, w: 5, h: 4, door: 4, wall: '#8e5a46', roof: '#3a3a3a' });
  building(m, { id: 'dz_huis2', x: 8, y: 25, w: 5, h: 4, door: 10, wall: '#a8553a', roof: '#3a3f4a' });
  building(m, { id: 'dz_huis3', x: 14, y: 25, w: 5, h: 4, door: 16, wall: '#9c4530', roof: '#2a2e3a' });
  building(m, { id: 'dz_huis4', x: 34, y: 25, w: 6, h: 4, door: 37, wall: '#b05a40', roof: '#3a3a3a' });
  [0, 1, 2].forEach((i) => building(m, { id: 'fabriek' + i, x: 46 + i * 6, y: 43, w: 5, h: 4, door: 48 + i * 6, kind: 'shop', label: 'CHEMIE', signCol: '#5a5a62' }));

  prop(m, 6, 23, 'maigret', true, 'maigret');
  prop(m, 33, 21, 'bordje', true, 'damsterdiep');
  [[50, 15], [54, 27], [49, 34]].forEach(([x, y]) => prop(m, x, y, 'schip', true, 'schip'));
  [[43, 12], [43, 22], [43, 32]].forEach(([x, y]) => prop(m, x, y, 'kraan', true, 'kraan'));
  [[46, 42], [52, 42], [58, 42], [61, 44]].forEach(([x, y]) => prop(m, x, y, 'schoorsteen', true, 'schoorsteen'));
  [[9, 7], [20, 7], [38, 7], [27, 23], [8, 24]].forEach(([x, y]) => prop(m, x, y, 'bank', true, 'bank'));
  [[29, 9], [32, 17], [29, 24], [32, 30]].forEach(([x, y]) => prop(m, x, y, 'lamp', true));
  prop(m, 29, 46, 'plaatsbord', true, 'dz_plaatsbord');
  prop(m, 42, 38, 'container', true, 'container'); prop(m, 42, 39, 'container', true, 'container');
  MAPS.delfzijl = m;
})();

// ---------- binnenruimtes in Delfzijl ----------
house('snackbar_binnen', 'Snackbar', 10, 8, 'tegel', 4, [[1, 1, 'poster', true, 'snackposter'], [8, 5, 'plant'], [1, 6, 'kliko']]);
(function () { const m = MAPS.snackbar_binnen; rect(m, 2, 3, 6, 1, 'counter'); setT(m, 7, 5, 'table'); setT(m, 6, 5, 'chair'); })();
house('muzee_binnen', 'Muzeeaquarium', 14, 10, 'tegel', 7, [[1, 2, 'aquarium', true, 'aquarium'], [2, 2, 'aquarium', true, 'aquarium'], [4, 2, 'aquarium', true, 'aquarium'],
  [9, 2, 'aquarium', true, 'aquarium'], [11, 2, 'aquarium', true, 'aquarium'], [12, 2, 'aquarium', true, 'aquarium'], [1, 6, 'aquarium', true, 'aquarium'], [12, 6, 'aquarium', true, 'aquarium'], [6, 1, 'poster', true, 'bunkerposter']]);
house('molen_binnen', 'Molen Adam', 8, 8, 'plank', 4, [[1, 2, 'hay'], [6, 2, 'emmer'], [3, 1, 'klok']]);
house('centrumkerk_binnen', 'Centrumkerk', 10, 12, 'steen', 5, [[4, 2, 'orgel'], [5, 2, 'orgel'], ...[5, 7, 9].flatMap((y) => [[2, y, 'kerkbank'], [3, y, 'kerkbank'], [6, y, 'kerkbank'], [7, y, 'kerkbank']])]);
PROP_DRAW.hay = function (x) { TILE_DRAW.hay(x); };
