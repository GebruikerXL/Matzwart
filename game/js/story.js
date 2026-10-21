// Verhaal deel 1: opdrachten en personages. Deuren, voorwerpen, intro en finale staan in story2.js.
const F = () => G.flags;
const say = (n, t) => G.say(n, t);
const ask = (n, t, o, c) => G.ask(n, t, o, c);
const me = (t) => G.say('', t);
const pick = (l) => l[Math.floor(Math.random() * l.length)];
const CLUES = ['c_lanting', 'c_eka', 'c_bal', 'c_thijs'];
const REKENING = 47;

const QUESTS = {
  naam: {
    name: 'Wie ben ik?', done: 3,
    steps: [
      '',
      () => `Zoek uit wat je gisteravond hebt gedaan. Herinneringen: ${CLUES.filter((c) => F()[c]).length} van 4 (Lanting, de EKA, het voetbalveld, de A-framestraat).`,
      'Probeer je sleutel nog eens bij het gele huis naast mevrouw Bakker.',
      'Je weet het bijna.',
    ],
  },
  rekening: {
    name: 'De rekening bij Lanting', done: 2,
    steps: ['', () => `Je hebt nog €${REKENING} openstaan bij Gerda in café Lanting. Je hebt nu €${G.P.money}. Gevechten leveren geld op.`, 'Rekening betaald. Gerda vertelde hoe je avond begon.'],
  },
  onbetaald: {
    name: 'Onbetaalde frikandellen', done: 3,
    steps: ['', 'Ineke van de EKA vergeeft je de 24 frikandellen als je de dropdief achter de winkel aanpakt. Hij hangt bij de containers.', 'De dropdief is aangepakt. Vertel het Ineke.', 'Schuld vereffend. Je krijgt korting in de EKA.'],
  },
  bal: {
    name: 'De wedstrijdbal', done: 4,
    steps: ['', () => (G.quest('onbetaald') >= 3 ? 'De bal vloog vannacht richting de EKA. Vraag het Ineke eens.' : 'Trainer Harm zoekt de wedstrijdbal. Jij schoot hem vannacht richting de EKA.'), 'Breng de bal terug naar trainer Harm bij het voetbalveld.', 'Win het penaltyduel tegen keeper Kevin en meld je bij trainer Harm.', 'De wedstrijd kan doorgaan.'],
  },
  motorblok: {
    name: 'Het motorblok van Thijs', done: 3,
    steps: ['', () => (F().zagDerkje ? 'Thijs mist het motorblok van zijn BMW. Derkje, bij de zwemsteiger, had wel heel volle broekzakken…' : 'Thijs mist het motorblok van zijn BMW. Jij zou het gisteravond aan "iemand die er goed op past" hebben gegeven.'), 'Je hebt het motorblok. Breng het naar Thijs in de A-framestraat.', 'De BMW heeft weer een motor. Min of meer.'],
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
  zwemmer: { skin: '#f0c4a0', hair: '#e0e0e0', style: 'bald', shirt: '#2a6aa6', pants: '#2a6aa6', extra: ['mustache'] },
};

// Elke keer dat iemand bijna je naam zegt, gebeurt er iets.
async function bijna(wie, begin, onderbreking) {
  await say(wie, begin);
  SFX.no();
  await me(onderbreking);
}

async function clue(flag) {
  const f = F();
  if (f[flag]) return;
  f[flag] = true;
  UI.toast(`Herinnering terug: ${CLUES.filter((c) => f[c]).length} van 4`, 2400);
  if (CLUES.every((c) => f[c]) && G.quest('naam') === 1) {
    await me('Wacht even. Het komt terug. Stukje voor stukje.');
    await me('Om acht uur begon je in Lanting. Om vijf voor twaalf rende je met 24 frikandellen de EKA uit.');
    await me('Om twee uur penalty\'s op het voetbalveld. Om drie uur "hielp" je Thijs met zijn BMW.');
    await me('En ergens daartussen liep je langs het gele huis naast mevrouw Bakker. Je stond een half uur aan de deur te morrelen.');
    await me('Misschien… hield je je sleutel gewoon ondersteboven?');
    G.quest('naam', 2);
  }
}

const NPCS = [
  // ---------- dorp ----------
  {
    id: 'boer', map: 'dorp', x: 30, y: 23, dir: 'left', look: LOOK.boer,
    async talk() {
      const f = F();
      if (!f.metBoer) {
        f.metBoer = true;
        await say('Boer Jansen', 'Hé! Daar is ie. Lekker geslapen in mijn schuur?');
        await say('Boer Jansen', 'Ik vond je vanochtend om vijf uur tussen het stro. Zingend. Iets over "slapen bij de koeien".');
        const k = await ask('Boer Jansen', 'Wat wou je vragen?', ['Weet u hoe ik heet?', 'Sorry van de schuur…']);
        if (k === 1) await say('Boer Jansen', 'Ach, geeft niks. De koeien vonden het gezellig. Maar weet je eigenlijk wel hoe je heet?');
        await bijna('Boer Jansen', 'Natuurlijk weet ik dat! Jij bent de zoon van… van…', 'Van binnen roept iemand: "KLAAS! DE KOEIEN STAAN WEER IN DE SLOOT!"');
        await say('Boer Jansen', 'Ja ja, ik kom! … Waar was ik? Oh ja. Geen idee eigenlijk, jongen.');
        await say('Boer Jansen', 'Begin maar bij café Lanting, aan de Dorpsstraat. Gerda weet alles van iedereen. En je hebt daar vast nog een rekening openstaan.');
        await say('Boer Jansen', 'Oostelijk ligt de A-framestraat met de EKA. Zuidelijk, over het bruggetje, het voetbalveld en de zwemsteiger.');
        G.quest('naam', 1);
        UI.toast('Tip: Esc of B opent het menu met je opdrachten', 3200);
        return;
      }
      await say('Boer Jansen', pick([
        'De koeien zijn vandaag ook brak. Geen idee waarom.',
        'Blaarkoppen, dat zijn het. Rood met een witte kop. Net als jij vanochtend, maar dan andersom.',
        'In het hoge gras kom je allerlei volk tegen. Pas maar op. Al levert het wel een paar euro op.',
        'Op het bankje aan de Dorpsstraat kun je even bijkomen. Doe ik ook altijd.',
      ]));
    },
  },
  {
    id: 'bakker', map: 'dorp', x: 9, y: 19, dir: 'down', look: LOOK.bakker,
    async talk() {
      if (G.quest('naam') >= 2) { await say('Mevrouw Bakker', 'Ga nou maar naar binnen, jongen. Je staat al de hele ochtend voor mijn neus.'); return; }
      await say('Mevrouw Bakker', pick([
        'Je ziet er slecht uit, jongen. Je stond vannacht een half uur aan een deur te morrelen. Ik hoorde het tot in mijn slaapkamer.',
        'Ik ken jou ergens van. Ik weet alleen niet meer waarvan. Dat heb ik vaker, op mijn leeftijd.',
        'Mijn tuinkabouter staat er gelukkig nog. Dat kan ik niet van iedereen zeggen die hier vannacht langskwam.',
      ]));
    },
  },
  {
    id: 'henk', map: 'dorp', x: 17, y: 13, dir: 'right', look: LOOKS.henk,
    async talk() {
      if (!F().metHenk) {
        F().metHenk = true;
        await say('Henk', 'JIJ. Jij hebt vannacht om vier uur een polonaise door mijn tulpen gelopen. In je eentje.');
        await say('Henk', 'Ik heb er een foto van. Wil je hem zien? Nee? Mooi niet.');
        return;
      }
      if (!ownsWeapon('schoffel')) {
        if ((G.P.stoer || 0) >= 2) {
          await say('Henk', 'Hm. Je ziet er ineens een stuk stoerder uit. Rook je soms?');
          await say('Henk', 'Weet je wat, neem mijn schoffel mee. Dan jaag je die hangjongeren uit mijn tulpen. En ik wil hem terug.');
          await giveWeapon('schoffel');
          return;
        }
        await say('Henk', 'Als je er wat stoerder uitzag, mocht je mijn schoffel lenen. Om die hangjongeren uit mijn tulpen te jagen. Maar zo? Nee.');
        return;
      }
      await say('Henk', pick(['Mijn tulpen komen er wel weer bovenop. Jij ook, denk ik.', 'Ga eens naar huis, jongen. Je ziet eruit als een natte krant.', 'Is mijn schoffel nog heel?']));
    },
  },
  {
    id: 'kind', map: 'dorp', x: 20, y: 16, dir: 'down', look: LOOK.kind, wander: true,
    async talk() {
      await say('Kind', pick([
        'Mama zegt dat ik niet meer met jou mag praten. Sinds gisteren.',
        'Weet je hoe jij heet? Ik wel. Maar ik zeg het niet. Haha!',
        'Ken jij Derkje? Die woont in het allerkleinste huisje van de hele wereld!',
      ]));
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
      await say('Man bij de bushalte', 'Jij liep hier vannacht langs met een zak frikandellen. Je gaf me er drie. Bedankt nog.');
    },
  },
  // ---------- café Lanting ----------
  {
    id: 'gerda', map: 'cafe', x: 4, y: 2, dir: 'down', look: LOOK.gerda,
    async talk() {
      const f = F();
      if (!f.metGerda) {
        f.metGerda = true;
        await say('Gerda', 'Nou nou. Kijk eens wie we daar hebben. De held van gisteravond.');
        const k = await ask('Gerda', 'Weet je eigenlijk nog hoe je heet?', ['Eh… nee.', 'Natuurlijk! …Nee.']);
        await bijna('Gerda', k === 0 ? 'Haha! Ik weet het wel, hoor. Jij bent…' : 'Dat dacht ik al. Nou, jij bent…', 'Achter de bar gaat de telefoon. "Café Lanting, met Gerda? … Nee, we gaan pas om twaalf open."');
        await say('Gerda', 'Waar waren we? Oh ja. Je rekening. Die staat nog open: €47.');
        await say('Gerda', 'Elf bier, drie bitterballen en één "rondje voor de zaak". Betaal eerst maar, schat. Dan vertel ik je wat je hier allemaal hebt uitgespookt.');
        G.quest('rekening', 1);
        return;
      }
      for (;;) {
        const opts = ['Wat kopen'];
        const acts = [() => G.shop(['frikandelbroodje', 'bitterballen', 'koffie', 'w_darts'], 'Gerda')];
        if (G.quest('rekening') === 1) { opts.push({ label: `Rekening betalen (€${REKENING})`, off: G.P.money < REKENING }); acts.push(payBill); }
        opts.push('Heb je een tip?', 'Doei');
        acts.push(async () => say('Gerda', hint()), null);
        const k = await ask('Gerda', G.quest('rekening') === 1 ? `Zeg het maar, schat. Je hebt €${G.P.money}. Je rekening is €${REKENING}.` : 'Zeg het maar, schat.', opts, true);
        if (k < 0 || !acts[k]) { await say('Gerda', 'Doei! En drink vandaag maar water.'); return; }
        await acts[k]();
        if (k !== 0) return;
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
      await say('Opa Dirk', pick(['Zzz…', 'Hè? Wat? Ik sliep niet.', 'Vroeger was hier alles beter. Behalve het bier. Dat is hetzelfde.']));
    },
  },
  // ---------- dorpshuis ----------
  {
    id: 'rick', map: 'dorpshuis', x: 7, y: 3, dir: 'down', look: LOOKS.rick,
    async talk() {
      await say('Rick', pick([
        'Je noemde me gisteren bij het klaverjassen een valsspeler. Ik ben nog steeds boos. Een beetje.',
        'Die polonaise van jou ging trouwens helemaal tot aan de EKA. Dat moet ik je nageven.',
        'Ga eens douchen, man. Je ruikt naar koe.',
      ]));
    },
  },
  {
    id: 'bestuur', map: 'dorpshuis', x: 11, y: 8, dir: 'up', look: LOOK.bestuur, wander: true,
    async talk() {
      if (ownsWeapon('tafelvlag')) {
        await say('Bestuurslid', 'Is dat… ONZE tafelvlag? Waarom is hij nat?');
        await say('Bestuurslid', 'Ach, hou hem maar. Hij staat je wel.');
        return;
      }
      await say('Bestuurslid', 'Ik ben de stoelen aan het tellen. Er missen er twee. Én de tafelvlag.');
      await say('Bestuurslid', 'Jij weet daar zeker niks van? Je had gisteravond wel een tafelvlag om als cape.');
    },
  },
  // ---------- A-framestraat ----------
  {
    id: 'thijs', map: 'oost', x: 11, y: 8, dir: 'right', look: LOOKS.thijs,
    async talk() {
      const f = F(), q = G.quest('motorblok');
      if (!q) {
        f.metThijs = true;
        await say('Thijs', 'Hé! Jij bent het. Mooi dat je er bent, ik kan wel wat hulp gebruiken.');
        await say('Thijs', 'Kijk. Mijn BMW. Motorkap open. En daaronder… niks.');
        await say('Thijs', 'Het motorblok is weg. Oopsie.');
        await say('Thijs', 'Jij kwam hier vannacht om drie uur langs. "Ik help je even sleutelen," zei je. Na een uur zei je: "Dit ding zit in de weg."');
        await say('Thijs', 'En toen zei je dat je het naar "iemand die er goed op past" bracht. Meer weet ik ook niet.');
        await say('Thijs', 'O, en let niet op Mick. Dat is mijn labradoodle. Hij houdt van iedereen. Echt van iedereen.');
        if ((G.P.stoer || 0) >= 3) await say('Thijs', 'Rook jij tegenwoordig? Stoer hoor. Maar vind nou eerst even mijn motorblok.');
        G.quest('motorblok', 1);
        return;
      }
      if (q === 1 || (q === 2 && !G.has('motorblok'))) {
        await say('Thijs', pick(['Nog steeds geen motor. Hij rolt wel lekker van de heuvel af.', 'Een motorblok weegt ruim honderd kilo. Hoe raak je dat kwijt? Oopsie, blijkbaar.']));
        return;
      }
      if (G.has('motorblok')) {
        G.take('motorblok');
        await say('Thijs', 'MIJN MOTORBLOK! Waar was die?');
        await me('Je vertelt over Derkje en haar broekzak.');
        await say('Thijs', 'In de broekzak van Derkje? Van het kleine huisje? Hoe past dat erin?');
        await me('Thijs en jij tillen het motorblok terug. Het zit er een beetje scheef in, maar de BMW start.');
        await say('Thijs', 'Bedankt, man. Hier, voor de moeite.');
        G.P.money += 15; SFX.item(); UI.toast('+€15');
        await say('Thijs', 'En hier. Een fotolijst van Mick. Mijn moeder heeft er tien laten maken: Mick en zijn strandbal.');
        await say('Thijs', 'Ik kan er niet meer naar kijken. Niemand kan dat. Misschien heb jij er iets aan.');
        await giveWeapon('mick');
        await say('Thijs', 'Na het sleutelen liep je trouwens zingend richting de boerderij van Jansen. "Ik slaap vannacht bij de koeien," riep je.');
        await bijna('Thijs', 'Wacht, ik heb je nummer gewoon in mijn telefoon. Onder…', 'De BMW begint keihard te piepen. Thijs rent naar zijn auto. Als het stil is, weet hij niet meer wat hij zocht.');
        G.quest('motorblok', 3);
        await clue('c_thijs');
        return;
      }
      await say('Thijs', pick(['Hij loopt weer als een zonnetje. Een scheef zonnetje.', 'Als je ooit een lift nodig hebt, weet je me te vinden. Oopsie, je hebt geen idee hoe je heet. Maakt niet uit.']));
    },
  },
  {
    id: 'mick', map: 'oost', x: 16, y: 8, dir: 'down', look: LOOKS.mick, wander: true,
    async talk() {
      await say('Mick', pick(['Woef!', 'Woef woef.', 'Hijg hijg.']));
      await me(pick([
        'Mick springt tegen je been op en begint enthousiast te… bewegen. Je schudt hem er voorzichtig af.',
        'Mick kijkt je diep in de ogen. Te diep.',
        'Mick snuffelt aan je broek, zucht teleurgesteld en loopt naar de lantaarnpaal. Die heeft meer kans.',
        'Mick heeft een winkelwagen gevonden. Ze hebben het samen erg gezellig. Je kijkt de andere kant op.',
      ]));
    },
  },
  {
    id: 'dief', map: 'oost', x: 9, y: 20, dir: 'left', look: LOOKS.dief, show: () => G.quest('onbetaald') === 1,
    async talk() {
      await say('Dropdief', 'Wat moet je? Dit is mijn plek.');
      const k = await ask('Dropdief', 'Kom je soms van die caissière?', ['Geef die drop terug!', 'Nee hoor, ik loop maar wat']);
      if (k !== 0) { await say('Dropdief', 'Loop dan maar door.'); return; }
      const r = await G.fight('winkeldief');
      if (r === 'win' || r === 'spared') {
        await say('Dropdief', 'Oké, oké. Ik betaal voortaan. Zeg maar tegen Ineke dat het niet meer gebeurt.');
        G.quest('onbetaald', 2);
      }
    },
  },
  // ---------- EKA ----------
  {
    id: 'ineke', map: 'eka', x: 12, y: 5, dir: 'left', look: LOOKS.ineke,
    async talk() {
      const f = F(), q = G.quest('onbetaald');
      if (!q) {
        await say('Ineke', 'JIJ.');
        await say('Ineke', 'Gisteravond, vijf voor twaalf. Jij rende naar binnen en griste 24 frikandellen uit de vriezer.');
        await say('Ineke', '"Zet maar op de rekening van het dorp!" riep je. En weg was je.');
        await say('Ineke', 'Ik bel de politie niet, als je me een handje helpt. Achter de winkel, bij de containers, hangt al de hele week een dropdief rond. Pak hem aan.');
        G.quest('onbetaald', 1);
        return;
      }
      for (;;) {
        const korting = q >= 3 ? 0.2 : 0;
        const opts = ['Boodschappen doen'];
        const acts = [() => G.shop(['krentenbol', 'rookworst', 'chocomel', 'paracetamol', 'energiedrank', 'pakje', 'w_frikandel', 'w_paraplu'], 'Ineke', korting)];
        if (G.quest('onbetaald') === 2) { opts.push('De dropdief is aangepakt'); acts.push(dropDone); }
        if (G.quest('bal') === 1) { opts.push('Heb je een voetbal gezien?'); acts.push(askBall); }
        opts.push('Doei');
        acts.push(null);
        const k = await ask('Ineke', korting ? 'Wat mag het zijn? Jij krijgt 20% korting.' : 'Wat mag het zijn?', opts, true);
        if (k < 0 || !acts[k]) { await say('Ineke', 'Fijne dag. Betalen is ook een optie, hè.'); return; }
        await acts[k]();
        if (k !== 0) return;
      }
    },
  },
  // ---------- voetbalveld en steiger ----------
  {
    id: 'trainer', map: 'zuid', x: 8, y: 5, dir: 'down', look: LOOKS.trainer,
    async talk() {
      const f = F(), q = G.quest('bal');
      if (!q) {
        await say('Trainer Harm', 'Jij! Jij hebt vannacht om twee uur de wedstrijdbal over het hek geknald. Recht richting de EKA.');
        await say('Trainer Harm', '"Penaltytoernooi!" riep je. Om twee uur \'s nachts. Met frikandellen als prijs.');
        await say('Trainer Harm', 'Vanmiddag speelt VV Meedhuizen. Zonder bal geen wedstrijd. Ga hem zoeken.');
        G.quest('bal', 1);
        return;
      }
      if (q === 1) { await say('Trainer Harm', 'De bal ging richting de EKA. Misschien heeft iemand daar hem gevonden.'); return; }
      if (q === 2 && G.has('bal')) {
        G.take('bal');
        await say('Trainer Harm', 'DE BAL! Hij ruikt naar meloen, maar dat geeft niet.');
        await say('Trainer Harm', 'Weet je nog wat je vannacht riep? "Ik schiet élke penalty langs Kevin!"');
        await say('Trainer Harm', 'Kevin heeft geen oog dichtgedaan. Hij staat in het doel op je te wachten. Rechterkant van het veld.');
        G.quest('bal', 3);
        return;
      }
      if (q === 3 && !f.keeperDone) { await say('Trainer Harm', 'Kevin staat in het doel. Rechterkant. Succes. Je gaat het nodig hebben.'); return; }
      if (q === 3 && f.keeperDone) {
        await say('Trainer Harm', 'Langs Kevin! Ongelooflijk. Die jongen houdt zelfs zijn eigen schaduw tegen.');
        await say('Trainer Harm', 'Na de penalty\'s vannacht ging je richting de A-framestraat. Je zei dat je "Thijs ging helpen met zijn auto".');
        await bijna('Trainer Harm', 'Je naam staat trouwens op een oud teamshirt in de kantine. Rugnummer 7. En de naam is…', '…eraf gewassen. Op 90 graden. "Sorry," zegt Harm. "Mijn vrouw doet de was."');
        G.P.money += 10; SFX.item(); UI.toast('+€10');
        await say('Trainer Harm', 'En neem deze cornervlag maar mee. Die zat vannacht ook al in jouw hand.');
        await giveWeapon('cornervlag');
        G.quest('bal', 4);
        await clue('c_bal');
        return;
      }
      await say('Trainer Harm', pick(['Vanmiddag winnen we. Dankzij jou. Een beetje.', 'Kom je vanmiddag kijken? Neem geen frikandellen mee.']));
    },
  },
  {
    id: 'keeper', map: 'zuid', x: 30, y: 7, dir: 'left', look: LOOKS.keeper,
    async talk() {
      const f = F(), q = G.quest('bal');
      if (f.keeperDone) { await say('Keeper Kevin', 'Volgende keer stop ik ze allemaal. Allemaal!'); return; }
      if (q < 3) { await say('Keeper Kevin', pick(['Ik train. Zonder bal. Dat gaat best.', 'Jij. Jij zei vannacht dat ik niks tegenhoud. We zullen zien.'])); return; }
      await say('Keeper Kevin', 'Daar is ie. De man die élke penalty zou maken.');
      const k = await ask('Keeper Kevin', 'Klaar voor het penaltyduel?', ['Kom maar op', 'Nog even niet']);
      if (k !== 0) { await say('Keeper Kevin', 'Bang?'); return; }
      const r = await G.fight('keeper');
      if (r === 'win' || r === 'spared') {
        f.keeperDone = true;
        await say('Keeper Kevin', 'Goed. Die zat. Ga het Harm maar vertellen.');
      }
    },
  },
  {
    id: 'derkje', map: 'zuid', x: 19, y: 22, dir: 'left', look: LOOKS.derkje, show: () => F().dwerghuis || F().metThijs,
    async talk() {
      const f = F();
      if (!f.tomaat) {
        f.tomaat = true; f.zagDerkje = true;
        await me('Aan het eind van de steiger staat een heel klein vrouwtje. Op haar trui staat met de hand geborduurd: DERKJE.');
        await say('Derkje', 'Mrrrp?');
        await me('Je zegt voorzichtig hallo.');
        await say('Derkje', 'Iiiieee! Blubblub.');
        await me('Ze graait in haar broekzak en geeft je… een tomaat.');
        await me('Je eet hem op. Hij smaakt naar zomer en een beetje naar broekzak.');
        await G.levelUpNow();
      }
      if (f.metThijs && G.quest('motorblok') === 1) {
        await me('Haar broekzak puilt enorm uit. Er steekt een stuk metaal uit, met een blauw-wit logo.');
        await me('Dat is het motorblok van Thijs!');
        const k = await ask('', 'Derkje kan niet praten. Ze maakt alleen geluiden. Misschien moet jij dat ook doen.', ['Probeer het met geluiden', 'Laat maar']);
        if (k !== 0) { await say('Derkje', 'Hrmpf.'); return; }
        const r = await G.fight('derkje');
        if (r === 'spared' || r === 'win') {
          await me('Derkje legt het motorblok in je armen. Het is zwaar en een beetje warm.');
          G.give('motorblok');
          G.quest('motorblok', 2);
          await say('Derkje', 'Tsjiep!');
        }
        return;
      }
      await say('Derkje', pick(['Tsjiep tsjiep?', 'Blubblub…', 'Mrrrp.', 'Iiiieee!']));
      await me(pick(['Derkje kijkt tevreden over het water.', 'Derkje wiebelt heen en weer.', 'Derkje maakt een geluid als een fluitketel.']));
    },
  },
  {
    id: 'zwemmer', map: 'zuid', x: 22, y: 16, dir: 'down', look: LOOK.zwemmer, wander: true,
    async talk() {
      await say('IJszwemmer', pick([
        'Vijftien graden. Heerlijk. Jij sprong er vannacht trouwens ook in. In je onderbroek.',
        'Niet van de steiger duiken, staat er. Jij deed het toch. Twee keer.',
        'Dat kleine vrouwtje op de steiger? Derkje. Ze staat daar elke dag. Niemand weet waarom.',
      ]));
    },
  },
];

async function payBill() {
  G.P.money -= REKENING; SFX.item();
  G.quest('rekening', 2);
  await say('Gerda', 'Kijk eens aan. Betaald. Dan zal ik je vertellen hoe je avond begon.');
  await say('Gerda', 'Om acht uur kwam je binnen. Je won drie potjes klaverjassen van Rick en noemde hem daarna een valsspeler. Iedereen erbij.');
  await say('Gerda', 'Om half twaalf sprong je op tafel en riep: "IK HAAL FRIKANDELLEN VOOR HET HELE DORP!" En weg was je. Richting de EKA.');
  await bijna('Gerda', 'Je rekening stond trouwens op naam. Even kijken wat ik had opgeschreven…', 'Op het bonnetje staat: "HIJ-DAAR". In Gerda\'s eigen handschrift.');
  await clue('c_lanting');
}

async function dropDone() {
  await say('Ineke', 'Echt? Hij betaalt voortaan? Nou, dan zijn wij quitte. En je krijgt voortaan 20% korting.');
  G.quest('onbetaald', 3);
  await say('Ineke', 'Je zei vannacht nog dat je de frikandellen naar het voetbalveld bracht. "Voor het penaltytoernooi."');
  await bijna('Ineke', 'Weet je wat, je hebt een bonuskaart. Daar staat je naam op. Ik print hem even…', 'De bonprinter ratelt, piept en spuugt een leeg strookje uit. "Papier op," zegt Ineke.');
  await clue('c_eka');
}

async function askBall() {
  if (G.quest('onbetaald') < 3) { await say('Ineke', 'Een voetbal? Die heb ik, ja. Maar die krijg je pas als we quitte zijn. Eerst die dropdief.'); return; }
  await say('Ineke', 'Die lag vanochtend tussen de meloenen. Hoe hij daar kwam, wil ik niet weten.');
  G.give('bal');
  G.quest('bal', 2);
}
