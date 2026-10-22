// Kleding: 4 vakken (hoofd, boven, broek, schoenen), stats, de kringloopwinkel, vondsten en zeldzame buit.
// Zonder broek krijg je een censuurbalk; het formaat kies je bij het maken van je personage.
const SLOTS = ['hoofd', 'boven', 'broek', 'schoenen'];
const SLOT_NAME = { hoofd: 'Hoofd', boven: 'Bovenlijf', broek: 'Broek', schoenen: 'Schoenen' };

const CLOTHES = {
  // hoofd
  muts_oma: { slot: 'hoofd', name: 'Gehaakte muts van oma', t: 'muts', col: '#c86a9a', st: { def: 1 }, price: 6, desc: 'Roze, met pompon. Kriebelt.' },
  pet_guci: { slot: 'hoofd', name: 'Nep-Gucci pet ("Guci")', t: 'pet', col: '#2e6a3a', st: { stoer: 1 }, price: 12, desc: 'De G staat op zijn kop.' },
  vissershoed: { slot: 'hoofd', name: 'Vissershoedje met haakjes', t: 'hoedje', col: '#9a8a5a', st: { def: 1 }, price: 5, desc: 'Er hangt nog een wormpje aan.' },
  kegel: { slot: 'hoofd', name: 'Verkeerskegel', t: 'kegel', col: '#ff7a2a', st: { def: 2, stoer: -1 }, desc: 'Past verrassend goed. Je ziet er niet uit.' },
  glitterhoed: { slot: 'hoofd', name: 'Glitter-buckethat', t: 'hoedje', col: '#e86fb0', st: { def: 1, stoer: 2 }, rare: true, desc: 'Zeldzaam. Glinstert zelfs in de schaduw.' },
  propellerpet: { slot: 'hoofd', name: 'Propellerpet', t: 'propeller', col: '#3a6ac8', st: { def: 1, stoer: 2, atk: 1 }, rare: true, desc: 'Zeldzaam. Draait als je hard loopt. Denk je.' },
  // boven
  kersttrui: { slot: 'boven', name: 'Kersttrui met rendier', col: '#c23b2e', pat: 'rendier', st: { def: 2 }, price: 8, desc: 'Het rendier heeft een knipperneus. De batterij is leeg.' },
  prado: { slot: 'boven', name: 'Nep-Prada shirt ("Prado")', col: '#1b1b1b', pat: 'logo', st: { def: 1, stoer: 1 }, price: 15, desc: 'Echt nep. Gegarandeerd.' },
  hawaii: { slot: 'boven', name: 'Hawaïblouse met flamingo\'s', col: '#3ab0c0', pat: 'flamingo', st: { def: 1, atk: 1 }, price: 7, desc: 'Voor als je niet gezien wilt worden. Dat lukt niet.' },
  trainingsjack: { slot: 'boven', name: 'Glimmend trainingsjack', col: '#7a3ac8', pat: 'tracksuit', st: { def: 1, atk: 1 }, price: 10, desc: 'Ritselt bij elke stap.' },
  vuilniszak: { slot: 'boven', name: 'Vuilniszak met armgaten', col: '#2a2a2a', st: { def: 1, stoer: -1 }, desc: 'Gratis. Ruikt naar gisteren.' },
  leerjack: { slot: 'boven', name: 'Echt leren jack', col: '#2a1a14', pat: 'jacket', st: { def: 3, stoer: 2 }, rare: true, desc: 'Zeldzaam. Echt leer. Echt stoer.' },
  // broek
  ribbroek: { slot: 'broek', name: 'Ribbroek in mosterdgeel', col: '#c8a02a', st: { def: 2 }, price: 8, desc: 'Zoeft bij het lopen.' },
  jogging: { slot: 'broek', name: 'Joggingbroek met gat in de knie', col: '#7a7a84', st: { def: 1 }, price: 4, desc: 'Het gat zit precies waar je knie zit.' },
  vitton: { slot: 'broek', name: 'Nep-Louis Vuitton broek ("Louis Vitton")', col: '#6a4a2a', pat: 'monogram', st: { stoer: 2 }, price: 18, desc: 'Het monogram is LW. Niemand merkt het.' },
  palmbomen: { slot: 'broek', name: 'Korte broek met palmbomen', col: '#2e8a5a', cut: 'kort', st: { def: 1, atk: 1 }, price: 5, desc: 'Vakantiegevoel. In Meedhuizen.' },
  jutezak: { slot: 'broek', name: 'Jutezak (als broek)', col: '#b08a50', st: {}, desc: 'Het bedekt het belangrijkste. Meer niet.' },
  goudbroek: { slot: 'broek', name: 'Gouden trainingsbroek', col: '#e0b030', pat: 'tracksuit', st: { def: 2, atk: 2 }, rare: true, desc: 'Zeldzaam. Glimt als een trofee.' },
  // schoenen
  crocs: { slot: 'schoenen', name: 'Crocs in limoengroen', col: '#9ad040', st: { def: 1 }, price: 6, desc: 'Op sportstand. Natuurlijk.' },
  sokken: { slot: 'schoenen', name: 'Witte sokken in sandalen', col: '#f4f1ea', st: { def: 1 }, price: 5, desc: 'Comfort boven alles.' },
  mike: { slot: 'schoenen', name: 'Nep-Nikes ("Mike")', col: '#e8e8f0', st: { atk: 1, stoer: 1 }, price: 14, desc: 'Het vinkje wijst de verkeerde kant op.' },
  klompen: { slot: 'schoenen', name: 'Klompen', col: '#e8c060', st: { def: 2, atk: 1 }, price: 9, desc: 'Gronings vakmanschap. Hard als steen.' },
  goudcrocs: { slot: 'schoenen', name: 'Gouden Crocs', col: '#ffd25a', st: { def: 2, atk: 1, stoer: 1 }, rare: true, desc: 'Zeldzaam. De heilige graal van de fatbikers.' },
};
for (const id of Object.keys(CLOTHES)) {
  const c = CLOTHES[id];
  ITEMS[id] = { name: c.name, desc: `${SLOT_NAME[c.slot]}. ${statText(c.st)}. ${c.desc}`, price: c.price, slot: c.slot, wear: true };
}
function statText(st) {
  const p = Object.keys(st || {}).filter((k) => st[k]).map((k) => `${st[k] > 0 ? '+' : ''}${st[k]} ${{ def: 'verdediging', atk: 'aanval', stoer: 'Stoerheid' }[k]}`);
  return p.length ? p.join(', ') : 'Geen stats';
}
function wornIds(P) { return SLOTS.map((s) => (P.wear || {})[s]).filter((id) => id && CLOTHES[id]); }
function clothBonus(P) {
  const b = { def: 0, atk: 0, stoer: 0 };
  for (const id of wornIds(P)) for (const k of Object.keys(b)) b[k] += CLOTHES[id].st[k] || 0;
  return b;
}
const stoerNow = (P) => (P.stoer || 0) + clothBonus(P).stoer;

// ---------- uiterlijk ----------
const SKINS = ['#f6d5b8', '#f0c4a0', '#e0a880', '#c88a60', '#8a5a3a', '#5a3a24'];
const HAIRS = [['zwart', '#1b1420'], ['bruin', '#6b4226'], ['blond', '#e0b850'], ['rood', '#b8442a'], ['grijs', '#a8a8b0'], ['roze', '#e86fb0'], ['blauw', '#3a7ac8'], ['groen', '#3a9a5a']];
const STYLES = [['Kort', 'short'], ['Lang', 'long'], ['Krullen', 'curly'], ['Slordig', 'messy'], ['Kaal', 'bald'], ['Knotje', 'bun']];
const BEARDS = [['Geen', ''], ['Snor', 'mustache'], ['Baard', 'beard']];
const FACES = [['Niks', ''], ['Bril', 'glasses'], ['Sproeten', 'freckles'], ['Blosjes', 'blush']];
const SIZES = ['Bescheiden', 'Gemiddeld', 'Royaal', 'Belachelijk'];
const defaultAppearance = () => ({ sk: 1, hs: 3, hc: 1, fh: 0, fc: 0, z: 1 });

// Bouw een look-object voor getChar uit uiterlijk + kleding
function lookFrom(ap, wear) {
  ap = ap || defaultAppearance(); wear = wear || {};
  const n = (v, max, d) => (Number.isInteger(v) && v >= 0 && v < max ? v : d);
  const skin = SKINS[n(ap.sk, SKINS.length, 1)];
  const c = (s) => (wear[s] && CLOTHES[wear[s]] && CLOTHES[wear[s]].slot === s ? CLOTHES[wear[s]] : null);
  const top = c('boven'), pants = c('broek'), shoes = c('schoenen'), hat = c('hoofd');
  const extra = [BEARDS[n(ap.fh, BEARDS.length, 0)][1], FACES[n(ap.fc, FACES.length, 0)][1]].filter(Boolean);
  return {
    skin, hair: HAIRS[n(ap.hc, HAIRS.length, 1)][1], style: STYLES[n(ap.hs, STYLES.length, 3)][1],
    shirt: top ? top.col : skin, pants: pants ? pants.col : skin, extra,
    shoes: shoes ? shoes.col : null, pat: top && top.pat, ppat: pants && pants.pat, cut: pants && pants.cut,
    hat: hat ? { t: hat.t, c: hat.col } : null, naked: pants ? 0 : 1 + n(ap.z, SIZES.length, 1), nakedTop: !top,
  };
}

// ---------- tekenen: kledingdetails over het basispoppetje heen ----------
const _drawBase = drawCharInto;
drawCharInto = function (x, L, dir, frame) {
  _drawBase(x, L, dir, frame);
  if (L.dog || !('naked' in L)) return;
  const lA = frame === 1 ? -1 : 0, lB = frame === 2 ? -1 : 0;
  // voeten / schoenen
  const feet = L.shoes || L.skin;
  px(x, 5, 15 + lA, 2, 1, feet); px(x, 9, 15 + lB, 2, 1, feet);
  if (L.shoes === '#f4f1ea') { px(x, 5, 14 + lA, 2, 1, '#f4f1ea'); px(x, 9, 14 + lB, 2, 1, '#f4f1ea'); }
  if (L.cut === 'kort') { px(x, 5, 14 + lA, 2, 1, L.skin); px(x, 9, 14 + lB, 2, 1, L.skin); }
  if (L.ppat === 'tracksuit') { px(x, 5, 12 + lA, 1, 3, '#f4f1ea'); px(x, 10, 12 + lB, 1, 3, '#f4f1ea'); }
  if (L.ppat === 'monogram') { px(x, 6, 13 + lA, 1, 1, '#e0b030'); px(x, 9, 12 + lB, 1, 1, '#e0b030'); }
  // bovenlijf
  const front = dir === 'down';
  if (L.nakedTop && dir !== 'up') { px(x, 5, 10, 1, 1, shade(L.skin, -25)); px(x, 10, 10, 1, 1, shade(L.skin, -25)); px(x, 7, 12, 2, 1, shade(L.skin, -18)); }
  if (L.pat === 'rendier' && front) { px(x, 6, 10, 4, 2, '#8a5a2a'); px(x, 7, 11, 1, 1, '#ff3a3a'); px(x, 5, 9, 1, 1, '#f4f1ea'); px(x, 10, 9, 1, 1, '#f4f1ea'); }
  if (L.pat === 'logo' && front) { px(x, 7, 10, 2, 2, '#e0b030'); }
  if (L.pat === 'flamingo') { px(x, 5, 10, 1, 2, '#ff8ab0'); px(x, 9, 9, 1, 2, '#ff8ab0'); px(x, 7, 12, 1, 1, '#ff8ab0'); }
  if (L.pat === 'tracksuit') { px(x, 4, 9, 1, 4, '#f4f1ea'); px(x, 11, 9, 1, 4, '#f4f1ea'); }
  if (L.pat === 'jacket' && front) { px(x, 7, 9, 2, 4, '#c8463a'); px(x, 6, 9, 1, 4, shade(L.shirt, 25)); }
  // censuurbalk
  if (L.naked && dir !== 'up') {
    const w = [0, 2, 4, 6, 10][L.naked] || 4;
    const cx = dir === 'left' ? 6 : dir === 'right' ? 10 : 8;
    px(x, Math.round(cx - w / 2), 12, w, 2, '#000');
  }
  // gezichtsdetails
  if (front && (L.extra || []).includes('freckles')) [[5, 6], [6, 5], [10, 6], [9, 5]].forEach(([a, b]) => px(x, a, b, 1, 1, shade(L.skin, -45)));
  // hoofddeksel
  const h = L.hat;
  if (h) {
    const C = h.c, D = shade(C, -35);
    if (h.t === 'muts' || h.t === 'propeller') {
      px(x, 4, 0, 8, 3, C); px(x, 4, 2, 8, 1, D);
      if (h.t === 'muts') px(x, 7, 0, 2, 1, '#f4f1ea');
      else { px(x, 7, 0, 2, 1, '#f2c22e'); px(x, 5, 0, 2, 1, '#c23b2e'); px(x, 9, 0, 2, 1, '#2e7a3a'); }
    } else if (h.t === 'pet') {
      px(x, 4, 0, 8, 3, C);
      if (dir === 'down') px(x, 3, 3, 10, 1, D);
      if (dir === 'left') px(x, 2, 2, 4, 1, D);
      if (dir === 'right') px(x, 10, 2, 4, 1, D);
      if (dir === 'down') px(x, 7, 1, 2, 1, '#c23b2e');
    } else if (h.t === 'hoedje') {
      px(x, 5, 0, 6, 2, C); px(x, 3, 2, 10, 1, D);
      if (C === '#e86fb0') { px(x, 6, 0, 1, 1, '#fff'); px(x, 9, 1, 1, 1, '#fff'); }
    } else if (h.t === 'kegel') {
      px(x, 7, 0, 2, 1, C); px(x, 6, 1, 4, 1, '#f4f1ea'); px(x, 5, 2, 6, 1, C); px(x, 3, 3, 10, 1, shade(C, -30));
    }
  }
};

// ---------- kringloopwinkel ----------
(function () {
  const m = MAPS.dorp;
  building(m, { id: 'kringloop', x: 20, y: 17, w: 4, h: 4, door: 21, label: 'KRINGLOOP', wall: '#7a8a5a', roof: '#3a3a3a', signCol: '#f2c22e' });
  const k = interior('kringloop', 'Kringloopwinkel', 12, 9, 'floor');
  setT(k, 5, 8, 'mat_out');
  k.doors.push({ x: 5, y: 8, id: 'uit_kringloop' });
  rect(k, 8, 3, 1, 3, 'counter');
  [[2, 3], [3, 3], [2, 5], [3, 5], [5, 3]].forEach(([x, y]) => prop(k, x, y, 'rek', true, 'rek'));
  prop(k, 10, 1, 'spiegel', true, 'spiegel');
  prop(k, 1, 7, 'doos', true, 'graaibak');
  MAPS.kringloop = k;
})();
PROP_DRAW.rek = function (x) {
  px(x, 2, 2, 12, 1, '#888'); px(x, 2, 2, 1, 13, '#888'); px(x, 13, 2, 1, 13, '#888');
  const cols = ['#c23b2e', '#3ab0c0', '#c8a02a', '#7a3ac8', '#e86fb0'];
  for (let i = 0; i < 5; i++) px(x, 3 + i * 2, 3, 2, 7 + (i % 2) * 2, cols[i]);
};
PROP_DRAW.spiegel = function (x) { px(x, 4, 1, 8, 13, '#6e4a2c'); px(x, 5, 2, 6, 11, '#a8d0e8'); px(x, 6, 3, 1, 4, '#f4f1ea'); };
PROP_DRAW.doos = function (x) { px(x, 2, 6, 12, 9, '#a8784a'); px(x, 2, 6, 12, 2, '#c8985a'); px(x, 4, 4, 3, 3, '#c86a9a'); px(x, 8, 3, 4, 4, '#3ab0c0'); };

DOORS.kringloop = () => G.warp('kringloop', 5, 7, 'up');
DOORS.uit_kringloop = () => G.warp('dorp', 21, 21, 'down');

NPCS.push({
  id: 'kringloop', map: 'kringloop', x: 9, y: 4, dir: 'left',
  look: { skin: '#e8b898', hair: '#a8a8b0', style: 'bun', shirt: '#6a8a4a', pants: '#3a3a3a', extra: ['glasses', 'apron'] },
  async talk() {
    const f = F();
    if (!f.metKringloop) {
      f.metKringloop = true;
      await say('Kringloopmedewerker', 'Welkom in de kringloop! Alles is tweedehands, alles is uniek, en alles is…');
      await say('Kringloopmedewerker', '…nou ja. Lelijk. Of nep. Maar wel goedkoop!');
      if (!wornIds(G.P).length) await say('Kringloopmedewerker', 'En zo te zien kun je wel wat gebruiken. Alles eigenlijk.');
    }
    const ids = Object.keys(CLOTHES).filter((id) => CLOTHES[id].price);
    for (;;) {
      const list = ids.map((id) => ({ label: CLOTHES[id].name, right: `EUR ${CLOTHES[id].price}`, off: G.P.money < CLOTHES[id].price }));
      list.push('Klaar');
      const k = await G.ask('Kringloopmedewerker', `Wat mag het zijn? Je hebt EUR ${G.P.money}.`, list, true);
      if (k < 0 || k === ids.length) { await say('Kringloopmedewerker', 'Tot ziens! Ruilen kan niet, hè. Terugbrengen ook niet.'); return; }
      const id = ids[k];
      G.P.money -= CLOTHES[id].price;
      G.give(id, 1, true); SFX.item();
      const w = await G.ask('', `${CLOTHES[id].name} gekocht (${statText(CLOTHES[id].st)}). Meteen aantrekken?`, ['Aantrekken', 'In je tas']);
      if (w === 0) wearItem(id);
    }
  },
});

Object.assign(PROPS, {
  rek: () => me(pick(['Een rek vol truien met rendieren. Het zijn er minstens veertig.', 'Een rek met nep-designerkleding. "Guci", "Prado", "Louis Vitton".', 'Je voelt aan een blouse. Hij voelt aan als een gordijn. Het is een gordijn.'])),
  spiegel: async () => {
    const n = wornIds(G.P).length;
    await me(n === 0 ? 'Je kijkt in de spiegel. Je bent helemaal naakt. Er zit een zwart balkje op je. Dat is wel zo netjes.' : n < 4 ? 'Je kijkt in de spiegel. Het is een begin.' : 'Je kijkt in de spiegel. Lelijk, maar compleet. Je bent er klaar voor.');
  },
  graaibak: async () => {
    if (!F().graaibak) { F().graaibak = true; await me('Je graait in de graaibak. Onderin: witte sokken in sandalen. Gratis, staat erbij.'); G.give('sokken'); return; }
    await me('De graaibak is leeg. Op een losse knoop na.');
  },
});

// ---------- vondsten ----------
MAPS.oost.props.push({ x: 30, y: 12, name: 'kegelprop', solid: true, id: 'w_kegel' });
PROP_DRAW.kegelprop = function (x) { px(x, 7, 3, 2, 2, '#ff7a2a'); px(x, 6, 5, 4, 2, '#f4f1ea'); px(x, 5, 7, 6, 4, '#ff7a2a'); px(x, 3, 11, 10, 3, '#3a3a3a'); };
PROP_HIDE.w_kegel = () => F().kegel;
PROPS.w_kegel = async () => { F().kegel = true; await me('Een verkeerskegel. Je zet hem op je hoofd. Hij past. Dat is het ergste eraan.'); G.give('kegel'); };
// de jutezak ligt in de schuur, de vuilniszak in de tweede container
MAPS.schuur.props.push({ x: 9, y: 5, name: 'jute', solid: true, id: 'w_jute' });
PROP_DRAW.jute = function (x) { px(x, 3, 4, 10, 10, '#b08a50'); px(x, 3, 4, 10, 2, '#8a6a3a'); px(x, 5, 8, 6, 1, '#8a6a3a'); };
PROP_HIDE.w_jute = () => F().jute;
PROPS.w_jute = async () => { F().jute = true; await me('Een lege jutezak. Als je er twee gaten in maakt, is het bijna een broek.'); G.give('jutezak'); if (!G.P.wear.broek) { const k = await G.ask('', 'Aantrekken?', ['Ja, graag', 'Nee']); if (k === 0) wearItem('jutezak'); } };
(function () {
  const c = MAPS.oost.props.find((p) => p.id === 'container');
  if (c) c.id = 'w_zak';
})();
PROPS.w_zak = async () => {
  if (F().vuilniszak) { await me('Een container. Hij ruikt naar gisteren.'); return; }
  F().vuilniszak = true;
  await me('Bovenop de container ligt een lege vuilniszak. Met drie gaten erin is het eigenlijk een shirt.');
  G.give('vuilniszak');
};

// ---------- zeldzame buit van vapers (heel kleine kans) ----------
const RARE_DROP = { vaper_tiktok: 'glitterhoed', vaper_scooter: 'leerjack', vaper_training: 'goudbroek', vaper_fatbike: 'goudcrocs', vaper_beugel: 'propellerpet' };
async function rareDrop(B, f) {
  const id = RARE_DROP[f.id];
  if (!id || Math.random() > (f.rareChance || 0.03)) return;
  await B.log(`Wacht… ${f.name} laat iets heel zeldzaams vallen: ${CLOTHES[id].name}!`);
  G.give(id, 1, true); SFX.item();
}

// ---------- aan- en uittrekken ----------
function wearItem(id) {
  const c = CLOTHES[id];
  if (!c || !(G.P.items[id] > 0)) return;
  G.P.wear = G.P.wear || {};
  G.P.wear[c.slot] = id;
  UI.toast(`Aan: ${c.name}`);
}
async function clothesMenu() {
  const P = G.P, panel = $('#panel');
  P.wear = P.wear || {};
  for (;;) {
    const b = clothBonus(P);
    panel.innerHTML = `<h3>Kleding</h3><div id="clist" class="list"></div><p id="cdesc" class="lbl"></p><p class="lbl">Totaal: ${statText(b)}</p>`;
    panel.hidden = false;
    const opts = SLOTS.map((s) => ({ label: `${SLOT_NAME[s]}: ${P.wear[s] ? CLOTHES[P.wear[s]].name : 'niks'}` }));
    const k = await UI.list('#clist', opts, { cancel: true, keep: true, onMove: (i) => { const id = P.wear[SLOTS[i]]; $('#cdesc').textContent = id ? ITEMS[id].desc : (SLOTS[i] === 'broek' ? 'Niks. Alleen een zwart balkje.' : 'Niks.'); } });
    if (k < 0) break;
    const slot = SLOTS[k];
    const own = Object.keys(P.items).filter((id) => P.items[id] > 0 && CLOTHES[id] && CLOTHES[id].slot === slot);
    const list = own.map((id) => ({ label: (P.wear[slot] === id ? '✓ ' : '') + CLOTHES[id].name, right: P.items[id] > 1 ? '×' + P.items[id] : '' })).concat(['Uittrekken']);
    panel.innerHTML = `<h3>${SLOT_NAME[slot]}</h3><div id="clist" class="list"></div><p id="cdesc" class="lbl"></p>`;
    const j = await UI.list('#clist', list, { cancel: true, keep: true, onMove: (i) => { $('#cdesc').textContent = own[i] ? ITEMS[own[i]].desc : 'Uit ermee.'; } });
    if (j < 0) continue;
    if (j === own.length) { P.wear[slot] = null; UI.toast(slot === 'broek' ? 'Broek uit. Het balkje is terug.' : `${SLOT_NAME[slot]}: uit`); }
    else wearItem(own[j]);
  }
  panel.hidden = true;
}

// ---------- personage maken ----------
function creator(ap) {
  ap = { ...defaultAppearance(), ...(ap || {}) };
  const el = $('#creator');
  el.hidden = false;
  const rows = [
    ['Huidskleur', 'sk', SKINS.map((c, i) => `Tint ${i + 1}`)],
    ['Haarstijl', 'hs', STYLES.map((s) => s[0])],
    ['Haarkleur', 'hc', HAIRS.map((h) => h[0])],
    ['Gezichtsbeharing', 'fh', BEARDS.map((b) => b[0])],
    ['Gezicht', 'fc', FACES.map((f) => f[0])],
    ['Formaat', 'z', SIZES],
  ];
  el.innerHTML = `<h3>Hoe zie je eruit?</h3><div class="cwrap"><canvas width="16" height="16"></canvas><div class="crows">${rows.map((r, i) => `<div class="crow" data-i="${i}"><span class="lbl">${r[0]}</span><button type="button" data-d="-1">◀</button><b></b><button type="button" data-d="1">▶</button></div>`).join('')}<div class="crow done" data-i="${rows.length}"><button type="button" class="ok">Klaar</button></div></div></div><p class="lbl">Je begint naakt. Kleding vind, koop of ruil je in het dorp. Het formaat bepaalt alleen hoe groot de censuurbalk is.</p>`;
  const cv = el.querySelector('canvas'), cx = cv.getContext('2d');
  let sel = 0, dirI = 0, t0 = performance.now(), raf;
  const dirs = ['down', 'right', 'up', 'left'];
  const paint = () => {
    el.querySelectorAll('.crow').forEach((r, i) => { r.classList.toggle('sel', i === sel); if (rows[i]) r.querySelector('b').textContent = rows[i][2][ap[rows[i][1]]]; });
  };
  if (window.CreatorPreview) cv.width = cv.height = 160;
  const draw = (now) => {
    dirI = Math.floor((now - t0) / 1100) % 4;
    if (window.CreatorPreview) CreatorPreview(cv, lookFrom(ap, {}), (now - t0) / 1000);
    else { cx.clearRect(0, 0, 16, 16); cx.drawImage(getChar(lookFrom(ap, {}), dirs[dirI], 0), 0, 0); }
    raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);
  const change = (i, d) => { const r = rows[i]; if (!r) return; ap[r[1]] = (ap[r[1]] + d + r[2].length) % r[2].length; SFX.tick(); paint(); };
  paint();
  return new Promise((resolve) => {
    const done = () => { cancelAnimationFrame(raf); el.hidden = true; UI.focus = null; SFX.ok(); resolve(ap); };
    el.onclick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const row = +b.closest('.crow').dataset.i; sel = row;
      if (b.classList.contains('ok')) return done();
      change(row, +b.dataset.d);
    };
    UI.focus = (k) => {
      if (k === 'up') { sel = (sel + rows.length) % (rows.length + 1); SFX.tick(); paint(); }
      else if (k === 'down') { sel = (sel + 1) % (rows.length + 1); SFX.tick(); paint(); }
      else if (k === 'left') change(sel, -1);
      else if (k === 'right') change(sel, 1);
      else if (k === 'ok') { if (sel === rows.length) done(); else change(sel, 1); }
    };
  });
}
