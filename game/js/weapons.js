// Wapens: elk met eigen bonus, aanvalstekst, speciale aanval en icoontje dat je poppetje vasthoudt.
const FOE_ST = { ongemak: 'Ongemakkelijk', misselijk: 'Misselijk', verblind: 'Verblind', verzwakt: 'Verzwakt' };
const ME_ST = { misselijk: 'Misselijk', duizelig: 'Duizelig', opgepompt: 'Opgepompt', gedekt: 'Gedekt' };

const WEAPONS = {
  krant: {
    name: 'Natte krant', atk: 1, verb: 'Je mept met de natte krant. Pets.', from: 'De bushalte',
    sp: { name: 'Opgerolde mep', ep: 2, desc: 'Strak opgerold. 1,4× schade.', run: (B) => B.wHit(1.4, 'Je rolt de krant strak op en geeft een flinke mep.') },
  },
  tafelvlag: {
    name: 'Tafelvlag', atk: 2, verb: 'Je zwaait met de tafelvlag van het dorpshuis.', from: 'De reddingsboei bij de steiger',
    sp: { name: 'Capezwaai', ep: 3, desc: 'Verblindt de vijand 2 beurten.', run: async (B) => { await B.log('Je slaat de tafelvlag om als cape en draait een rondje. De vijand ziet alleen nog vlag.'); await B.foeSt('verblind', 2); } },
  },
  kaarten: {
    name: 'Klaverjaskaarten', atk: 2, verb: 'Je gooit een klaverjaskaart. Hij komt met de punt aan.', from: 'Het dorpshuis',
    sp: { name: 'Roem!', ep: 3, desc: 'Gok: tussen 0,3× en 2,8× schade.', run: (B) => { const m = 0.3 + Math.random() * 2.5; return B.wHit(m, m > 2 ? 'STUK! Honderd roem!' : m < 0.8 ? 'Je hebt alleen een driekaart. Zielig.' : 'Vijftig roem!'); } },
  },
  selfiestick: {
    name: 'Selfiestick', atk: 3, verb: 'Je prikt met de selfiestick.', from: 'Buit van de TikTok-vaper',
    sp: { name: 'Flitsselfie', ep: 3, desc: 'Lichte schade en verblindt 2 beurten.', run: async (B) => { await B.wHit(0.8, 'Klik! Met flits. Je zet hem meteen in je story.'); await B.foeSt('verblind', 2); } },
  },
  helm: {
    name: 'Scooterhelm', atk: 3, verb: 'Je slaat met de scooterhelm.', from: 'Buit van de vaper op scooter',
    sp: { name: 'Helmstoot', ep: 4, desc: 'Kopstoot zonder hoofdpijn. 1,8× schade.', run: (B) => B.wHit(1.8, 'Je zet de helm op en gaat er met je hoofd vol in.') },
  },
  breinaalden: {
    name: 'Breinaalden', atk: 3, verb: 'Je prikt met de breinaalden.', from: 'Mevrouw Bakker',
    sp: { name: 'Recht-averecht', ep: 4, desc: 'Twee prikken en de vijand is Verzwakt.', run: async (B) => { await B.wHit(0.8, 'Recht!'); await B.wHit(0.8, 'Averecht!'); await B.foeSt('verzwakt', 2); } },
  },
  fietspomp: {
    name: 'Fietspomp', atk: 4, verb: 'Je meppt met de fietspomp.', from: 'Buit van de vaper op fatbike',
    sp: { name: 'Oppompen', ep: 3, desc: 'Je doet 3 beurten 40% meer schade.', run: async (B) => { await B.log('Je zet de pomp op je eigen arm en pompt. Je voelt je opgepompt. Letterlijk.'); B.meSt('opgepompt', 3); } },
  },
  springtouw: {
    name: 'Springtouw', atk: 3, verb: 'Je zwiept met het springtouw.', from: 'Buit van de vaper in trainingspak',
    sp: { name: 'Vastbinden', ep: 4, desc: 'De vijand slaat een beurt over.', run: async (B) => { await B.log('Je bindt de vijand met het springtouw aan een denkbeeldige lantaarnpaal.'); await B.foeSt('ongemak', 1); } },
  },
  frikandel: {
    name: 'Bevroren frikandel', atk: 4, verb: 'Je slaat met de bevroren frikandel. Hij is keihard.', from: 'Te koop bij de EKA',
    sp: { name: 'Diepvriesklap', ep: 4, desc: '1,4× schade en de vijand bevriest een beurt.', run: async (B) => { await B.wHit(1.4, 'Een klap recht uit de vriezer.'); await B.foeSt('ongemak', 1); } },
  },
  paraplu: {
    name: 'Paraplu', atk: 4, verb: 'Je prikt met de punt van de paraplu.', from: 'Te koop bij de EKA',
    sp: { name: 'Paraplu open!', ep: 3, desc: 'De volgende aanval op jou ketst af.', run: async (B) => { await B.log('Floep! Je klapt de paraplu open en verstopt je erachter.'); B.meSt('gedekt', 1); } },
  },
  dartpijlen: {
    name: 'Dartpijlen', atk: 5, verb: 'Je gooit een dartpijl. Dubbel zestien.', from: 'Te koop bij Lanting',
    sp: { name: 'Triple twenty', ep: 5, desc: 'Drie pijlen achter elkaar.', run: async (B) => { for (const t of ['Twintig!', 'Nog een twintig!', 'ONE HUNDRED AND EIGHTYYY!']) if (B.foe.curHp > 0) await B.wHit(0.7, t); } },
  },
  mestvork: {
    name: 'Mestvork', atk: 5, verb: 'Je prikt met de mestvork.', from: 'De schuur van boer Jansen',
    sp: { name: 'Mestschep', ep: 4, desc: 'Een schep uit de koeienstal. De vijand wordt Misselijk.', run: async (B) => { await B.wHit(1.2, 'Je schept iets uit de stal en gooit het met een boog richting de vijand.'); await B.foeSt('misselijk', 3); } },
  },
  schoffel: {
    name: 'Tuinschoffel van Henk', atk: 5, verb: 'Je haalt uit met de schoffel van Henk.', from: 'Henk, als je stoer genoeg bent',
    sp: { name: 'Onkruid wieden', ep: 4, desc: '1,5× schade en de vijand is Verzwakt.', run: async (B) => { await B.wHit(1.5, 'Je wiedt de vijand als onkruid tussen Henks tulpen.'); await B.foeSt('verzwakt', 2); } },
  },
  cornervlag: {
    name: 'Cornervlag', atk: 6, verb: 'Je zwiept met de cornervlag.', from: 'Trainer Harm',
    sp: { name: 'Buitenspel!', ep: 5, desc: 'De vijand moet terug: een beurt over en Verzwakt.', run: async (B) => { await B.log('Je steekt de vlag in de lucht. BUITENSPEL! De vijand moet beschaamd terug naar zijn eigen helft.'); await B.foeSt('ongemak', 1); await B.foeSt('verzwakt', 2); } },
  },
  dildo: {
    name: 'Roze dildo', atk: 7, verb: 'Je slaat met de roze dildo. Hij flubbert na.', from: 'Een container achter de EKA',
    sp: { name: 'Zwiepen', ep: 5, desc: '1,6× schade. De vijand weet niet waar hij moet kijken.', run: async (B) => { await B.wHit(1.6, 'Je zwiept met de roze dildo. Hij maakt een geluid als een natte wilgentak.'); await B.foeSt('ongemak', 2); } },
  },
  mick: {
    name: 'Fotolijst: Mick de geile hond', atk: 8, verb: 'Je slaat met de fotolijst. Mick kijkt vanachter het glas toe.', from: 'Thijs',
    sp: { name: 'Mick laten zien', ep: 6, desc: 'De foto. Ongemakkelijk én Misselijk.', run: async (B) => { await B.wHit(1.2, 'Je houdt de fotolijst omhoog. Mick en een strandbal, in volle actie.'); await B.foeSt('ongemak', 2); await B.foeSt('misselijk', 3); } },
  },
};

// ---------- icoontjes (12×12, handvat linksonder) ----------
const WICON = {
  krant(x) { for (let i = 0; i < 9; i++) { px(x, 1 + i, 10 - i, 3, 2, '#d8d4c8'); px(x, 2 + i, 10 - i, 1, 1, '#8a8678'); } },
  tafelvlag(x) { for (let i = 0; i < 11; i++) px(x, 1 + (i >> 1), 11 - i, 1, 1, '#6e4a2c'); px(x, 6, 0, 6, 2, '#2e7a3a'); px(x, 6, 2, 6, 2, '#f4f1ea'); px(x, 6, 4, 6, 2, '#2e7a3a'); },
  kaarten(x) { px(x, 2, 3, 5, 7, '#1b1420'); px(x, 3, 4, 3, 5, '#f4f1ea'); px(x, 5, 2, 5, 7, '#1b1420'); px(x, 6, 3, 3, 5, '#f4f1ea'); px(x, 7, 4, 1, 2, '#c23b2e'); },
  selfiestick(x) { for (let i = 0; i < 9; i++) px(x, 1 + i, 11 - i, 1, 1, '#2a2a2a'); px(x, 8, 0, 4, 5, '#1b1420'); px(x, 9, 1, 2, 3, '#7ab0e0'); },
  helm(x) { px(x, 1, 3, 10, 8, '#1b1420'); px(x, 2, 2, 8, 2, '#1b1420'); px(x, 2, 4, 8, 6, '#2a2a3a'); px(x, 6, 5, 4, 3, '#5a8ab0'); px(x, 3, 4, 2, 1, '#6a6a7a'); },
  breinaalden(x) { for (let i = 0; i < 10; i++) { px(x, 1 + i, 11 - i, 1, 1, '#c0c0c8'); px(x, 3 + i * 0.8, 11 - i, 1, 1, '#c0c0c8'); } px(x, 1, 7, 4, 4, '#e86fb0'); px(x, 2, 8, 2, 1, '#c84f90'); },
  fietspomp(x) { for (let i = 0; i < 8; i++) px(x, 2 + i, 10 - i, 2, 2, '#f2c22e'); px(x, 8, 0, 4, 2, '#1b1420'); px(x, 1, 10, 3, 2, '#1b1420'); },
  springtouw(x) { px(x, 1, 9, 2, 3, '#c23b2e'); px(x, 9, 9, 2, 3, '#c23b2e'); for (let i = 0; i < 9; i++) px(x, 2 + i, 8 - Math.round(Math.sin((i / 8) * Math.PI) * 7), 1, 1, '#f4f1ea'); },
  frikandel(x) { for (let i = 0; i < 9; i++) px(x, 1 + i, 10 - i, 3, 2, '#8a4a2a'); px(x, 3, 8, 1, 1, '#e0f0ff'); px(x, 6, 5, 1, 1, '#e0f0ff'); px(x, 9, 2, 1, 1, '#e0f0ff'); },
  paraplu(x) { for (let i = 0; i < 4; i++) px(x, 1 + i, 11 - i, 1, 1, '#3a2a1a'); for (let i = 0; i < 6; i++) px(x, 4 + i, 8 - i, 3, 2, '#c23b2e'); px(x, 10, 1, 1, 1, '#999'); },
  dartpijlen(x) { for (let d = 0; d < 3; d++) { for (let i = 0; i < 6; i++) px(x, 2 + i + d * 2, 10 - i - d, 1, 1, '#c0c0c8'); px(x, 1 + d * 2, 10 - d, 2, 2, ['#c23b2e', '#2e7a3a', '#3a6aa6'][d]); } },
  mestvork(x) { for (let i = 0; i < 8; i++) px(x, 1 + i, 11 - i, 1, 1, '#8c5a32'); px(x, 7, 1, 1, 4, '#888'); px(x, 9, 0, 1, 4, '#888'); px(x, 11, 0, 1, 3, '#888'); px(x, 7, 3, 5, 1, '#888'); },
  schoffel(x) { for (let i = 0; i < 8; i++) px(x, 1 + i, 11 - i, 1, 1, '#8c5a32'); px(x, 7, 0, 5, 3, '#9a9aa2'); px(x, 7, 2, 5, 1, '#6a6a72'); },
  cornervlag(x) { for (let i = 0; i < 11; i++) px(x, 1 + (i >> 1), 11 - i, 1, 1, '#f4f1ea'); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) px(x, 6 + c * 2, r * 2, 2, 2, (r + c) % 2 ? '#c23b2e' : '#f2c22e'); },
  dildo(x) {
    for (let i = 0; i < 7; i++) px(x, 2 + i, 9 - i, 3, 3, '#e86fb0');
    px(x, 8, 1, 3, 3, '#f08ac0'); px(x, 9, 0, 2, 1, '#f08ac0'); px(x, 1, 9, 4, 3, '#c84f90');
    for (let i = 0; i < 6; i++) px(x, 3 + i, 9 - i, 1, 1, '#f6a8d0');
  },
  mick(x) {
    px(x, 1, 1, 10, 10, '#6e4424'); px(x, 2, 2, 8, 8, '#a8d0e8');
    px(x, 3, 6, 5, 3, '#d8b88a'); px(x, 6, 4, 3, 3, '#d8b88a'); px(x, 7, 5, 1, 1, '#1b1420'); px(x, 4, 5, 1, 1, '#c8a878');
    px(x, 2, 7, 2, 2, '#c23b2e');
  },
};
const wiconCache = {};
function wicon(id, flip) {
  const key = id + (flip ? 'f' : '');
  if (!wiconCache[key]) {
    const [c, x] = mk(12, 12);
    if (flip) { x.translate(12, 0); x.scale(-1, 1); }
    (WICON[id] || (() => {}))(x);
    wiconCache[key] = c;
  }
  return wiconCache[key];
}
// Wapen in de hand, ten opzichte van de linkerbovenhoek van de 16×16 sprite
function drawHeld(c, id, dir, x, y, frame, behind) {
  if (!id) return;
  const bob = frame === 1 ? 1 : 0;
  if (behind !== (dir === 'up')) return;
  if (dir === 'down') c.drawImage(wicon(id), Math.round(x) + 10, Math.round(y) - 2 + bob);
  else if (dir === 'right') c.drawImage(wicon(id), Math.round(x) + 8, Math.round(y) - 2 + bob);
  else if (dir === 'left') c.drawImage(wicon(id, true), Math.round(x) - 4, Math.round(y) - 2 + bob);
  else c.drawImage(wicon(id), Math.round(x) + 6, Math.round(y) - 7 + bob);
}

function ownsWeapon(id) { return (G.P.weapons || []).includes(id); }
async function giveWeapon(id, quiet) {
  const P = G.P;
  P.weapons = P.weapons || [];
  if (P.weapons.includes(id)) return;
  P.weapons.push(id);
  SFX.item();
  UI.toast(`Wapen: ${WEAPONS[id].name}`, 2400);
  if (quiet) { if (!P.wpn) P.wpn = id; return; }
  const k = await G.ask('', `${WEAPONS[id].name} (+${WEAPONS[id].atk} aanval). Speciaal: ${WEAPONS[id].sp.name}. Meteen vasthouden?`, ['Vasthouden', 'In je zak stoppen']);
  if (k === 0) P.wpn = id;
}

// ---------- Mick, de labradoodle van Thijs ----------
function drawDog(x, L, dir, frame) {
  const O = '#1b1420', B = L.fur || '#d8b88a', D = shade(B, -30);
  const leg = frame ? 1 : 0;
  if (dir === 'left' || dir === 'right') {
    const fl = dir === 'left';
    const X = (v, w = 1) => (fl ? 16 - v - w : v);
    px(x, X(2, 11), 6, 11, 6, O); px(x, X(3, 9), 7, 9, 4, B);
    for (let i = 0; i < 4; i++) px(x, X(3 + i * 2), 7 + (i % 2), 1, 1, D);
    px(x, X(10, 5), 3, 5, 5, O); px(x, X(11, 4), 4, 3, 4, B); px(x, X(13), 5, 1, 1, O); px(x, X(14), 6, 1, 1, '#3a2a2a');
    px(x, X(10), 4, 1, 3, D);
    px(x, X(1), 5 + leg, 1, 2, B);
    px(x, X(3), 11, 1, 3 - leg, O); px(x, X(5), 11, 1, 2 + leg, O); px(x, X(9), 11, 1, 3 - leg, O); px(x, X(11), 11, 1, 2 + leg, O);
  } else {
    px(x, 4, 6, 8, 8, O); px(x, 5, 7, 6, 6, B);
    px(x, 4, 1, 8, 7, O); px(x, 5, 2, 6, 5, B); px(x, 4, 3, 1, 3, D); px(x, 11, 3, 1, 3, D);
    for (let i = 0; i < 3; i++) px(x, 5 + i * 2, 2, 1, 1, D);
    if (dir === 'down') { px(x, 6, 4, 1, 1, O); px(x, 9, 4, 1, 1, O); px(x, 7, 5, 2, 1, '#3a2a2a'); px(x, 7, 6, 2, 1, '#e88a9a'); }
    else px(x, 7, 11, 2, 3 + leg, B);
    px(x, 5, 13, 2, 2 - leg, O); px(x, 9, 13, 2, 1 + leg, O);
  }
}
const _drawCharInto = drawCharInto;
drawCharInto = function (x, L, dir, frame) { if (L.dog) drawDog(x, L, dir, frame); else _drawCharInto(x, L, dir, frame); };
LOOKS.mick = { dog: true, fur: '#d8b88a' };

// wapens die je kunt kopen
Object.assign(ITEMS, {
  w_frikandel: { name: 'Bevroren frikandel (wapen)', desc: 'Keihard. Niet opeten.', price: 5, weapon: 'frikandel' },
  w_paraplu: { name: 'Paraplu (wapen)', desc: 'Voor regen en vijanden.', price: 8, weapon: 'paraplu' },
  w_darts: { name: 'Dartpijlen (wapen)', desc: 'Drie stuks, met vluchtjes.', price: 10, weapon: 'dartpijlen' },
});
PROP_DRAW.mestvork = function (x) { px(x, 7, 4, 1, 11, '#8c5a32'); px(x, 4, 3, 7, 1, '#888'); for (let i = 0; i < 4; i++) px(x, 4 + i * 2, 0, 1, 3, '#888'); };
