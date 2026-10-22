// Verhaal deel 3: bewoners van alle huizen, het paleis van Daniël en Delfzijl (zware jongens, betere buit, de Koning van de Zeedijk).

// ---------- nieuwe spullen, wapens en kleding ----------
Object.assign(ITEMS, {
  gouden_vape: { name: 'Gouden vape', desc: 'Zwaar, glimmend, Delfzijls. Aron betaalt er EUR 400 voor.', key: true, sell: 400 },
  opapet: { name: 'Pet van de opa van Jaap', desc: 'Ruikt naar zout, diesel en een beetje mango.', key: true },
  frikandel_speciaal: { name: 'Frikandel speciaal', desc: '+50 HP', price: 4, use: (p) => heal(p, 50, 0) },
  kroket: { name: 'Kroket', desc: '+35 HP', price: 3, use: (p) => heal(p, 35, 0) },
  patatje_oorlog: { name: 'Patatje oorlog', desc: '+60 HP, +10 EP', price: 6, use: (p) => heal(p, 60, 10) },
});
Object.assign(WEAPONS, {
  harpoen: { name: 'Harpoen', atk: 9, verb: 'Je prikt met de harpoen.', from: 'Visser Jaap of de havenjongens',
    sp: { name: 'Walvisvangst', ep: 6, desc: '2,2× schade.', run: (B) => B.wHit(2.2, 'Je gooit de harpoen met een boog. Raak.') } },
  anker: { name: 'Klein anker', atk: 10, verb: 'Je zwaait met het anker. Het is zwaar.', from: 'Buit in Delfzijl',
    sp: { name: 'Ankerslag', ep: 6, desc: '1,7× schade en Verzwakt.', run: async (B) => { await B.wHit(1.7, 'Het anker valt met een klap. Precies goed.'); await B.foeSt('verzwakt', 2); } } },
  scheepshoorn: { name: 'Scheepshoorn', atk: 6, verb: 'Je slaat met de scheepshoorn. Hij toetert ervan.', from: 'Buit in Delfzijl',
    sp: { name: 'TOEEEET', ep: 5, desc: 'Ongemakkelijk en Verblind.', run: async (B) => { SFX.tone(110, 0.8, 'sawtooth', 0.08); await B.log('TOEEEEEEEET. De hele haven kijkt op.'); await B.foeSt('ongemak', 1); await B.foeSt('verblind', 2); } } },
});
Object.assign(WICON, {
  harpoen(x) { for (let i = 0; i < 10; i++) px(x, 1 + i, 11 - i, 1, 1, '#8c5a32'); px(x, 9, 0, 3, 1, '#c0c0c8'); px(x, 11, 0, 1, 3, '#c0c0c8'); px(x, 10, 1, 1, 1, '#c0c0c8'); },
  anker(x) { px(x, 5, 1, 2, 9, '#5a5a62'); px(x, 3, 2, 6, 1, '#5a5a62'); px(x, 2, 9, 8, 2, '#5a5a62'); px(x, 1, 7, 2, 2, '#5a5a62'); px(x, 9, 7, 2, 2, '#5a5a62'); px(x, 5, 0, 2, 1, '#888'); },
  scheepshoorn(x) { px(x, 1, 5, 4, 3, '#e0b030'); for (let i = 0; i < 6; i++) px(x, 5 + i, 6 - i / 2, 1, 1 + i, '#e0b030'); px(x, 1, 6, 2, 1, '#8a6a20'); },
  mes(x) { for (let i = 0; i < 7; i++) px(x, 4 + i, 7 - i, 2, 2, '#d8d8e0'); px(x, 4 + 6, 0, 1, 1, '#fff'); px(x, 1, 8, 4, 3, '#3a2a1a'); },
});
function addCloth(id, c) { CLOTHES[id] = c; ITEMS[id] = { name: c.name, desc: `${SLOT_NAME[c.slot]}. ${statText(c.st)}. ${c.desc}`, price: c.price, slot: c.slot, wear: true }; }
addCloth('zuidwester', { slot: 'hoofd', name: 'Zuidwester', t: 'hoedje', col: '#f2c22e', st: { def: 3, stoer: 1 }, rare: true, desc: 'Zeldzaam. Waterdicht. Stormdicht. Kritiekdicht.' });
addCloth('reddingsvest', { slot: 'boven', name: 'Reddingsvest', col: '#ff7a2a', pat: 'tracksuit', st: { def: 4 }, rare: true, desc: 'Zeldzaam. Je blijft overal boven drijven.' });
addCloth('havenbroek', { slot: 'broek', name: 'Havenwerkersbroek', col: '#2a3a5a', st: { def: 3, atk: 1 }, rare: true, desc: 'Zeldzaam. Twaalf zakken. Allemaal leeg.' });
addCloth('laarzen', { slot: 'schoenen', name: 'Visserslaarzen', col: '#2e6a3a', st: { def: 3, atk: 1 }, rare: true, desc: 'Zeldzaam. Tot aan je knieën.' });

// ---------- de zware jongens van Delfzijl ----------
const DZ = (hair, style, shirt, pants, skin, cap) => ({ skin: skin || '#e8b898', hair, style, shirt, pants, cap, extra: ['pimples', 'vape'] });
Object.assign(LOOKS, {
  dz_slager: DZ('#2a1a10', 'cap', '#c8c8d0', '#2a2a3a', '#e0b090', '#c23b2e'),
  dz_haven: DZ('#1b1420', 'short', '#2a3a5a', '#2a2a2a', '#d8a880'),
  dz_chemie: DZ('#5a3a20', 'messy', '#e8c030', '#3a3a3a', '#f0c9a0'),
  dz_fatbike: DZ('#d8b25a', 'cap', '#1b1b1b', '#3a3a44', '#f0c4a0', '#2a2a2a'),
  dz_dijk: DZ('#7a4a2a', 'long', '#4a6a3a', '#2a2a3a', '#e8b898'),
  dz_koning: { skin: '#e0b090', hair: '#e0b030', style: 'cap', cap: '#e0b030', shirt: '#6a1a8a', pants: '#1b1b1b', extra: ['pimples', 'vape', 'beard', 'belly'] },
  jaap: { skin: '#d8a070', hair: '#c8c8d0', style: 'bald', shirt: '#2a4a7a', pants: '#2a2a3a', extra: ['beard'] },
});
const DZ_BASE = { vaper: true, dz: true, knife: true, cloudScale: 2.2, stoerNeed: 3, rareChance: 0.06 };
Object.assign(ENEMIES, {
  dz_slager: { ...DZ_BASE, name: 'Vaper met slagersmes', look: 'dz_slager', cloud: '#ffd9a0', smaak: 'mango-xl', hp: 64, atk: 12, def: 4, xp: 34, money: 26, drop: 'anker',
    inflict: { st: 'misselijk', ch: 0.3, t: 'Een mangowolk zo groot als een vrachtwagen. Je wordt misselijk.' },
    moves: ['zwaait met een slagersmes', 'blaast een wolk zo groot als een vrachtwagen', 'scherpt zijn mes aan de stoeprand'],
    talk: [{ t: 'Vraag hoe je zo\'n wolk blaast', v: 35, r: '"Longinhoud, bro. Training." Hij is trots.' }, { t: 'Zeg dat je uit Meedhuizen komt', v: 25, r: '"Meedhuizen? Daar is toch niks?" Maar hij grinnikt.' }, { t: 'Zeg dat Delfzijl stinkt', v: -1, r: '"WAT?!" Het mes gaat omhoog.' }],
    spare: 'Hij stopt het mes weg en verdwijnt in zijn eigen wolk.', rare: 'zuidwester' },
  dz_haven: { ...DZ_BASE, name: 'Havenvaper met kapmes', look: 'dz_haven', cloud: '#c0d0ff', smaak: 'zeezout', hp: 76, atk: 13, def: 6, xp: 40, money: 30, drop: 'harpoen',
    inflict: { st: 'duizelig', ch: 0.25, t: 'De wolk ruikt naar diesel en blauwe bes. Je wordt duizelig.' },
    moves: ['hakt met een kapmes', 'blaast een wolk die de haven afsluit', 'gooit een tros naar je'],
    talk: [{ t: 'Vraag naar de schepen', v: 35, r: '"Daar komt er straks één uit Rusland. Of Emden." Hij wordt wat rustiger.' }, { t: 'Help met een tros', v: 30, r: 'Jullie trekken samen aan een tros. Het voelt als vriendschap.' }, { t: 'Zeg dat je zeeziek wordt', v: -1, r: '"Landrot!" Hij komt dreigend op je af.' }],
    spare: 'Hij springt op een sleepboot en vaart weg.', rare: 'reddingsvest' },
  dz_chemie: { ...DZ_BASE, name: 'Chemievaper met broodmes', look: 'dz_chemie', cloud: '#c8f070', smaak: 'onbekend', hp: 66, atk: 12, def: 5, xp: 36, money: 28, drop: 'scheepshoorn',
    inflict: { st: 'misselijk', ch: 0.4, t: 'De groene wolk ruikt naar het Chemiepark. Je wordt heel misselijk.' },
    moves: ['snijdt met een broodmes', 'blaast een felgroene wolk', 'zegt "proef maar" en houdt zijn vape op'],
    talk: [{ t: 'Vraag welke smaak dat is', v: 30, r: '"Weet ik niet. Stond niks op." Hij lijkt het zelf ook een beetje eng te vinden.' }, { t: 'Bied een krentenbol aan', v: 35, r: 'Hij eet hem in één hap. "Lekker. Gezond."' }, { t: 'Zeg dat hij groen ziet', v: -1, r: '"Jij ziet groen!" Dat klopt eigenlijk.' }],
    spare: 'Hij hoest groen en loopt naar huis.', rare: 'havenbroek' },
  dz_fatbike: { ...DZ_BASE, name: 'Fatbikebende met vleesmes', look: 'dz_fatbike', cloud: '#e0d0c0', smaak: 'cola-max', hp: 70, atk: 13, def: 5, xp: 38, money: 28, drop: 'anker',
    inflict: { st: 'duizelig', ch: 0.3, t: 'Ze rijden met z\'n vieren rondjes om je heen. Je wordt duizelig.' },
    moves: ['zwaait met een vleesmes vanaf de fatbike', 'rijdt over je voeten', 'blaast colawolken in je gezicht'],
    talk: [{ t: 'Vraag of hij de fatbike heeft opgevoerd', v: 35, r: '"Zestig. Officieel vijfentwintig." Hij knipoogt.' }, { t: 'Doe een wheelie na', v: 30, r: 'Je doet een wheelie zonder fiets. Ze vinden het briljant.' }, { t: 'Zeg dat Meedhuizen beter is', v: -1, r: '"Meedhuizen?!" Vier fatbikes keren tegelijk om.' }],
    spare: 'De bende scheurt weg richting de dijk.', rare: 'laarzen' },
  dz_dijk: { ...DZ_BASE, name: 'Dijkvaper met jachtmes', look: 'dz_dijk', cloud: '#ffc0e0', smaak: 'bubblegum-xxl', hp: 60, atk: 12, def: 4, xp: 32, money: 24, drop: 'harpoen',
    inflict: { st: 'misselijk', ch: 0.25, t: 'Bubblegum-xxl. Het is te veel. Je wordt misselijk.' },
    moves: ['steekt met een jachtmes', 'blaast een roze wolk over de dijk', 'filmt je voor zijn story'],
    talk: [{ t: 'Bewonder het uitzicht over de Eems', v: 35, r: '"Mooi hè. Daar ligt Duitsland." Hij wordt er stil van.' }, { t: 'Vraag of hij Maigret kent', v: 30, r: '"Dat beeld bij het Damsterdiep? Die kijkt altijd zo." Hij moet lachen.' }, { t: 'Gooi zijn vape in de Eems', v: -1, r: 'Je mist. Hij niet.' }],
    spare: 'Hij loopt de dijk op en kijkt naar de zee.', rare: 'zuidwester' },
  dz_koning: { ...DZ_BASE, boss: true, name: 'De Koning van de Zeedijk', look: 'dz_koning', cloud: '#c890ff', cloudScale: 3.5, smaak: 'koninklijk', hp: 260, atk: 17, def: 8, xp: 220, money: 150, stoerNeed: 5, rareChance: 0.5, rare: 'zuidwester',
    inflict: { st: 'misselijk', ch: 0.35, t: 'Een paarse wolk zo groot als de Eems. Je wordt misselijk.' },
    moves: ['zwaait met een machete', 'blaast een wolk zo groot als de Eems', 'roept "IK BEN DE KONING!"', 'gooit een oesterschelp naar je'],
    talk: [{ t: 'Buig voor de koning', v: 20, r: '"Eindelijk iemand met manieren." Hij is gevleid.' }, { t: 'Vraag naar zijn kroon', v: 20, r: 'Het is een gouden pet. "Van de Action," fluistert hij. "Maar zeg het tegen niemand."' }, { t: 'Zeg dat het geen echte koning is', v: -1, r: '"WAT?!" De machete gaat omhoog.' }],
    intim: 'Je kijkt de Koning recht aan en blaast een wolk terug die nog groter is. Er valt een stilte op de dijk.',
    spare: 'De Koning legt zijn machete neer. "Je bent sterker dan ik dacht, Meedhuizenaar."' },
});
const DZ_POOL = ['dz_slager', 'dz_haven', 'dz_chemie', 'dz_fatbike', 'dz_dijk'];
MAPS.delfzijl.pool = DZ_POOL;
for (const [id, e] of Object.entries(ENEMIES)) if (e.dz && e.rare) RARE_DROP[id] = e.rare;

// gouden vapes bij de zware jongens
const _stealVape = stealVape;
stealVape = async function (B, f, P) {
  if (!f.dz) return _stealVape(B, f, P);
  await B.log(`${f.name} ligt verslagen. De vape bungelt tussen zijn vette vingertjes, naast een heel groot mes.`);
  const ok = await vapeQTE();
  if (!ok) { SFX.no(); await B.log('"Probeer het nog eens, Meedhuizenaar." Hij klemt hem vast.'); return; }
  const gold = Math.random() < (f.boss ? 1 : 0.3);
  P.money += 40; SFX.item();
  if (gold) { P.items.gouden_vape = (P.items.gouden_vape || 0) + 1; await B.log('Je jat een GOUDEN VAPE! In het hoesje zit nog EUR 40.'); }
  else { P.items.vape = (P.items.vape || 0) + 1; await B.log('Je jat zijn vape. In het hoesje zit nog EUR 40.'); }
};

// ---------- quest in Delfzijl ----------
QUESTS.koning = {
  name: 'De Koning van de Zeedijk', done: 3,
  steps: ['', 'Visser Jaap wil de pet van zijn opa terug. De Koning van de Zeedijk heeft hem en hangt op de dijk boven de haven.', 'Breng de pet terug naar visser Jaap op de kade.', 'De pet is terug. Jaap is blij.'],
};

// ---------- deuren ----------
const go = (map, x, y, dir) => () => G.warp(map, x, y, dir);
async function locked(text) { await me(text); G.stepBack(); }
Object.assign(DOORS, {
  henk: async () => { if (!F().henkBinnen) { F().henkBinnen = true; await say('Henk', 'Ga maar naar binnen. Niks aanraken. Vooral de tulpenposter niet.'); } await G.warp('huis_henk', 5, 6, 'up'); },
  uit_huis_henk: go('dorp', 15, 13, 'down'),
  bakker: go('huis_bakker', 4, 6, 'up'),
  uit_huis_bakker: go('dorp', 4, 22, 'down'),
  boerderij: go('huis_boer', 6, 8, 'up'),
  uit_huis_boer: go('dorp', 29, 22, 'down'),
  kerk: go('kerk_binnen', 6, 14, 'up'),
  uit_kerk_binnen: go('dorp', 35, 13, 'down'),
  school: go('school_binnen', 6, 7, 'up'),
  uit_school_binnen: go('dorp', 16, 5, 'down'),
  aframe0: go('aframe_0', 4, 8, 'up'),
  uit_aframe_0: go('oost', 4, 8, 'down'),
  aframe1: go('aframe_1', 4, 8, 'up'),
  uit_aframe_1: go('oost', 10, 8, 'down'),
  aframe2: async () => {
    await G.warp('paleis', 11, 24, 'up');
    if (!F().paleisGezien) { F().paleisGezien = true; G.busy = true; await me('Je stapt naar binnen en blijft staan. Marmer. Gouden pilaren. Fonteinen. Een rode loper.'); await me('Het A-frame is van binnen groter dan van buiten. Veel groter.'); G.busy = false; }
  },
  uit_paleis: go('oost', 16, 8, 'down'),
  aframe3: go('aframe_3', 4, 8, 'up'),
  uit_aframe_3: go('oost', 22, 8, 'down'),
  kantine: go('kantine_binnen', 5, 6, 'up'),
  uit_kantine_binnen: go('zuid', 3, 7, 'down'),
  naar_delfzijl: async () => {
    await G.warp('delfzijl', G.pl.x === 11 ? 30 : 31, 46, 'up');
    if (!F().delfzijl) { F().delfzijl = true; G.busy = true; await me('Je loopt de Meedhuizerweg af naar het noorden. Daar ligt Delfzijl: een molen, een kerk, de haven en de dijk.'); await me('Boven de stad hangt een vape-wolk. Een hele grote.'); G.busy = false; }
  },
  dz_naar_dorp: () => G.warp('dorp', G.pl.x === 30 ? 11 : 12, 1, 'down'),
  molen_adam: go('molen_binnen', 4, 6, 'up'),
  uit_molen_binnen: go('delfzijl', 14, 17, 'down'),
  centrumkerk: go('centrumkerk_binnen', 5, 10, 'up'),
  uit_centrumkerk_binnen: go('delfzijl', 21, 17, 'down'),
  muzee: go('muzee_binnen', 7, 8, 'up'),
  uit_muzee_binnen: go('delfzijl', 37, 17, 'down'),
  snackbar: go('snackbar_binnen', 4, 6, 'up'),
  uit_snackbar_binnen: go('delfzijl', 5, 17, 'down'),
  dz_huis1: () => locked('Op de deur hangt een bordje: "Geen Meedhuizenaren." Dat is wel heel specifiek.'),
  dz_huis2: () => locked('Je klopt aan. Iemand roept: "We kopen niks!" Je verkocht ook niks.'),
  dz_huis3: () => locked('De deur zit op slot. Binnen hoor je iemand heel hard vapen.'),
  dz_huis4: () => locked('Een briefje: "Ben naar de haven. Terug als het vloed is."'),
  fabriek0: () => locked('VERBODEN TOEGANG. Het ruikt hier naar de wolk van de chemievapers.'),
  fabriek1: () => locked('VERBODEN TOEGANG.'),
  fabriek2: () => locked('VERBODEN TOEGANG. Echt.'),
});

// ---------- bewoners ----------
const R = (who, lines) => () => say(who, pick(lines));
NPCS.push(
  { id: 'kat_henk', map: 'huis_henk', x: 6, y: 4, dir: 'left', wander: true, look: { dog: true, fur: '#8a8a92' },
    async talk() { await say('Kat van Henk', pick(['Miauw.', 'Mrrr.'])); await me(pick(['De kat kijkt naar de tulpenposter en zucht.', 'De kat wil niet geaaid worden. Door jou.'])); } },
  { id: 'kleinzoon', map: 'huis_bakker', x: 5, y: 5, dir: 'down', look: { skin: '#f0c9a0', hair: '#3a2a1a', style: 'short', shirt: '#3aa0e0', pants: '#2a2a3a', extra: ['glasses'] },
    talk: R('Kleinzoon van mevrouw Bakker', ['Ik laat nergens opladers liggen. Ik verstop ze strategisch.', 'Oma heeft zesentwintig kabouters. Gerrit is haar favoriet. Zeg dat niet tegen de rest.', 'Heb jij mijn oplader gezien? Grapje. Ik heb er veertien.']) },
  { id: 'vrouw_jansen', map: 'huis_boer', x: 8, y: 6, dir: 'down', look: { skin: '#e8b090', hair: '#a8a8b0', style: 'bun', shirt: '#6a8a4a', pants: '#3a3a3a', extra: ['apron'] },
    async talk() {
      const f = F(), P = G.P;
      if (P.wear && P.wear.schoenen) {
        await say('Mevrouw Jansen', 'SCHOENEN UIT!');
        await me('Je trekt je schoenen uit. Mevrouw Jansen knikt tevreden.');
        P.wear.schoenen = null; return;
      }
      if (!f.jansenKoffie) {
        f.jansenKoffie = true;
        await say('Mevrouw Jansen', 'Goed zo, zonder schoenen. Oh. Je bent verder ook… nou ja. Ga zitten.');
        await say('Mevrouw Jansen', 'Klaas zei al dat je in de schuur had geslapen. Hier, twee krentenbollen. Je ziet eruit alsof je ze nodig hebt.');
        G.give('krentenbol', 2); return;
      }
      await say('Mevrouw Jansen', pick(['Klaas is bij de koeien. Hij is altijd bij de koeien.', 'Dit is een Oldambtster boerderij, hoor. Voor wonen, achter de koeien. Zo hoort het.', 'Wil je nog een bakkie? Nee? Ook goed.']));
    } },
  { id: 'organist', map: 'kerk_binnen', x: 7, y: 3, dir: 'up', look: { skin: '#f0c9a0', hair: '#c8c8d0', style: 'short', shirt: '#2a2a3a', pants: '#2a2a3a', extra: ['glasses'] },
    async talk() {
      [523, 659, 784, 1047].forEach((n, i) => setTimeout(() => SFX.tone(n, 0.4, 'triangle', 0.05), i * 260));
      await say('Organist', pick(['De Laurentiuskerk is uit de dertiende eeuw. De toren is later om de oude toren heen gebouwd. Een toren in een toren.', 'Ik oefen voor zondag. Jij hoorde me vannacht toch niet, hè? Ik jou wel.', 'De beuken buiten zijn ouder dan iedereen in het dorp. Behalve de kerk.']));
    } },
  { id: 'buren_a0', map: 'aframe_0', x: 4, y: 4, dir: 'down', look: { skin: '#e8b898', hair: '#6b4226', style: 'long', shirt: '#c86a9a', pants: '#2a2a3a', extra: [] },
    talk: R('Buurvrouw', ['Daniël van verderop heeft zestien schermen. Onze lampen knipperen als hij een baas verslaat.', 'Hij komt nooit buiten. Er staat elke dag een pizzabezorger voor de deur.', 'Zijn A-frame is van buiten net zo groot als het onze. Van binnen niet.']) },
  { id: 'oud_stel', map: 'aframe_3', x: 3, y: 4, dir: 'down', look: { skin: '#e0b090', hair: '#e0e0e0', style: 'bald', shirt: '#6a5a4a', pants: '#3a3a3a', extra: ['mustache', 'glasses'] },
    talk: R('Opa', ['Vroeger stond hier een boerderij. Daarvoor een boerderij. En daarvoor water.', 'Meedhuizen ligt laag, jongen. Een van de laagste plekken van Groningen. Hou je voeten droog.', 'Ik heb die jongen van verderop één keer gezien. Hij had een headset op.']) },
  { id: 'oma', map: 'aframe_3', x: 5, y: 4, dir: 'down', look: { skin: '#eac0a0', hair: '#d8d8e0', style: 'curly', shirt: '#7a4a9a', pants: '#3a3a5a', extra: ['glasses', 'blush'] },
    talk: R('Oma', ['Wil je een koekje? Ze zijn op. Maar wil je er een?', 'Mijn man vertelt weer verhalen. Ze zijn allemaal waar. Ongeveer.']) },
  { id: 'kantinejuf', map: 'kantine_binnen', x: 4, y: 2, dir: 'down', look: { skin: '#f0c9a0', hair: '#c88a3a', style: 'curly', shirt: '#2a4a9a', pants: '#2a2a3a', extra: ['apron'] },
    async talk() {
      await say('Kantinejuffrouw', 'Frikandellen zijn op. Iemand heeft er vannacht vierentwintig gebracht en ze toen allemaal zelf opgegeten.');
      await G.shop(['frikandelbroodje', 'koffie', 'bitterballen'], 'Kantinejuffrouw');
    } },
  { id: 'juf', map: 'school_binnen', x: 8, y: 2, dir: 'down', look: { skin: '#e8b898', hair: '#8a5a2a', style: 'bun', shirt: '#2e8a5a', pants: '#2a2a3a', extra: ['glasses'] },
    talk: R('Juf', ['De school is uit 1936. De tafels ook, zo te zien.', 'Jij was toch die jongen die vannacht door het raam keek? Je zwaaide.', 'Weet je hoe je heet? Schrijf het maar op het bord. Nee? Dacht ik al.']) },
  // het paleis
  { id: 'daniel', map: 'paleis', x: 11, y: 3, dir: 'up', look: { skin: '#f0c4a0', hair: '#3a2a1a', style: 'short', shirt: '#1b1b2a', pants: '#2a2a3a', extra: ['glasses', 'tired'] },
    async talk() {
      const f = F();
      f.daniel = (f.daniel || 0) + 1;
      const n = f.daniel;
      if (n === 1) { await me('Daniël zit achter zijn computer, met zijn rug naar je toe. Op zestien monitoren tegelijk loopt RuneScape.'); await say('Daniël', 'Ssst. Ik ben aan het raiden.'); return; }
      if (n === 2) { await say('Daniël', 'Nee, echt, niet nu. Nog 2000 XP tot 99 Woodcutting.'); return; }
      if (n === 3) { await say('Daniël', 'Ik heb net een level gehaald. Door jou heb ik het vuurwerk gemist.'); await say('Butler', 'Meneer Daniël wenst niet gestoord te worden. Dit is de laatste waarschuwing.'); return; }
      await say('Daniël', '…');
      await me('De butler pakt je vriendelijk maar heel beslist bij de schouders en zet je buiten.');
      f.daniel = 0;
      await G.warp('oost', 16, 8, 'down');
    } },
  { id: 'butler', map: 'paleis', x: 13, y: 23, dir: 'left', look: { skin: '#e8b898', hair: '#c8c8d0', style: 'short', shirt: '#1b1b1b', pants: '#1b1b1b', extra: ['mustache'] },
    async talk() {
      const f = F();
      if (!f.butler) { f.butler = true; await say('Butler', 'Welkom in het paleis van meneer Daniël. U mag rondkijken. U mag hem niet storen.'); await say('Butler', 'Meneer speelt RuneScape. Op zestien schermen. Hij is bijna 99 Woodcutting. Dat is heel belangrijk.'); return; }
      await say('Butler', pick(['Fluisteren, alstublieft.', 'Meneer heeft vandaag al drie bazen verslagen. En een pizza.', 'De fonteinen zijn van echt marmer. De pizza\'s van de Domino\'s.', 'Als u meneer stoort, moet ik u helaas buiten zetten.']));
    } },
  // Delfzijl
  { id: 'jaap', map: 'delfzijl', x: 42, y: 24, dir: 'left', look: LOOKS.jaap,
    async talk() {
      const f = F(), q = G.quest('koning');
      if (!q) {
        await say('Visser Jaap', 'Meedhuizenaar, hè? Dat zie ik zo. Aan je… alles.');
        await say('Visser Jaap', 'De Koning van de Zeedijk heeft de pet van mijn opa gejat. Hij hangt op de dijk met zijn bende en blaast wolken over de Eems.');
        await say('Visser Jaap', 'Haal die pet terug, dan krijg je mijn oude harpoen. En een paar centen.');
        G.quest('koning', 1); return;
      }
      if (q === 2 && G.has('opapet')) {
        G.take('opapet');
        await say('Visser Jaap', 'De pet van opa! Hij ruikt naar mango, maar dat waait er wel uit.');
        G.P.money += 150; SFX.item(); UI.toast('+EUR 150');
        await giveWeapon('harpoen');
        G.quest('koning', 3); return;
      }
      await say('Visser Jaap', pick(['De Eems is vandaag rustig. De vapers niet.', 'Molen Adam staat er al sinds 1875. Hij kwam uit Bedum. Net als mijn schoonmoeder.', 'Dat beeld bij het Damsterdiep? Maigret. Een speurder. Misschien weet hij hoe jij heet.']));
    } },
  { id: 'koning', map: 'delfzijl', x: 36, y: 6, dir: 'down', look: LOOKS.dz_koning, show: () => !F().koningDone,
    async talk() {
      await say('De Koning van de Zeedijk', 'Wie stoort de Koning? Een Meedhuizenaar? Op MIJN dijk?');
      const k = await ask('De Koning van de Zeedijk', 'Je komt voor de pet, hè. Iedereen komt voor de pet.', ['Geef die pet terug', 'Ik loop maar wat']);
      if (k !== 0) { await say('De Koning van de Zeedijk', 'Loop dan maar door. Snel.'); return; }
      const r = await G.fight('dz_koning');
      if (r === 'win' || r === 'spared') {
        F().koningDone = true;
        await say('De Koning van de Zeedijk', 'Goed. Neem die pet maar. Hij paste me toch niet.');
        G.give('opapet');
        if (G.quest('koning') < 2) G.quest('koning', 2);
      }
    } },
  { id: 'snackbaas', map: 'snackbar_binnen', x: 4, y: 2, dir: 'down', look: { skin: '#e0b090', hair: '#1b1420', style: 'short', shirt: '#f4f1ea', pants: '#2a2a3a', extra: ['apron', 'mustache'] },
    async talk() {
      await say('Snackbarbaas', pick(['Wat mag het zijn? Hier in Delfzijl frituren we op zeeniveau.', 'Ben jij die Meedhuizenaar? Je ziet er hongerig uit. En naakt.', 'Patatje oorlog. Dat is hier geen gerecht, dat is een levensstijl.']));
      await G.shop(['frikandel_speciaal', 'kroket', 'patatje_oorlog', 'koffie'], 'Snackbarbaas');
    } },
  { id: 'zeehond', map: 'muzee_binnen', x: 7, y: 5, dir: 'down', wander: true, look: { dog: true, fur: '#8a8a92' },
    async talk() { await say('Zeehond Sjors', pick(['Arf.', 'Arf arf.', 'Mrrf.'])); await me(pick(['Sjors klapt met zijn flippers. Hij vindt je leuk. Of hij wil vis.', 'Het Muzeeaquarium zit deels in een bunker uit de oorlog. Sjors vindt dat gezellig.'])); } },
  { id: 'molenaar', map: 'molen_binnen', x: 4, y: 3, dir: 'down', look: { skin: '#e8b898', hair: '#e0e0e0', style: 'short', shirt: '#f4f1ea', pants: '#6a5a4a', extra: ['beard'] },
    talk: R('Molenaar', ['Molen Adam. Gebouwd in Bedum, in 1875 hierheen verhuisd. Molens verhuisden toen nog.', 'Bij harde wind draait hij als een gek. Net als jij vannacht, hoor ik.', 'Meel heb ik niet. Wel stof. Heel veel stof.']) },
  { id: 'koster', map: 'centrumkerk_binnen', x: 7, y: 3, dir: 'down', look: { skin: '#f0c9a0', hair: '#5a3a20', style: 'short', shirt: '#2a2a3a', pants: '#2a2a3a', extra: [] },
    talk: R('Koster', ['De Centrumkerk is uit 1830. De vape-lucht uit 2024.', 'Hier is het rustig. Buiten op de dijk niet.', 'Kom je bidden of schuilen? Allebei mag.']) },
  { id: 'strandganger', map: 'delfzijl', x: 8, y: 6, dir: 'down', wander: true, look: { skin: '#f0c4a0', hair: '#e0b850', style: 'long', shirt: '#e8433a', pants: '#3ab0c0', extra: [] },
    talk: R('Strandganger', ['Dit is het stadsstrand. Ja, Delfzijl heeft een strand. Op nieuwjaarsdag springen we erin.', 'Daar achter de dijk ligt de Eems. En daarachter Duitsland. Zwaai maar.', 'Pas op voor de Koning op de dijk. Zijn wolk zie je vanaf Borkum.']) },
);

// ---------- dingen om te bekijken ----------
Object.assign(PROPS, {
  kanaalbord: () => me('AFWATERINGSKANAAL VAN DUURSWOLD. De brug is in 1945 opgeblazen en daarna opnieuw gebouwd. Deze houdt het wel.'),
  borddelfzijl: () => me('↑ Meedhuizerweg · Delfzijl'),
  dz_plaatsbord: () => me('DELFZIJL. Daaronder heeft iemand met stift geschreven: "Meedhuizenaren: op eigen risico."'),
  maigret: () => me('Een bronzen beeld van inspecteur Maigret, bij het Damsterdiep. Simenon schreef zijn eerste Maigret hier in Delfzijl. Maigret kijkt je onderzoekend aan. Als iemand kan uitzoeken hoe je heet, is hij het. Jammer dat hij van brons is.'),
  damsterdiep: () => me('DAMSTERDIEP. Van Groningen naar Delfzijl. Vroeger heette het de Delf. Vandaar de naam.'),
  schip: () => me(pick(['Een vrachtschip. Op de achterkant staat een havennaam die je niet kunt uitspreken.', 'Een sleepboot. Er hangt een vape-wolk boven de schoorsteen. Of is het rook?'])),
  kraan: () => me('Een havenkraan. Hij tilt containers. En stiekem ook wel eens een fatbike.'),
  schoorsteen: () => me('Een schoorsteen van het Chemiepark. Uit de top komt een wolk die bijna net zo groot is als die van de Koning.'),
  aquarium: () => me(pick(['Een aquarium met platvissen. Ze kijken allebei de kant van jou op. Met twee ogen aan één kant.', 'Een aquarium met een krab. Hij zwaait. Je zwaait terug.', 'Een aquarium met kwallen. Je wordt er rustig van. Even.'])),
  bunkerposter: () => me('Een deel van het Muzeeaquarium zit in een bunker uit de Tweede Wereldoorlog. En er ligt een stuk van een echt hunebed.'),
  snackposter: () => me('MENU: frikandel speciaal, kroket, patatje oorlog. Onderaan: "Vapen is hier verboden." Iemand heeft dat doorgestreept.'),
  henk_tv: () => me('Op de tv van Henk staat een tuinprogramma. Er wordt gesnoeid. Henk heeft het vast opgenomen.'),
  henk_poster: () => me('Een poster van tulpen. Eronder: "Keukenhof 1998. Het mooiste jaar van mijn leven." Handtekening: Henk.'),
  kabouters: () => me(pick(['Een rij tuinkabouters. Gerrit staat niet tussen de anderen. Hij is buiten. Hij is speciaal.', 'Zesentwintig tuinkabouters kijken je aan. Je voelt je bekeken.'])),
  thijs_poster: () => me(pick(['Een poster van een BMW. Het motorblok is goed te zien.', 'Een poster met de tekst "OOPSIE". Thijs heeft hem zelf laten drukken.'])),
  kantineposter: () => me('VV MEEDHUIZEN. Sportcomplex. Eronder een teamfoto. Op de achterste rij: rugnummer 7. Het gezicht is weggekrast.'),
  frikandelzakjes: () => me('Een doos met vierentwintig lege frikandelzakjes. Je telt ze. Ja, vierentwintig.'),
  schoolbord: () => me('Op het bord staat: "Wie weet de naam van de jongen die vannacht door het raam zwaaide?" Niemand heeft iets opgeschreven.'),
  orgel: () => { [392, 494, 587, 784].forEach((n, i) => setTimeout(() => SFX.tone(n, 0.5, 'triangle', 0.05), i * 220)); return me('Je drukt een paar toetsen in. Het klinkt als een begrafenis. Of als jij vanochtend.'); },
  pilaar: () => me('Een pilaar van wit marmer met gouden randen. Je klopt erop. Massief. Hoe past dit in een A-frame?'),
  fontein: () => me('Een fontein. Het water klatert. Er liggen munten in, en een lege energiedrank.'),
  monitors: () => me('Zestien monitoren. Op elk scherm RuneScape. Op één scherm staat "Congratulations, you just advanced a Woodcutting level." Ernaast een lege pizzadoos.'),
});
