// Quest: Hermann en zijn vliegtuigje op het voetbalveld. Hij praat als een LinkedIn-post, ziet eruit als een cryptomannetje
// en moet "premium witte blokken" naar Duitsland brengen. Ga je mee, dan gooi jij ze uit het luik... en val je er zelf achteraan.
// Gedeeld door 2D en 3D; in 3D is de vlucht een echte cutscene (scenes3d.js).

LOOKS.hermann = { skin: '#f0c4a0', hair: '#e0b850', style: 'short', shirt: '#2a3a6a', pants: '#c8b890', shoes: '#f4f1ea', pat: 'logo', extra: ['glasses'] };
prop(MAPS.zuid, 21, 6, 'vliegtuig', true, 'vliegtuig');
PROP_HIDE.vliegtuig = () => !!G.S && G.quest('hermann') >= 2;
PROPS.vliegtuig = () => me('Een klein vliegtuigje, midden op het voetbalveld. Op de staart: HERMANN AIR. Daaronder: "Disrupting logistics."');

QUESTS.hermann = {
  name: 'Witte blokken', done: 2,
  steps: ['', 'Hermann staat met zijn vliegtuigje op het voetbalveld. Hij moet "premium witte blokken" naar Duitsland brengen en zoekt een gedreven teamplayer.', 'Je bent uit het vliegtuig van Hermann gevallen en met een parachute in de Dorpsstraat geland. Hermann heeft je aanbevolen op LinkedIn.'],
};
NPCS.push({ id: 'hermann', map: 'zuid', x: 23, y: 7, dir: 'left', look: LOOKS.hermann, show: () => G.quest('hermann') < 2,
  async talk() {
    const N = 'Hermann';
    if (!G.quest('hermann')) G.quest('hermann', 1);
    await say(N, 'Ik ben trots en dankbaar om aan te kondigen dat ik een nieuwe uitdaging aanga.');
    await say(N, 'Wat een vliegtuig mij leerde over leiderschap: je moet durven loslaten. Letterlijk.');
    await say(N, 'Ik zoek een gedreven teamplayer met een hands-on mentaliteit, voor een kort maar impactvol project.');
    await say(N, 'De opdracht: premium witte blokken van A naar B. A is hier. B is Duitsland. Geen vragen. Wel groei.');
    const k = await ask(N, 'Ben jij klaar voor de volgende stap in je carrière? Agree? #logistiek #disruptie #grindset', ['Ja, ik help je', 'Nee, dit klinkt niet legaal']);
    if (k !== 0) { await say(N, 'Geen probleem. Niet iedereen is klaar voor groei. Ik stuur je een connectieverzoek.'); return; }
    await say(N, 'Love this energy. Instappen. Achterin. Niet aan de blokken komen. Nog niet.');
    await hermannFlight();
  } });

// zonder 3D: de vlucht is tekst
var hermannFlight = async function () {
  G.busy = true;
  await UI.fade(true);
  for (const [n, t] of [['', 'Het vliegtuigje hobbelt over het voetbalveld en trekt op, net over de kantine heen.'], ['Hermann', 'Eerlijk verhaal: vijf jaar geleden had ik niks. Nu heb ik een vliegtuig. En schulden. Maar vooral een vliegtuig.'], ['Hermann', 'NU NU NU!'], ['', 'Je draait je om. Tien witte blokken. Je gooit ze een voor een uit het luik. Bij de laatste glijd je zelf mee naar buiten.'], ['', 'Alles gaat heel langzaam. Dan: een ruk. Je parachute gaat open.']]) await UI.say(n, t);
  G.loadMap('dorp', 17, 15, 'up');
  await UI.fade(false);
  await hermannLanding();
};
async function hermannLanding() {
  G.busy = true;
  await me('Je landt midden op de Dorpsstraat van Meedhuizen. Op je knieën, maar je landt.');
  G.quest('hermann', 2);
  G.P.money += 750;
  SFX.win();
  UI.toast('+EUR 750 provisie van Hermann', 2600);
  await say('LinkedIn', 'Hermann heeft je aanbevolen voor de vaardigheid: Luchtvracht.');
  await say('Hermann', 'Thanks voor de samenwerking! Je provisie staat erop. Sorry van het luik. Learnings. #teamwork');
  G.busy = false;
}

PROP_DRAW.vliegtuig = function (x) { px(x, 1, 7, 14, 3, '#f4f1ea'); px(x, 5, 5, 4, 7, '#e8e6e0'); px(x, 0, 8, 2, 1, '#c23b2e'); px(x, 12, 5, 2, 5, '#c23b2e'); px(x, 3, 7, 3, 1, '#9ab4d0'); px(x, 0, 6, 1, 5, '#555'); };
