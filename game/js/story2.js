// Verhaal deel 2: voorwerpen, deuren, intro en finale.
const PROP_HIDE = { w_mestvork: () => ownsWeapon('mestvork'), w_kaarten: () => ownsWeapon('kaarten') };
const STEP_EVENTS = {};

const PROPS = {
  // dorp
  plaatsbord: () => me('MEEDHUIZEN. Je weet tenminste wáár je bent. Dat is een begin.'),
  bordoost: () => me('→ A-framestraat · EKA'),
  bordzuid: () => me('↓ Voetbalveld VV Meedhuizen · Zwemsteiger'),
  bushalte: async () => {
    if (!ownsWeapon('krant')) {
      await me('Op het bankje in het bushokje ligt een doorweekte krant. Opgerold is hij verrassend stevig.');
      await giveWeapon('krant'); return;
    }
    await me('Dienstregeling: de bus komt om 7:12 en om 16:48. Het is nu… geen idee.');
  },
  w_mestvork: async () => { await me('Een mestvork. Boer Jansen zal hem vast niet missen. Hij heeft er nog drie.'); await giveWeapon('mestvork'); },
  w_kaarten: async () => { await me('Op de tafel ligt nog een spel klaverjaskaarten. De schoppenboer zit onder het bier.'); await giveWeapon('kaarten'); },
  w_dildo: async () => {
    if (ownsWeapon('dildo')) { await me('Een container. Hij ruikt naar gisteren. Er zit verder niks bijzonders meer in.'); return; }
    await me('Je tilt het deksel van de container op. Tussen de lege dozen ligt iets roze.');
    await me('Je pakt het op voordat je erover nadenkt. Het is… een dildo. Roze. Flubberig. Toch verrassend stevig.');
    await me('Wie gooit er nou zoiets weg? Je besluit er geen vragen over te stellen.');
    await giveWeapon('dildo');
  },
  tractor: () => me('Een groene trekker. De sleutel zit er nog in. Nee. Je hebt gisteren al genoeg gedaan.'),
  koe0: () => me('De koe kijkt je aan alsof ze precies weet hoe je heet.'),
  koe1: () => me('"Boe." Dat is het niet. Denk je.'),
  koe2: () => me('Een Groninger blaarkop. Rood met een witte kop. Ze kauwt rustig verder.'),
  koe3: () => me('De koe draait zich om. Ook zij heeft je vannacht gezien.'),
  bank: async () => {
    G.P.hp = G.P.maxHp; G.P.ep = G.P.maxEp; SFX.heal();
    await me('Je gaat even op het bankje zitten. Je voelt je een stuk beter. (HP en EP vol)');
    const k = await ask('', 'Wil je opslaan?', ['Opslaan', 'Nee']);
    if (k === 0) UI.toast(G.save() ? 'Opgeslagen' : 'Opslaan lukt niet in deze browser');
  },
  // Lanting en dorpshuis
  bonnenbak: () => me('Bovenop ligt een bonnetje: "11 bier, 3 bitterballen, 1 rondje voor de zaak (??)". Op naam van: HIJ-DAAR.'),
  piano: () => me('Je drukt één toets in. Opa Dirk kijkt je vernietigend aan. Of hij slaapt met open ogen.'),
  cafeposter: () => me('CAFÉ LANTING. Elke vrijdag klaverjassen. Iemand heeft er "VALSSPELER!!" bij geschreven.'),
  klaverposter: () => me('Uitslag klaverjassen: 1. [een grote bruine bierkring]. 2. Rick.'),
  prikbord: () => me('GEZOCHT: wie heeft vannacht de polonaise tot aan de EKA ingezet? Graag melden bij het bestuur. Er staat een tekening bij die erg op jou lijkt.'),
  // A-framestraat
  bmw: () => me(G.quest('motorblok') >= 3 ? 'De BMW heeft weer een motorblok. Het zit er een beetje scheef in, maar hij loopt.' : 'Een zwarte BMW met de motorkap open. Daaronder gaapt een gat waar een motorblok hoort.'),
  dwergplant: () => me('Een tomatenplant. Er hangen piepkleine, knalrode tomaatjes aan.'),
  container: () => me('Een container. Hij ruikt naar gisteren.'),
  winkelwagen: () => me('Een winkelwagen. Er zit nog een muntje in. Je laat het zitten. Je bent geen dief. Niet meer.'),
  // EKA
  kassa: () => me(G.quest('onbetaald') >= 3 ? 'Het display van de kassa zegt: "VEREFFEND". Ineke heeft er een smiley achter gezet.' : 'Het display van de kassa zegt: "24× FRIKANDEL — NIET BETAALD".'),
  meloenen: () => me('Een bak meloenen. Een van de meloenen heeft een opvallend ronde, voetbal-vormige deuk.'),
  aanbieding: () => me('AANBIEDING: rookworst, 2e halve prijs. Sigaretten alleen voor stoere types (en niet goed voor je HP).'),
  // dwerghuisje
  minibed: () => me('Een bedje van nog geen meter. Op het kussen is met rood garen geborduurd: DERKJE.'),
  foto: () => me('Een fotootje van een heel klein vrouwtje met een tomaat zo groot als haar hoofd. Eronder: "Derkje, 1e prijs groentekeuring".'),
  dwergplant2: () => me('Een tomatenplant in een emmertje. Aan een kaartje: "Van Derkje. Niet aankomen."'),
  brief: () => me('Een brief op de deurmat. "Aan: Derkje, Het Kleine Huisje." Afzender: de Tomatenvereniging. Er staat "zwemsteiger" op de achterkant gekrabbeld.'),
  // voetbalveld en steiger
  doel: () => me('Het doel. In het net zit een gat ter grootte van een bal.'),
  dug: () => me('De dug-out. Iemand heeft "IK SCHIET ALLES ERIN" in de bank gekrast. Het handschrift komt je bekend voor.'),
  boei: async () => {
    if (!ownsWeapon('tafelvlag')) {
      await me('Om de reddingsboei is iets vastgeknoopt. Je trekt het eruit: de tafelvlag van het dorpshuis. Kletsnat.');
      await me('Je had hem vannacht om als cape, zeiden ze. Dat verklaart een hoop.');
      await giveWeapon('tafelvlag'); return;
    }
    await me('Een reddingsboei. Je hoopt maar dat die vannacht niet nodig was.');
  },
  ijsco: () => me('IJsjes! Gesloten tot de zomer.'),
  steigerbord: () => me('ZWEMSTEIGER. Zwemmen op eigen risico. Niet duiken. Iemand heeft er met stift onder geschreven: "behalve hij".'),
};

const DOORS = {
  // dorp
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
  dorpshuis: () => G.warp('dorpshuis', 7, 9, 'up'),
  uit_dorpshuis: () => G.warp('dorp', 26, 13, 'down'),
  kerk: async () => { await me('De kerkdeur is dicht. Binnen oefent iemand op het orgel. Elke noot doet pijn.'); G.stepBack(); },
  bakker: async () => { await me('Aanbellen bij mevrouw Bakker? Ze staat toch gewoon in haar tuin.'); G.stepBack(); },
  boerderij: async () => { await me('"SCHOENEN UIT!" roept iemand van binnen. Je loopt maar weer verder.'); G.stepBack(); },
  henk: async () => { await me('Je belt aan. Henk staat drie meter verderop en kijkt je aan.'); await say('Henk', 'Ik sta híér.'); G.stepBack(); },
  geelhuis: async () => {
    if (G.quest('naam') < 2) {
      await me('Een geel huis. Je probeert je sleutel. Hij past niet. Je draait hem om. Past nog steeds niet.');
      await me('Gek. Dit zal wel niet jouw huis zijn.');
      G.stepBack(); return;
    }
    await finale();
  },
  naar_oost: () => G.warp('oost', 1, G.pl.y - 4, 'right'),
  naar_zuid: () => G.warp('zuid', 6, 1, 'down'),
  // A-framestraat
  oost_naar_dorp: () => G.warp('dorp', 38, G.pl.y + 4, 'left'),
  aframe0: async () => { await me('Niemand thuis. Op de deurmat staat "Welkom". Dat voelt vandaag niet helemaal oprecht.'); G.stepBack(); },
  aframe1: async () => { await me('Het huis van Thijs. Binnen miauwt een kat. Thijs zelf staat buiten bij zijn BMW.'); G.stepBack(); },
  aframe2: async () => { await me('Je klopt aan. Binnen gaat de tv zachter. En weer harder.'); G.stepBack(); },
  aframe3: async () => { await me('Op de deur hangt een bordje: "Geen reclame. Geen colportage. Geen gasten van gisteravond."'); G.stepBack(); },
  dwerghuis: async () => {
    await me('Dit lijkt wel een huis voor een dwerg.');
    await me('Je bukt heel diep en wurmt je naar binnen.');
    const first = !F().dwerghuis;
    F().dwerghuis = true;
    await G.warp('dwerg', 3, 4, 'up');
    if (first) { G.busy = true; await me('Binnen is het helemaal leeg. Er is niemand thuis.'); G.busy = false; }
  },
  uit_dwerg: () => G.warp('oost', 27, 8, 'down'),
  eka: () => G.warp('eka', 6, 8, 'up'),
  uit_eka: () => G.warp('oost', 7, 19, 'down'),
  // voetbalveld
  zuid_naar_dorp: () => G.warp('dorp', 30, 30, 'up'),
  kantine: async () => { await me('De kantine is dicht. Door het raam zie je een tafel vol lege frikandelzakjes. Vierentwintig, schat je.'); G.stepBack(); },
};

async function onEdge() {
  await me('Je kunt het dorp niet uit. Niet zonder je naam.');
}

function hint() {
  const f = F(), q = (id) => G.quest(id);
  if (q('rekening') === 1 && G.P.money < REKENING) return `Je rekening is EUR ${REKENING}. In het hoge gras kom je genoeg volk tegen om wat geld bij elkaar te vechten. Of te praten.`;
  if (!q('onbetaald')) return 'Ineke van de EKA, in de A-framestraat, zocht je vanochtend. Iets met frikandellen.';
  if (!q('bal')) return 'Trainer Harm van het voetbalveld liep hier vanochtend te vloeken. Zuidelijk, over het bruggetje.';
  if (!q('motorblok')) return 'Thijs, uit de A-framestraat, staat al de hele ochtend naar zijn BMW te staren.';
  if (q('motorblok') === 1) return f.zagDerkje ? 'Derkje? Die staat altijd op de zwemsteiger. Ze praat niet, maar ze verstaat geluiden heel goed.' : 'In de A-framestraat staat een piepklein huisje. Daar woont iemand die overal goed op past.';
  if (q('onbetaald') === 1) return 'De dropdief hangt achter de EKA bij de containers.';
  if (q('bal') === 3 && !f.keeperDone) return 'Keeper Kevin is sterk. Koop wat eten bij de EKA voor je gaat.';
  if (q('naam') === 2) return 'Ga naar huis, schat.';
  return pick(['Op het bankje in de Dorpsstraat kun je bijkomen en opslaan.', 'Er slingert van alles door het dorp waarmee je kunt meppen. Kijk eens in containers, bij de bushalte en bij de steiger.']);
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
  await me('Je voelt in je zakken: EUR 12, twee krentenbollen en een telefoon. Batterij 1%. Vergrendeld. De pincode weet je natuurlijk ook niet.');
  await me('En een sleutel. Aan de sleutelhanger hangt een J… De rest van de letters is eraf gesleten. Of is het een G?');
  await me('Er zit maar één ding op. Uitzoeken wat er gisteravond is gebeurd.');
  F().intro = true;
  UI.toast('Pijltjes of WASD om te lopen, Spatie om te praten', 3500);
}

// ---------- finale ----------
async function finale() {
  G.busy = true;
  await me('Je steekt de sleutel in het slot. Ondersteboven, deze keer. Je draait hem om.');
  await me('Klik.');
  await me('Het gele huis. Jouw huis. Op de deurmat staat een naam. Je bukt…');
  await me('…maar de mat zit zo onder de modder dat je alleen een J ziet. Of een G.');
  SFX.phone();
  await me('Je telefoon gaat. Op het scherm: MAM.');
  await say('Mam', 'Hoi lieverd! Met mama. Hoe was het gisteren? Gerda belde al. Iets over 24 frikandellen en een motorblok?');
  await ask('Mam', 'Lieverd? Ben je er nog?', ['Mam… hoe heet ik?']);
  await say('Mam', 'Hoe je heet? Wat een rare vraag. Jij heet gewoon J—');
  SFX.lose();
  await me('Piep.');
  await me('Batterij leeg.');
  await me('Je staart naar het zwarte scherm. Het lag op het puntje van je tong. Je voelt het. Het begint met een…');
  G.quest('naam', 3);
  await UI.fade(true);
  G.ending('Je weet het bijna.\n\nBedankt voor het spelen,\n…eh…\nhoe heette jij ook alweer?\n\n(Druk op Spatie of A om opnieuw te beginnen)');
  await UI.fade(false);
}
