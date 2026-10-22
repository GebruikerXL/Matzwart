// HARDCORE: permadeath (je wordt wakker in Delfzicht op level 1, zonder spullen), automatisch opslaan,
// de fatbike van Otto, en Koen die je over de A28 naar Zwolle rijdt: de wildernis.
// Gedeeld door 2D en 3D; de 3D-versie voegt PvP, oprapen en de autorit-cutscene toe.

// ---------- Delfzicht, het ziekenhuis van Delfzijl ----------
building(MAPS.delfzijl, { id: 'delfzicht', x: 34, y: 40, w: 8, h: 5, door: 38, kind: 'shop', label: 'DELFZICHT', signCol: '#c23b2e' });
house('delfzicht_binnen', 'Ziekenhuis Delfzicht', 14, 9, 'tegel', 7, [[2, 2, 'bed'], [5, 2, 'bed'], [8, 2, 'bed'], [11, 2, 'bed'], [1, 6, 'plant'], [12, 6, 'plant'], [6, 1, 'klok'], [4, 1, 'poster', true, 'delfzicht_poster']]);
Object.assign(DOORS, {
  delfzicht: go('delfzicht_binnen', 7, 7, 'up'),
  uit_delfzicht_binnen: go('delfzijl', 38, 45, 'down'),
});
PROPS.delfzicht_poster = () => me('Een poster: "HARDCORE? Denk aan je naasten. En aan je spullen. Die ben je kwijt." Iemand heeft er een doodshoofd bij getekend.');

// ---------- Zwolle: de wildernis ----------
(function () {
  const m = newMap('zwolle', 'Zwolle (wildernis)', 50, 40, 'grass');
  m.encounters = true; m.pvp = true;
  m.warn = 'WILDERNIS. Hier mogen spelers elkaar aanvallen. Ga je dood, dan ben je alles kwijt.';
  rect(m, 0, 0, 50, 1, 'tree'); rect(m, 0, 39, 50, 1, 'tree'); rect(m, 0, 0, 1, 40, 'tree'); rect(m, 49, 0, 1, 40, 'tree');
  // de wildernis rond de stad
  rect(m, 1, 1, 48, 4, 'tall'); rect(m, 1, 5, 6, 30, 'tall'); rect(m, 43, 5, 6, 30, 'tall'); rect(m, 1, 33, 20, 6, 'tall'); rect(m, 29, 33, 20, 6, 'tall');
  [[3, 8], [5, 15], [2, 24], [46, 10], [44, 20], [47, 28], [10, 2], [20, 3], [33, 2], [41, 3], [8, 35], [15, 37], [36, 36], [42, 35]].forEach(([x, y]) => setT(m, x, y, 'tree'));
  // de Stadsgracht, met vier bruggen
  rect(m, 8, 6, 34, 2, 'water'); rect(m, 8, 30, 34, 2, 'water'); rect(m, 8, 6, 2, 26, 'water'); rect(m, 40, 6, 2, 26, 'water');
  rect(m, 24, 6, 2, 2, 'bridge'); rect(m, 24, 30, 2, 2, 'bridge'); rect(m, 8, 18, 2, 2, 'bridge'); rect(m, 40, 18, 2, 2, 'bridge');
  // binnenstad: straten en de Grote Markt
  rect(m, 10, 8, 30, 22, 'grass');
  rect(m, 10, 18, 30, 2, 'path'); rect(m, 24, 8, 2, 22, 'path');
  rect(m, 17, 14, 14, 9, 'kade');
  // aankomst: parkeerplaats aan de zuidkant
  rect(m, 21, 33, 8, 6, 'asfalt'); rect(m, 24, 32, 2, 1, 'road');
  building(m, { id: 'peperbus', x: 27, y: 9, w: 6, h: 5, door: 29, kind: 'church', wall: '#a8553a', roof: '#3a3f4a' });
  building(m, { id: 'grotekerk', x: 14, y: 9, w: 8, h: 5, door: 17, kind: 'church', wall: '#9a4a34', roof: '#2f3340' });
  building(m, { id: 'sassenpoort', x: 33, y: 22, w: 5, h: 5, door: 35, wall: '#b05a40', roof: '#3a3f4a', label: 'SASSENPOORT' });
  building(m, { id: 'zw_huis1', x: 11, y: 22, w: 5, h: 4, door: 13, wall: '#8e5a46', roof: '#3a3a3a' });
  building(m, { id: 'zw_huis2', x: 17, y: 24, w: 5, h: 4, door: 19, wall: '#a8553a', roof: '#2a2e3a' });
  building(m, { id: 'zw_snackbar', x: 27, y: 24, w: 5, h: 4, door: 29, kind: 'shop', label: 'BLAUWVINGER', signCol: '#2a6ac8' });
  prop(m, 23, 21, 'bordje', true, 'zw_bord');
  prop(m, 23, 34, 'autoL', true, 'koenauto'); prop(m, 24, 34, 'autoR', true, 'koenauto');
  [[16, 17], [31, 17], [22, 13], [27, 22], [26, 29], [20, 34], [29, 34]].forEach(([x, y]) => prop(m, x, y, 'lamp', true));
  m.pool = typeof DZ_POOL !== 'undefined' ? DZ_POOL : RANDOM_POOL;
  MAPS.zwolle = m;
})();
const zwDicht = (t) => () => locked(t);
Object.assign(DOORS, {
  peperbus: zwDicht('De Peperbus. De deur zit dicht. Boven je hoofd hangt de toren als een peperbus. Vandaar.'),
  grotekerk: zwDicht('De Grote Kerk. Dicht. Er hangt een briefje: "Ook voor Meedhuizenaren niet."'),
  sassenpoort: zwDicht('De Sassenpoort. Dicht sinds 1409. Ongeveer.'),
  zw_huis1: zwDicht('Iemand roept door de brievenbus: "Wildernis! Ga weg!"'),
  zw_huis2: zwDicht('De deur zit dicht. En gebarricadeerd. Met een fatbike.'),
  zw_snackbar: zwDicht('BLAUWVINGER. Gesloten wegens wildernis. Er hangt een bordje: "Blauwvingers eten we zelf."'),
});
PROPS.zw_bord = () => me('ZWOLLE. Daaronder, met een stift: WILDERNIS. Elk voor zich. Geen spullen terug.');
PROPS.koenauto = () => me('De auto van Koen. Verlaagd, een spoiler zo groot als een strijkplank en een uitlaat als een kanon. Er zitten nog vliegen van de A28 op de voorruit.');

// ---------- Koen en zijn auto op de parkeerplaats van de EKA ----------
prop(MAPS.oost, 9, 21, 'autoL', true, 'koenauto'); prop(MAPS.oost, 10, 21, 'autoR', true, 'koenauto');
LOOKS.koen = { skin: '#e8b898', hair: '#3a2a1a', style: 'cap', cap: '#1b1b1b', shirt: '#2a2a2e', pants: '#2a2a3a', pat: 'jacket', extra: [] };
const WILDERNIS = 'Zwolle is WILDERNIS: daar mogen spelers elkaar aanvallen. Ga je dood, dan laat je al je spullen vallen, kan iedereen ze oprapen en word je wakker in Delfzicht. Op level 1.';
NPCS.push(
  { id: 'koen', map: 'oost', x: 11, y: 20, dir: 'left', look: LOOKS.koen,
    async talk() {
      await say('Koen', pick(['Moet je mee? Ik ga naar Zwolle. Plankgas over de A28.', 'Honderdzestig is geen snelheid. Honderdzestig is een begin.', 'Instappen of opzouten. Ik moet tanken.']));
      const k = await ask('Koen', `Ik rij je naar Zwolle. Maar luister goed: ${WILDERNIS} Instappen?`, ['Instappen', 'Nee, ik blijf hier']);
      if (k !== 0) { await say('Koen', 'Slim. Saai, maar slim.'); return; }
      await rideTo('zwolle');
    } },
  { id: 'koen_zw', map: 'zwolle', x: 22, y: 34, dir: 'right', look: LOOKS.koen,
    async talk() {
      const k = await ask('Koen', 'Leef je nog? Knap. Terug naar Meedhuizen?', ['Instappen', 'Nog even blijven']);
      if (k !== 0) { await say('Koen', 'Ik wacht hier. Met de motor aan.'); return; }
      await rideTo('oost');
    } },
);
// zonder 3D: de rit is een korte tekst (3d: een cutscene, zie js3d/ride3d.js)
var rideTo = async function (dest) {
  const G_ = G; G_.busy = true;
  await UI.fade(true);
  await UI.say('', 'Koen scheurt de parkeerplaats af. De A28 op. Honderdtachtig. Tweehonderd. Hij haalt rechts in. En links. En over de vluchtstrook.');
  if (dest === 'zwolle') G_.loadMap('zwolle', 25, 37, 'up'); else G_.loadMap('oost', 11, 22, 'up');
  await UI.fade(false);
  if (dest === 'zwolle') await UI.say('Koen', 'Zwolle. Wildernis. Ik wacht bij de auto. Als je terug wilt: je weet me te vinden.');
  G_.busy = false;
};

// ---------- de fatbike van Otto ----------
ITEMS.fatbike = { name: 'Fatbike', desc: 'Mount. Druk op R om op te stappen: je gaat 100% sneller. Officieel 25 km per uur.', key: true, sell: 2000 };
(function () {
  const otto = NPCS.find((n) => n.id === 'rick');
  const talk = otto.talk;
  otto.talk = async function () {
    if ((G.P.items.fatbike || 0) > 0) return talk.call(this);
    await say('Otto', 'Psst. Ik heb een fatbike te koop. Elektrisch. Opgevoerd. Officieel natuurlijk niet.');
    if (G.P.lvl < 10) { await say('Otto', `Maar alleen voor serieuze types. Kom terug als je level 10 bent. Jij bent level ${G.P.lvl}.`); return; }
    const k = await ask('Otto', 'EUR 10.000. Contant. Geen vragen. Je gaat er twee keer zo snel mee.', ['Kopen (EUR 10.000)', 'Te duur']);
    if (k !== 0) { await say('Otto', 'Dan loop je maar. Langzaam.'); return; }
    if (G.P.money < 10000) { await say('Otto', `Je hebt EUR ${G.P.money}. Dat is geen EUR 10.000. Ik heb het nagerekend.`); return; }
    G.P.money -= 10000;
    G.give('fatbike');
    SFX.win();
    await say('Otto', window.MODE3D ? 'Hij is van jou. Druk op R om op te stappen. En niet tegen de kliko van Henk.' : 'Hij is van jou. Rijden kan in de 3D-versie (toets R).');
  };
})();

// ---------- permadeath ----------
// Wat je bij je had (geld, spullen, wapens, kleding) is weg; alleen spullen voor het verhaal houd je.
const QUEST_KEEP = ['motorblok', 'bal', 'telefoon', 'sleutel', 'opapet'];
async function hardcoreDeath(cause) {
  const G_ = G, P = G_.P;
  const lost = { money: P.money, items: {}, weapons: (P.weapons || []).slice() };
  for (const [id, n] of Object.entries(P.items)) if (n > 0 && !QUEST_KEEP.includes(id)) lost.items[id] = n;
  if (G_.onDeathDrop) G_.onDeathDrop(lost);
  const keep = {};
  for (const id of QUEST_KEEP) if (P.items[id]) keep[id] = P.items[id];
  const deaths = (P.deaths || 0) + 1;
  Object.assign(P, freshState().P, { items: keep, weapons: [], wear: {}, wpn: null, money: 0, deaths });
  if (G_.S.ap && window.MODE3D) G_.S.ap.cl = null;
  G_.busy = true;
  await UI.fade(true);
  G_.loadMap('delfzicht_binnen', 3, 4, 'down');
  G_.save();
  await UI.fade(false);
  await UI.say('', `${cause || 'Alles wordt zwart.'}`);
  await UI.say('Zuster Hilda', 'Ah, je bent wakker. Je ligt in Delfzicht. Je bent er heel slecht aan toe geweest.');
  await UI.say('', `PERMADEATH. Je geld, je spullen, je kleren en je wapens ben je kwijt. Je bent weer level 1.${window.MODE3D ? ' Wat je bij je had, ligt nog op de plek waar je viel. Iedereen kan het oprapen.' : ''}`);
  G_.busy = false;
}
LOOKS.zuster = { skin: '#f0c9a0', hair: '#e0b850', style: 'bun', shirt: '#f4f1ea', pants: '#f4f1ea', extra: [] };
NPCS.push({ id: 'zuster', map: 'delfzicht_binnen', x: 9, y: 5, dir: 'left', look: LOOKS.zuster,
  async talk() {
    await say('Zuster Hilda', pick([
      `Jij bent hier al ${G.P.deaths || 0} keer binnengebracht. We hebben een vast bed voor je.`,
      'Hardcore, zeggen ze dan. Ik noem het gewoon dom.',
      'Je kleren? Die lagen niet bij je toen ze je brachten. Alleen dat ziekenhuishemd. Sorry, je hebt niet eens een hemd.',
    ]));
  } });

// de auto van Koen in 2D: twee helften, net als de BMW van Thijs
PROP_DRAW.autoL = function (x) { px(x, 2, 6, 14, 7, '#9ad040'); px(x, 6, 3, 10, 4, '#7ab030'); px(x, 7, 4, 8, 2, '#9ab4d0'); px(x, 3, 12, 4, 4, '#1b1b1b'); px(x, 0, 4, 3, 2, '#1b1b1b'); px(x, 1, 5, 1, 4, '#1b1b1b'); };
PROP_DRAW.autoR = function (x) { px(x, 0, 6, 13, 7, '#9ad040'); px(x, 0, 3, 8, 4, '#7ab030'); px(x, 0, 4, 7, 2, '#9ab4d0'); px(x, 9, 12, 4, 4, '#1b1b1b'); px(x, 12, 8, 3, 2, '#f7dc8a'); px(x, 13, 11, 3, 2, '#888'); };

// ---------- de grote kleedkamer naast het voetbalveld, vol hooligans ----------
// het sportpark wordt naar het oosten groter
(function () {
  const m = MAPS.zuid, W = m.w, add = 14;
  for (let y = 0; y < m.h; y++) {
    const row = m.tiles[y], fill = row[W - 2];
    row[W - 1] = fill;
    for (let i = 0; i < add; i++) row.push(fill);
    row[W + add - 1] = 'tree';
  }
  m.w = W + add;
  rect(m, W - 1, 13, add, 2, 'grass');
  rect(m, 33, 10, 13, 1, 'path');
  building(m, { id: 'kleedkamer', x: 36, y: 2, w: 10, h: 7, door: 41, kind: 'shop', label: 'KLEEDKAMERS', signCol: '#2a4a9a' });
  setT(m, 41, 9, 'path');
  prop(m, 38, 11, 'bank', true, 'bank'); prop(m, 44, 11, 'bordje', true, 'kk_bord');
  [[35, 10], [46, 10]].forEach(([x, y]) => prop(m, x, y, 'lamp', true));
})();
house('kleedkamer_binnen', 'Kleedkamer', 18, 12, 'tegel', 9, [[2, 2, 'kast'], [3, 2, 'kast'], [4, 2, 'kast'], [13, 2, 'kast'], [14, 2, 'kast'], [15, 2, 'kast'], [8, 2, 'bank'], [1, 1, 'poster', true, 'kk_poster'], [16, 9, 'biervat'], [1, 9, 'doos', true, 'kk_tassen']]);
PROPS.kk_bord = () => me('KLEEDKAMERS. Daaronder, met een stift: "BEZET. Door ons. Wegwezen."');
PROPS.kk_poster = () => me('Een sjaal aan de muur, en een poster: "WIJ ZINGEN HARDER DAN JULLIE". Daaronder een tekening van een spandoek.');
PROPS.kk_tassen = () => me('Een berg sporttassen. Er komt een geur uit die je nooit meer vergeet.');

Object.assign(LOOKS, {
  hool_a: { skin: '#e8b090', hair: '#d8b25a', style: 'bald', shirt: '#2a4a9a', pants: '#2a2a3a', extra: ['belly', 'beard'] },
  hool_b: { skin: '#f0c4a0', hair: '#1b1b1b', style: 'cap', cap: '#1b1b1b', shirt: '#1b1b1b', pants: '#3a3a44', pat: 'jacket', extra: [] },
  hool_c: { skin: '#d8a880', hair: '#6b4226', style: 'short', shirt: '#c23b2e', pants: '#2a4a9a', pat: 'tracksuit', extra: ['mustache'] },
  hool_kapo: { skin: '#e8b090', hair: '#a8a8b0', style: 'bald', shirt: '#2a4a9a', pants: '#1b1b1b', extra: ['belly', 'beard', 'tired'] },
});
const HOOL = (o) => ({ hp: 30, atk: 6, def: 2, xp: 14, money: 10, ...o });
Object.assign(ENEMIES, {
  hool_a: HOOL({ name: 'Hooligan met buikje', look: 'hool_a', moves: ['zingt heel hard in je oor', 'gooit een plastic bekertje bier', 'duwt je met zijn buik'],
    talk: [{ t: 'Zing zijn clublied mee', v: 45, r: 'Je kent de tekst niet, maar je brult heel hard. Hij is ontroerd.' }, { t: 'Zeg dat zijn club gaat degraderen', v: -1, r: '"WAT ZEG JIJ?!"' }],
    spare: 'Hij slaat een arm om je heen, zingt nog één couplet en waggelt weg.' }),
  hool_b: HOOL({ name: 'Hooligan met capuchon', look: 'hool_b', atk: 7, moves: ['steekt een bengaals vuurtje aan', 'trekt zijn capuchon over zijn ogen', 'doet een kung-fu trap'],
    talk: [{ t: 'Vraag waar hij zijn jas gekocht heeft', v: 45, r: '"Bij de outlet. Echt Stone Island. Bijna."' }, { t: 'Zeg dat hij er niet eng uitziet', v: -1, r: 'Hij trekt zijn capuchon nog verder dicht. Woedend.' }],
    spare: 'Hij verdwijnt in een wolk bengaals vuur. Hij hoest nog na.' }),
  hool_c: HOOL({ name: 'Hooligan in trainingspak', look: 'hool_c', hp: 34, moves: ['zwaait met een sjaal', 'roept "SCHEIDS!"', 'gooit een aansteker'],
    talk: [{ t: 'Prijs zijn snor', v: 45, r: '"Die laat ik al sinds 1998 staan." Hij glundert.' }, { t: 'Zeg dat trainingspakken uit zijn', v: -1, r: 'Hij ritst zijn trainingsjack woedend helemaal dicht.' }],
    spare: 'Hij gaat op de bank zitten en begint over vroeger.' }),
  hool_kapo: HOOL({ name: 'De Kapo', look: 'hool_kapo', hp: 90, atk: 10, def: 4, xp: 60, money: 60, boss: true, moves: ['brult door een megafoon', 'gooit een bank naar je', 'zet een spreekkoor in'],
    talk: [{ t: 'Vraag naar de goeie ouwe tijd', v: 35, r: '"Vroeger was alles beter. Toen hadden we nog stadionworst."' }, { t: 'Zeg dat zijn megafoon nep is', v: -1, r: '"NEP?!" Hij brult het door de megafoon.' }],
    spare: 'De Kapo legt zijn megafoon neer. "Goed gestreden, Meedhuizenaar." Hij geeft je een stuk worst.' }),
});
Object.assign(DOORS, {
  kleedkamer: async () => {
    const k = await ask('', 'Achter de deur hoor je gebrul, gezang en het geluid van een bierkrat dat wordt omgegooid. Naar binnen?', ['Naar binnen', 'Liever niet']);
    if (k !== 0) { G.stepBack(); return; }
    await G.warp('kleedkamer_binnen', 9, 10, 'up');
    await hooliganBrawl();
  },
  uit_kleedkamer_binnen: go('zuid', 41, 9, 'down'),
});
async function hooliganBrawl() {
  const f = F();
  if (f.brawlT && Date.now() - f.brawlT < 3 * 60 * 1000) { await me('De kleedkamer is leeg. Het ruikt naar bier, zweet en Deep Heat. Ze komen vast terug.'); return; }
  G.busy = true;
  await me('De kleedkamer zit VOL hooligans. Iemand zet de muziek uit. Alle hoofden draaien naar jou.');
  await say('De Kapo', 'Zo. Een Meedhuizenaar. In ONZE kleedkamer.');
  await say('De Kapo', 'Jongens. Pakken.');
  f.brawlT = Date.now();
  let r = 'win';
  if (window.MODE3D) r = await CB.brawl([['hool_a', 'hool_b', 'hool_c'], ['hool_c', 'hool_a', 'hool_b'], ['hool_kapo', 'hool_b']]);
  else for (const id of ['hool_a', 'hool_b', 'hool_c', 'hool_kapo']) { r = await G.fight(id); if (r !== 'win' && r !== 'spared') break; r = 'win'; }
  if (r === 'win') {
    G.busy = true;
    G.P.money += 150; SFX.win();
    await me('De laatste hooligan kruipt huilend de douche in. Jij hebt de kleedkamer veroverd.');
    await me('In een sporttas vind je EUR 150. En een halve rookworst. Die laat je liggen.');
  }
  G.busy = false;
}
