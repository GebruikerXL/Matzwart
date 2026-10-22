// Quest: Café Josje. Kjell en Jornt staan stomdronken in Delfzijl bij hun auto, naast een plas kots.
// Ga je mee, dan rijd jij (dronken) naar Café Josje: een enorme, compleet gesloopte kroeg met meerdere ruimtes.
// Bij de uitgang staat de bruine meneer, een enorme meneer in een bruin pak: 200.000 biertjes, drie miljoen euro. Dat loopt slecht af.
// Gedeeld door 2D en 3D; de 3D-versie maakt van de rit en het einde echte cutscenes (ride3d.js, scenes3d.js).

Object.assign(LOOKS, {
  kjell: { skin: '#f0c4a0', hair: '#e0b850', style: 'messy', shirt: '#f4f1ea', pants: '#2a4a9a', extra: ['blush', 'tired'] },
  jornt: { skin: '#e8b898', hair: '#3a2a1a', style: 'cap', cap: '#c23b2e', shirt: '#2e7a3a', pants: '#2a2a3a', extra: ['blush', 'tired', 'beard'] },
  meneer: { skin: '#e8b090', hair: '#2a2a2a', style: 'bald', shirt: '#6b4226', pants: '#5a3a20', pat: 'jacket', extra: ['mustache'] },
});

// de auto en de plas kots, in Delfzijl
prop(MAPS.delfzijl, 24, 29, 'opelL', true, 'opel'); prop(MAPS.delfzijl, 25, 29, 'opelR', true, 'opel');
prop(MAPS.delfzijl, 26, 29, 'kots', false, 'kots');
PROPS.opel = () => me('Een roestige Opel Kadett. Op de achterbank: lege blikjes. Heel veel lege blikjes. In het contactslot: de sleutel.');
PROPS.kots = () => me('Een plas kots. Je herkent stukjes frikandel. En iets oranjes. Je kijkt snel weg.');

QUESTS.josje = {
  name: 'Café Josje', done: 3,
  steps: ['', 'Kjell en Jornt staan in Delfzijl bij hun auto. Ze willen naar Café Josje.', 'Je bent in Café Josje. Alles is kapot. Hoe kom je hier weer weg?', 'Doodgeslagen om 200.000 biertjes. Kjell en Jornt hebben niks betaald.'],
};

async function josjeInvite(who) {
  if (G.quest('josje') >= 3) { await say(who, pick(['Josje! Wat een avond was dat. Jij had toch betaald?', 'Volgende keer gaan we weer. Jij rijdt.', '*hik* Wie ben jij ook alweer?'])); return; }
  if (!G.quest('josje')) G.quest('josje', 1);
  await say(who, pick(['Heeeeeej! Jij! Jij bent... jij!', 'Wij zijn NIET dronken. *hik*', 'Kjell heeft net gekotst. Of ik. Een van ons.']));
  const k = await ask(who, 'Ga je mee naar Café Josje? Het is daar altijd open. Altijd!', ['Ja, gezellig', 'Nee, jullie zijn veel te dronken']);
  if (k !== 0) { await say(who, 'Saaaaaai. *hik*'); return; }
  await say('Kjell', 'Top! Jij rijdt. Wij hebben al wat op. Hier, neem er een voor onderweg.');
  await josjeRide();
}
NPCS.push(
  { id: 'kjell', map: 'delfzijl', x: 26, y: 28, dir: 'down', look: LOOKS.kjell, talk: () => josjeInvite('Kjell') },
  { id: 'jornt', map: 'delfzijl', x: 27, y: 29, dir: 'left', look: LOOKS.jornt, talk: () => josjeInvite('Jornt') },
  { id: 'kjell_josje', map: 'josje', x: 13, y: 18, dir: 'down', look: LOOKS.kjell, talk: () => say('Kjell', pick(['Zzzzz...', '*snurk* Nog eentje... *snurk*', 'Mam? Ben jij dat?'])) },
  { id: 'jornt_josje', map: 'josje', x: 5, y: 16, dir: 'up', look: LOOKS.jornt, talk: () => say('Jornt', pick(['*hangt boven de wc* Ga weg. Ik ben bezig.', 'Ik heb het gevoel dat ik iets vergeten ben. Betalen of zo.', 'Bleeeeh.'])) },
);

// zonder 3D: de rit is tekst
var josjeRide = async function () {
  G.busy = true;
  await UI.fade(true);
  for (const t of ['Je stapt achter het stuur. Kjell geeft je een biertje. En nog een.', 'De weg wordt wazig. Jornt zingt. Je kotst uit het raam. Kjell applaudisseert.', 'Nog een biertje. Waar is de weg? Is dit een weg?']) await UI.say('', t);
  await josjeArrive();
};
async function josjeArrive() {
  G.loadMap('josje', 8, 9, 'up');
  G.P.hp = Math.max(1, Math.round(G.P.maxHp * 0.2));
  G.quest('josje', 2);
  await UI.fade(false);
  G.busy = true;
  await me('Je opent je ogen. Je ligt op een kleverige vloer. Café Josje.');
  await me('Alles is kapot. Tafels, stoelen, de bar, de spiegel. Je hebt nog 20% van je HP. Je hoofd voelt alsof Mick erop heeft gezeten.');
  G.busy = false;
}

// ---------- Café Josje: een mega grote kroeg, compleet gesloopt ----------
(function () {
  const m = interior('josje', 'Café Josje', 32, 22, 'floor');
  setT(m, 25, 21, 'mat_out');
  m.doors.push({ x: 25, y: 21, id: 'uit_josje' });
  // muren tussen de ruimtes, met doorgangen
  rect(m, 1, 13, 30, 1, 'wall'); for (const x of [5, 15, 25]) setT(m, x, 13, 'floor');
  rect(m, 16, 2, 1, 11, 'wall'); for (const y of [6, 7, 8]) setT(m, 16, y, 'floor');
  rect(m, 9, 14, 1, 7, 'wall'); setT(m, 9, 17, 'floor');
  rect(m, 21, 14, 1, 7, 'wall'); setT(m, 21, 17, 'floor');
  rect(m, 1, 14, 8, 7, 'tegel');
  // de bar
  rect(m, 2, 3, 10, 1, 'counter');
  [[4, 3, 'tap'], [8, 3, 'kassa'], [14, 2, 'piano', true, 'josje_piano'], [3, 1, 'poster', true, 'josje_poster'],
    [4, 7, 'kapottafel'], [10, 9, 'kapottafel'], [7, 10, 'kapottafel'], [5, 8, 'kapotstoel'], [11, 8, 'kapotstoel'], [3, 10, 'kapotstoel'],
    [8, 6, 'scherven', false], [12, 7, 'scherven', false], [6, 9, 'plas', false], [13, 10, 'plas', false],
    // de zaal met de dansvloer
    [17, 2, 'box'], [30, 2, 'box'], [23, 2, 'bureau', true, 'josje_dj'], [23, 7, 'discobal', false],
    [20, 9, 'kapottafel'], [27, 10, 'kapottafel'], [19, 5, 'kapotstoel'], [22, 10, 'plas', false], [25, 5, 'plas', false], [28, 7, 'scherven', false],
    // de wc's
    [2, 15, 'emmer'], [4, 18, 'kots', false], [6, 19, 'kots', false], [3, 19, 'plas', false],
    // het achterhok
    [11, 15, 'biervat'], [12, 15, 'biervat'], [19, 15, 'biervat'], [15, 15, 'kratten', true], [16, 19, 'kapotstoel'],
    // de gang naar de uitgang
    [25, 17, 'plas', false], [27, 16, 'scherven', false], [23, 15, 'kapotstoel'],
  ].forEach(([x, y, n, solid, id]) => prop(m, x, y, n, solid !== false, id));
  MAPS.josje = m;
})();
PROPS.josje_poster = () => me('CAFÉ JOSJE. ALTIJD OPEN. Daaronder, met stift: "200.000 biertjes = record?!"');
PROPS.josje_piano = () => me('De piano heeft nog drie toetsen. Op een ervan staat een biertje. Het is jouw biertje, zegt iets in je.');
PROPS.josje_dj = () => me('Het draaitafeltje van de DJ. De plaat is in tweeën gebroken. De DJ ook, zo te zien aan het bloed op de vloer. Nee. Dat is ketchup. Hopelijk.');
DOORS.uit_josje = () => bouncerScene();

// ---------- de bruine meneer bij de uitgang ----------
async function bouncerTalk() {
  await me('Je loopt naar de uitgang. In de deuropening staat ineens een enorme meneer in een bruin pak. Hij past maar net door de deur.');
  await say('De bruine meneer', 'Ho. Waar dacht jij heen te gaan?');
  await say('De bruine meneer', 'Jij hebt vannacht 200.000 biertjes besteld. Die moeten betaald worden. Drie miljoen euro.');
  const k = await ask('De bruine meneer', 'Betalen. Nu.', ['Betalen', 'Kjell en Jornt betalen', 'Wegrennen']);
  if (k === 0) await me(G.P.money >= 3000000 ? 'Je hebt het geld. Maar hij wil het contant. In muntjes van twee euro. Die heb je niet.' : `Je hebt EUR ${G.P.money.toLocaleString('nl-NL')}. Dat is iets minder dan drie miljoen.`);
  else if (k === 1) await me('Je kijkt om. Kjell slaapt in het achterhok. Jornt hangt boven de wc. Ze betalen helemaal niks.');
  else await me('Je draait je om. Hij is sneller. Veel sneller.');
  await say('De bruine meneer', 'Jammer.');
}
var bouncerScene = async function () {
  G.busy = true;
  await bouncerTalk();
  await UI.fade(true);
  await me('Alles gaat heel langzaam. Zijn vuist. Jouw gezicht. Nog een keer. En nog een keer.');
  G.quest('josje', 3);
  await hardcoreDeath('De bruine meneer heeft je doodgeslagen. In slow motion. Om 200.000 biertjes.');
};

// 2D-plaatjes
PROP_DRAW.opelL = function (x) { px(x, 2, 6, 14, 7, '#c8783a'); px(x, 6, 3, 10, 4, '#a8602a'); px(x, 7, 4, 8, 2, '#9ab4d0'); px(x, 3, 12, 4, 4, '#1b1b1b'); px(x, 9, 8, 3, 2, '#7a4a2a'); };
PROP_DRAW.opelR = function (x) { px(x, 0, 6, 13, 7, '#c8783a'); px(x, 0, 3, 8, 4, '#a8602a'); px(x, 0, 4, 7, 2, '#9ab4d0'); px(x, 9, 12, 4, 4, '#1b1b1b'); px(x, 12, 8, 3, 2, '#f7dc8a'); };
PROP_DRAW.kots = function (x) { px(x, 3, 10, 10, 4, '#a8b83a'); px(x, 5, 9, 6, 1, '#c8c84a'); px(x, 6, 11, 2, 1, '#e8833a'); px(x, 10, 12, 1, 1, '#e8833a'); };
PROP_DRAW.plas = function (x) { px(x, 2, 11, 12, 3, '#d8a83a'); px(x, 4, 10, 7, 1, '#e8c860'); px(x, 5, 11, 2, 1, '#f4f1ea'); };
PROP_DRAW.scherven = function (x) { [[3, 12], [7, 10], [11, 13], [9, 11], [5, 14]].forEach(([a, b]) => px(x, a, b, 2, 1, '#c8e0f0')); };
PROP_DRAW.kapottafel = function (x) { px(x, 2, 9, 12, 3, '#8c5a32'); px(x, 3, 12, 2, 3, '#4a2c18'); px(x, 11, 6, 2, 4, '#4a2c18'); px(x, 6, 9, 1, 3, '#2a1a0a'); };
PROP_DRAW.kapotstoel = function (x) { px(x, 3, 10, 8, 2, '#7a4c2a'); px(x, 10, 6, 2, 6, '#6a3c1a'); px(x, 4, 12, 1, 3, '#5a3c1a'); };
PROP_DRAW.box = function (x) { px(x, 3, 2, 10, 14, '#1b1b20'); px(x, 5, 4, 6, 5, '#3a3a44'); px(x, 6, 10, 4, 4, '#3a3a44'); px(x, 7, 6, 2, 1, '#888'); };
PROP_DRAW.discobal = function (x) { px(x, 5, 3, 6, 6, '#c8ccd4'); px(x, 6, 4, 1, 1, '#fff'); px(x, 9, 6, 1, 1, '#fff'); px(x, 7, 0, 2, 3, '#888'); };
