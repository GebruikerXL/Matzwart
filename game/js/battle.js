// Turn-based gevechten. Naast vechten kun je "Praten": vul de Rust-meter tot 100 en de tegenstander laat je gaan.
const SKILLS = [
  { id: 'kopstoot', name: 'Kopstoot', ep: 4, lvl: 1, desc: 'Hard, maar je hoofd bonkt al.' },
  { id: 'adem', name: 'Brakke adem', ep: 3, lvl: 1, desc: 'Vijand doet 3 beurten minder schade.' },
  { id: 'powernap', name: 'Powernap', ep: 5, lvl: 2, desc: 'Herstel 40% van je HP.' },
  { id: 'dans', name: 'Dansmoves van gisteren', ep: 6, lvl: 3, desc: '3 wilde klappen.' },
];

const ITEMS = {
  // EKA
  krentenbol: { name: 'Krentenbol', desc: '+20 HP', price: 2, use: (p) => heal(p, 20, 0) },
  rookworst: { name: 'Rookworst', desc: '+45 HP', price: 4, use: (p) => heal(p, 45, 0) },
  chocomel: { name: 'Pak chocomel', desc: '+12 EP', price: 2, use: (p) => heal(p, 0, 12) },
  paracetamol: { name: 'Paracetamol', desc: '+70 HP', price: 6, use: (p) => heal(p, 70, 0) },
  energiedrank: { name: 'Energiedrankje', desc: '+25 HP, +25 EP', price: 5, use: (p) => heal(p, 25, 25) },
  pakje: { name: 'Pakje sigaretten', desc: '5 sigaretten. Ongezond, maar stoer.', price: 6, pack: ['sigaret', 5] },
  sigaret: { name: 'Sigaret', desc: '-8 HP, -2 max HP, +1 Stoerheid', use: smoke },
  // Lanting
  frikandelbroodje: { name: 'Frikandelbroodje', desc: '+30 HP', price: 3, use: (p) => heal(p, 30, 0) },
  bitterballen: { name: 'Bitterballen', desc: '+25 HP, +5 EP', price: 3, use: (p) => heal(p, 25, 5) },
  koffie: { name: 'Bakkie koffie', desc: '+12 EP', price: 2, use: (p) => heal(p, 0, 12) },
  // sleutelvoorwerpen
  motorblok: { name: 'Motorblok', desc: 'Zwaar, vettig en een beetje warm van Derkjes broekzak.', key: true },
  bal: { name: 'Wedstrijdbal', desc: 'Van VV Meedhuizen. Ruikt naar meloen.', key: true },
  telefoon: { name: 'Telefoon', desc: 'Batterij 1%. Vergrendeld. Pincode? Geen idee.', key: true },
  sleutel: { name: 'Sleutel met hanger "J…"', desc: 'De rest van de letters is eraf gesleten.', key: true },
};
function smoke(p) {
  p.maxHp = Math.max(20, p.maxHp - 2);
  p.hp = Math.max(1, Math.min(p.maxHp, p.hp - 8));
  p.stoer = (p.stoer || 0) + 1;
  return `Kuch! -8 HP, max HP -2, Stoerheid ${p.stoer}`;
}
function levelUp(P) {
  P.lvl += 1; P.next = Math.round(P.next * 1.55);
  P.maxHp += 9; P.maxEp += 3; P.atk += 2; P.def += 1;
  P.hp = P.maxHp; P.ep = P.maxEp;
  return SKILLS.find((s) => s.lvl === P.lvl);
}
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
  thijs: { skin: '#f0c4a0', hair: '#111111', style: 'short', shirt: '#f4f1ea', pants: '#2f4f7f', extra: [] },
  derkje: { skin: '#f0c9a0', hair: '#7a4a2a', style: 'bun', shirt: '#e8433a', pants: '#2e7a3a', extra: ['blush'], small: true },
  keeper: { skin: '#e0b090', hair: '#d8b25a', style: 'short', shirt: '#f2c22e', pants: '#1b1b2a', extra: [] },
  trainer: { skin: '#e8b898', hair: '#6a6a70', style: 'bald', shirt: '#2a4a9a', pants: '#2a4a9a', extra: ['mustache'] },
  ineke: { skin: '#f0c9a0', hair: '#c88a3a', style: 'curly', shirt: '#d42a2a', pants: '#2a2a3a', extra: ['apron'] },
  dief: { skin: '#e0b090', hair: '#222', style: 'cap', cap: '#2a2a2a', shirt: '#3a3a44', pants: '#2a2a3a', extra: [] },
};

// Tegenstanders. talk: opties met effect op Rust (+) of woede (negatief = vijand sterker)
const ENEMIES = {
  winkeldief: {
    inflict: { st: 'misselijk', ch: 0.25, t: 'Hij duwt een koude frikandel in je mond. Bah.' }, name: 'Puutje', look: 'dief', hp: 40, atk: 7, def: 2, xp: 22, money: 15, boss: true,
    moves: ['gooit een koude frikandel naar je', 'rijdt met een winkelwagen tegen je aan', 'trekt zijn capuchon strak'],
    talk: [
      { t: 'Vraag waarom hij ze koud eet', v: 30, r: '"Opwarmen is voor amateurs." Hij ontspant een beetje.' },
      { t: 'Zeg dat je hem niet verraadt', v: 25, r: 'Hij kijkt je wantrouwig aan, maar laat zijn schouders zakken.' },
      { t: 'Zeg dat Eka hem zoekt', v: -1, r: '"Eka?! Nooit!" Hij wordt woest.' },
    ],
    intim: 'Je blaast een rookkringetje en kijkt hem lang aan. Hij legt de frikandellen één voor één terug.',
    spare: 'Puutje geeft alle 38 frikandellen terug. Nou ja, 35. Drie zitten er al in.',
  },
  keeper: {
    inflict: { st: 'duizelig', ch: 0.3, t: 'De bal tegen je hoofd laat je sterretjes zien.' }, name: 'Keeper', look: 'keeper', hp: 85, atk: 9, def: 4, xp: 45, money: 20, boss: true,
    moves: ['duikt naar je enkels', 'brult "MIJN DOEL!"', 'trapt een bal tegen je hoofd', 'doet een schijnbeweging'],
    talk: [
      { t: 'Wijs naar de verkeerde hoek', v: 25, r: 'De keeper kijkt de verkeerde kant op. Hij voelt zich voor gek gezet, maar moet ook lachen.' },
      { t: 'Prijs zijn reddingen', v: 20, r: '"Vorig seizoen drie clean sheets," zegt hij trots.' },
      { t: 'Vraag om een handtekening', v: 20, r: 'Hij zet een krabbel op je arm. Met een stift die hij ergens vandaan tovert.' },
      { t: 'Zeg dat hij te klein is voor keeper', v: -1, r: '"TE KLEIN?!" De keeper rekt zich uit tot twee meter. Bijna.' },
    ],
    intim: 'Je trekt je mouwen op, steekt een sigaret achter je oor en kijkt naar de kruising. De keeper slikt.',
    spare: 'De keeper laat de bal doorrollen. "Goed. Die zat. Ik zeg wel dat ik uitgleed."',
  },
  derkje: {
    name: 'Derkje', look: 'derkje', hp: 999, atk: 3, def: 0, xp: 30, money: 0, boss: true, peaceful: true,
    moves: ['gooit een cherrytomaatje naar je', 'maakt een heel hoog geluid', 'trekt aan je broekspijp'],
    noises: [
      { say: 'Mrrrp?', ans: 'Mrrrp!' },
      { say: 'Iiiieeeee!', ans: 'Iiiiieee!' },
      { say: 'Blubblub…', ans: 'Blub.' },
      { say: 'Hrmpf. HRMPF.', ans: 'Hrmpf!' },
      { say: 'Tsjiep tsjiep tsjiep?', ans: 'Tsjiep!' },
    ],
    spare: 'Derkje klapt in haar handjes, graait diep in haar broekzak en haalt er een heel motorblok uit.',
  },
};
const RANDOM_POOL = [];

// ---------- Gevecht ----------
const Battle = {
  active: false, foe: null, shake: 0, flash: 0, foeHit: 0, foeGone: 0, swing: null, me: {},

  async start(id, P) {
    const E = ENEMIES[id];
    const lvlBoost = E.boss ? 0 : Math.max(0, P.lvl - 1);
    this.foe = { ...E, id, maxHp: E.hp + lvlBoost * 6, atk: E.atk + lvlBoost, calm: 0, angry: 0, talked: new Set(), st: {} };
    this.foe.curHp = this.foe.maxHp;
    // in 3D kun je een vaper verrassen door hem eerst te slaan
    if (G.firstStrike) { this.foe.st.ongemak = 1; G.firstStrike = false; }
    this.P = P; this.me = {}; this.active = true; this.foeHit = 0; this.foeGone = 0; this.swing = null;
    SFX.battle();
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
      if (this.foe.curHp <= 0) result = 'win';
      else if (P.hp <= 0) result = 'lose';
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

  chips(st, names) {
    const on = Object.keys(st).filter((k) => st[k] > 0);
    return on.length ? `<div class="chips">${on.map((k) => `<span class="chip st-${k}">${names[k]} ${st[k]}</span>`).join('')}</div>` : '';
  },
  paintFoe() {
    const f = this.foe;
    $('#benemy').innerHTML = `<div class="row"><b>${f.name}</b><span class="lbl">${f.boss ? 'BAAS' : ''}</span></div>
      ${f.peaceful ? '' : `<div class="row"><span class="lbl">HP</span><span>${Math.max(0, f.curHp)}/${f.maxHp}</span></div><div class="bar hp"><i style="width:${Math.max(0, f.curHp) / f.maxHp * 100}%"></i></div>`}
      <div class="row"><span class="lbl">Rust</span><span>${Math.min(100, f.calm)}%</span></div><div class="bar calm"><i style="width:${Math.min(100, f.calm)}%"></i></div>
      ${this.chips(f.st, FOE_ST)}`;
  },
  paintStats() {
    const p = this.P, w = p.wpn && WEAPONS[p.wpn];
    $('#bstats').innerHTML = `<div class="row"><b>???</b><span class="lbl">Lvl ${p.lvl}</span></div>
      <div class="row"><span class="lbl">HP</span><span>${p.hp}/${p.maxHp}</span></div><div class="bar hp"><i style="width:${p.hp / p.maxHp * 100}%"></i></div>
      <div class="row"><span class="lbl">EP</span><span>${p.ep}/${p.maxEp}</span></div><div class="bar ep"><i style="width:${p.ep / p.maxEp * 100}%"></i></div>
      <div class="wpn">${w ? w.name : 'Lege handen'} · EUR ${p.money}</div>${this.chips(this.me, ME_ST)}`;
  },

  dmg(atk, def, mult = 1) {
    const base = Math.max(1, atk * 1.6 - def);
    return Math.max(1, Math.round(base * mult * (0.85 + Math.random() * 0.3)));
  },
  atkNow() { const w = this.P.wpn && WEAPONS[this.P.wpn]; return this.P.atk + (w ? w.atk : 0) + clothBonus(this.P).atk; },

  async hitFoe(n, text) {
    const f = this.foe;
    const crit = Math.random() < 0.1;
    if (crit) n = Math.round(n * 1.6);
    f.curHp -= n; this.foeHit = 12;
    crit ? SFX.crit() : SFX.hit();
    this.paintFoe();
    await this.log(`${text} ${crit ? 'Voltreffer! ' : ''}${n} schade.`);
  },
  // aanval met het wapen in je hand (of je vuisten)
  async wHit(mult, text) {
    if (this.me.duizelig && Math.random() < 0.35) { SFX.no(); await this.log(`${text} …maar je bent duizelig en slaat mis.`); return; }
    if (this.P.wpn) this.swing = { id: this.P.wpn, t: 0 };
    if (this.me.opgepompt) mult *= 1.4;
    await this.hitFoe(this.dmg(this.atkNow(), this.foe.def, mult), text);
  },
  async foeSt(k, n) {
    const f = this.foe;
    if (f.curHp <= 0) return;
    if (f.boss && k === 'ongemak') n = 1;
    f.st[k] = Math.max(f.st[k] || 0, n);
    this.paintFoe();
    await this.log(`${f.name} is ${FOE_ST[k].toLowerCase()}.`);
  },
  meSt(k, n) { this.me[k] = Math.max(this.me[k] || 0, n); this.paintStats(); },
  tick(st, keys) { keys.forEach((k) => { if (st[k] > 0) st[k] -= 1; }); },

  async playerTurn() {
    const P = this.P, f = this.foe;
    if (this.me.misselijk) {
      const n = Math.max(3, Math.round(P.maxHp * 0.06));
      P.hp = Math.max(1, P.hp - n); this.me.misselijk -= 1; this.paintStats();
      await this.log(`Je bent misselijk. Je verliest ${n} HP.`);
    }
    if (f.noises) {
      f.cur = f.noises[Math.floor(Math.random() * f.noises.length)];
      await this.log(`${f.name}: "${f.cur.say}"`);
    }
    const r = await this.choose();
    this.tick(this.me, ['duizelig', 'opgepompt']);
    this.paintStats();
    return r;
  },

  async choose() {
    const P = this.P, f = this.foe, peace = !!f.peaceful;
    const W = P.wpn && WEAPONS[P.wpn];
    for (;;) {
      $('#blog').textContent = f.noises ? `${f.name}: "${f.cur.say}"` : 'Wat doe je?';
      const off = (l, o) => (o ? { label: l, off: true } : l);
      const c = await UI.list('#bcmd', [off('Aanvallen', peace), off('Wapen', peace), off('Skills', peace), 'Praten', 'Spullen', off('Vluchten', f.boss)], { keep: true });
      if (c === 3 && f.noises) {
        const ans = f.noises.map((n) => n.ans);
        const k = await UI.list('#bsub', ans, { cancel: true, onMove: () => { $('#blog').textContent = `${f.name}: "${f.cur.say}"`; } });
        if (k < 0) continue;
        UI.show('#bcmd', false);
        await this.log(`Je zegt: "${ans[k]}"`);
        if (ans[k] === f.cur.ans) { f.calm += 34; SFX.heal(); this.paintFoe(); await this.log(`${f.name} kijkt je stralend aan en wiebelt heen en weer.`); }
        else { SFX.no(); await this.log(`${f.name} fronst. Dat was duidelijk niet het goede geluid.`); }
        return null;
      }
      if (c === 0) {
        UI.show('#bcmd', false);
        await this.wHit(1, W ? W.verb : 'Je haalt uit met je vuisten.');
        return null;
      }
      if (c === 1) {
        const own = P.weapons || [];
        if (!own.length) { await this.log('Je hebt niks in je handen. Behalve je eigen hoofd.'); continue; }
        const opts = [], acts = [];
        if (W) { opts.push({ label: W.sp.name, right: W.sp.ep + ' EP', off: P.ep < W.sp.ep }); acts.push('sp'); }
        if (own.length > (W ? 1 : 0)) { opts.push(W ? 'Ander wapen pakken' : 'Wapen pakken'); acts.push('swap'); }
        const k = await UI.list('#bsub', opts, { cancel: true, onMove: (i) => { $('#blog').textContent = acts[i] === 'sp' ? W.sp.desc : 'Wisselen kost je beurt.'; } });
        if (k < 0) continue;
        if (acts[k] === 'sp') {
          UI.show('#bcmd', false);
          P.ep -= W.sp.ep; this.paintStats();
          await W.sp.run(this, f, P);
          return null;
        }
        const list = own.filter((id) => id !== P.wpn);
        const j = await UI.list('#bsub', list.map((id) => ({ label: WEAPONS[id].name, right: '+' + WEAPONS[id].atk })), { cancel: true, onMove: (i) => { $('#blog').textContent = `Speciaal: ${WEAPONS[list[i]].sp.name}. ${WEAPONS[list[i]].sp.desc}`; } });
        if (j < 0) continue;
        UI.show('#bcmd', false);
        P.wpn = list[j]; this.paintStats(); SFX.ok();
        await this.log(`Je pakt de ${WEAPONS[P.wpn].name.toLowerCase()} erbij.`);
        return null;
      }
      if (c === 2) {
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
          SFX.no();
          await this.log(`Je ademt uit. ${f.name} deinst achteruit.`);
          await this.foeSt('verzwakt', 3);
        } else if (s.id === 'powernap') {
          const r = heal(P, Math.round(P.maxHp * 0.4), 0); SFX.heal(); this.paintStats();
          await this.log(`Je doet even je ogen dicht. ${r}.`);
        } else if (s.id === 'dans') {
          for (let i = 0; i < 3 && f.curHp > 0; i++) await this.wHit(0.75, ['Een draai!', 'Een sprong!', 'De vogeltjesdans!'][i]);
        }
        return null;
      }
      if (c === 3) {
        const need = f.boss ? 4 : 2, stoer = stoerNow(P);
        const opts = f.talk.concat([{ t: 'Intimideren', v: f.boss ? 35 : 70, r: f.intim || `Je blaast rook in het gezicht van ${f.name.toLowerCase()} en kijkt heel stoer. Dat maakt indruk.`, stoer: need }]);
        const k = await UI.list('#bsub', opts.map((t) => (t.stoer ? { label: stoer >= t.stoer ? t.t : `${t.t} (Stoerheid ${t.stoer})`, off: stoer < t.stoer } : { label: t.t })), {
          cancel: true, onMove: (i) => { $('#blog').textContent = opts[i].stoer ? `Alleen voor echte stoere types. Jouw Stoerheid: ${stoer}.` : 'Wat zeg je?'; },
        });
        if (k < 0) continue;
        UI.show('#bcmd', false);
        const t = opts[k];
        await this.log(`"${t.t}."`);
        const again = f.talked.has(t.t);
        if (t.v > 0) { f.calm += again ? Math.round(t.v / 2) : t.v; f.talked.add(t.t); SFX.heal(); }
        else { f.angry += 1; f.atk += 2; f.calm = Math.max(0, f.calm - 15); this.shake = 8; SFX.no(); }
        this.paintFoe();
        await this.log(again && t.v > 0 ? 'Je probeert het nog een keer. Het werkt een beetje.' : t.r);
        return null;
      }
      if (c === 4) {
        const own = Object.keys(P.items).filter((id) => P.items[id] > 0 && !ITEMS[id].key && ITEMS[id].use);
        if (!own.length) { await this.log('Je zakken zijn leeg. Op een bonnetje na.'); continue; }
        const k = await UI.list('#bsub', own.map((id) => ({ label: ITEMS[id].name, right: '×' + P.items[id] })), { cancel: true, onMove: (i) => { $('#blog').textContent = ITEMS[own[i]].desc; } });
        if (k < 0) continue;
        UI.show('#bcmd', false);
        const id = own[k]; P.items[id] -= 1;
        const r = ITEMS[id].use(P); SFX.heal();
        if (id === 'paracetamol') { this.me.misselijk = 0; this.me.duizelig = 0; }
        this.paintStats();
        await this.log(`${ITEMS[id].name}: ${r}.`);
        return null;
      }
      if (c === 5) {
        UI.show('#bcmd', false);
        if (Math.random() < 0.65) { await this.log('Je rent weg zo hard als een brakke man kan.'); return 'fled'; }
        await this.log('Je struikelt over je eigen veters. Vluchten mislukt.');
        return null;
      }
    }
  },

  async foeTurn() {
    const f = this.foe, P = this.P, st = f.st;
    if (st.misselijk > 0) {
      const n = Math.max(3, Math.round(f.maxHp * 0.07));
      st.misselijk -= 1; f.curHp -= n; this.foeHit = 8; this.paintFoe();
      await this.log(`${f.name} is misselijk en kokhalst. ${n} schade.`);
      if (f.curHp <= 0) return;
    }
    if (st.ongemak > 0) {
      st.ongemak -= 1; this.paintFoe();
      await this.log(pick([`${f.name} staat er ongemakkelijk bij en weet niet wat te doen.`, `${f.name} kijkt naar de grond en schuifelt wat.`, `${f.name} moet even bijkomen van wat er net gebeurde.`]));
      return;
    }
    const move = f.moves[Math.floor(Math.random() * f.moves.length)];
    if (st.verblind > 0) {
      st.verblind -= 1; this.paintFoe();
      if (Math.random() < 0.5) { await this.log(`${f.name} ${move}… maar ziet niks en mist.`); return; }
    }
    let n = this.dmg(f.atk, P.def + clothBonus(P).def, st.verzwakt > 0 ? 0.6 : 1);
    if (st.verzwakt > 0) st.verzwakt -= 1;
    if (f.calm >= 50) n = Math.max(1, Math.round(n * 0.7));
    if (f.peaceful) n = Math.min(n, 3);
    if (this.me.gedekt) {
      this.me.gedekt = 0; this.paintStats(); this.paintFoe();
      await this.log(`${f.name} ${move}! Het ketst af op je paraplu.`);
      return;
    }
    P.hp = Math.max(0, P.hp - n);
    this.shake = 10; this.flash = 6; SFX.hit();
    this.paintStats(); this.paintFoe();
    await this.log(`${f.name} ${move}! ${n} schade.`);
    const inf = f.inflict;
    if (inf && P.hp > 0 && !this.me[inf.st] && Math.random() < inf.ch) {
      this.meSt(inf.st, inf.st === 'misselijk' ? 3 : 2);
      await this.log(inf.t);
    }
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
      await this.log(money ? `+${xp} XP, +EUR ${money}` : `+${xp} XP`);
      while (P.xp >= P.next) {
        P.xp -= P.next;
        const nieuw = levelUp(P);
        SFX.item(); this.paintStats();
        await this.log(`Level ${P.lvl}! Je voelt je bijna weer mens.${nieuw ? ` Nieuwe skill: ${nieuw.name}.` : ''}`);
      }
      if (f.vaper) await stealVape(this, f, P);
      if (f.vaper) await rareDrop(this, f);
      if (f.drop && !(P.weapons || []).includes(f.drop) && Math.random() < 0.35) {
        await this.log(`${f.name} laat iets vallen: ${WEAPONS[f.drop].name}!`);
        await giveWeapon(f.drop, true);
      }
    } else if (result === 'lose') {
      SFX.lose();
      await this.log('Alles wordt zwart…');
    }
    UI.show('#blog', false); UI.show('#benemy', false); UI.show('#bstats', false);
    this.me = {};
    this.active = false;
    return result;
  },
};
