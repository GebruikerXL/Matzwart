// Meer te halen in huizen: koelkasten, laatjes, kluizen en sporttassen met spullen (na tien minuten weer gevuld),
// en huizen waar vijanden zitten: krakpanden in Delfzijl en Zwolle, en vapende tieners in het klaslokaal.
// Gedeeld door 2D en 3D.

// ---------- plekken met spullen ----------
const SPOT_REFILL = 10 * 60 * 1000;
const lootSpot = (what, table) => async function () {
  const f = F(); f.spots = f.spots || {};
  const id = this && this.spotId;
  const t = f.spots[id];
  if (t && Date.now() - t < SPOT_REFILL) { await me(`${what} is leeg. Misschien ligt er later weer iets.`); return; }
  f.spots[id] = Date.now();
  const tot = table.reduce((a, r) => a + (r.w || 1), 0);
  let k = Math.random() * tot, r = table[0];
  for (const x of table) { k -= x.w || 1; if (k <= 0) { r = x; break; } }
  if (r.eur) { G.P.money += r.eur; SFX.item(); UI.toast(`+EUR ${r.eur}`); }
  if (r.it && ITEMS[r.it]) G.give(r.it, r.n || 1);
  await me(r.t);
};
const SPOT = {
  koelkast: [
    { it: 'rookworst', t: 'Een rookworst. Nog in de verpakking. Bijna over de datum.', w: 3 },
    { it: 'chocomel', t: 'Een pak chocomel. Je schudt het. Er zit nog wat in.', w: 3 },
    { it: 'energiedrank', t: 'Een energiedrankje achterin. Iemand heeft er "NIET VAN MIJ" op geschreven.', w: 2 },
    { it: 'bitterballen', t: 'Koude bitterballen in een bakje. Ze zijn nog goed. Waarschijnlijk.', w: 2 },
  ],
  lade: [
    { eur: 5, t: 'Tussen de elastiekjes en de batterijen: EUR 5.', w: 3 },
    { eur: 20, t: 'Een envelop met "voor de kerstpot". EUR 20. Het is geen kerst.', w: 1 },
    { it: 'paracetamol', t: 'Een strip paracetamol. Handig, zo de ochtend na.', w: 2 },
    { it: 'krentenbol', t: 'Een krentenbol in een lade. Waarom?', w: 2 },
  ],
  kluis: [
    { eur: 60, t: 'De kluis staat open. Iemand heeft de code op een geeltje erop geplakt. EUR 60.', w: 3 },
    { eur: 150, t: 'De kluis is niet op slot. Er ligt EUR 150 in, en een foto van een kat.', w: 1 },
    { it: 'gouden_vape', t: 'In de kluis ligt een gouden vape. Wie bewaart zoiets in een kluis?', w: 1 },
  ],
  tas: [
    { it: 'energiedrank', t: 'Een sporttas. Een energiedrankje, een sok, en nog een sok. Je neemt het drankje.', w: 3 },
    { eur: 12, t: 'In het zijvak: EUR 12 en een kauwgompje. Je neemt alleen het geld.', w: 2 },
    { it: 'vape', t: 'Onderin de tas: een vape. Smaak: "verboden fruit".', w: 1 },
  ],
};
// zet een spullenplek in een binnenruimte
function spot(mapId, x, y, model, what, id) {
  const m = MAPS[mapId]; if (!m) return;
  if (m.props.some((p) => p.x === x && p.y === y) || !(TILE_DEF[tileAt(m, x, y)] || {}).walk) return;
  prop(m, x, y, model, true, id);
  PROPS[id] = lootSpot(what, SPOT[model === 'dressoir' ? 'lade' : model]).bind({ spotId: id });
  PROP_HIDE[id] = PROP_HIDE[id] || null;
}
[
  ['huis_henk', 6, 2, 'koelkast', 'De koelkast van Henk'], ['huis_henk', 1, 5, 'dressoir', 'Het laatje van Henk'],
  ['huis_bakker', 7, 2, 'koelkast', 'De koelkast van mevrouw Bakker'], ['huis_bakker', 1, 5, 'dressoir', 'Het dressoir van mevrouw Bakker'],
  ['huis_boer', 3, 2, 'koelkast', 'De koelkast van de boer'], ['huis_boer', 1, 8, 'kluis', 'De kluis van de boer'],
  ['aframe_0', 3, 2, 'dressoir', 'Het laatje van de buren'], ['aframe_1', 6, 4, 'tas', 'De sporttas van Thijs'], ['aframe_3', 6, 4, 'koelkast', 'De koelkast van het oude stel'],
  ['kantine_binnen', 8, 2, 'koelkast', 'De koelkast van de kantine'], ['school_binnen', 10, 3, 'tas', 'Een vergeten schooltas'],
  ['paleis', 20, 24, 'kluis', 'De kluis van Daniël'], ['snackbar_binnen', 8, 2, 'koelkast', 'De koelkast van de snackbar'],
  ['delfzicht_binnen', 12, 4, 'dressoir', 'Het medicijnkastje'], ['molen_binnen', 5, 5, 'tas', 'Een meelzak'],
  ['kleedkamer_binnen', 16, 5, 'tas', 'Een sporttas van een hooligan'],
].forEach(([m, x, y, model, what]) => spot(m, x, y, model, what, `ls_${m}_${x}_${y}`));

// 2D-plaatjes voor de nieuwe meubels
PROP_DRAW.koelkast = function (x) { px(x, 3, 0, 10, 16, '#e8e6e0'); px(x, 3, 6, 10, 1, '#b8b6b0'); px(x, 11, 2, 1, 3, '#888'); px(x, 11, 8, 1, 4, '#888'); px(x, 5, 9, 3, 2, '#e8433a'); };
PROP_DRAW.dressoir = function (x) { px(x, 1, 6, 14, 10, '#8c5a32'); px(x, 1, 6, 14, 1, '#a8784a'); px(x, 2, 8, 12, 3, '#6e4424'); px(x, 2, 12, 12, 3, '#6e4424'); px(x, 7, 9, 2, 1, '#f2c22e'); px(x, 7, 13, 2, 1, '#f2c22e'); px(x, 4, 3, 3, 3, '#3a8a3a'); };
PROP_DRAW.kluis = function (x) { px(x, 3, 5, 10, 11, '#5a5a62'); px(x, 4, 6, 8, 9, '#6e6e78'); px(x, 7, 9, 3, 3, '#3a3a44'); px(x, 8, 10, 1, 1, '#f2c22e'); };
PROP_DRAW.tas = function (x) { px(x, 2, 8, 12, 7, '#2a4a9a'); px(x, 5, 6, 6, 2, '#1b1b1b'); px(x, 2, 10, 12, 1, '#f4f1ea'); };

// ---------- huizen met vijanden ----------
// 3D: de vijanden staan binnen en vallen aan; 2D: je vecht ze een voor een. Na drie minuten zijn ze terug.
const FOES_BACK = 3 * 60 * 1000;
function foesReady(mapId) { const f = F(); f.foeT = f.foeT || {}; return !f.foeT[mapId] || Date.now() - f.foeT[mapId] > FOES_BACK; }
async function indoorFoes(mapId) {
  const m = MAPS[mapId];
  if (!m || !m.foes || !foesReady(mapId) || window.MODE3D) return;
  F().foeT[mapId] = Date.now();
  G.busy = true;
  await me(m.foesText || 'Er is hier iemand. Meerdere iemanden.');
  for (const id of m.foes) { const r = await G.fight(id); if (r !== 'win' && r !== 'spared') break; }
  G.busy = false;
}
const goFoes = (map, x, y, dir) => async () => { await G.warp(map, x, y, dir); await indoorFoes(map); };

// krakpanden in Delfzijl: de deuren die eerst op slot zaten
[
  ['dz_huis1', 'dz_kraak1', 4, 'Kraakpand', ['dz_slager', 'dz_chemie'], 'Het huis is gekraakt. Door vapers. Met messen.'],
  ['dz_huis2', 'dz_kraak2', 10, 'Kraakpand', ['dz_haven', 'dz_dijk'], '"We kopen niks!" riepen ze. Ze verkopen wel. En ze hebben messen.'],
  ['dz_huis3', 'dz_kraak3', 16, 'Vapehol', ['dz_fatbike', 'dz_slager', 'dz_chemie'], 'Binnen is het één grote wolk. Er komen drie silhouetten op je af.'],
  ['dz_huis4', 'dz_kraak4', 37, 'Havenhuis', ['dz_haven', 'dz_haven'], 'Twee havenwerkers. Ze waren niet naar de haven. Ze waren hier.'],
].forEach(([door, id, dx, name, foes, text], i) => {
  const m = house(id, name, 12, 9, 'floor', 6, [[1, 2, 'sofa'], [10, 2, 'tv'], [2, 6, 'doos', true, 'kraak_dozen']]);
  m.foes = foes; m.foesText = text;
  spot(id, 5, 2, i % 2 ? 'kluis' : 'koelkast', i % 2 ? 'Een kluis vol vapestickers' : 'Een koelkast vol energiedrank', `ls_${id}_kast`);
  spot(id, 10, 6, 'tas', 'Een tas met buit', `ls_${id}_tas`);
  DOORS[door] = goFoes(id, 6, 7, 'up');
  DOORS['uit_' + id] = go('delfzijl', dx, 29, 'down');
});
PROPS.kraak_dozen = () => me('Dozen vol lege vapes. Honderden. Aron zou hier gek van worden.');
// in Zwolle: twee huizen, nog zwaarder
[
  ['zw_huis1', 'zw_binnen1', 13, 26, 'Bendehuis', ['dz_haven', 'dz_slager', 'dz_fatbike']],
  ['zw_huis2', 'zw_binnen2', 19, 28, 'Fatbikegarage', ['dz_fatbike', 'dz_fatbike', 'dz_chemie']],
].forEach(([door, id, dx, dy, name, foes]) => {
  const m = house(id, name, 12, 9, 'floor', 6, [[1, 2, 'kast'], [10, 2, 'doos', true, 'kraak_dozen']]);
  m.foes = foes; m.foesText = 'WILDERNIS. Hier wonen de zwaarste jongens van Zwolle. Ze hadden je al gehoord.';
  spot(id, 5, 2, 'kluis', 'Een bendekluis', `ls_${id}_kluis`);
  spot(id, 9, 6, 'tas', 'Een tas vol buit', `ls_${id}_tas`);
  DOORS[door] = goFoes(id, 6, 7, 'up');
  DOORS['uit_' + id] = go('zwolle', dx, dy, 'down');
});
// vapende tieners in het klaslokaal
MAPS.school_binnen.foes = ['vaper_tiktok', 'vaper_beugel', 'vaper_training'];
MAPS.school_binnen.foesText = 'Achterin de klas hangt een dikke wolk. Drie tieners. Ze vapen onder de les. Er is geen les.';
(function () { const go0 = DOORS.school; if (go0) DOORS.school = async () => { await go0(); await indoorFoes('school_binnen'); }; })();

// beloning voor de daken (jump puzzles, alleen bereikbaar in 3D)
addCloth('clubshirt', { slot: 'boven', name: 'Clubshirt van de Kapo', col: '#2a4a9a', pat: 'logo', st: { def: 2, stoer: 2 }, rare: true, desc: 'Zeldzaam. Lag op het dak van de kleedkamers. Ruikt naar de jaren negentig.' });
