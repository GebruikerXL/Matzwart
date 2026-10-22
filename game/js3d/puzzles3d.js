// Jump puzzles (alleen in 3D): stapels kratten, containers en hooibalen naar platte daken. Op elk dak ligt iets.
// De voortgang staat bij je taken: "Op het dak".
const DAKEN = [];
function dakPuzzle(mapId, steps, kind, reward, opts = {}) {
  const m = MAPS[mapId];
  for (const [x, y, h] of steps) m.props.push({ x, y, name: kind, solid: true, h, id: opts.stepId });
  for (const id of opts.flat || []) { const b = m.buildings.find((q) => q.id === id); if (b) { b.flat = true; if (opts.roofH) b.roofH = opts.roofH; } }
  const [rx, ry] = reward.at, id = 'dak_' + reward.key;
  m.props.push({ x: rx, y: ry, name: 'dakbuit', solid: false, id });
  DAKEN.push(id);
  PROP_HIDE[id] = () => (F().daken || []).includes(id);
  PROPS[id] = async () => {
    const f = F(); f.daken = f.daken || [];
    if (f.daken.includes(id)) return;
    f.daken.push(id);
    SFX.win();
    await me(reward.text);
    if (reward.eur) { G.P.money += reward.eur; UI.toast(`+EUR ${reward.eur}`); }
    for (const [it, n] of reward.items || []) G.give(it, n);
    dakenCheck();
  };
}
function dakenCheck() {
  const n = (F().daken || []).length;
  if (n >= DAKEN.length) { G.quest('daken', 2); UI.toast('Alle daken gehaald!', 3000); }
  else UI.toast(`Daken: ${n} van ${DAKEN.length}`, 2200);
}
// het dorpshuis (de Paashaasoren) telt ook mee
DAKEN.push('paashaas');
(function () { const p = PROPS.paashaas; PROPS.paashaas = async () => { await p(); const f = F(); f.daken = f.daken || []; if (!f.daken.includes('paashaas')) { f.daken.push('paashaas'); dakenCheck(); } }; })();

// de EKA: achter de supermarkt staan pallets bierkratten
dakPuzzle('oost', [[3, 13, 1.0], [4, 13, 1.9], [5, 13, 2.8], [6, 13, 3.7]], 'stapel',
  { key: 'eka', at: [8, 16], eur: 250, text: 'Op het dak van de EKA: een verloren boodschappentas. Er zit EUR 250 in. En een komkommer.' }, { flat: ['eka'], stepId: 'stapel_kratten' });
// de kleedkamers: hooibalen van de terreinknecht
dakPuzzle('zuid', [[37, 1, 1.0], [38, 1, 2.0], [39, 1, 3.0], [40, 1, 3.8]], 'hooi',
  { key: 'kleedkamer', at: [41, 5], eur: 100, items: [['clubshirt', 1]], text: 'Op het dak van de kleedkamers ligt een opgevouwen clubshirt. Van de Kapo zelf. En EUR 100 in een sok.' }, { flat: ['kleedkamer'], stepId: 'stapel_hooi' });
// Delfzijl: een toren van containers op de kade
dakPuzzle('delfzijl', [[42, 14, 0.9], [42, 15, 1.8], [42, 16, 2.7], [42, 17, 3.6], [42, 18, 4.5], [42, 19, 5.4]], 'cstapel',
  { key: 'containers', at: [42, 19], items: [['gouden_vape', 2]], text: 'Bovenop de hoogste container: twee gouden vapes, met tape vastgeplakt. Iemand verstopt hier zijn spaargeld.' }, { stepId: 'stapel_containers' });
// Delfzicht: hooibalen in het hoge gras achter het ziekenhuis
dakPuzzle('delfzijl', [[35, 39, 1.0], [36, 39, 2.0], [37, 39, 3.0], [38, 39, 3.9]], 'hooi',
  { key: 'delfzicht', at: [38, 42], eur: 150, items: [['paracetamol', 4]], text: 'Op het dak van Delfzicht staat een vergeten EHBO-koffer. Paracetamol en EUR 150. De zuster zal het niet missen.' }, { flat: ['delfzicht'], stepId: 'stapel_hooi' });
// Zwolle: de Sassenpoort, in de wildernis
dakPuzzle('zwolle', [[34, 21, 1.0], [35, 21, 2.0], [36, 21, 3.0]], 'stapel',
  { key: 'sassenpoort', at: [35, 24], eur: 1000, text: 'Boven op de Sassenpoort: de stadskas van Zwolle. EUR 1000. Nu snel naar beneden, voordat iemand je ziet.' }, { flat: ['sassenpoort'], roofH: 3.85, stepId: 'stapel_kratten' });

PROPS.stapel_kratten = () => me('Een stapel kratten. Hij staat verdacht handig, als een trap.');
PROPS.stapel_hooi = () => me('Hooibalen, opgestapeld als een trap. Iemand wilde hier ooit naar boven.');
PROPS.stapel_containers = () => me('Containers, scheef op elkaar gestapeld. Met een beetje springen kom je bovenop.');

QUESTS.daken = {
  name: 'Op het dak', done: 2,
  steps: ['', () => `Daken gehaald: ${(F().daken || []).length} van ${DAKEN.length}. Zoek stapels kratten, hooibalen en containers achter gebouwen en spring (Spatie) naar boven. Op elk dak ligt iets.`, 'Alle daken gehaald. Jij bent de koning van de dakgoot.'],
};
// de taak staat vanaf het begin open
(function () {
  const begin = G.begin.bind(G);
  G.begin = function (st, fresh) { const r = begin(st, fresh); if (!G.S.quests.daken) G.S.quests.daken = 1; return r; };
})();
