// Turn-based gevechten. Naast vechten kun je "Praten": vul de Rust-meter tot 100 en de tegenstander laat je gaan.
const SKILLS = [
  { id: 'kopstoot', name: 'Kopstoot', ep: 4, lvl: 1, desc: 'Hard, maar je hoofd bonkt al.' },
  { id: 'adem', name: 'Brakke adem', ep: 3, lvl: 1, desc: 'Vijand doet 3 beurten minder schade.' },
  { id: 'powernap', name: 'Powernap', ep: 5, lvl: 2, desc: 'Herstel 40% van je HP.' },
  { id: 'dans', name: 'Dansmoves van gisteren', ep: 6, lvl: 3, desc: '3 wilde klappen.' },
];

const ITEMS = {
  frikandelbroodje: { name: 'Frikandelbroodje', desc: '+30 HP', price: 3, use: (p) => heal(p, 30, 0) },
  koffie: { name: 'Bakkie koffie', desc: '+12 EP', price: 2, use: (p) => heal(p, 0, 12) },
  paracetamol: { name: 'Paracetamol', desc: '+70 HP', price: 6, use: (p) => heal(p, 70, 0) },
  energiedrank: { name: 'Energiedrankje', desc: '+25 HP, +25 EP', price: 5, use: (p) => heal(p, 25, 25) },
  // sleutelvoorwerpen
  koffie_boer: { name: 'Koffie voor Jansen', desc: 'Zwart, drie klontjes.', key: true },
  hark: { name: 'Hark', desc: 'Van boer Jansen. Lang genoeg voor de sloot.', key: true },
  kabouter: { name: 'Tuinkabouter Gerrit', desc: 'Kijkt je verwijtend aan.', key: true },
  fiets: { name: 'Fiets', desc: 'Nat. Groen. Waarschijnlijk van jou.', key: true },
  telefoon: { name: 'Telefoon', desc: 'Leeg. Volledig leeg.', key: true },
  oplader: { name: 'Oplader', desc: 'Van mevrouw Bakker. Past precies.', key: true },
  sleutel: { name: 'Sleutel met hanger "J…"', desc: 'De rest van de letters is eraf gesleten.', key: true },
};
function heal(p, hp, ep) {
  const h = Math.min(p.maxHp - p.hp, hp), e = Math.min(p.maxEp - p.ep, ep);
  p.hp += h; p.ep += e;
  return [h && `+${h} HP`, e && `+${e} EP`].filter(Boolean).join(', ') || 'Geen effect.';
}

// look-presets voor dorpstypes
const LOOKS = {
  jogger: { skin: '#f0c9a0', hair: '#d8b25a', style: 'short', shirt: '#2ab0c0', pants: '#1b1b2a', extra: [] },
  buurvrouw: { skin: '#eac0a0', hair: '#c8c8d0', style: 'curly', shirt: '#b04a8a', pants: '#3a3a5a', extra: ['glasses'] },
  scooter: { skin: '#d8a880', hair: '#222', style: 'cap', cap: '#111', shirt: '#2a2a2a', pants: '#4a4a6a', extra: [] },
  enquete: { skin: '#f0c9a0', hair: '#7a4a2a', style: 'long', shirt: '#e8e2d0', pants: '#2a4a7a', extra: ['glasses'] },
  fietser: { skin: '#e0b090', hair: '#888', style: 'bald', shirt: '#f2c22e', pants: '#222', extra: ['mustache'] },
  henk: { skin: '#e8b090', hair: '#9a9aa0', style: 'bald', shirt: '#6a7a5a', pants: '#4a3a2a', extra: ['mustache', 'belly'] },
  rick: { skin: '#e0b494', hair: '#b8742a', style: 'messy', shirt: '#2a3a6a', pants: '#1b1b2a', extra: ['beard'] },
};

// Tegenstanders. talk: opties met effect op Rust (+) of woede (negatief = vijand sterker)
const ENEMIES = {
  jogger: {
    name: 'Fanatieke jogger', look: 'jogger', hp: 22, atk: 5, def: 1, xp: 8, money: 3,
    moves: ['rent tegen je aan', 'zwaait met zijn smartwatch', 'hijgt in je gezicht'],
    talk: [
      { t: 'Vraag naar zijn rondetijd', v: 55, r: '"Vier minuut tweeëntwintig per kilometer!" Hij straalt.' },
      { t: 'Ren een stukje mee', v: 40, r: 'Je rent drie meter en moet bijna overgeven. Hij waardeert de moeite.' },
      { t: 'Bied een frikandel aan', v: -1, r: '"Weet je hoeveel transvet daarin zit?!" Hij wordt boos.' },
    ],
    spare: 'De jogger knikt, start zijn stopwatch opnieuw en rent verder.',
  },
  buurvrouw: {
    name: 'Bemoeizuchtige buurvrouw', look: 'buurvrouw', hp: 26, atk: 5, def: 2, xp: 10, money: 4,
    moves: ['wijst met haar vinger', 'zucht heel diep', 'begint over vroeger'],
    talk: [
      { t: 'Roddel over Henk', v: 60, r: '"Nee! Echt?!" Ze is helemaal om.' },
      { t: 'Zeg dat je haast hebt', v: -1, r: '"Haast? Op jouw leeftijd? Toen ík jong was…" Ze wordt feller.' },
      { t: 'Prijs haar vitrage', v: 45, r: '"Zelf gestreken," zegt ze trots.' },
    ],
    spare: 'Ze moet nodig de buurt bijpraten over wat ze net hoorde, en loopt weg.',
  },
  scooter: {
    name: 'Hangjongere op scooter', look: 'scooter', hp: 30, atk: 7, def: 2, xp: 13, money: 6,
    moves: ['laat zijn uitlaat knallen', 'rijdt over je tenen', 'blaast een dampwolk naar je'],
    talk: [
      { t: 'Bewonder zijn scooter', v: 50, r: '"Opgevoerd tot vijfenveertig, broer." Hij is gevleid.' },
      { t: 'Vraag of hij weet wie je bent', v: 30, r: '"Jij bent die gast van gisteren! Die van de polonaise!" Meer weet hij niet.' },
      { t: 'Zeg dat hij te hard rijdt', v: -1, r: '"Ben jij politie of zo?" Hij geeft gas.' },
    ],
    spare: 'Hij laat zijn scooter nog één keer knallen en scheurt weg.',
  },
  enquete: {
    name: 'Enquêteur met klembord', look: 'enquete', hp: 24, atk: 6, def: 1, xp: 10, money: 5,
    moves: ['stelt een vervolgvraag', 'tikt met haar pen', 'vraagt om je postcode'],
    talk: [
      { t: 'Beantwoord de vragen', v: 35, r: '"Naam?" … Dat weet je dus niet. Ze schrijft "onbekend" op en lacht.' },
      { t: 'Geef heel enthousiast een 10', v: 50, r: '"Wat een fijne respondent!" Ze vinkt alles af.' },
      { t: 'Zeg "geen interesse"', v: -1, r: '"Het duurt maar vijf minuutjes!" Ze komt dichterbij.' },
    ],
    spare: 'De enquête is af. Ze bedankt je met een pen met een logo erop. Die pen ben je binnen een minuut kwijt.',
  },
  fietser: {
    name: 'Wielrenner in strak pak', look: 'fietser', hp: 28, atk: 6, def: 3, xp: 12, money: 5,
    moves: ['belt agressief', 'klikt zijn schoenen los', 'roept "AAN DE KANT!"'],
    talk: [
      { t: 'Vraag naar zijn wattage', v: 55, r: 'Hij praat vijf minuten over wattage. Je knikt op de juiste momenten.' },
      { t: 'Wijs op de wind', v: 40, r: '"Altijd tegenwind hier, hè." Eindelijk iets waar jullie het over eens zijn.' },
      { t: 'Vraag waarom hij een panty draagt', v: -1, r: '"Dat is een BIB SHORT." Hij is beledigd.' },
    ],
    spare: 'Hij klikt zijn schoenen weer vast en verdwijnt richting de dijk.',
  },
  henk: {
    name: 'Henk de buurman', look: 'henk', hp: 70, atk: 8, def: 3, xp: 40, money: 15, boss: true,
    moves: ['zwaait met een tuinschoffel', 'scheldt op je', 'dreigt de wijkagent te bellen', 'gooit een bloempot'],
    talk: [
      { t: 'Excuses voor de tulpen', v: 20, r: '"Ze waren van de Keukenhof-veiling!" Henk wordt iets rustiger.' },
      { t: 'Bied aan zijn heg te knippen', v: 25, r: '"…Ook de achterkant?" Hij denkt erover na.' },
      { t: 'Prijs zijn gazon', v: 20, r: '"Elke zaterdag met de schaar," bromt hij trots.' },
      { t: 'Zeg dat het de kat was', v: -1, r: '"De kat kan niet aanbellen om vier uur!" Henk ontploft.' },
    ],
    spare: 'Henk zucht. "Goed dan. Maar je knipt die heg."',
  },
  rick: {
    name: 'Rick', look: 'rick', hp: 120, atk: 10, def: 4, xp: 80, money: 30, boss: true,
    moves: ['geeft een klaverjas-klap', 'gooit een bierviltje', 'roept "ROEM!"', 'doet een polonaise-tackle'],
    talk: [
      { t: 'Excuses aanbieden', v: 15, r: '"Excuses? Je noemde me een valsspeler! Voor het hele dorp!"' },
      { t: 'Daag hem uit voor klaverjassen', v: 30, r: 'Zijn ogen lichten op. "Eén potje. Nu meteen."' },
      { t: 'Herinner hem aan de polonaise', v: 25, r: '"Dat was wel mooi, ja. Jij voorop, ik erachter." Hij grijnst even.' },
      { t: 'Zeg dat hij vals speelde', v: -1, r: '"WAT ZEG JE?!" Dat was geen goed idee.' },
    ],
    spare: 'Rick laat zijn schouders zakken. "Ach man. Laten we het gewoon vergeten."',
  },
};
const RANDOM_POOL = ['jogger', 'buurvrouw', 'scooter', 'enquete', 'fietser'];

// ---------- Gevecht ----------
const Battle = {
  active: false, foe: null, shake: 0, flash: 0, foeHit: 0, foeGone: 0,

  async start(id, P) {
    const E = ENEMIES[id];
    const lvlBoost = E.boss ? 0 : Math.max(0, P.lvl - 1);
    this.foe = {
      ...E, id, maxHp: E.hp + lvlBoost * 6, atk: E.atk + lvlBoost, calm: 0, angry: 0, weak: 0, talked: new Set(),
    };
    this.foe.curHp = this.foe.maxHp;
    this.P = P; this.active = true; this.foeHit = 0; this.foeGone = 0;
    SFX.battle();
    ['#hud'].forEach((s) => UI.show(s, false));
    this.paintFoe(); this.paintStats();
    UI.show('#benemy'); UI.show('#bstats');
    await this.log(E.boss ? `${E.name} wil met je vechten!` : `Een ${E.name.toLowerCase()} houdt je tegen!`);
    let result = null;
    while (!result) {
      result = await this.playerTurn();
      if (result) break;
      if (this.foe.curHp <= 0) { result = 'win'; break; }
      if (this.foe.calm >= 100) { result = 'spared'; break; }
      await this.foeTurn();
      if (P.hp <= 0) result = 'lose';
    }
    return this.finish(result);
  },

  log(text, wait = true) {
    const el = $('#blog'); el.hidden = false; el.textContent = text;
    if (!wait) return Promise.resolve();
    return new Promise((r) => {
      const t = setTimeout(done, 1100 + text.length * 32);
      function done() { clearTimeout(t); UI.focus = null; r(); }
      UI.focus = (k) => { if (k === 'ok' || k === 'cancel') done(); };
    });
  },

  paintFoe() {
    const f = this.foe;
    $('#benemy').innerHTML = `<div class="row"><b>${f.name}</b><span class="lbl">${f.boss ? 'BAAS' : ''}</span></div>
      <div class="row"><span class="lbl">HP</span><span>${Math.max(0, f.curHp)}/${f.maxHp}</span></div><div class="bar hp"><i style="width:${Math.max(0, f.curHp) / f.maxHp * 100}%"></i></div>
      <div class="row"><span class="lbl">Rust</span><span>${Math.min(100, f.calm)}%</span></div><div class="bar calm"><i style="width:${Math.min(100, f.calm)}%"></i></div>`;
  },
  paintStats() {
    const p = this.P;
    $('#bstats').innerHTML = `<div class="row"><b>???</b><span class="lbl">Lvl ${p.lvl}</span></div>
      <div class="row"><span class="lbl">HP</span><span>${p.hp}/${p.maxHp}</span></div><div class="bar hp"><i style="width:${p.hp / p.maxHp * 100}%"></i></div>
      <div class="row"><span class="lbl">EP</span><span>${p.ep}/${p.maxEp}</span></div><div class="bar ep"><i style="width:${p.ep / p.maxEp * 100}%"></i></div>`;
  },

  dmg(atk, def, mult = 1) {
    const base = Math.max(1, atk * 1.6 - def);
    return Math.max(1, Math.round(base * mult * (0.85 + Math.random() * 0.3)));
  },

  async hitFoe(n, text) {
    const f = this.foe;
    const crit = Math.random() < 0.1;
    if (crit) n = Math.round(n * 1.6);
    f.curHp -= n; this.foeHit = 12;
    crit ? SFX.crit() : SFX.hit();
    this.paintFoe();
    await this.log(`${text} ${crit ? 'Voltreffer! ' : ''}${n} schade.`);
  },

  async playerTurn() {
    const P = this.P, f = this.foe;
    for (;;) {
      $('#blog').textContent = 'Wat doe je?';
      const c = await UI.list('#bcmd', ['Aanvallen', 'Skills', 'Praten', 'Spullen', f.boss ? { label: 'Vluchten', off: true } : 'Vluchten'], { keep: true });
      if (c === 0) {
        UI.show('#bcmd', false);
        await this.hitFoe(this.dmg(P.atk, f.def), 'Je haalt uit.');
        return null;
      }
      if (c === 1) {
        const avail = SKILLS.filter((s) => P.lvl >= s.lvl);
        const k = await UI.list('#bsub', avail.map((s) => ({ label: s.name, right: s.ep + ' EP', off: P.ep < s.ep })), {
          cancel: true, onMove: (i) => { $('#blog').textContent = avail[i].desc; },
        });
        if (k < 0) continue;
        UI.show('#bcmd', false);
        const s = avail[k];
        P.ep -= s.ep; this.paintStats();
        if (s.id === 'kopstoot') {
          await this.hitFoe(this.dmg(P.atk, f.def, 1.9), 'KOPSTOOT!');
          if (Math.random() < 0.3) { const self = Math.round(P.maxHp * 0.08); P.hp = Math.max(1, P.hp - self); this.shake = 10; SFX.hit(); this.paintStats(); await this.log(`Au. Je kater slaat terug: ${self} schade aan jezelf.`); }
        } else if (s.id === 'adem') {
          f.weak = 3; SFX.no();
          await this.log(`Je ademt uit. ${f.name} deinst achteruit en doet minder schade.`);
        } else if (s.id === 'powernap') {
          const r = heal(P, Math.round(P.maxHp * 0.4), 0); SFX.heal(); this.paintStats();
          await this.log(`Je doet even je ogen dicht. ${r}.`);
        } else if (s.id === 'dans') {
          for (let i = 0; i < 3 && f.curHp > 0; i++) await this.hitFoe(this.dmg(P.atk, f.def, 0.75), ['Een draai!', 'Een sprong!', 'De vogeltjesdans!'][i]);
        }
        return null;
      }
      if (c === 2) {
        const k = await UI.list('#bsub', f.talk.map((t) => ({ label: t.t })), { cancel: true, onMove: () => { $('#blog').textContent = 'Wat zeg je?'; } });
        if (k < 0) continue;
        UI.show('#bcmd', false);
        const t = f.talk[k];
        await this.log(`"${t.t}."`);
        const again = f.talked.has(t.t);
        if (t.v > 0) { f.calm += again ? Math.round(t.v / 2) : t.v; f.talked.add(t.t); SFX.heal(); }
        else { f.angry += 1; f.atk += 2; f.calm = Math.max(0, f.calm - 15); this.shake = 8; SFX.no(); }
        this.paintFoe();
        await this.log(again && t.v > 0 ? 'Je probeert het nog een keer. Het werkt een beetje.' : t.r);
        return null;
      }
      if (c === 3) {
        const own = Object.keys(P.items).filter((id) => P.items[id] > 0 && !ITEMS[id].key);
        if (!own.length) { await this.log('Je zakken zijn leeg. Op een bonnetje na.'); continue; }
        const k = await UI.list('#bsub', own.map((id) => ({ label: ITEMS[id].name, right: '×' + P.items[id] })), { cancel: true, onMove: (i) => { $('#blog').textContent = ITEMS[own[i]].desc; } });
        if (k < 0) continue;
        UI.show('#bcmd', false);
        const id = own[k]; P.items[id] -= 1;
        const r = ITEMS[id].use(P); SFX.heal(); this.paintStats();
        await this.log(`${ITEMS[id].name}: ${r}.`);
        return null;
      }
      if (c === 4) {
        UI.show('#bcmd', false);
        if (Math.random() < 0.65) { await this.log('Je rent weg zo hard als een brakke man kan.'); return 'fled'; }
        await this.log('Je struikelt over je eigen veters. Vluchten mislukt.');
        return null;
      }
    }
  },

  async foeTurn() {
    const f = this.foe, P = this.P;
    const move = f.moves[Math.floor(Math.random() * f.moves.length)];
    let n = this.dmg(f.atk, P.def, f.weak > 0 ? 0.6 : 1);
    if (f.weak > 0) f.weak -= 1;
    // als de vijand al aardig rustig is, slaat hij minder hard
    if (f.calm >= 50) n = Math.max(1, Math.round(n * 0.7));
    P.hp = Math.max(0, P.hp - n);
    this.shake = 10; this.flash = 6; SFX.hit();
    this.paintStats();
    await this.log(`${f.name} ${move}! ${n} schade.`);
  },

  async finish(result) {
    const f = this.foe, P = this.P;
    UI.show('#bcmd', false); UI.show('#bsub', false);
    if (result === 'win' || result === 'spared') {
      this.foeGone = 1;
      SFX.win();
      const xp = f.xp, money = result === 'spared' ? Math.ceil(f.money * 1.5) : f.money;
      await this.log(result === 'spared' ? f.spare : `${f.name} geeft het op!`);
      P.xp += xp; P.money += money;
      await this.log(`+${xp} XP, +€${money}`);
      while (P.xp >= P.next) {
        P.xp -= P.next; P.lvl += 1; P.next = Math.round(P.next * 1.55);
        P.maxHp += 9; P.maxEp += 3; P.atk += 2; P.def += 1;
        P.hp = P.maxHp; P.ep = P.maxEp;
        SFX.item(); this.paintStats();
        const nieuw = SKILLS.find((s) => s.lvl === P.lvl);
        await this.log(`Level ${P.lvl}! Je voelt je bijna weer mens.${nieuw ? ` Nieuwe skill: ${nieuw.name}.` : ''}`);
      }
    } else if (result === 'lose') {
      SFX.lose();
      await this.log('Alles wordt zwart…');
    }
    UI.show('#blog', false); UI.show('#benemy', false); UI.show('#bstats', false);
    this.active = false;
    return result;
  },
};
