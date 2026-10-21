// Verhaal: personages, opdrachten, deuren en voorwerpen.
const F = () => G.flags;
const say = (n, t) => G.say(n, t);
const ask = (n, t, o, c) => G.ask(n, t, o, c);
const me = (t) => G.say('', t);

const QUESTS = {
  naam: {
    name: 'Wie ben ik?', done: 4,
    steps: [
      '',
      () => `Vraag rond wie je bent. Getuigen gesproken: ${['w_gerda', 'w_bakker', 'w_henk'].filter((f) => F()[f]).length} van 3 (Gerda, mevrouw Bakker, Henk).`,
      'Rick wacht op je in het dorpshuis.',
      'Rick zegt dat je in het gele huis naast mevrouw Bakker woont.',
      'Je weet het bijna.',
    ],
  },
  telefoon: {
    name: 'Waar is mijn telefoon?', done: 4,
    steps: ['', 'Gerda zegt dat Henk de buurman je telefoon heeft.', 'Je telefoon is terug, maar leeg. Zoek een oplader.', 'Laad je telefoon op achter de bar bij Gerda.', 'Opgeladen tot 1%. Eén bericht van Rick.'],
  },
  fiets: {
    name: 'Waar is mijn fiets?', done: 6,
    steps: ['', 'Boer Jansen zag een groene fiets in de sloot liggen, ten zuiden van het dorp.', 'Je kunt niet bij de fiets. Vraag boer Jansen om een hark.', 'Jansen wil eerst koffie. Zwart, drie klontjes. Gerda van het café heeft koffie.', 'Breng de koffie naar boer Jansen.', 'De hark staat in de schuur. Vis je fiets uit de sloot.', 'Fiets gevonden. Nat, maar heel.'],
  },
  goedmaken: {
    name: 'Iets goedmaken', done: 4,
    steps: ['', 'Mevrouw Bakker mist haar tuinkabouter Gerrit. Jij hebt hem gisteren meegenomen.', 'Er lag een tuinkabouter in je fietsmand. Van wie zou die zijn?', 'Breng Gerrit terug naar mevrouw Bakker.', 'Gerrit staat weer in de tuin.'],
  },
};

const LOOK = {
  boer: { skin: '#e0a880', hair: '#8a6a4a', style: 'cap', cap: '#2e7a3a', shirt: '#c8463a', pants: '#3d5fa0', extra: ['overall', 'beard'] },
  gerda: { skin: '#f0c9a0', hair: '#b8442a', style: 'long', shirt: '#2a2a2a', pants: '#2a2a2a', extra: ['apron'] },
  bakker: { skin: '#eac0a0', hair: '#d8d8e0', style: 'bun', shirt: '#7a4a9a', pants: '#4a3a5a', extra: ['glasses'] },
  dirk: { skin: '#e0b090', hair: '#e0e0e0', style: 'cap', cap: '#3a3a4a', shirt: '#6a5a4a', pants: '#3a3a3a', extra: ['mustache'] },
  kind: { skin: '#f0c9a0', hair: '#e0b040', style: 'short', shirt: '#3aa0e0', pants: '#c8463a', extra: ['blush'] },
  post: { skin: '#c89070', hair: '#2a2020', style: 'cap', cap: '#e08a20', shirt: '#e08a20', pants: '#2a4a7a', extra: [] },
  wachter: { skin: '#e8b898', hair: '#4a3a2a', style: 'short', shirt: '#4a7a5a', pants: '#2a2a3a', extra: ['glasses'] },
  bestuur: { skin: '#f0c9a0', hair: '#5a3a2a', style: 'curly', shirt: '#c23b6e', pants: '#2a2a3a', extra: [] },
};

function bumpNaam() {
  const f = F();
  if (G.quest('naam') === 1 && f.w_gerda && f.w_bakker && f.w_henk && f.rickMsg) G.quest('naam', 2);
}

// Elke keer dat iemand bijna je naam zegt, gebeurt er iets.
async function bijna(wie, begin, onderbreking) {
  await say(wie, begin);
  SFX.no();
  await me(onderbreking);
}

const NPCS = [
  // ---------- dorp ----------
  {
    id: 'boer', map: 'dorp', x: 30, y: 23, dir: 'left', look: LOOK.boer,
    async talk() {
      const f = F(), q = G.quest('fiets');
      if (!f.metBoer) {
        f.metBoer = true;
        await say('Boer Jansen', 'Hé! Daar is ie. Lekker geslapen in mijn schuur?');
        await say('Boer Jansen', 'Ik vond je vanochtend om vijf uur tussen het stro. Zingend. Iets over een polonaise.');
        const k = await ask('Boer Jansen', 'Wat wou je vragen?', ['Weet u hoe ik heet?', 'Sorry van de schuur…']);
        if (k === 1) await say('Boer Jansen', 'Ach, geeft niks. De koeien vonden het gezellig. Maar weet je eigenlijk wel hoe je heet?');
        await bijna('Boer Jansen', 'Natuurlijk weet ik dat! Jij bent de zoon van… van…', 'Van binnen roept iemand: "KLAAS! DE KOEIEN STAAN WEER IN DE SLOOT!"');
        await say('Boer Jansen', 'Ja ja, ik kom! … Waar was ik? Oh ja. Geen idee eigenlijk, jongen.');
        await say('Boer Jansen', 'Vraag het in het dorp. Gerda van café De Gouden Kater weet alles van iedereen.');
        await say('Boer Jansen', 'En je fiets ligt trouwens in de sloot. Groen ding. Zag hem vanochtend liggen, aan de weilandkant.');
        G.quest('naam', 1);
        if (!q) G.quest('fiets', 1);
        UI.toast('Tip: Esc of B opent het menu met je opdrachten', 3200);
        return;
      }
      if (q === 2) {
        await say('Boer Jansen', 'Een hark? Kan wel. Maar eerst een bakkie.');
        await say('Boer Jansen', 'Mijn vrouw heeft de koffiemachine gesloopt. Haal er eentje bij Gerda. Zwart, drie klontjes.');
        G.quest('fiets', 3); return;
      }
      if (q === 3 || q === 4) {
        if (G.has('koffie_boer')) {
          G.take('koffie_boer');
          await say('Boer Jansen', 'Ahh. Zwart, drie klontjes. Gerda weet het.');
          await say('Boer Jansen', 'De hark staat in de schuur. Pak maar. En niet weer in het stro gaan liggen, hè.');
          f.harkOk = true; G.quest('fiets', 5); return;
        }
        await say('Boer Jansen', 'Eerst koffie. Zwart. Drie klontjes. Bij Gerda.'); return;
      }
      const lines = [
        'De koeien zijn vandaag ook brak. Geen idee waarom.',
        'Blaarkoppen, dat zijn het. Rood met een witte kop. Net als jij vanochtend, maar dan andersom.',
        'Als je in het hoge gras loopt, kom je allerlei volk tegen. Pas maar op.',
        'Op het bankje aan de Dorpsstraat kun je even bijkomen. Doe ik ook altijd.',
      ];
      await say('Boer Jansen', lines[Math.floor(Math.random() * lines.length)]);
    },
  },
  {
    id: 'bakker', map: 'dorp', x: 9, y: 19, dir: 'down', look: LOOK.bakker,
    async talk() {
      const f = F();
      if (G.has('kabouter')) {
        G.take('kabouter'); f.kabouterTerug = true;
        await say('Mevrouw Bakker', 'GERRIT!');
        await say('Mevrouw Bakker', 'Je hebt hem teruggebracht! Hij is helemaal nat. Wat heb je met hem gedaan?');
        await me('Je vertelt over de sloot. Mevrouw Bakker zet Gerrit voorzichtig terug op zijn sokkeltje.');
        await say('Mevrouw Bakker', 'Je zei gisteravond dat hij "ook eens uit moest". Nou, dat is dan gebeurd.');
        await say('Mevrouw Bakker', 'Je bent eigenlijk best een lieve jongen. Je woont hier al jaren, hè. Hoe heette je ook alweer…');
        await bijna('Mevrouw Bakker', 'Iets met een J. Of een G. Jo… Ge…', 'Gerrit valt om. Mevrouw Bakker gilt en zet hem weer recht. Ze is de draad kwijt.');
        await say('Mevrouw Bakker', 'Ik zeg altijd gewoon "jongen". Hier, neem deze oplader. Mijn kleinzoon laat ze overal liggen.');
        G.give('oplader');
        f.w_bakker = true;
        G.quest('goedmaken', 4);
        if (G.quest('telefoon') === 2) G.quest('telefoon', 3);
        bumpNaam();
        return;
      }
      if (f.kabouterTerug) {
        const l = ['Gerrit en ik gaan vanmiddag samen in de zon zitten.', 'Doe je moeder de groeten. Ik weet niet meer hoe zij heet, maar doe ze de groeten.', 'Als je die oplader niet meer nodig hebt, mag je hem houden.'];
        await say('Mevrouw Bakker', l[Math.floor(Math.random() * l.length)]); return;
      }
      if (!f.metBakker) {
        f.metBakker = true;
        await say('Mevrouw Bakker', 'Jij! Jij durft hier nog te komen!');
        await say('Mevrouw Bakker', 'Gisteravond om half twee stond jij in mijn tuin. Met Gerrit in je armen.');
        await say('Mevrouw Bakker', 'Gerrit is mijn tuinkabouter. Hij staat daar al eenendertig jaar. En nu is hij weg!');
        const k = await ask('Mevrouw Bakker', 'Nou?', ['Weet u wie ik ben?', 'Sorry. Ik ga hem zoeken.']);
        if (k === 0) await say('Mevrouw Bakker', 'Wie je bent? Een kabouterdief, dat ben je!');
        await say('Mevrouw Bakker', 'Zonder Gerrit praat ik niet met je.');
        if (G.quest('goedmaken') < 2) G.quest('goedmaken', 1);
        return;
      }
      await say('Mevrouw Bakker', 'Zonder Gerrit praat ik niet met je. Hij heeft een rood mutsje. Je kunt hem niet missen.');
    },
  },
  {
    id: 'henk', map: 'dorp', x: 17, y: 13, dir: 'right', look: LOOKS.henk,
    async talk() {
      const f = F();
      if (f.henkBeaten) {
        const l = ['Die heg, hè. Niet vergeten.', 'Mijn tulpen komen er wel weer bovenop. Jij ook, denk ik.', 'Ga eens naar huis, jongen. Je ziet eruit als een natte krant.'];
        await say('Henk', l[Math.floor(Math.random() * l.length)]); return;
      }
      if (!f.metHenk) {
        f.metHenk = true;
        await say('Henk', 'JIJ!');
        await say('Henk', 'Om vier uur vannacht belde jij aan. Zeven keer.');
        await say('Henk', 'Toen ik opendeed, gooide jij je telefoon naar me en riep je: "BEL ME MAAR ALS JE WEET HOE IK HEET!"');
        await say('Henk', 'En toen heb je in mijn tulpen geplast.');
        if (!G.quest('telefoon')) G.quest('telefoon', 1);
      }
      const k = await ask('Henk', 'Je telefoon? Die krijg je pas terug als je langs mij komt!', ['Kom maar op, Henk', 'Even niet']);
      if (k !== 0) { await say('Henk', 'Dat dacht ik al.'); return; }
      const r = await G.fight('henk');
      if (r === 'win' || r === 'spared') {
        f.henkBeaten = true;
        await say('Henk', 'Goed, goed. Hier heb je je telefoon. Hij is natuurlijk leeg.');
        G.give('telefoon');
        G.quest('telefoon', G.has('oplader') ? 3 : 2);
        await say('Henk', 'En je naam? Je riep "ik ben de koning van Meedhuizen". Dat is geen naam.');
        await bijna('Henk', 'Maar je moeder riep je vroeger altijd hier op straat. Het was… J… Ja…', 'Een trekker rijdt voorbij en toetert drie keer. Henk zwaait. Hij weet niet meer wat hij zei.');
        await say('Henk', 'Ligt op het puntje van mijn tong. Komt wel weer.');
        f.w_henk = true;
        bumpNaam();
      } else if (r === 'fled') {
        await say('Henk', 'Ja, ren maar! Ik heb je telefoon nog!');
      }
    },
  },
  {
    id: 'kind', map: 'dorp', x: 20, y: 16, dir: 'down', look: LOOK.kind, wander: true,
    async talk() {
      const l = [
        'Mama zegt dat ik niet meer met jou mag praten. Sinds gisteren.',
        'Jij was het die op de bushalte stond te zingen! Het was heel vals.',
        'Weet je hoe jij heet? Ik wel. Maar ik zeg het niet. Haha!',
      ];
      await say('Kind', l[Math.floor(Math.random() * l.length)]);
    },
  },
  {
    id: 'post', map: 'dorp', x: 28, y: 14, dir: 'left', look: LOOK.post, wander: true,
    async talk() {
      if (!F().postGag) {
        F().postGag = true;
        await say('Postbode', 'Hé, jou zoek ik! Ik heb een pakje voor je.');
        await bijna('Postbode', 'Even kijken wat er op het etiket staat… Voor de heer J…', 'Het etiket is nat geworden. De inkt is uitgelopen tot één grote blauwe vlek.');
        await say('Postbode', 'Nou ja. Ik leg het wel bij de buren.');
        return;
      }
      await say('Postbode', 'Je pakje ligt bij de buren. Welke buren? Goede vraag.');
    },
  },
  {
    id: 'wachter', map: 'dorp', x: 23, y: 16, dir: 'left', look: LOOK.wachter,
    async talk() {
      await say('Man bij de bushalte', 'De bus komt hier twee keer per dag. Vandaag nog niet.');
      await say('Man bij de bushalte', 'Jij hebt gisteren de dienstregeling meegenomen, toch? Je zei dat je hem "ging inlijsten".');
    },
  },
  // ---------- café ----------
  {
    id: 'gerda', map: 'cafe', x: 4, y: 2, dir: 'down', look: LOOK.gerda,
    async talk() {
      const f = F();
      if (!f.w_gerda) {
        f.w_gerda = true;
        await say('Gerda', 'Nou nou. Kijk eens wie we daar hebben. De held van gisteravond.');
        const k = await ask('Gerda', 'Weet je eigenlijk nog hoe je heet?', ['Eh… nee.', 'Natuurlijk! …Nee.']);
        await bijna('Gerda', k === 0 ? 'Haha! Ik weet het wel, hoor. Jij bent…' : 'Dat dacht ik al. Nou, jij bent…', 'Achter de bar gaat de telefoon. "Café De Gouden Kater, met Gerda? … Nee, we gaan pas om twaalf open."');
        await say('Gerda', 'Waar waren we? Oh ja. Je hebt hier gisteren een rekening van €47 laten liggen.');
        await say('Gerda', 'En je kreeg ruzie met Rick. Bij de finale van het klaverjassen. Je noemde hem een valsspeler, waar iedereen bij was.');
        await say('Gerda', 'Je naam stond op de inschrijflijst, maar daar heeft iemand een heel biertje overheen gegooid. Jij, denk ik.');
        await say('Gerda', 'En je telefoon? Die heb je om vier uur naar Henk gegooid. De buurman. Vraag het hem maar.');
        if (G.quest('telefoon') < 1) G.quest('telefoon', 1);
        bumpNaam();
        return;
      }
      for (;;) {
        const opts = ['Wat kopen'];
        const acts = [() => G.shop(['frikandelbroodje', 'koffie', 'energiedrank', 'paracetamol'])];
        if (G.quest('fiets') === 3 && !G.has('koffie_boer')) {
          opts.push('Koffie voor boer Jansen');
          acts.push(async () => {
            await say('Gerda', 'Zwart met drie klontjes? Dat is voor Klaas Jansen. Hij drinkt niks anders.');
            await say('Gerda', 'Van het huis. Die rekening van €47 staat nog wel open, hè.');
            G.give('koffie_boer'); G.quest('fiets', 4);
          });
        }
        if (G.has('telefoon') && G.has('oplader') && G.quest('telefoon') < 4) {
          opts.push('Telefoon opladen');
          acts.push(chargePhone);
        }
        opts.push('Heb je een tip?', 'Doei');
        acts.push(async () => say('Gerda', hint()), null);
        const k = await ask('Gerda', 'Zeg het maar, schat.', opts, true);
        if (k < 0 || !acts[k]) { await say('Gerda', 'Doei! En drink vandaag maar water.'); return; }
        await acts[k]();
        if (opts[k] !== 'Wat kopen') return;
      }
    },
  },
  {
    id: 'dirk', map: 'cafe', x: 8, y: 4, dir: 'right', look: LOOK.dirk,
    async talk() {
      if (!F().dirkGag) {
        F().dirkGag = true;
        await say('Opa Dirk', 'Ik ken jou! Jij bent de kleinzoon van… van die man met de pet.');
        await say('Opa Dirk', 'Al heeft iedereen hier een pet. Ik ook.');
        await bijna('Opa Dirk', 'Wacht, wacht, ik weet het. Jij heet…', 'Opa Dirk valt in slaap. Midden in de zin. Hij snurkt zacht.');
        return;
      }
      const l = ['Zzz…', 'Hè? Wat? Ik sliep niet.', 'Vroeger was hier alles beter. Behalve het bier. Dat is hetzelfde.'];
      await say('Opa Dirk', l[Math.floor(Math.random() * l.length)]);
    },
  },
  // ---------- dorpshuis ----------
  {
    id: 'rick', map: 'dorpshuis', x: 7, y: 3, dir: 'down', look: LOOKS.rick,
    async talk() {
      const f = F();
      if (f.rickBeaten) {
        await say('Rick', 'Ga nou maar naar huis, man. Het gele huis. Naast mevrouw Bakker.'); return;
      }
      if (!f.metRick) {
        f.metRick = true;
        await say('Rick', 'Daar ben je eindelijk.');
        await say('Rick', 'Gisteravond. Finale klaverjassen. Jij en ik.');
        await say('Rick', 'Jij verloor. En toen noemde je mij een valsspeler. Waar het hele dorp bij was.');
        await say('Rick', 'Daarna sprong je op tafel en begon je een polonaise. Iedereen deed mee. Behalve ik.');
      }
      const k = await ask('Rick', 'Dat maken we nu af.', ['Rick, ik weet niet eens hoe ik heet', 'Kom maar op']);
      if (k === 0) await say('Rick', 'Ik wel. Versla me, dan vertel ik het je.');
      const r = await G.fight('rick');
      if (r !== 'win' && r !== 'spared') return;
      f.rickBeaten = true;
      await say('Rick', 'Oké. Oké! Je wint.');
      await say('Rick', 'Eerlijk gezegd was het best een mooie avond. Die polonaise ging helemaal tot aan de kerk.');
      await say('Rick', 'Hier. Dit heb je hier laten liggen.');
      await me('Rick geeft je je portemonnee. Je maakt hem gretig open. Daarin: een bierviltje, een stempelkaart van de snackbar, en geen ID-kaart.');
      await me('Natuurlijk niet.');
      await bijna('Rick', 'Je naam? Iedereen noemt je gewoon "die van het gele huis". Maar je echte naam is…', 'De klok van de kerk begint te slaan. Twaalf keer. Rick wacht beleefd tot hij klaar is, en is dan vergeten wat hij wilde zeggen.');
      await say('Rick', 'Nou ja. Je woont in het gele huis, naast mevrouw Bakker. Ga daar maar kijken.');
      G.quest('naam', 3);
    },
  },
  {
    id: 'bestuur', map: 'dorpshuis', x: 11, y: 8, dir: 'up', look: LOOK.bestuur, wander: true,
    async talk() {
      await say('Bestuurslid', 'Ik ben de stoelen aan het tellen. Er missen er twee. Én de tafelvlag.');
      await say('Bestuurslid', 'Jij weet daar zeker niks van? Je had gisteravond wel een tafelvlag om als cape.');
    },
  },
];

// ---------- voorwerpen in de wereld ----------
const PROP_HIDE = {
  fiets: () => F().fiets,
  hark: () => G.has('hark') || F().fiets,
};

const PROPS = {
  plaatsbord: () => me('MEEDHUIZEN. Je weet tenminste wáár je bent. Dat is een begin.'),
  bordoost: () => me('Er staat "Doorgaand verkeer". Jij gaat nergens heen tot je weet wie je bent.'),
  bushalte: () => me('Dienstregeling: weg. Op de plek waar hij hing staat met stift: "INGELIJST".'),
  tractor: () => me('Een groene trekker. De sleutel zit er nog in. Nee. Je hebt gisteren al genoeg gedaan.'),
  koe0: () => me('De koe kijkt je aan alsof ze precies weet hoe je heet.'),
  koe1: () => me('"Boe." Dat is het niet. Denk je.'),
  koe2: () => me('Een Groninger blaarkop. Rood met een witte kop. Ze kauwt rustig verder.'),
  koe3: () => me('De koe draait zich om. Ook zij heeft je gisteren gezien.'),
  sokkel: () => me(F().kabouterTerug ? 'Gerrit staat weer op zijn plek. Hij kijkt nog altijd verwijtend.' : 'Een leeg sokkeltje. In het mos staan twee piepkleine voetafdrukken.'),
  bank: async () => {
    G.P.hp = G.P.maxHp; G.P.ep = G.P.maxEp; SFX.heal();
    await me('Je gaat even op het bankje zitten en kijkt naar de Dorpsstraat. Je voelt je een stuk beter. (HP en EP vol)');
    const k = await ask('', 'Wil je opslaan?', ['Opslaan', 'Nee']);
    if (k === 0) UI.toast(G.save() ? 'Opgeslagen' : 'Opslaan lukt niet in deze browser');
  },
  fiets: async () => {
    const f = F();
    if (G.has('hark')) {
      await me('Je steekt de hark in de sloot en graait wat rond. Kroos. Een schoen. Een winkelwagentje?');
      await me('Beet! Je trekt een groene fiets uit het water. Met een snor van kroos.');
      f.fiets = true; G.take('hark'); G.give('fiets');
      G.quest('fiets', 6);
      await me('In de fietsmand ligt… een tuinkabouter met een rood mutsje. Hij kijkt je verwijtend aan.');
      G.give('kabouter');
      G.quest('goedmaken', f.metBakker ? 3 : 2);
      return;
    }
    await me('In de sloot ligt een groene fiets. Dat is vast de jouwe. Je kunt er niet bij zonder iets met een lange steel.');
    if (G.quest('fiets') < 2) G.quest('fiets', 2);
  },
  hark: async () => {
    if (!F().harkOk) { await me('Een hark van boer Jansen. Na gisteren lijkt het je geen goed plan om zomaar iets mee te nemen.'); return; }
    G.give('hark');
    await me('Je pakt de hark. Lang genoeg voor de sloot.');
  },
  bonnenbak: () => me('Bovenop ligt een bonnetje: "Tafel 4: 11 bier, 3 bitterballen, 1 rondje voor de zaak (??)". Het handschrift lijkt op dat van jou.'),
  piano: () => me('Je drukt één toets in. Opa Dirk kijkt je vernietigend aan. Of hij slaapt met open ogen.'),
  cafeposter: () => me('KLAVERJASCOMPETITIE MEEDHUIZEN. Finale vrijdagavond in het dorpshuis. Iemand heeft er "VALSSPELER!!" bij geschreven.'),
  klaverposter: () => me('Uitslag klaverjassen: 1. Rick. 2. [een grote bruine bierkring].'),
  prikbord: () => me('GEZOCHT: Wie heeft gisteravond de polonaise ingezet? Graag melden bij het bestuur. Er staat een tekening bij. Die lijkt heel erg op jou.'),
};

// ---------- deuren ----------
const DOORS = {
  cafe: () => G.warp('cafe', 6, 8, 'up'),
  uit_cafe: () => G.warp('dorp', 6, 13, 'down'),
  schuur: () => G.warp('schuur', 5, 7, 'up'),
  uit_schuur: async () => {
    await G.warp('dorp', 36, 22, 'down');
    if (!F().metBoer) {
      G.busy = true;
      await say('Boer Jansen', 'Hé! Jij daar! Kom eens even hier!');
      G.busy = false;
    }
  },
  dorpshuis: async () => {
    if (!F().rickMsg) {
      await me('Op de deur hangt een briefje: "Gesloten tot vanavond. P.S. Wie heeft het toilet zo achtergelaten?!"');
      G.stepBack(); return;
    }
    await G.warp('dorpshuis', 7, 9, 'up');
  },
  uit_dorpshuis: () => G.warp('dorp', 26, 13, 'down'),
  kerk: async () => { await me('De kerkdeur is dicht. Binnen oefent iemand op het orgel. Elke noot doet pijn.'); G.stepBack(); },
  bakker: async () => { await me('Aanbellen bij mevrouw Bakker? Ze staat toch gewoon in haar tuin.'); G.stepBack(); },
  boerderij: async () => { await me('"SCHOENEN UIT!" roept iemand van binnen. Je loopt maar weer verder.'); G.stepBack(); },
  henk: async () => {
    await me('Je belt aan. Henk staat drie meter verderop en kijkt je aan.');
    await say('Henk', 'Ik sta híér.');
    G.stepBack();
  },
  geelhuis: async () => {
    if (!F().rickBeaten) {
      await me('Een geel huis. Je probeert je sleutel. Hij past niet. Je draait hem om. Past nog steeds niet.');
      await me('Gek. Dit zal wel niet jouw huis zijn.');
      G.stepBack(); return;
    }
    await finale();
  },
};

const STEP_EVENTS = {};

async function onEdge() {
  await me('Je kunt het dorp niet uit. Niet zonder je naam. En eigenlijk ook niet zonder je fiets.');
}

async function chargePhone() {
  const f = F();
  await me('Je prikt de oplader achter de bar in het stopcontact. Na een eeuwigheid gaat het scherm aan.');
  await me('Batterij: 1%.');
  SFX.phone();
  await me('Bzzt. Eén nieuw bericht.');
  await say('Rick', '"Ik zit in het dorpshuis. Jij weet waarom. Kom maar op."');
  await me('Je wilt verder kijken, maar het scherm is vergrendeld. Pincode? Je weet niet eens hoe je heet.');
  await say('Gerda', 'Rick? Die is nog steeds boos over gisteren. Het dorpshuis is aan de overkant. Succes, schat.');
  f.rickMsg = true;
  G.quest('telefoon', 4);
  bumpNaam();
}

function hint() {
  const f = F();
  if (G.quest('fiets') === 3) return 'Koffie voor Klaas Jansen? Vraag het me maar.';
  if (!f.henkBeaten) return 'Henk heeft je telefoon. Hij staat altijd voor zijn huis, naast het achterpaadje. Ga goed uitgerust: koop wat te eten.';
  if (G.quest('fiets') < 2) return 'Je fiets ligt in de sloot, aan de zuidkant van het dorp. Loop langs het gele huis naar beneden.';
  if (G.quest('fiets') < 6) return 'Boer Jansen heeft vast iets om je fiets uit de sloot te vissen.';
  if (G.has('kabouter')) return 'Een kabouter met een rood mutsje? Die is van mevrouw Bakker. Ze staat in haar tuin.';
  if (G.has('telefoon') && G.has('oplader')) return 'Je kunt hier je telefoon opladen.';
  if (f.rickMsg && !f.rickBeaten) return 'Rick zit in het dorpshuis. Hij praat graag over klaverjassen.';
  if (f.rickBeaten) return 'Ga naar huis, schat. Het gele huis.';
  return 'Op het bankje in de Dorpsstraat kun je bijkomen en opslaan.';
}

// ---------- intro ----------
async function intro() {
  await me('…');
  await me('Ugh.');
  await me('Waar ben je? Het ruikt naar stro en naar koe. Je hoofd voelt als een kermis.');
  await me('Oké. Rustig. Eerst de basis. Je naam is…');
  await me('Je naam is…');
  await me('…');
  await me('Je weet je naam niet meer.');
  await me('Je voelt in je zakken: €12, een licht geplet frikandelbroodje, en een sleutel.');
  await me('Aan de sleutel hangt een sleutelhanger met een J… De rest van de letters is eraf gesleten. Of is het een G?');
  await me('Er zit maar één ding op. Uitzoeken wat er gisteravond is gebeurd.');
  F().intro = true;
  UI.toast('Pijltjes of WASD om te lopen, Spatie om te praten', 3500);
}

// ---------- finale ----------
async function finale() {
  G.busy = true;
  await me('Je steekt de sleutel in het slot. Ondersteboven, net als vanochtend. Je draait hem om.');
  await me('Klik.');
  await me('Het gele huis. Jouw huis. Op de deurmat staat een naam. Je bukt…');
  await me('…maar de mat zit zo onder de modder dat je alleen een J ziet. Of een G.');
  SFX.phone();
  await me('Je telefoon gaat. Op het scherm: MAM.');
  await say('Mam', 'Hoi lieverd! Met mama. Hoe was het gisteren? Gerda belde al. Iets over een polonaise?');
  await ask('Mam', 'Lieverd? Ben je er nog?', ['Mam… hoe heet ik?']);
  await say('Mam', 'Hoe je heet? Wat een rare vraag. Jij heet gewoon J—');
  SFX.lose();
  await me('Piep.');
  await me('Batterij leeg.');
  await me('Je staart naar het zwarte scherm. Het lag op het puntje van je tong. Je voelt het. Het begint met een…');
  G.quest('naam', 4);
  await UI.fade(true);
  G.ending('Je weet het bijna.\n\nBedankt voor het spelen,\n…eh…\nhoe heette jij ook alweer?\n\n(Druk op Spatie of A om opnieuw te beginnen)');
  await UI.fade(false);
}

// Het teruggezette kabouterbeeldje
MAPS.dorp.props.push({ x: 10, y: 18, name: 'kabouter', solid: false, id: 'kabouterTerug' });
PROP_HIDE.kabouterTerug = () => !F().kabouterTerug;
