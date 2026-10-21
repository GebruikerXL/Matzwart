// Casino Gokpaleis in de A-framestraat: gokkast, roulette, hoger-lager en Aron van der Wal met zijn "investeringsadviezen".

// ---------- gebouw en tegels ----------
BUILD_KIND.casino = function (b) {
  const W = b.w * TS, H = b.h * TS, [c, x] = mk(W, H);
  px(x, 0, 0, W, H, '#1b1420');
  px(x, 1, 1, W - 2, H - 3, '#3a1f4a');
  for (let i = 4; i < W - 4; i += 8) px(x, i, 26, 1, H - 30, '#2e1a3c');
  // marquee met lampjes
  px(x, 2, 4, W - 4, 18, '#f2c22e'); px(x, 4, 6, W - 8, 14, '#7a1a1a');
  for (let i = 3; i < W - 3; i += 4) { px(x, i, 3, 2, 2, i % 8 ? '#fff6c0' : '#ff8a3a'); px(x, i, 21, 2, 2, i % 8 ? '#ff8a3a' : '#fff6c0'); }
  x.font = '8px Silkscreen, monospace'; x.textBaseline = 'top'; x.fillStyle = '#ffd25a';
  const tw = x.measureText(b.label).width; x.fillText(b.label, Math.round((W - tw) / 2), 9);
  // ramen met paarse gloed
  for (const wx of [8, W - 28]) { px(x, wx, 32, 20, 20, '#f2c22e'); px(x, wx + 1, 33, 18, 18, '#b04ad0'); px(x, wx + 4, 38, 4, 4, '#ffd25a'); px(x, wx + 11, 42, 4, 4, '#ff6a6a'); }
  const dx = (b.door - b.x) * TS;
  px(x, dx, H - 26, 16, 24, '#f2c22e'); px(x, dx + 1, H - 25, 14, 23, '#2a0f30'); px(x, dx + 3, H - 23, 10, 10, '#d070f0');
  px(x, 0, H - 2, W, 2, '#3a2a24');
  return c;
};
TILE_DEF.tapijt = { walk: true };
TILE_DRAW.tapijt = function (x, gx, gy) {
  px(x, 0, 0, 16, 16, '#6a1a2a');
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const cx = 4 + i * 8, cy = 4 + j * 8; px(x, cx, cy - 2, 1, 5, '#a8862a'); px(x, cx - 2, cy, 5, 1, '#a8862a'); }
  px(x, 0, 0, 16, 1, '#5a1222');
};
Object.assign(PROP_DRAW, {
  gokkast(x) {
    px(x, 2, 0, 12, 16, '#1b1420'); px(x, 3, 1, 10, 14, '#c23b2e'); px(x, 3, 1, 10, 2, '#f2c22e');
    px(x, 4, 4, 8, 5, '#f4f1ea'); px(x, 5, 5, 2, 3, '#c23b2e'); px(x, 7, 5, 2, 3, '#f2c22e'); px(x, 9, 5, 2, 3, '#c23b2e');
    px(x, 4, 11, 8, 2, '#3a1f1a'); px(x, 14, 3, 1, 6, '#888'); px(x, 13, 2, 3, 2, '#e8433a');
  },
  roulL(x) {
    px(x, 0, 3, 16, 11, '#1b1420'); px(x, 1, 4, 15, 9, '#1f6a3a');
    px(x, 3, 4, 10, 9, '#5a3720'); px(x, 4, 5, 8, 7, '#1b1420');
    for (let i = 0; i < 4; i++) px(x, 5 + i * 2, 6 + (i % 2) * 4, 1, 1, i % 2 ? '#f4f1ea' : '#c23b2e');
    px(x, 7, 7, 2, 2, '#f2c22e');
  },
  roulR(x) {
    px(x, 0, 3, 16, 11, '#1b1420'); px(x, 0, 4, 15, 9, '#1f6a3a');
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) px(x, 1 + c * 3, 5 + r * 3, 2, 2, (r + c) % 2 ? '#c23b2e' : '#1b1420');
  },
  kaarttafel(x) {
    px(x, 1, 3, 14, 11, '#1b1420'); px(x, 2, 4, 12, 9, '#1f6a3a');
    px(x, 4, 6, 4, 5, '#f4f1ea'); px(x, 5, 7, 1, 1, '#c23b2e'); px(x, 9, 5, 4, 5, '#3a6aa6'); px(x, 10, 6, 2, 3, '#2a4a7a');
  },
  jackpot(x) { px(x, 1, 2, 14, 8, '#1b1420'); px(x, 2, 3, 12, 6, '#7a1a1a'); for (let i = 0; i < 5; i++) px(x, 3 + i * 2, 5, 1, 2, '#ffd25a'); },
});

// ---------- kaarten ----------
(function () {
  const m = MAPS.oost;
  rect(m, 22, 13, 1, 7, 'asfalt');
  rect(m, 22, 19, 10, 1, 'asfalt');
  building(m, { id: 'casino', x: 24, y: 14, w: 8, h: 5, door: 27, kind: 'casino', label: 'GOKPALEIS' });

  const c = interior('casino', 'Gokpaleis', 14, 10, 'tapijt');
  setT(c, 6, 9, 'mat_out');
  c.doors.push({ x: 6, y: 9, id: 'uit_casino' });
  [2, 3, 4].forEach((x) => prop(c, x, 2, 'gokkast', true, 'gokkast'));
  prop(c, 9, 4, 'roulL', true, 'roulette'); prop(c, 10, 4, 'roulR', true, 'roulette');
  prop(c, 9, 7, 'kaarttafel', true, 'hogerlager');
  prop(c, 8, 1, 'jackpot', true, 'jackpotbord');
  prop(c, 12, 8, 'biervat', true);
  MAPS.casino = c;
})();

DOORS.casino = () => G.warp('casino', 6, 8, 'up');
DOORS.uit_casino = () => G.warp('oost', 27, 19, 'down');

// ---------- scherm voor de spelletjes ----------
const Casino = {
  open(title) {
    const el = $('#casino');
    el.hidden = false;
    el.innerHTML = `<h3>${title}</h3><div class="stage"></div><div class="msg"></div>`;
    return el.querySelector('.stage');
  },
  msg(t) { $('#casino .msg').textContent = t; },
  close() { $('#casino').hidden = true; },
  async bet(who) {
    const opts = [1, 5, 10, 25].map((b) => ({ label: `EUR ${b}`, off: G.P.money < b }));
    opts.push('Stoppen');
    const k = await UI.ask(who, `Hoeveel zet je in? Je hebt EUR ${G.P.money}.`, opts, true);
    return k < 0 || k === 4 ? 0 : [1, 5, 10, 25][k];
  },
  win(b, mult, text) {
    const n = b * mult;
    G.P.money += n; SFX.win();
    this.msg(`${text} Je wint EUR ${n}!`);
  },
  lose(b, text) { SFX.no(); this.msg(`${text} EUR ${b} kwijt.`); },
  // Aron-tip: true = je volgt hem (verlies), false = je doet het omgekeerde (winst), null = tip niet van toepassing
  tip(followIds, oppositeIds) {
    const t = F().aronTip;
    if (!t) return null;
    if (followIds.includes(t)) { F().aronTip = null; F().aronGevolgd = (F().aronGevolgd || 0) + 1; return true; }
    if (oppositeIds.includes(t)) { F().aronTip = null; F().aronOmgekeerd = (F().aronOmgekeerd || 0) + 1; return false; }
    return null;
  },
};

// ---------- gokkast ----------
const SLOT = [
  { id: 'kers', w: 34, pay: 3 }, { id: 'tomaat', w: 22, pay: 8 }, { id: 'frikandel', w: 16, pay: 15 },
  { id: 'bel', w: 13, pay: 25 }, { id: 'bar', w: 10, pay: 40 }, { id: 'zeven', w: 5, pay: 100 },
];
const SLOT_ICON = {
  kers(x) { px(x, 7, 2, 1, 5, '#2e7a3a'); px(x, 8, 2, 4, 1, '#2e7a3a'); px(x, 3, 7, 5, 5, '#c23b2e'); px(x, 9, 8, 5, 5, '#c23b2e'); px(x, 4, 8, 1, 1, '#ff9a8a'); px(x, 10, 9, 1, 1, '#ff9a8a'); },
  tomaat(x) { px(x, 3, 5, 10, 9, '#e8433a'); px(x, 4, 4, 8, 11, '#e8433a'); px(x, 6, 3, 4, 2, '#2e7a3a'); px(x, 5, 6, 2, 2, '#ff9a8a'); },
  frikandel(x) { for (let i = 0; i < 10; i++) px(x, 2 + i, 11 - i, 3, 3, '#8a4a2a'); px(x, 5, 7, 6, 1, '#f2c22e'); },
  bel(x) { px(x, 5, 3, 6, 2, '#f2c22e'); px(x, 4, 5, 8, 6, '#f2c22e'); px(x, 3, 11, 10, 2, '#d8a01e'); px(x, 7, 13, 2, 2, '#a87010'); px(x, 6, 5, 1, 4, '#fff6c0'); },
  bar(x) { px(x, 1, 5, 14, 7, '#1b1420'); px(x, 2, 6, 12, 5, '#f4f1ea'); x.font = '8px Silkscreen, monospace'; x.textBaseline = 'top'; x.fillStyle = '#1b1420'; x.fillText('BAR', 2, 5); },
  zeven(x) { px(x, 3, 2, 10, 3, '#c23b2e'); px(x, 10, 5, 3, 3, '#c23b2e'); px(x, 8, 8, 3, 3, '#c23b2e'); px(x, 6, 11, 3, 3, '#c23b2e'); px(x, 3, 2, 10, 1, '#ff6a5a'); },
};
function slotPick() {
  let r = Math.random() * 100;
  for (const s of SLOT) { if ((r -= s.w) < 0) return s.id; }
  return 'kers';
}
function drawSlot(cv, id) {
  const x = cv.getContext('2d');
  x.imageSmoothingEnabled = false;
  x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, 16, 16);
  SLOT_ICON[id](x);
}

async function playSlot() {
  for (;;) {
    const b = await Casino.bet('Gokkast');
    if (!b) break;
    G.P.money -= b;
    const stage = Casino.open('Gokkast');
    stage.innerHTML = '<div class="reels"><canvas width="16" height="16"></canvas><canvas width="16" height="16"></canvas><canvas width="16" height="16"></canvas></div>';
    const cvs = [...stage.querySelectorAll('canvas')];
    const t = Casino.tip(['kast'], []);
    let res = [slotPick(), slotPick(), slotPick()];
    if (t === true) res = ['zeven', 'zeven', 'kers'];
    Casino.msg('Rrrrrrr…');
    await new Promise((done) => {
      let n = 0;
      const iv = setInterval(() => {
        n += 1;
        cvs.forEach((cv, i) => { if (n < 12 + i * 6) drawSlot(cv, SLOT[Math.floor(Math.random() * SLOT.length)].id); else drawSlot(cv, res[i]); });
        if (n % 2) SFX.tick();
        if (n >= 26) { clearInterval(iv); done(); }
      }, 60);
    });
    const [a, c2, d] = res;
    if (a === c2 && c2 === d) Casino.win(b, SLOT.find((s) => s.id === a).pay, a === 'zeven' ? 'JACKPOT! Drie zevens!' : 'Drie op een rij!');
    else if (res.filter((s) => s === 'kers').length === 2) Casino.win(b, 2, 'Twee kersen.');
    else if (t === true) { Casino.lose(b, 'Twee zevens… en een kers. Net niet. Precies zoals Aron voorspelde. Andersom.'); F().aronVerlies = (F().aronVerlies || 0) + b; }
    else Casino.lose(b, 'Niks.');
  }
  Casino.close();
}

// ---------- roulette ----------
const RED = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const kleur = (n) => (n === 0 ? 'groen' : RED.includes(n) ? 'rood' : 'zwart');

async function playRoulette() {
  for (;;) {
    const b = await Casino.bet('Croupier');
    if (!b) break;
    const opts = ['Rood', 'Zwart', 'Even', 'Oneven', 'Getal 7', 'Getal 17', 'Getal 0'];
    const k = await UI.ask('Croupier', 'Waar zet je op in?', opts, true);
    if (k < 0) continue;
    G.P.money -= b;
    const keuze = ['rood', 'zwart', 'even', 'oneven', 7, 17, 0][k];
    const fits = (n) => (keuze === 'rood' ? kleur(n) === 'rood' : keuze === 'zwart' ? kleur(n) === 'zwart' : keuze === 'even' ? n > 0 && n % 2 === 0 : keuze === 'oneven' ? n % 2 === 1 : n === keuze);
    const tegen = { rood: 'zwart', zwart: 'rood', even: 'oneven', oneven: 'even' }[keuze];
    const t = typeof keuze === 'string' ? Casino.tip([keuze], [tegen]) : null;
    let n = Math.floor(Math.random() * 37);
    if (t === true) { const pool = []; for (let i = 0; i <= 36; i++) if (!fits(i)) pool.push(i); n = pool[Math.floor(Math.random() * pool.length)]; }
    if (t === false) { const pool = []; for (let i = 1; i <= 36; i++) if (fits(i)) pool.push(i); n = pool[Math.floor(Math.random() * pool.length)]; }
    const stage = Casino.open('Roulette');
    stage.innerHTML = '<div class="wheel"><span></span></div>';
    const span = stage.querySelector('span'), wheel = stage.querySelector('.wheel');
    Casino.msg(`Inzet: EUR ${b} op ${opts[k].toLowerCase()}. Rien ne va plus…`);
    await new Promise((done) => {
      let i = 0, delay = 40;
      const step = () => {
        i += 1;
        const v = i < 22 ? Math.floor(Math.random() * 37) : n;
        span.textContent = v; wheel.dataset.k = kleur(v); SFX.tick();
        if (i >= 22) return done();
        delay *= 1.12; setTimeout(step, delay);
      };
      step();
    });
    const label = `${n} ${kleur(n)}.`;
    if (fits(n)) {
      Casino.win(b, typeof keuze === 'number' ? 36 : 2, t === false ? `${label} Je deed precies het omgekeerde van wat Aron zei.` : label);
    } else {
      Casino.lose(b, t === true ? `${label} Je volgde het advies van Aron.` : label);
      if (t === true) F().aronVerlies = (F().aronVerlies || 0) + b;
    }
  }
  Casino.close();
}

// ---------- hoger-lager ----------
const KAART = ['', '', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'V', 'H', 'A'];
const SUITS = [['♥', '#c23b2e'], ['♦', '#c23b2e'], ['♠', '#1b1420'], ['♣', '#1b1420']];
function cardHtml(v) { const s = SUITS[Math.floor(Math.random() * 4)]; return `<div class="card" style="color:${s[1]}">${KAART[v]}<small>${s[0]}</small></div>`; }

async function playHogerLager() {
  for (;;) {
    let b = await Casino.bet('Dealer');
    if (!b) break;
    G.P.money -= b;
    let cur = 2 + Math.floor(Math.random() * 13);
    const stage = Casino.open('Hoger of lager');
    stage.innerHTML = `<div class="cards">${cardHtml(cur)}</div>`;
    let pot = b;
    for (;;) {
      Casino.msg(`Pot: EUR ${pot}. Is de volgende kaart hoger of lager?`);
      const k = await UI.ask('Dealer', 'Hoger of lager?', ['Hoger', 'Lager']);
      const g = k === 0 ? 'hoger' : 'lager';
      const t = Casino.tip([g], [g === 'hoger' ? 'lager' : 'hoger']);
      let next = 2 + Math.floor(Math.random() * 13);
      const goed = (v) => (g === 'hoger' ? v > cur : v < cur);
      if (t === true) { const pool = []; for (let v = 2; v <= 14; v++) if (!goed(v)) pool.push(v); next = pool[Math.floor(Math.random() * pool.length)]; }
      if (t === false) { const pool = []; for (let v = 2; v <= 14; v++) if (goed(v)) pool.push(v); if (pool.length) next = pool[Math.floor(Math.random() * pool.length)]; }
      stage.querySelector('.cards').insertAdjacentHTML('beforeend', cardHtml(next));
      SFX.tick();
      if (!goed(next)) {
        Casino.lose(pot, t === true ? 'Mis. Precies zoals Aron het je aanraadde.' : next === cur ? 'Gelijk is ook mis.' : 'Mis.');
        if (t === true) F().aronVerlies = (F().aronVerlies || 0) + pot;
        break;
      }
      cur = next; pot *= 2; SFX.ok();
      Casino.msg(`Goed! De pot is nu EUR ${pot}.${t === false ? ' (Het omgekeerde van Arons advies.)' : ''}`);
      const d = await UI.ask('Dealer', `Goed! Pot: EUR ${pot}. Dubbel of niks?`, ['Dubbel of niks', `Stoppen (EUR ${pot} pakken)`]);
      if (d !== 0) { G.P.money += pot; SFX.win(); Casino.msg(`Je pakt EUR ${pot}.`); break; }
      if (stage.querySelectorAll('.card').length > 3) stage.querySelector('.card').remove();
    }
  }
  Casino.close();
}

// ---------- Aron van der Wal ----------
const ARON_TIPS = [
  { id: 'rood', t: 'Roulette. Rood. Alles op rood. Rood is de kleur van groei, dat zie je aan elke grafiek.' },
  { id: 'zwart', t: 'Zwart. Zwart is stabiel. Zwart is volwassen. Zet in op zwart.' },
  { id: 'even', t: 'Even getallen, man. Die zijn gewoon betrouwbaarder. Wiskundig bewezen, heb ik gelezen.' },
  { id: 'oneven', t: 'Oneven. Daar zit de alpha. Niemand kijkt naar oneven.' },
  { id: 'hoger', t: 'Hoger-lager? Altijd hoger. De markt gaat op de lange termijn altijd omhoog.' },
  { id: 'lager', t: 'Lager. Contrair beleggen. Iedereen zegt hoger, dus jij zegt lager. Zo doen de grote jongens het.' },
  { id: 'kast', t: 'Die gokkast staat op knappen. Ik voel het aan alles. Die valt de volgende draai.' },
];
const ARON_INVEST = [
  { id: 'coin', bedrag: 10, t: 'MeedhuizenCoin. Een cryptomunt, gedekt door… vertrouwen. Ik zit er zelf ook vol in.', na: 'MeedhuizenCoin is even gecorrigeerd. Met honderd procent. Tijdelijk, hoor.' },
  { id: 'bmw', bedrag: 5, t: 'Losse motorblokken. Daar is een gigantische markt voor. Thijs zit al in die sector, als het ware.', na: 'De motorblokkenmarkt is ingestort. Er was er maar één, en die zit weer in een BMW.' },
  { id: 'tomaat', bedrag: 5, t: 'Tomaten-futures. Ik heb een bron bij de zwemsteiger. Ze zegt niet veel, maar ze kweekt fantastisch.', na: 'De tomaten zijn opgegeten. Door de bron zelf.' },
  { id: 'frik', bedrag: 8, t: 'Een frikandel-ETF. Een mandje van 24 frikandellen. Gespreid risico. Kan niks misgaan.', na: 'Iemand heeft het mandje leeggegeten. Vannacht. Jij misschien?' },
];

NPCS.push(
  {
    id: 'aron', map: 'casino', x: 5, y: 2, dir: 'down',
    look: { skin: '#f0c4a0', hair: '#4a3020', style: 'short', shirt: '#2a2e4a', pants: '#2a2e4a', extra: ['glasses'] },
    async talk() {
      const f = F(), N = 'Aron van der Wal';
      if (!f.metAron) {
        f.metAron = true;
        await say(N, 'Hé. Aron van der Wal. Investeringsadviseur. Nou ja, ik adviseer. Investeren mag je zelf.');
        await say(N, 'Jij ziet eruit als iemand die wel wat rendement kan gebruiken. Ik heb tips. Goede tips.');
      }
      if (f.aronPending) {
        const inv = ARON_INVEST.find((i) => i.id === f.aronPending);
        f.aronPending = null;
        await say(N, inv.na);
        await say(N, 'Maar goed. Wie niet waagt, die niet wint. Ik heb alweer iets nieuws.');
      }
      if (f.aronTip) {
        await say(N, 'Heb je mijn vorige tip al gebruikt? Niet twijfelen. Twijfel kost geld.');
        return;
      }
      const vorige = f.aronLaatste;
      if (Math.random() < 0.4) {
        const opts = ARON_INVEST.filter((i) => i.id !== vorige);
        const inv = opts[Math.floor(Math.random() * opts.length)];
        f.aronLaatste = inv.id;
        await say(N, inv.t);
        const k = await ask(N, `Ik heb nog een plekje vrij. EUR ${inv.bedrag}. Doe je mee?`, [{ label: `Ik doe mee (EUR ${inv.bedrag})`, off: G.P.money < inv.bedrag }, 'Nee, dank je']);
        if (k === 0) {
          G.P.money -= inv.bedrag; SFX.no();
          f.aronVerlies = (f.aronVerlies || 0) + inv.bedrag;
          f.aronPending = inv.id;
          await say(N, 'Top. Je hoort van me. Je geld is in goede handen. Mijn handen.');
        } else await say(N, 'Jouw verlies. Of nou ja, jouw gemiste winst.');
        return;
      }
      const opts = ARON_TIPS.filter((t) => t.id !== vorige);
      const tip = opts[Math.floor(Math.random() * opts.length)];
      f.aronLaatste = tip.id;
      f.aronTip = tip.id;
      await say(N, tip.t);
      await say(N, 'Die tip is gratis. De volgende niet. Grapje. Ook gratis.');
    },
  },
  {
    id: 'croupier', map: 'casino', x: 10, y: 3, dir: 'down',
    look: { skin: '#e8b898', hair: '#1b1420', style: 'long', shirt: '#7a1a1a', pants: '#1b1420', extra: [] },
    talk: () => PROPS.roulette(),
  },
  {
    id: 'dealer', map: 'casino', x: 10, y: 7, dir: 'left',
    look: { skin: '#d8a880', hair: '#e0e0e0', style: 'short', shirt: '#f4f1ea', pants: '#1b1420', extra: ['mustache'] },
    talk: () => PROPS.hogerlager(),
  },
  {
    id: 'gokker', map: 'casino', x: 4, y: 6, dir: 'up', wander: true,
    look: { skin: '#e0b090', hair: '#888', style: 'cap', cap: '#2a6aa6', shirt: '#6a8a5a', pants: '#3a3a3a', extra: [] },
    async talk() {
      const f = F();
      await say('Vaste gast', pick([
        'Aron? Doe gewoon het tegenovergestelde van wat hij zegt. Dat doet het hele dorp.',
        'Ik heb ooit één tip van Aron opgevolgd. Ik fiets nu.',
        f.aronVerlies ? `Hoeveel ben je al kwijt aan Aron? EUR ${f.aronVerlies}? Dat valt nog mee.` : 'Die gokkast valt nooit. Behalve als je niet kijkt.',
      ]));
    },
  },
);

Object.assign(PROPS, {
  gokkast: async () => { await playSlot(); },
  roulette: async () => { await playRoulette(); },
  hogerlager: async () => { await playHogerLager(); },
  jackpotbord: () => me(`JACKPOT: drie zevens = 100× je inzet. Daaronder in kleine letters: "Gokken kost geld."${F().aronVerlies ? ` Iemand heeft er met pen bijgeschreven: "Aron-verlies: EUR ${F().aronVerlies}".` : ''}`),
});
