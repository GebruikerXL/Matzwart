// Realtime gevechten in WoW-stijl (alleen in 3D): je kiest een class met vijf abilities op toetsen 1-5, Energydrink is je mana,
// je selecteert een vijand met klikken of Tab, je slaat vanzelf als je dichtbij staat en verslagen vijanden kun je looten.
// Posities van vijanden staan in tegels (net als E3.pos); afstanden en bereik rekenen we in meters.

// ---------- icoontjes voor de abilities (16x16, in code getekend) ----------
const AICON = {
  rookring: (x) => { x.strokeStyle = '#f4f1ea'; x.lineWidth = 2.5; x.beginPath(); x.arc(8, 8, 5, 0, 7); x.stroke(); px(x, 2, 12, 3, 3, '#5ad0f0'); },
  wolk: (x) => { [[5, 9, 4], [10, 8, 4], [8, 5, 4]].forEach(([a, b, r]) => { x.fillStyle = '#c8f070'; x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); }); px(x, 3, 12, 10, 2, '#8ab040'); },
  blast: (x) => { x.fillStyle = '#ffd9a0'; x.beginPath(); x.moveTo(2, 8); x.lineTo(15, 2); x.lineTo(15, 14); x.fill(); px(x, 1, 7, 3, 3, '#5ad0f0'); },
  damp: (x) => { x.globalAlpha = 0.5; px(x, 5, 2, 6, 6, '#f0c9a0'); px(x, 4, 8, 8, 6, '#9ab4d0'); x.globalAlpha = 1; px(x, 2, 12, 12, 2, '#e8e6e0'); },
  chaser: (x) => { [[8, 8, 7], [8, 8, 4.5], [8, 8, 2]].forEach(([a, b, r], i) => { x.fillStyle = ['#7a3ac8', '#c8a0ff', '#ffffff'][i]; x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); }); },
  buks: (x) => { px(x, 1, 6, 12, 2, '#3a3a44'); px(x, 9, 8, 3, 4, '#6e4a2c'); px(x, 12, 5, 3, 3, '#6e4a2c'); px(x, 0, 6, 2, 1, '#f2c22e'); },
  zakken: (x) => { px(x, 4, 4, 8, 9, '#3a3a44'); px(x, 6, 2, 4, 3, '#3a3a44'); px(x, 6, 7, 4, 3, '#f2c22e'); px(x, 7, 8, 2, 1, '#c8a020'); },
  rug: (x) => { px(x, 7, 1, 2, 9, '#d8dce4'); px(x, 6, 10, 4, 2, '#888'); px(x, 7, 12, 2, 3, '#3a2a1a'); px(x, 2, 4, 3, 1, '#c23b2e'); px(x, 11, 4, 3, 1, '#c23b2e'); },
  scooter: (x) => { px(x, 3, 7, 9, 4, '#c23b2e'); px(x, 10, 3, 2, 5, '#888'); px(x, 2, 11, 4, 4, '#1b1b1b'); px(x, 10, 11, 4, 4, '#1b1b1b'); },
  neven: (x) => { for (const o of [0, 6]) { px(x, 2 + o, 3, 5, 5, '#f0c9a0'); px(x, 2 + o, 2, 5, 2, '#1b1b1b'); px(x, 1 + o, 8, 7, 7, '#3a3a44'); } },
  bal: (x) => { x.fillStyle = '#f4f1ea'; x.beginPath(); x.arc(8, 8, 6, 0, 7); x.fill(); px(x, 7, 6, 3, 3, '#1b1420'); px(x, 3, 9, 2, 2, '#1b1420'); px(x, 11, 10, 2, 2, '#1b1420'); },
  sliding: (x) => { px(x, 1, 10, 12, 3, '#2a4a9a'); px(x, 12, 9, 3, 3, '#f0c9a0'); px(x, 0, 13, 16, 2, '#5f9e3c'); px(x, 2, 7, 3, 2, '#e8e6e0'); },
  schwalbe: (x) => { px(x, 2, 9, 12, 3, '#f2c22e'); px(x, 12, 7, 3, 3, '#f0c9a0'); px(x, 5, 3, 2, 4, '#f4f1ea'); px(x, 9, 2, 2, 4, '#f4f1ea'); px(x, 5, 1, 2, 1, '#c23b2e'); },
  hogebal: (x) => { x.strokeStyle = '#f4f1ea'; x.setLineDash([2, 2]); x.beginPath(); x.arc(8, 14, 7, Math.PI, 0); x.stroke(); x.setLineDash([]); x.fillStyle = '#f4f1ea'; x.beginPath(); x.arc(13, 9, 3, 0, 7); x.fill(); },
  penalty: (x) => { px(x, 1, 2, 14, 2, '#f4f1ea'); px(x, 1, 2, 2, 12, '#f4f1ea'); px(x, 13, 2, 2, 12, '#f4f1ea'); x.fillStyle = '#f4f1ea'; x.beginPath(); x.arc(8, 11, 3, 0, 7); x.fill(); px(x, 7, 10, 2, 2, '#1b1420'); },
  viltje: (x) => { x.fillStyle = '#f4f1ea'; x.beginPath(); x.arc(8, 8, 6.5, 0, 7); x.fill(); x.fillStyle = '#c23b2e'; x.beginPath(); x.arc(8, 8, 4.5, 0, 7); x.fill(); px(x, 6, 7, 4, 2, '#f4f1ea'); },
  rondje: (x) => { for (const o of [1, 6, 11]) { px(x, o, 5, 4, 9, '#f2c22e'); px(x, o, 3, 4, 3, '#f4f1ea'); } },
  kruk: (x) => { px(x, 3, 3, 10, 3, '#8c5a32'); px(x, 4, 6, 2, 9, '#4a2c18'); px(x, 10, 6, 2, 9, '#4a2c18'); px(x, 5, 10, 6, 1, '#4a2c18'); },
  polonaise: (x) => { for (const o of [0, 5, 10]) { px(x, o + 1, 2, 4, 4, '#f0c9a0'); px(x, o, 6, 5, 6, ['#e86fb0', '#2ab0c0', '#f2c22e'][o / 5]); px(x, o + 4, 7, 2, 1, '#f0c9a0'); } },
  laatste: (x) => { px(x, 5, 4, 6, 10, '#f2c22e'); px(x, 5, 2, 6, 3, '#f4f1ea'); px(x, 11, 6, 3, 5, '#f2c22e'); px(x, 1, 1, 3, 3, '#e8433a'); px(x, 12, 1, 3, 3, '#e8433a'); },
  haak: (x) => { x.strokeStyle = '#c0c0c8'; x.lineWidth = 2; x.beginPath(); x.arc(7, 10, 4, 0, Math.PI); x.stroke(); px(x, 10, 2, 2, 9, '#c0c0c8'); px(x, 9, 1, 4, 2, '#6e4a2c'); },
  harpoen: (x) => { px(x, 1, 7, 12, 2, '#6e4a2c'); x.fillStyle = '#c0c0c8'; x.beginPath(); x.moveTo(16, 8); x.lineTo(11, 4); x.lineTo(11, 12); x.fill(); },
  anker: (x) => { px(x, 7, 2, 2, 11, '#5a5a62'); px(x, 4, 4, 8, 2, '#5a5a62'); x.strokeStyle = '#5a5a62'; x.lineWidth = 2; x.beginPath(); x.arc(8, 9, 5, 0.2, Math.PI - 0.2); x.stroke(); x.strokeStyle = '#3a3a3a'; x.beginPath(); x.arc(8, 2, 1.5, 0, 7); x.stroke(); },
  hoorn: (x) => { x.fillStyle = '#e0b030'; x.beginPath(); x.moveTo(2, 7); x.lineTo(11, 2); x.lineTo(11, 14); x.lineTo(2, 9); x.fill(); px(x, 12, 4, 1, 8, '#f4f1ea'); px(x, 14, 2, 1, 12, '#f4f1ea'); },
  storm: (x) => { px(x, 0, 9, 16, 7, '#3a6fb0'); x.fillStyle = '#f4f1ea'; x.beginPath(); x.arc(5, 9, 4, Math.PI, 0); x.fill(); x.beginPath(); x.arc(12, 10, 3, Math.PI, 0); x.fill(); },
};
const aiconCache = {};
function aicon(id) { if (!aiconCache[id]) aiconCache[id] = makeCanvas(16, 16, (x) => (AICON[id] || AICON.bal)(x)); return aiconCache[id]; }

// ---------- de classes ----------
// lvl: vanaf welk level de ability vrijkomt. cost: Energydrink. cd: cooldown in seconden. range: meters (0 = op jezelf).
// k: schadefactor. Elke ability met een doelwit heeft een vijand nodig.
const CLASSES = {
  vaper: {
    name: 'Vaper', col: '#9ad0ff', desc: 'Vecht op afstand. Dampwolken die blijven doorvreten.',
    abil: [
      { id: 'rookring', name: 'Rookring', lvl: 1, cost: 10, cd: 0, range: 20, k: 1.0, shot: 'ring', desc: 'Schiet een rookring op je doelwit.' },
      { id: 'wolk', name: 'Dikke wolk', lvl: 1, cost: 15, cd: 8, range: 20, k: 0.3, dot: 6, shot: 'puff', desc: 'Je doelwit wordt misselijk en verliest 6 seconden lang HP.' },
      { id: 'blast', name: 'Mango-blast', lvl: 2, cost: 20, cd: 10, range: 7, k: 1.2, cone: true, desc: 'Een mangowolk recht voor je uit. Raakt alles in de wolk.' },
      { id: 'damp', name: 'Opgaan in damp', lvl: 4, cost: 15, cd: 30, range: 0, desc: '5 seconden onzichtbaar: vijanden verliezen je uit het oog. Je volgende aanval doet +50%.' },
      { id: 'chaser', name: 'Cloud chaser', lvl: 6, cost: 40, cd: 45, range: 20, k: 2.4, aoe: 6, dot: 4, desc: 'Een gigantische wolk rond je doelwit. Iedereen erin is meteen misselijk.' },
    ],
  },
  crimineel: {
    name: 'Crimineel', col: '#c8c8d0', desc: 'Veel schade in één keer. Altijd met een plan B.',
    abil: [
      { id: 'buks', name: 'Schieten', lvl: 1, cost: 8, cd: 0, range: 24, k: 1.0, shot: 'kogel', desc: 'Schiet met je luchtbuks.' },
      { id: 'zakken', name: 'Zakkenrollen', lvl: 1, cost: 0, cd: 12, range: 3.2, k: 0.6, desc: 'Kleine klap, en je jat geld en een slok Energydrink.' },
      { id: 'rug', name: 'In de rug', lvl: 2, cost: 25, cd: 6, range: 3.2, k: 1.6, desc: 'Flinke steek. Dubbele schade als hij je niet ziet aankomen.' },
      { id: 'scooter', name: 'Wegscheuren', lvl: 4, cost: 10, cd: 20, range: 0, desc: '5 seconden twee keer zo snel, op een scooter die niet van jou is.' },
      { id: 'neven', name: 'Neven bellen', lvl: 6, cost: 40, cd: 60, range: 0, desc: 'Twee neven komen 12 seconden meevechten.' },
    ],
  },
  voetballer: {
    name: 'Voetballer', col: '#7ad46a', desc: 'Dichtbij en taai (15% minder schade). Houdt vijanden tegen.',
    abil: [
      { id: 'bal', name: 'Knal', lvl: 1, cost: 10, cd: 0, range: 22, k: 1.0, shot: 'bal', desc: 'Trap de bal keihard naar je doelwit.' },
      { id: 'sliding', name: 'Sliding', lvl: 1, cost: 15, cd: 12, range: 14, k: 0.8, desc: 'Glij naar je doelwit. Hij is 2 seconden verdoofd.' },
      { id: 'schwalbe', name: 'Schwalbe', lvl: 2, cost: 20, cd: 25, range: 0, desc: 'Laat je theatraal vallen: 2,5 seconden onkwetsbaar en 15% HP terug.' },
      { id: 'hogebal', name: 'Hoge bal', lvl: 4, cost: 25, cd: 10, range: 22, k: 1.1, aoe: 4, shot: 'lob', desc: 'Een hoge bal die alles rond je doelwit raakt.' },
      { id: 'penalty', name: 'Penalty', lvl: 6, cost: 45, cd: 40, range: 22, k: 3.0, shot: 'bal', desc: 'Vanaf elf meter. Enorme schade.' },
    ],
  },
  kroegtijger: {
    name: 'Kroegtijger', col: '#f2c22e', desc: 'Geneest zichzelf met rondjes en laat vijanden dansen.',
    abil: [
      { id: 'viltje', name: 'Bierviltje', lvl: 1, cost: 8, cd: 0, range: 20, k: 0.9, shot: 'viltje', desc: 'Gooi een bierviltje als een frisbee.' },
      { id: 'rondje', name: 'Rondje geven', lvl: 1, cost: 25, cd: 8, range: 0, desc: 'Herstel 30% van je HP. Proost.' },
      { id: 'kruk', name: 'Barkruk', lvl: 2, cost: 15, cd: 10, range: 3.2, k: 1.3, desc: 'Een barkruk tegen zijn hoofd. 1,5 seconde verdoofd.' },
      { id: 'polonaise', name: 'Polonaise', lvl: 4, cost: 30, cd: 30, range: 0, aoe: 10, desc: 'Alle vijanden binnen 10 meter dansen 4 seconden mee en doen niks.' },
      { id: 'laatste', name: 'Laatste ronde', lvl: 6, cost: 40, cd: 60, range: 0, desc: 'HP helemaal vol en 8 seconden +40% schade. Dronken moed.' },
    ],
  },
  havenwerker: {
    name: 'Havenwerker', col: '#e8b030', desc: 'Uit Delfzijl. Zwaar gebouwd (25% minder schade), trekt vijanden naar zich toe.',
    abil: [
      { id: 'haak', name: 'Haak', lvl: 1, cost: 5, cd: 0, range: 3.4, k: 1.1, desc: 'Een flinke haal met je bootshaak.' },
      { id: 'harpoen', name: 'Harpoen', lvl: 1, cost: 15, cd: 10, range: 20, k: 0.8, shot: 'harpoen', desc: 'Schiet een harpoen en trek je doelwit naar je toe.' },
      { id: 'anker', name: 'Anker gooien', lvl: 2, cost: 20, cd: 8, range: 15, k: 1.6, shot: 'anker', desc: 'Zwaar. Je doelwit is 4 seconden twee keer zo traag.' },
      { id: 'hoorn', name: 'Scheepshoorn', lvl: 4, cost: 25, cd: 20, range: 0, aoe: 8, k: 0.5, desc: 'Iedereen binnen 8 meter is 2,5 seconden verdoofd.' },
      { id: 'storm', name: 'Stormvloed', lvl: 6, cost: 40, cd: 50, range: 0, aoe: 10, k: 2.0, cone: true, desc: 'Een golf Eemswater recht voor je uit. Spoelt alles weg.' },
    ],
  },
};
const CLASS_KEYS = Object.keys(CLASSES);

// paashaasoren en het dak van het dorpshuis staan in story3.js; hier de buit-tabellen
const LOOT_SNACKS = ['krentenbol', 'energiedrank', 'rookworst', 'chocomel'];

const CB = {
  mobs: [], shots: [], fx: [], target: null, gcd: 0, cds: {}, swing: 0, combatT: 0, buffs: {}, neven: [], story: null, loot: null,
  ring: null, edMax: 100,

  // ---------- class en stats ----------
  cls() { const ap = G.S && G.S.ap; const k = ap && CLASS_KEYS[ap.cl]; return k ? CLASSES[k] : null; },
  clsKey() { const ap = G.S && G.S.ap; return ap && CLASS_KEYS[ap.cl]; },
  atk() { const P = G.P, w = P.wpn && WEAPONS[P.wpn]; return P.atk + (w ? w.atk : 0) + clothBonus(P).atk; },
  def() { return G.P.def + clothBonus(G.P).def; },
  fixEnergy() { const P = G.P; const want = 100 + 5 * (P.lvl - 1); if (P.maxEp !== want) { P.maxEp = want; P.ep = Math.min(P.ep, want); } },
  inCombat() { return this.mobs.some((m) => this.chasesMe(m)); },
  // jagen ze op jou (en niet op een andere speler)?
  chasesMe(v) { return v.state === 'chase' && (!v.tgt || v.tgt === NET.myShort()); },
  // vijanden die iedereen in het gebied ziet (verhaalgevechten en de kleedkamer blijven van jezelf)
  shared(v) { return !v.story && !v.brawl; },

  // ---------- vijanden ----------
  makeMob(id, x, z, opts = {}) {
    const E = ENEMIES[id], P = G.P;
    const boost = E.boss ? 0 : Math.max(0, P.lvl - 1);
    const maxHp = Math.round((E.hp + boost * 6) * (opts.story ? 3.2 : 3.0));
    const g = E3.enemyFigure(id);
    E3.scene.add(g);
    const mob = {
      id, E, name: E.name, lvl: Math.max(1, P.lvl + (E.dz ? 3 : 0) + (E.boss ? 1 : 0) - (E.dz || E.boss ? 0 : 1)), hp: maxHp, maxHp,
      atk: E.atk + boost, def: E.def || 0, x, z, sx: x, sz: z, tx: x, tz: z, wait: 1, state: 'idle', g, atkT: 1, blowT: 4 + Math.random() * 4,
      st: {}, story: !!opts.story, npc: opts.npc || null, lostT: 0, nid: opts.nid || NET.newId(),
    };
    mob.plate = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(makeCanvas(128, 28, () => {})), depthTest: false, transparent: true }));
    mob.plate.scale.set(1.6, 0.35, 1); mob.plate.position.y = (E.dz ? 2.1 : 2.25) / g.scale.y; mob.plate.renderOrder = 11;
    g.add(mob.plate);
    this.paintPlate(mob);
    this.mobs.push(mob);
    return mob;
  },
  paintPlate(mob) {
    if (!mob.plate) return;
    const tex = mob.plate.material.map, c = tex.image, x = c.getContext('2d');
    x.clearRect(0, 0, 128, 28);
    x.font = '12px Silkscreen, monospace'; x.textAlign = 'center'; x.textBaseline = 'top';
    const hostile = mob.state === 'chase' || mob === this.target;
    x.fillStyle = 'rgba(0,0,0,.6)'; x.fillText(`${mob.lvl} ${mob.name}`.slice(0, 22), 65, 1);
    x.fillStyle = hostile ? '#ff6a5a' : '#f2c22e'; x.fillText(`${mob.lvl} ${mob.name}`.slice(0, 22), 64, 0);
    x.fillStyle = '#000'; x.fillRect(14, 16, 100, 9);
    x.fillStyle = (mob.hst || mob.st).dot > 0 ? '#9ad040' : '#d83a2e'; x.fillRect(15, 17, Math.max(0, 98 * mob.hp / mob.maxHp), 7);
    tex.needsUpdate = true;
    mob.plate.visible = mob.state !== 'dead';
  },
  spawnVapers(dt) {
    const m = G.map;
    if (!m.encounters || !G.flags.intro || !NET.host) return;
    const pool = m.pool || RANDOM_POOL;
    const want = m.id === 'delfzijl' || m.pvp ? 7 : m.id === 'dorp' ? 5 : 4;
    E3.vaperTimer -= dt;
    // vijanden komen vanzelf terug in het gras, buiten je zicht
    const alive = this.mobs.filter((v) => this.shared(v) && v.state !== 'dead').length;
    if (alive < want && E3.vaperTimer <= 0) {
      E3.vaperTimer = alive < want - 2 ? 1 : m.id === 'delfzijl' || m.pvp ? 4 : 6;
      const tall = [];
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.tiles[y][x] === 'tall' && E3.w(Math.hypot(x + 0.5 - E3.pos.x, y + 0.5 - E3.pos.z)) > 24) tall.push([x, y]);
      if (tall.length) {
        const [x, y] = tall[Math.floor(Math.random() * tall.length)];
        this.makeMob(pool[Math.floor(Math.random() * pool.length)], x + 0.5, y + 0.5);
      }
    }
  },
  clear() {
    for (const v of this.mobs) E3.scene.remove(v.g);
    for (const s of this.shots) E3.scene.remove(s.o);
    for (const f of this.fx) E3.scene.remove(f.o);
    for (const n of this.neven) E3.scene.remove(n.g);
    this.mobs = []; this.shots = []; this.fx = []; this.neven = []; this.setTarget(null);
    if (this.story) { const s = this.story; this.story = null; s.resolve('fled'); }
    if (this.brawlP) { const b = this.brawlP; this.brawlP = null; b.resolve('fled'); }
    this.closeLoot();
  },
  mobFree(x, z) { const t = tileAt(G.map, Math.floor(x), Math.floor(z)); return (TILE_DEF[t] || {}).walk && !(G.propAt(Math.floor(x), Math.floor(z)) || {}).solid; },
  // afstand in meters van speler tot vijand
  dist(mob) { return E3.w(Math.hypot(mob.x - E3.pos.x, mob.z - E3.pos.z)); },

  // wie kan een vijand aanvallen: jij, en bij gedeelde vijanden ook de anderen in dit gebied
  players() {
    const out = [], me = NET.myShort();
    const meC = { id: me, me: true, x: E3.pos.x, z: E3.pos.z, above: E3.fy - E3.ground(E3.pos.x, E3.pos.z) > 0.6 };
    const ok = G.mode === 'map' && !this.dying;
    if (ok && !(this.buffs.damp > 0)) out.push(meC);
    const peers = [];
    for (const p of NET.here()) {
      const s = p.presence;
      if (!(Number(s.hp) > 0) || s.dp) continue;
      const e = E3.peers[p.peer], q = e ? { x: e.x, z: e.z } : E3.peerPos(p);
      peers.push({ id: NET.short(p.peer), me: false, peer: p.peer, x: q.x, z: q.z, above: typeof s.fy === 'number' && s.fy - E3.ground(q.x, q.z) > 0.6 });
    }
    return { all: out.concat(peers), mine: out, story: ok ? [meC] : [] };
  },
  nearest(cands, v) {
    let best = null;
    for (const c of cands) { const d = E3.w(Math.hypot(c.x - v.x, c.z - v.z)); if (!best || d < best.d) best = { c, d }; }
    return best;
  },
  updateMobs(dt) {
    const S = E3.S;
    const P3 = this.players();
    for (const v of this.mobs) {
      const st = v.st;
      if (!v.remote) for (const k of Object.keys(st)) if (k !== 'dps' && st[k] > 0) st[k] = Math.max(0, st[k] - dt);
      if (v.state === 'dead') {
        v.deadT += dt;
        v.g.rotation.x = Math.max(-Math.PI / 2, v.g.rotation.x - dt * 5);
        v.g.position.y = Math.max(0.12, 0.12 + (1 + v.g.rotation.x / (Math.PI / 2)) * 0.3);
        if (v.glint) { v.glint.visible = !!(v.loot && v.loot.length); v.glint.material.opacity = 0.6 + Math.sin(E3.t * 5) * 0.4; }
        continue;
      }
      // vijanden van een andere speler: die bewegen zoals hij ze ziet
      if (v.remote) { NET.step(v, dt); continue; }
      // schade over tijd
      if (st.dot > 0) {
        v.dotTick = (v.dotTick || 0) + dt;
        if (v.dotTick >= 1) { v.dotTick -= 1; this.hurtMob(v, st.dps, { quiet: true, dot: true, col: '#b8f070' }); if (v.state === 'dead') continue; }
      }
      // op wie jaagt hij?
      const cands = v.story ? P3.story : this.shared(v) ? P3.all : P3.mine;
      let T = null;
      if (v.state === 'chase') {
        T = cands.find((c) => c.id === (v.tgt || NET.myShort())) || null;
        if (!T) { const n = this.nearest(cands, v); if (n && n.d < 12) { v.tgt = n.c.id; T = n.c; } else { v.state = 'return'; this.paintPlate(v); } }
      }
      const near = T ? { c: T, d: E3.w(Math.hypot(T.x - v.x, T.z - v.z)) } : this.nearest(cands, v);
      const d = near ? near.d : 999, F = near && near.c;
      const busy = st.stun > 0 || st.dance > 0;
      // aggro
      if (v.state === 'idle' && F && d < (v.E.dz ? 9 : 7)) { this.aggro(v, F.id); T = F; }
      let mv = false;
      const speedM = (v.E.dz ? 3.6 : 3.0) * (st.slow > 0 ? 0.5 : 1);
      if (st.dance > 0) {
        // polonaise: hij danst achter je aan
        v.g.rotation.y += dt * 6;
        if (F && d > 2.5) { const a = Math.atan2(F.x - v.x, F.z - v.z); this.step(v, Math.sin(a), Math.cos(a), 2 * dt / S); mv = true; }
      } else if (v.state === 'chase' && !busy && T) {
        const reach = 1.9;
        const a = Math.atan2(T.x - v.x, T.z - v.z);
        v.g.rotation.y = a;
        if (d > reach) { mv = this.step(v, Math.sin(a), Math.cos(a), speedM * dt / S); }
        // kan hij je niet bereiken (je staat op een dak)? dan geeft hij het na een tijdje op
        const above = T.above;
        v.lostT = (d > reach + 0.5 && (!mv || above)) || E3.w(Math.hypot(v.sx - T.x, v.sz - T.z)) > 40 ? v.lostT + dt : 0;
        if (v.lostT > (v.story ? 99 : 6)) { v.state = 'return'; this.paintPlate(v); }
        v.atkT -= dt; v.blowT -= dt;
        if (d <= reach + 0.4 && v.atkT <= 0 && !above) {
          v.atkT = (v.E.dz ? 2.3 : 2.7) * (0.9 + Math.random() * 0.2);
          if (T.me) this.mobHit(v); else { v.swingT = 0.3; NET.attack(v, T, v.atk * (0.85 + Math.random() * 0.3)); }
        } else if (v.E.vaper && v.blowT <= 0 && d < 8) { v.blowT = 10 + Math.random() * 5; this.mobBlow(v, T, d); }
      } else if (v.state === 'return') {
        const dx = v.sx - v.x, dz = v.sz - v.z, l = Math.hypot(dx, dz);
        v.hp = Math.min(v.maxHp, v.hp + v.maxHp * dt * 0.3);
        if (l < 0.1) { v.state = 'idle'; v.hp = v.maxHp; st.dot = 0; this.paintPlate(v); }
        else { v.x += dx / l * Math.min(l, 4 * dt / S); v.z += dz / l * Math.min(l, 4 * dt / S); v.g.rotation.y = Math.atan2(dx, dz); mv = true; }
        if (v.hp >= v.maxHp - 1) this.paintPlate(v);
      } else if (v.state === 'idle') {
        // rondhangen in het gras
        v.wait -= dt;
        if (v.wait <= 0 && Math.hypot(v.tx - v.x, v.tz - v.z) < 0.05) {
          v.wait = 1 + Math.random() * 3;
          const cx = Math.floor(v.x), cy = Math.floor(v.z);
          const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [cx + a, cy + b]).filter(([a, b]) => tileAt(G.map, a, b) === 'tall');
          if (opts.length && !v.story) { const [a, b] = opts[Math.floor(Math.random() * opts.length)]; v.tx = a + 0.5; v.tz = b + 0.5; }
        }
        const mx = v.tx - v.x, mz = v.tz - v.z, ml = Math.hypot(mx, mz);
        if (ml > 0.02) { const s = Math.min(ml, dt * 0.9 / S); v.x += mx / ml * s; v.z += mz / ml * s; v.g.rotation.y = Math.atan2(mx, mz); mv = true; }
        if (F && d < 8) v.g.rotation.y = Math.atan2(F.x - v.x, F.z - v.z);
      }
      v.g.position.set(E3.w(v.x), E3.ground(v.x, v.z), E3.w(v.z));
      animateFigure(v.g, E3.t, mv);
      if (v.g.userData.cloud) animateCloud(v.g.userData.cloud, E3.t);
      if (busy) { v.g.rotation.z = st.stun > 0 ? Math.sin(E3.t * 10) * 0.08 : 0; } else v.g.rotation.z = 0;
    }
    // lijken opruimen
    for (const v of this.mobs.filter((v) => v.state === 'dead' && (v.deadT > 120 || (v.deadT > (v.story ? 1.5 : 15) && !(v.loot && v.loot.length))))) { E3.scene.remove(v.g); if (this.loot && this.loot.mob === v) this.closeLoot(); }
    this.mobs = this.mobs.filter((v) => !(v.state === 'dead' && (v.deadT > 120 || (v.deadT > (v.story ? 1.5 : 15) && !(v.loot && v.loot.length)))));
  },
  removeMob(v) {
    E3.scene.remove(v.g);
    if (this.target === v) this.setTarget(null);
    if (this.loot && this.loot.mob === v) this.closeLoot();
    this.mobs = this.mobs.filter((m) => m !== v);
  },
  step(v, sx, sz, len) {
    const nx = v.x + sx * len, nz = v.z + sz * len;
    let moved = false;
    if (this.mobFree(nx, v.z)) { v.x = nx; moved = true; }
    if (this.mobFree(v.x, nz)) { v.z = nz; moved = true; }
    return moved;
  },
  // who: de speler op wie hij afkomt (leeg = jij)
  aggro(v, who) {
    if (v.state === 'dead') return;
    const mine = !who || who === NET.myShort();
    // een vijand van de gastheer: die beslist zelf op wie hij afkomt
    if (v.remote) { if (mine && (!this.target || this.target.state === 'dead')) this.setTarget(v); return; }
    if (v.state !== 'chase') { v.state = 'chase'; v.atkT = 0.8; v.lostT = 0; v.tgt = who || NET.myShort(); if (mine) SFX.tone(150, 0.15, 'sawtooth', 0.04, 60); }
    if (mine) {
      if (!this.target || this.target.state === 'dead') this.setTarget(v);
      this.combatT = 0;
    }
    this.paintPlate(v);
  },

  // ---------- jij raakt hen ----------
  power(k) {
    const P = G.P;
    let n = (this.atk() * 1.0 + 3 + P.lvl * 1.2) * k * (0.9 + Math.random() * 0.2);
    if (this.buffs.moed > 0) n *= 1.4;
    if (this.buffs.dampBonus) { n *= 1.5; this.buffs.dampBonus = false; }
    const crit = Math.random() < 0.1 + stoerNow(P) * 0.01;
    return { n: crit ? n * 1.6 : n, crit };
  },
  // vijanden: rondlopers, en in de wildernis ook andere spelers
  foes() { return this.mobs.concat(PV.targets()); },
  hurtMob(v, n, o = {}) {
    if (v.state === 'dead') return;
    if (v.isPeer) {
      const dmg = Math.max(1, Math.round(n));
      PV.sendHit(v.peer, dmg);
      this.floatText(o.crit ? `${dmg}!` : String(dmg), new THREE.Vector3(E3.w(v.x), 2.0, E3.w(v.z)), o.crit ? '#ffd25a' : '#ff8a7a', o.crit ? 1.5 : 1);
      SFX.hit();
      return;
    }
    const dmg = Math.max(1, Math.round(n - (o.quiet ? 0 : v.def * 0.6)));
    // een vijand van de gastheer: de klap gaat naar hem, en hier zie je hem alvast (hij sterft pas als de gastheer het zegt)
    if (v.remote) {
      NET.hit(v, dmg);
      v.hitByMe = true;
      v.hp = Math.max(1, v.hp - dmg); v.predT = 1.2;
      this.floatText(o.crit ? `${dmg}!` : String(dmg), new THREE.Vector3(E3.w(v.x), 2.0 + Math.random() * 0.3, E3.w(v.z)), o.crit ? '#ffd25a' : '#f4f1ea', o.crit ? 1.5 : 1);
      SFX.hit();
      this.aggro(v);
      this.combatT = 0;
      this.paintPlate(v);
      return;
    }
    if (!o.dot) v.hitByMe = true;
    v.hp -= dmg;
    this.floatText(o.crit ? `${dmg}!` : String(dmg), new THREE.Vector3(E3.w(v.x), (o.quiet ? 1.6 : 2.0) + Math.random() * 0.3, E3.w(v.z)), o.col || (o.crit ? '#ffd25a' : '#f4f1ea'), o.crit ? 1.5 : 1);
    if (!o.quiet) { v.hitT = 0.15; SFX.hit(); }
    if (v.hp <= 0) { this.killMob(v); return; }
    if (v.state !== 'chase') this.aggro(v);
    this.paintPlate(v);
  },
  killMob(v) {
    v.hp = 0; v.state = 'dead'; v.deadT = 0; v.st = {};
    if (v.g.userData.cloud) v.g.userData.cloud.visible = false;
    this.paintPlate(v);
    if (this.target === v) this.setTarget(null);
    SFX.tone(330, 0.3, 'triangle', 0.05, -200);
    const P = G.P, E = v.E;
    // alleen wie meesloeg krijgt XP en buit (iedereen zijn eigen buit)
    if (!(v.hitByMe || v.story || v.brawl)) { v.loot = []; return; }
    // XP meteen, de rest ligt op het lijk
    const xp = xpFor(E.xp);
    P.xp += xp;
    this.floatText(`+${xp} XP`, new THREE.Vector3(E3.w(v.x), 2.4, E3.w(v.z)), '#c8a0ff', 1.1);
    this.checkLevel();
    v.loot = this.rollLoot(v);
    // verhaaltegenstanders blijven niet liggen: hun buit krijg je meteen
    if (v.story) { for (const l of v.loot) { if (l.kind === 'geld') P.money += l.n; else if (l.kind === 'wapen') giveWeapon(l.id, true); else G.give(l.id, l.n, true); } if (v.loot.length) UI.toast(`Buit: ${v.loot.map((l) => this.lootName(l)).join(', ')}`, 2600); v.loot = []; }
    v.glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: W3.tex(PUFF_CANVAS), color: 0xffe080, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    v.glint.scale.set(0.9, 0.9, 1); v.glint.position.set(0, 0.5, 0.6);
    v.g.add(v.glint);
    if (v.story && this.story) { const s = this.story; this.story = null; G.busy = true; s.resolve('win'); }
  },
  // gastheer: een andere speler raakt een van onze vijanden
  netHit(v, h, p) {
    if (v.state === 'dead') return;
    const n = (x, max) => Math.max(0, Math.min(max, Number(x) || 0));
    const e = h.e && typeof h.e === 'object' ? h.e : null;
    if (e) {
      if (e.stun) v.st.stun = Math.max(v.st.stun || 0, n(e.stun, 5));
      if (e.slow) v.st.slow = Math.max(v.st.slow || 0, n(e.slow, 8));
      if (e.dance) v.st.dance = Math.max(v.st.dance || 0, n(e.dance, 6));
      if (e.dot) { v.st.dot = n(e.dot, 12); v.st.dps = n(e.dps, 999); }
      if (Array.isArray(e.p) && Math.hypot(n(e.p[0], 999) - v.x, n(e.p[1], 999) - v.z) < 6 && this.mobFree(+e.p[0], +e.p[1])) { v.x = +e.p[0]; v.z = +e.p[1]; }
    }
    const d = n(h.d, 5000);
    if (d > 0) {
      v.hp -= d; v.hitT = 0.15;
      this.floatText(String(Math.round(d)), new THREE.Vector3(E3.w(v.x), 2.0 + Math.random() * 0.3, E3.w(v.z)), '#8ac8ff', 0.8);
      if (v.hp <= 0) { this.killMob(v); return; }
    }
    if (v.state !== 'chase') this.aggro(v, NET.short(p.peer));
    this.paintPlate(v);
  },
  rollLoot(v) {
    const E = v.E, P = G.P, L = [];
    const money = Math.round(E.money * (0.8 + Math.random() * 0.5));
    if (money) L.push({ kind: 'geld', n: money });
    if (E.vaper) {
      if (E.dz && Math.random() < 0.35) L.push({ kind: 'item', id: 'gouden_vape', n: 1 });
      else if (Math.random() < 0.55) L.push({ kind: 'item', id: 'vape', n: 1 });
    }
    if (E.drop && WEAPONS[E.drop] && !(P.weapons || []).includes(E.drop) && Math.random() < 0.35) L.push({ kind: 'wapen', id: E.drop });
    const rare = RARE_DROP[v.id];
    if (rare && CLOTHES[rare] && Math.random() < (E.rareChance || 0.03) * 1.5) L.push({ kind: 'item', id: rare, n: 1, rare: true });
    if (Math.random() < (E.dz ? 0.5 : 0.3)) L.push({ kind: 'item', id: E.dz ? pick(['frikandel_speciaal', 'kroket', 'patatje_oorlog', 'energiedrank']) : pick(LOOT_SNACKS), n: 1 });
    return L.filter((l) => l.kind !== 'item' || ITEMS[l.id]);
  },
  checkLevel() {
    const P = G.P, c = this.cls();
    while (P.xp >= P.next) {
      P.xp -= P.next;
      levelUp(P); this.fixEnergy(); P.ep = P.maxEp;
      SFX.item();
      const nieuw = c && c.abil.find((a) => a.lvl === P.lvl);
      UI.toast(`LEVEL ${P.lvl}!${nieuw ? ` Nieuwe ability: ${nieuw.name} (toets ${c.abil.indexOf(nieuw) + 1})` : ''}`, 3200);
      E3.flash();
    }
  },

  // ---------- zij raken jou ----------
  mobHit(v) {
    const t = pick(v.E.moves || ['slaat je']);
    const knife = v.E.knife;
    v.g.userData.arms && (v.swingT = 0.3);
    this.hurtMe(v.atk * (0.85 + Math.random() * 0.3), knife ? '#ff4a3a' : '#ff8a6a', `${v.name} heeft je ${knife ? 'neergestoken' : 'neergeslagen'}.`);
    if (v.E.inflict && Math.random() < v.E.inflict.ch * 0.5) { this.buffs.misselijk = 5; UI.toast(v.E.inflict.t, 2000); }
    if (Math.random() < 0.15) UI.toast(`${v.name} ${t}.`, 1800);
  },
  mobBlow(v, T, d) {
    // vaper blaast een wolk in je gezicht: beetje schade en misselijk
    const from = new THREE.Vector3(E3.w(v.x), 1.5, E3.w(v.z));
    const k = v.E.cloudScale || 1;
    for (let i = 0; i < 3; i++) E3.puff(new THREE.Color(v.E.cloud || '#ffffff').getHex(), 4, from.clone(), { size: 0.5 * k, up: 0.3, life: 2.5, grow: 3 });
    if (T && !T.me) { if (d < 6) NET.attack(v, T, v.atk * 0.4, true); return; }
    if (this.dist(v) < 6) {
      this.hurtMe(v.atk * 0.4, '#b8f070', `${v.name} heeft je weggeblazen.`);
      this.buffs.misselijk = Math.max(this.buffs.misselijk || 0, 3);
      const hz = $('#haze'); hz.classList.remove('on'); void hz.offsetWidth; hz.classList.add('on');
    }
  },
  hurtMe(n, col, cause) {
    if (this.buffs.immune > 0 || G.mode !== 'map' || this.dying) return;
    PV.dismount();
    const cls = this.clsKey();
    const red = cls === 'havenwerker' ? 0.75 : cls === 'voetballer' ? 0.85 : 1;
    // tempo: alles wat jou raakt doet ruim de helft van wat het vroeger deed
    const dmg = Math.max(1, Math.round((n - this.def() * 0.5) * red * 0.55));
    const P = G.P;
    P.hp = Math.max(0, P.hp - dmg);
    this.combatT = 0;
    E3.hurtT = 0.35;
    this.floatText(`-${dmg}`, E3.eyePos().add(E3.forward().multiplyScalar(2.6)).add(new THREE.Vector3(0, -0.7, 0)), col || '#ff6a5a', 0.6);
    if (P.hp <= 0) this.die(cause, !!cause && G.map.pvp);
  },
  // HARDCORE: doodgaan is permadeath. Je spullen blijven liggen, je wordt wakker in Delfzicht op level 1.
  async die(cause, byPlayer) {
    if (this.dying) return;
    this.dying = true;
    SFX.lose();
    for (const v of this.mobs) if (!v.remote && this.chasesMe(v)) { v.state = 'return'; this.paintPlate(v); }
    this.setTarget(null);
    PV.dismount();
    if (byPlayer && this.lastAttacker) PV.killedBy = { to: this.lastAttacker, s: Date.now() };
    const story = this.story; this.story = null;
    const brawl = this.brawlP; this.brawlP = null;
    if (story) { for (const v of this.mobs.filter((m) => m.story)) E3.scene.remove(v.g); this.mobs = this.mobs.filter((m) => !m.story); E3.hideNpc = null; }
    this.closeLoot();
    G.busy = true;
    await hardcoreDeath(cause || 'Je gaat neer. Alles wordt zwart.');
    this.buffs = {}; this.cds = {};
    this.dying = false;
    if (story) story.resolve('lose');
    if (brawl) brawl.resolve('lose');
    _abarKey = '';
    await chooseClass(true);
  },

  // ---------- abilities gebruiken ----------
  ready(i) {
    const c = this.cls(); if (!c) return 'geen';
    const a = c.abil[i]; if (!a) return 'geen';
    if (G.P.lvl < a.lvl) return `Pas op level ${a.lvl}`;
    if ((this.cds[a.id] || 0) > 0 || (a.cd === 0 && this.gcd > 0) || this.gcd > 0) return 'wacht';
    if (G.P.ep < a.cost) return 'Te weinig Energydrink';
    return '';
  },
  use(i) {
    if (G.mode !== 'map' || G.busy || UI.focus || this.dying) return;
    const c = this.cls(); if (!c) return;
    const a = c.abil[i]; if (!a) return;
    const why = this.ready(i);
    if (why === 'wacht') return;
    if (why) { this.err(why); return; }
    let t = this.target && this.target.state !== 'dead' ? this.target : null;
    if (a.range > 0 && !a.cone) {
      if (!t) { t = this.autoTarget(a.range); if (!t) { this.err('Je hebt geen doelwit (klik op een vijand of druk Tab)'); return; } }
      if (this.dist(t) > a.range) { this.err('Te ver weg'); return; }
      if (this.facing(t) > 1.6) { this.err('Je moet je doelwit aankijken'); return; }
    }
    if (E3.seat) E3.standUp();
    PV.dismount();
    G.P.ep -= a.cost;
    this.gcd = 1.5;
    if (a.cd) this.cds[a.id] = a.cd;
    if (this.buffs.damp > 0) { this.buffs.damp = 0; this.buffs.dampBonus = true; }
    this.autoOn = true;
    this.combatT = 0;
    E3.swingT = 0.35;
    flashSlot(i);
    this.effect(a, t);
  },
  err(t) { if (performance.now() - (this.errT || 0) > 700) { this.errT = performance.now(); UI.toast(t, 1300); SFX.no(); } },
  facing(t) {
    const fx = -Math.sin(E3.yaw), fz = -Math.cos(E3.yaw), dx = t.x - E3.pos.x, dz = t.z - E3.pos.z, d = Math.hypot(dx, dz) || 1;
    return Math.acos(Math.max(-1, Math.min(1, (dx * fx + dz * fz) / d)));
  },
  autoTarget(range) {
    let best = null;
    for (const v of this.foes()) if (v.state !== 'dead' && this.dist(v) <= range && this.facing(v) < 0.8) { const s = this.dist(v) + this.facing(v) * 8; if (!best || s < best.s) best = { v, s }; }
    if (best) this.setTarget(best.v);
    return best && best.v;
  },
  hitT(t, a, extra = 1) { const p = this.power(a.k * extra); this.hurtMob(t, p.n, { crit: p.crit }); return p; },
  around(cx, cz, r) { return this.foes().filter((v) => v.state !== 'dead' && E3.w(Math.hypot(v.x - cx, v.z - cz)) <= r); },
  inCone(range) { return this.foes().filter((v) => v.state !== 'dead' && this.dist(v) <= range && this.facing(v) < 0.6); },
  effect(a, t) {
    const me = E3.eyePos(), P = G.P;
    const hand = me.clone().add(E3.forward().multiplyScalar(0.5)).add(new THREE.Vector3(0, -0.35, 0));
    const shoot = (kind, onHit, speed = 22) => this.shoot(kind, hand, t, onHit, speed);
    switch (a.id) {
      // Vaper
      case 'rookring': E3.puff(0xffffff, 4); shoot('ring', () => this.hitT(t, a), 14); SFX.tone(140, 0.3, 'sawtooth', 0.03, -40); break;
      case 'wolk': shoot('puff', () => { this.hitT(t, a); t.st.dot = a.dot; t.st.dps = this.power(a.k).n; this.paintPlate(t); this.cloudAt(t, 0xc8f070, 1.2); }, 9); E3.puff(0xc8f070, 10); break;
      case 'blast': E3.puff(0xffd9a0, 30); for (const v of this.inCone(a.range)) this.hitT(v, a); SFX.tone(90, 0.5, 'sawtooth', 0.04, -30); break;
      case 'damp': this.buffs.damp = 5; E3.puff(0xffffff, 40); for (const v of this.mobs) if (!v.remote && this.chasesMe(v) && !v.story) { v.state = 'return'; this.paintPlate(v); } UI.toast('Je verdwijnt in een wolk mango.', 1600); break;
      case 'chaser': shoot('puff', () => { this.cloudAt(t, 0xc8a0ff, 4); for (const v of this.around(t.x, t.z, a.aoe)) { this.hitT(v, a); if (v.state !== 'dead') { v.st.dot = a.dot; v.st.dps = this.power(0.3).n; } } this.shock(t.x, t.z, a.aoe, 0xc8a0ff); }, 10); E3.puff(0xc8a0ff, 30); break;
      // Crimineel
      case 'buks': shoot('kogel', () => this.hitT(t, a), 45); SFX.tone(900, 0.06, 'square', 0.05, -700); E3.flash(); break;
      case 'zakken': { this.hitT(t, a); if (!t.robbed) { t.robbed = true; const eur = 2 + Math.floor(Math.random() * 6); P.money += eur; this.floatText(`+EUR ${eur}`, new THREE.Vector3(E3.w(t.x), 2.2, E3.w(t.z)), '#ffd25a'); } P.ep = Math.min(P.maxEp, P.ep + 15); break; }
      case 'rug': { const sneaky = t.state !== 'chase' || this.facingMob(t) > 1.6; this.hitT(t, a, sneaky ? 2 : 1); if (sneaky) UI.toast('In de rug!', 1000); break; }
      case 'scooter': this.buffs.speed = 5; SFX.tone(70, 0.6, 'sawtooth', 0.04, 60); UI.toast('Vroem.', 1000); break;
      case 'neven': this.callNeven(); break;
      // Voetballer
      case 'bal': shoot('bal', () => this.hitT(t, a), 26); SFX.tone(180, 0.08, 'square', 0.06, -100); break;
      case 'penalty': shoot('bal', () => { this.hitT(t, a); this.shock(t.x, t.z, 2, 0xffffff); }, 34); SFX.tone(140, 0.12, 'square', 0.08, -100); UI.toast('GOAL?!', 900); break;
      case 'sliding': this.slide(t, a); break;
      case 'schwalbe': this.buffs.immune = 2.5; P.hp = Math.min(P.maxHp, P.hp + Math.round(P.maxHp * 0.15)); E3.fallT = 1.2; SFX.heal(); UI.toast(pick(['AAAAAH! Scheidsrechter!', 'Je rolt drie keer om je as.', 'Kaart! KAART!']), 1500); break;
      case 'hogebal': shoot('lob', () => { for (const v of this.around(t.x, t.z, a.aoe)) this.hitT(v, a); this.shock(t.x, t.z, a.aoe, 0xffffff); }, 14); break;
      // Kroegtijger
      case 'viltje': shoot('viltje', () => this.hitT(t, a), 20); break;
      case 'rondje': P.hp = Math.min(P.maxHp, P.hp + Math.round(P.maxHp * 0.3)); SFX.heal(); this.floatText('Proost!', me.clone().add(E3.forward().multiplyScalar(1.5)), '#7ad46a'); break;
      case 'kruk': this.hitT(t, a); if (t.state !== 'dead') t.st.stun = 1.5; this.paintPlate(t); break;
      case 'polonaise': { const hit = this.around(E3.pos.x, E3.pos.z, a.aoe); for (const v of hit) { v.st.dance = 4; this.aggro(v); } UI.toast(hit.length ? 'En we gaan nog niet naar huis!' : 'Je danst alleen. Niemand doet mee.', 1800); [392, 440, 392, 330].forEach((f, i) => setTimeout(() => SFX.tone(f, 0.15, 'square', 0.04), i * 160)); break; }
      case 'laatste': P.hp = P.maxHp; this.buffs.moed = 8; SFX.heal(); UI.toast('Laatste ronde! Dronken moed.', 1600); break;
      // Havenwerker
      case 'haak': this.hitT(t, a); break;
      case 'harpoen': shoot('harpoen', () => { this.hitT(t, a); if (t.state !== 'dead') this.pull(t); }, 28); break;
      case 'anker': shoot('anker', () => { this.hitT(t, a); if (t.state !== 'dead') t.st.slow = 4; }, 16); break;
      case 'hoorn': { for (const v of this.around(E3.pos.x, E3.pos.z, a.aoe)) { this.hitT(v, a); if (v.state !== 'dead') v.st.stun = 2.5; } this.shock(E3.pos.x, E3.pos.z, a.aoe, 0xe8b030); SFX.tone(80, 1.0, 'sawtooth', 0.08, 0); break; }
      case 'storm': { for (const v of this.inCone(a.aoe)) { this.hitT(v, a); if (v.state !== 'dead') this.knock(v, 3); } this.wave(); break; }
    }
  },
  facingMob(v) { if (!v.g) return 0; const fx = Math.sin(v.g.rotation.y), fz = Math.cos(v.g.rotation.y), dx = E3.pos.x - v.x, dz = E3.pos.z - v.z, d = Math.hypot(dx, dz) || 1; return Math.acos(Math.max(-1, Math.min(1, (dx * fx + dz * fz) / d))); },
  slide(t, a) {
    // naar het doelwit glijden, tot net ervoor
    const dx = t.x - E3.pos.x, dz = t.z - E3.pos.z, d = Math.hypot(dx, dz), stop = 1.4 / E3.S;
    let k = 0;
    const steps = 20;
    for (let i = 0; i < steps; i++) { const nx = E3.pos.x + dx / d * (d - stop) / steps, nz = E3.pos.z + dz / d * (d - stop) / steps; if (!E3.free(nx, nz)) break; E3.pos.x = nx; E3.pos.z = nz; k++; }
    E3.slideT = 0.4;
    SFX.tone(200, 0.3, 'noise' in SFX ? 'square' : 'sawtooth', 0.04, -150);
    if (this.dist(t) < 3.5) { this.hitT(t, a); if (t.state !== 'dead') t.st.stun = 2; this.paintPlate(t); }
  },
  pull(t) { const dx = E3.pos.x - t.x, dz = E3.pos.z - t.z, d = Math.hypot(dx, dz), want = d - 1.6 / E3.S; for (let i = 0; i < 20; i++) if (!this.step(t, dx / d, dz / d, want / 20)) break; this.moved(t); },
  knock(v, m) { const dx = v.x - E3.pos.x, dz = v.z - E3.pos.z, d = Math.hypot(dx, dz) || 1; for (let i = 0; i < 10; i++) if (!this.step(v, dx / d, dz / d, m / E3.S / 10)) break; v.st.stun = Math.max(v.st.stun || 0, 1); this.moved(v); },
  // weggetrokken of weggeduwd: bij een vijand van de gastheer gaat de nieuwe plek mee
  moved(v) { if (v.remote) { v.st.p = [Math.round(v.x * 100) / 100, Math.round(v.z * 100) / 100]; v.nx = v.x; v.nz = v.z; } },
  callNeven() {
    for (let i = 0; i < 2; i++) {
      const look = { skin: '#d8a880', hair: '#1b1b1b', style: i ? 'cap' : 'short', cap: '#1b1b1b', shirt: i ? '#2a2a2e' : '#3a3a44', pants: '#2a2a3a', pat: 'tracksuit', extra: [] };
      const g = buildFigure(look);
      const a = E3.yaw + (i ? 1.2 : -1.2);
      const n = { g, x: E3.pos.x - Math.sin(a) * 1 / E3.S * 1.5, z: E3.pos.z - Math.cos(a) * 1 / E3.S * 1.5, life: 12, hitT: 0.5 + i * 0.6 };
      E3.scene.add(g); this.neven.push(n);
    }
    UI.toast('"Ja neef, we komen eraan."', 1600);
  },
  updateNeven(dt) {
    for (const n of this.neven) {
      n.life -= dt;
      const t = this.target && this.target.state !== 'dead' ? this.target : this.mobs.find((v) => v.state === 'chase');
      let mv = false;
      if (t) {
        const dx = t.x - n.x, dz = t.z - n.z, d = Math.hypot(dx, dz);
        n.g.rotation.y = Math.atan2(dx, dz);
        if (E3.w(d) > 1.6) { const s = Math.min(d, 4.5 * dt / E3.S); n.x += dx / d * s; n.z += dz / d * s; mv = true; }
        else if ((n.hitT -= dt) <= 0) { n.hitT = 1.2; const p = this.power(0.5); this.hurtMob(t, p.n, { crit: p.crit }); }
      } else {
        const dx = E3.pos.x - n.x, dz = E3.pos.z - n.z, d = Math.hypot(dx, dz);
        if (E3.w(d) > 2.5) { const s = Math.min(d, 4.5 * dt / E3.S); n.x += dx / d * s; n.z += dz / d * s; mv = true; n.g.rotation.y = Math.atan2(dx, dz); }
      }
      n.g.position.set(E3.w(n.x), E3.ground(n.x, n.z), E3.w(n.z));
      animateFigure(n.g, E3.t, mv);
    }
    for (const n of this.neven.filter((n) => n.life <= 0)) { E3.puff(0xdddddd, 8, n.g.position.clone().add(new THREE.Vector3(0, 1, 0))); E3.scene.remove(n.g); }
    this.neven = this.neven.filter((n) => n.life > 0);
  },

  // ---------- projectielen en effecten ----------
  shotMesh(kind) {
    const g = new THREE.Group();
    if (kind === 'ring') { const r = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.07, 8, 18), new THREE.MeshBasicMaterial({ color: '#f4f1ea', transparent: true, opacity: 0.85 })); g.add(r); g.userData.ring = r; }
    else if (kind === 'puff') { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: W3.tex(PUFF_CANVAS), color: 0xd8f0a0, transparent: true, depthWrite: false })); s.scale.set(0.8, 0.8, 1); g.add(s); }
    else if (kind === 'kogel') { g.add(box(0.05, 0.05, 0.25, new THREE.MeshBasicMaterial({ color: '#ffe080' }), 0, 0, 0)); }
    else if (kind === 'bal' || kind === 'lob') { const s = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshLambertMaterial({ map: W3.tex(aicon('bal')) })); g.add(s); g.userData.spin = s; }
    else if (kind === 'viltje') { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 14), [cmat('#f4f1ea'), new THREE.MeshLambertMaterial({ map: W3.tex(aicon('viltje')) }), cmat('#f4f1ea')]); g.add(c); g.userData.spin = c; }
    else if (kind === 'harpoen') { g.add(box(0.05, 0.05, 1.3, cmat('#6e4a2c'), 0, 0, 0)); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 6), cmat('#c0c0c8')); tip.rotation.x = Math.PI / 2; tip.position.z = 0.75; g.add(tip); }
    else if (kind === 'anker') { g.add(box(0.08, 0.6, 0.08, cmat('#5a5a62'), 0, 0, 0)); g.add(box(0.5, 0.08, 0.08, cmat('#5a5a62'), 0, -0.28, 0)); g.userData.spin = g; }
    return g;
  },
  shoot(kind, from, t, onHit, speed) {
    const o = this.shotMesh(kind);
    o.position.copy(from);
    E3.scene.add(o);
    this.shots.push({ o, t, onHit, speed, kind, life: 0, start: from.clone() });
  },
  updateShots(dt) {
    for (const s of this.shots) {
      s.life += dt;
      const tp = new THREE.Vector3(E3.w(s.t.x), E3.ground(s.t.x, s.t.z) + 1.2, E3.w(s.t.z));
      const dir = tp.clone().sub(s.o.position), d = dir.length();
      if (d < 0.4 || s.life > 4 || s.t.state === 'dead') { s.done = true; if (s.t.state !== 'dead') s.onHit(); continue; }
      dir.normalize();
      s.o.position.addScaledVector(dir, Math.min(d, s.speed * dt));
      if (s.kind === 'lob') { const tot = s.start.distanceTo(tp) + 0.01; s.o.position.y = tp.y + Math.sin(Math.min(1, s.life * s.speed / tot) * Math.PI) * 3 * (1 - Math.min(1, s.life * s.speed / tot)) + (s.o.position.y - tp.y) * 0.9; }
      s.o.lookAt(tp);
      if (s.o.userData.spin) s.o.userData.spin.rotation.x += dt * 15;
      if (s.o.userData.ring) { s.o.userData.ring.scale.setScalar(1 + s.life * 1.5); }
      if (s.kind === 'puff' && Math.random() < 0.5) E3.puff(0xd8f0a0, 1, s.o.position.clone(), { size: 0.3, up: 0.1, life: 1 });
    }
    for (const s of this.shots.filter((s) => s.done)) E3.scene.remove(s.o);
    this.shots = this.shots.filter((s) => !s.done);
  },
  cloudAt(t, col, k) { const p = new THREE.Vector3(E3.w(t.x), E3.ground(t.x, t.z) + 1.0, E3.w(t.z)); for (let i = 0; i < 6 * k; i++) E3.puff(col, 1, p.clone().add(new THREE.Vector3((Math.random() - 0.5) * k * 2, Math.random(), (Math.random() - 0.5) * k * 2)), { size: 0.6 * k, up: 0.4, life: 3, grow: 2, op: 0.6 }); },
  shock(x, z, r, col) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 32), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(E3.w(x), E3.ground(x, z) + 0.08, E3.w(z));
    E3.scene.add(m); this.fx.push({ o: m, life: 0, max: 0.6, r });
  },
  wave() {
    const g = new THREE.Mesh(new THREE.BoxGeometry(6, 1.6, 0.6), new THREE.MeshLambertMaterial({ color: '#3a7ac8', transparent: true, opacity: 0.7 }));
    const f = E3.forward(); f.y = 0; f.normalize();
    g.position.copy(E3.eyePos()).add(new THREE.Vector3(0, -1.0, 0)).addScaledVector(f, 1.5);
    g.rotation.y = E3.yaw;
    E3.scene.add(g); this.fx.push({ o: g, life: 0, max: 0.9, v: f.multiplyScalar(11) });
    SFX.tone(60, 0.9, 'sawtooth', 0.06, 30);
  },
  floatText(text, pos, col = '#f4f1ea', size = 1) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 32;
    const x = c.getContext('2d'); x.font = 'bold 24px Silkscreen, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.lineWidth = 5; x.strokeStyle = '#000'; x.strokeText(text, 64, 16); x.fillStyle = col; x.fillText(text, 64, 16);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true }));
    s.scale.set(1.2 * size, 0.3 * size, 1); s.position.copy(pos); s.renderOrder = 12;
    E3.scene.add(s); this.fx.push({ o: s, life: 0, max: 1.1, rise: true });
  },
  updateFx(dt) {
    for (const f of this.fx) {
      f.life += dt; const k = f.life / f.max;
      if (f.rise) { f.o.position.y += dt * 0.9; f.o.material.opacity = 1 - k * k; }
      else if (f.r) { const s = 1 + k * E3.w(1) * f.r / E3.w(1); f.o.scale.set(s, s, s); f.o.material.opacity = 0.8 * (1 - k); }
      else if (f.v) { f.o.position.addScaledVector(f.v, dt); f.o.material.opacity = 0.7 * (1 - k); f.o.scale.y = 1 - k * 0.5; }
    }
    for (const f of this.fx.filter((f) => f.life >= f.max)) { E3.scene.remove(f.o); if (f.o.material && f.o.material.map && f.rise) f.o.material.map.dispose(); }
    this.fx = this.fx.filter((f) => f.life < f.max);
  },

  // ---------- doelwit ----------
  setTarget(v) {
    const old = this.target;
    this.target = v;
    if (old && old !== v && old.state !== 'dead') this.paintPlate(old);
    if (!this.ring) {
      this.ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.7, 28), new THREE.MeshBasicMaterial({ color: '#ff3a2a', transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }));
      this.ring.rotation.x = -Math.PI / 2;
    }
    if (v && v.g) { v.g.add(this.ring); this.ring.position.set(0, 0.05, 0); this.paintPlate(v); }
    else if (this.ring.parent) this.ring.parent.remove(this.ring);
    if (!v) this.autoOn = false;
    paintTargetFrame();
  },
  // klik: wat ligt er onder het kruisje?
  pick() {
    let best = null;
    for (const v of this.foes()) {
      if (v.state === 'dead') continue;
      const d = this.dist(v); if (d > 40) continue;
      const head = new THREE.Vector3(E3.w(v.x), E3.ground(v.x, v.z) + 1.1, E3.w(v.z)).sub(E3.eyePos());
      const ang = head.angleTo(E3.forward());
      const tol = Math.atan2(0.9, d);
      if (ang < tol && (!best || ang < best.a)) best = { v, a: ang };
    }
    if (best) { this.setTarget(best.v); this.autoOn = true; SFX.tick(); return true; }
    return false;
  },
  tab() {
    const list = this.foes().filter((v) => v.state !== 'dead' && this.dist(v) < 30 && this.facing(v) < 1.3).sort((a, b) => this.dist(a) - this.dist(b));
    if (!list.length) { this.setTarget(null); return; }
    const i = list.indexOf(this.target);
    this.setTarget(list[(i + 1) % list.length]);
    SFX.tick();
  },

  // ---------- per frame ----------
  update(dt) {
    if (!G.map || !G.S) return;
    const P = G.P;
    this.fixEnergy();
    this.gcd = Math.max(0, this.gcd - dt);
    for (const k of Object.keys(this.cds)) this.cds[k] = Math.max(0, this.cds[k] - dt);
    for (const k of Object.keys(this.buffs)) if (typeof this.buffs[k] === 'number') this.buffs[k] = Math.max(0, this.buffs[k] - dt);
    PV.update();
    NET.tick();
    this.guardLoot();
    this.spawnVapers(dt);
    this.updateMobs(dt);
    this.updateBrawl();
    this.updateNeven(dt);
    this.updateShots(dt);
    this.updateFx(dt);
    if (this.target && this.target.isPeer && !PV.targets().includes(this.target)) this.setTarget(null);
    const fighting = this.inCombat();
    this.combatT = fighting ? 0 : this.combatT + dt;
    if (G.mode === 'map' && !this.dying) {
      // Energydrink en HP herstellen
      P.ep = Math.min(P.maxEp, P.ep + dt * (fighting ? 3 : 10));
      if (this.combatT > 5 && P.hp > 0) P.hp = Math.min(P.maxHp, P.hp + P.maxHp * 0.03 * dt);
      if (this.buffs.misselijk > 0) { this.mTick = (this.mTick || 0) + dt; if (this.mTick > 1) { this.mTick = 0; this.hurtMe(2 + G.P.lvl * 0.5, '#b8f070', 'Je was te misselijk. Je gaat neer.'); } }
      // vanzelf slaan als je dichtbij staat
      const t = this.target;
      this.swing = Math.max(0, this.swing - dt);
      if (t && t.state !== 'dead' && this.autoOn && this.dist(t) < 3.0 && this.facing(t) < 1.3 && this.swing <= 0 && !E3.seat) {
        this.swing = 2.0;
        const p = this.power(0.55);
        this.hurtMob(t, p.n, { crit: p.crit });
        E3.swingT = 0.35;
      }
    }
    paintFrames();
  },

  // ---------- looten ----------
  lootable() { return this.mobs.filter((v) => v.state === 'dead' && v.loot && v.loot.length); },
  openLoot(v) {
    this.loot = { mob: v, sel: 0 };
    G.busy = true;
    this.paintLoot();
    $('#loot').hidden = false;
    UI.focus = this.lootFocus = (k) => {
      const L = this.loot && this.loot.mob.loot; if (!L) return;
      if (k === 'up') { this.loot.sel = (this.loot.sel + L.length) % (L.length + 1); this.paintLoot(); }
      else if (k === 'down') { this.loot.sel = (this.loot.sel + 1) % (L.length + 1); this.paintLoot(); }
      else if (k === 'ok') { if (this.loot.sel >= L.length) this.takeAll(); else this.take(this.loot.sel); }
      else if (k === 'cancel') this.closeLoot();
    };
  },
  // valt de besturing van het buitvenster ooit weg, pak hem dan terug (anders blijft het venster hangen)
  guardLoot() { if (this.loot && $('#loot').hidden === false && !UI.focus) UI.focus = this.lootFocus; if (!this.loot && !$('#loot').hidden) $('#loot').hidden = true; },
  lootName(l) { return l.kind === 'geld' ? `EUR ${l.n}` : l.kind === 'wapen' ? `${WEAPONS[l.id].name} (wapen)` : `${ITEMS[l.id].name}${l.n > 1 ? ' ×' + l.n : ''}`; },
  paintLoot() {
    const v = this.loot.mob, L = v.loot, el = $('#loot');
    el.innerHTML = `<h3>${v.name}</h3><div class="lrows">${L.map((l, i) => `<div class="lrow${i === this.loot.sel ? ' sel' : ''}${l.rare || l.kind === 'wapen' || l.id === 'gouden_vape' ? ' rare' : ''}" data-i="${i}"><canvas width="12" height="12"></canvas><span>${this.lootName(l)}</span></div>`).join('')}<div class="lrow all${this.loot.sel >= L.length ? ' sel' : ''}" data-i="all"><span>Alles pakken</span></div><div class="lrow close" data-i="close"><span>Sluiten</span></div></div><p class="lhint">${v.foreign ? 'Je raapt alles in één keer op (als niemand je voor is)' : 'Klik of Spatie om te pakken'} · Esc om te sluiten</p>`;
    el.querySelectorAll('.lrow canvas').forEach((c, i) => { const l = L[i]; const x = c.getContext('2d'); try { x.drawImage(l.kind === 'geld' ? aicon('zakken') : heldIcon(l.id), 0, 0, 12, 12); } catch (e) {} });
    el.onclick = (e) => { const r = e.target.closest('.lrow'); if (!r) return; if (r.dataset.i === 'close') this.closeLoot(); else if (r.dataset.i === 'all') this.takeAll(); else this.take(+r.dataset.i); };
  },
  take(i) {
    const v = this.loot.mob, l = v.loot[i]; if (!l) return;
    if (v.foreign) { PV.claim(v.foreign); this.closeLoot(); return; }
    if (l.kind === 'geld') { G.P.money += l.n; SFX.tick(); UI.toast(`+EUR ${l.n}`, 1200); }
    else if (l.kind === 'wapen') { giveWeapon(l.id, true); UI.toast(`Wapen: ${WEAPONS[l.id].name}. Kies het via Menu → Wapens.`, 2400); }
    else G.give(l.id, l.n);
    v.loot.splice(i, 1);
    if (!v.loot.length) { this.closeLoot(); return; }
    this.loot.sel = Math.min(this.loot.sel, v.loot.length);
    this.paintLoot();
  },
  takeAll() { const v = this.loot.mob; if (v.foreign) { this.take(0); return; } while (v.loot && v.loot.length && this.loot) this.take(0); },
  closeLoot() { if (!this.loot) return; this.loot = null; $('#loot').hidden = true; UI.focus = null; G.busy = false; },

  // ---------- huizen met vijanden: ze staan al binnen ----------
  spawnIndoor(m) {
    const f = F(); f.foeT = f.foeT || {}; f.foeT[m.id] = Date.now();
    const spots = [];
    for (let y = 2; y < m.h - 1; y++) for (let x = 1; x < m.w - 1; x++) {
      if (!(TILE_DEF[tileAt(m, x, y)] || {}).walk || m.props.some((p) => p.x === x && p.y === y) || m.doors.some((d) => d.x === x && d.y === y) || G.npcAt(x, y)) continue;
      const d = Math.hypot(x + 0.5 - E3.pos.x, y + 0.5 - E3.pos.z);
      if (d > 3) spots.push([x, y, d]);
    }
    spots.sort((a, b) => b[2] - a[2]);
    m.foes.forEach((id, i) => { const sp = spots[(i * 3) % Math.max(1, spots.length)]; if (sp) { const v = this.makeMob(id, sp[0] + 0.5, sp[1] + 0.5); v.indoor = true; } });
    if (m.foesText) setTimeout(() => UI.toast(m.foesText, 3200), 300);
  },

  // ---------- de kleedkamer: golven hooligans ----------
  brawl(waves) {
    G.busy = false; UI.focus = null;
    SFX.battle();
    return new Promise((resolve) => { this.brawlP = { waves: waves.slice(), mobs: [], resolve, n: 0 }; this.nextWave(); });
  },
  nextWave() {
    const b = this.brawlP, ids = b.waves.shift();
    const spots = [[5, 4], [13, 4], [9, 3], [3, 6], [15, 6], [7, 5], [11, 5]];
    b.n += 1;
    b.mobs = ids.map((id, i) => { const [x, z] = spots[(i + b.n * 2) % spots.length]; const v = this.makeMob(id, x + 0.5, z + 0.5); v.brawl = true; v.sx = x + 0.5; v.sz = z + 0.5; return v; });
    for (const v of b.mobs) this.aggro(v);
    UI.toast(b.waves.length ? `Golf ${b.n}: ${ids.length} hooligans!` : `De Kapo zelf komt eraan!`, 2000);
  },
  updateBrawl() {
    const b = this.brawlP; if (!b) return;
    if (!b.mobs.every((v) => v.state === 'dead')) { for (const v of b.mobs) if (v.state === 'return' || v.state === 'idle') this.aggro(v); return; }
    if (b.waves.length) { this.nextWave(); return; }
    this.brawlP = null; b.resolve('win');
  },

  // ---------- verhaalgevechten (Puutje, de keeper, de Koning) ----------
  storyFight(id) {
    const n = E3.talking;
    let x = E3.pos.x - Math.sin(E3.yaw) * 2.5 / E3.S, z = E3.pos.z - Math.cos(E3.yaw) * 2.5 / E3.S;
    if (n && G.npcRt[n.id]) { x = G.npcRt[n.id].px / TS + 0.5; z = G.npcRt[n.id].py / TS + 0.5; E3.hideNpc = n.id; }
    const mob = this.makeMob(id, x, z, { story: true, npc: n && n.id });
    mob.sx = x; mob.sz = z;
    return new Promise((resolve) => { this.story = { mob, resolve }; this.aggro(mob); this.setTarget(mob); });
  },
};

// Derkje vecht niet: zij praat in geluiden. Doe ze drie keer goed na.
async function derkjeScene() {
  const E = ENEMIES.derkje;
  const rounds = E.noises.slice().sort(() => Math.random() - 0.5).slice(0, 3);
  let fouten = 0;
  for (const r of rounds) {
    for (;;) {
      const opts = E.noises.map((n) => n.ans).sort(() => Math.random() - 0.5);
      const k = await ask('Derkje', r.say, opts);
      if (opts[k] === r.ans) { SFX.ok(); await say('Derkje', pick(['Iiii!', 'Mrrp!', '*klapt in haar handjes*'])); break; }
      SFX.no(); fouten += 1;
      await say('Derkje', pick(['Hrmpf.', '*kijkt heel beledigd*', '*gooit een cherrytomaatje naar je*']));
      if (fouten >= 4) { await me('Derkje draait zich om. Misschien later nog eens proberen.'); return 'fled'; }
    }
  }
  await me(E.spare);
  return 'spared';
}

// ---------- de HUD: spelerframe, doelwitframe, actiebalk ----------
function buildCombatUI() {
  $('#abar').innerHTML = [0, 1, 2, 3, 4].map((i) => `<div class="aslot" data-i="${i}"><canvas width="16" height="16"></canvas><i>${i + 1}</i><s></s><u></u><b></b></div>`).join('');
  $('#abar').onclick = (e) => { const s = e.target.closest('.aslot'); if (s) CB.use(+s.dataset.i); };
  $('#abar').onmousemove = (e) => {
    const s = e.target.closest('.aslot'); const c = CB.cls();
    const a = s && c && c.abil[+s.dataset.i];
    $('#atip').hidden = !a;
    if (a) $('#atip').innerHTML = `<b>${a.name}</b> <span>${a.cost ? a.cost + ' Energydrink' : 'Gratis'}${a.cd ? ` · ${a.cd}s cooldown` : ''}${a.range ? ` · ${a.range} m` : ''}</span><br>${a.desc}${G.P.lvl < a.lvl ? `<br><em>Vrij vanaf level ${a.lvl}</em>` : ''}`;
  };
  $('#abar').onmouseleave = () => { $('#atip').hidden = true; };
}
let _abarKey = '';
function paintFrames() {
  const on = !!(G.S && G.mode === 'map' && !E3.sceneCam);
  for (const s of ['#pframe', '#abar']) $(s).hidden = !on;
  $('#xpbar').hidden = true;
  if (!on) { $('#tframe').hidden = true; $('#atip').hidden = true; return; }
  const P = G.P, c = CB.cls();
  // spelerframe
  const pf = $('#pframe');
  const key = `${G.S.name}|${P.lvl}|${c && c.name}`;
  if (pf.dataset.k !== key) { pf.dataset.k = key; pf.querySelector('.nm').textContent = G.S.name || 'Jij'; pf.querySelector('.lv').textContent = `Lvl ${P.lvl} ${c ? c.name : ''}`; }
  pf.querySelector('.hp i').style.width = `${100 * P.hp / P.maxHp}%`;
  pf.querySelector('.hp span').textContent = `HP ${Math.ceil(P.hp)} / ${P.maxHp}`;
  pf.querySelector('.ed i').style.width = `${100 * P.ep / P.maxEp}%`;
  pf.querySelector('.ed span').textContent = `Energydrink ${Math.floor(P.ep)} / ${P.maxEp}`;
  const B = CB.buffs;
  const buffs = [B.damp > 0 && 'Onzichtbaar', B.immune > 0 && 'Onkwetsbaar', B.speed > 0 && 'Scooter', B.moed > 0 && 'Dronken moed', B.misselijk > 0 && 'Misselijk', CB.neven.length && 'Neven', E3.mounted && 'Op de fatbike'].filter(Boolean).join(' · ');
  const bf = pf.querySelector('.bf'); if (bf.textContent !== buffs) bf.textContent = buffs;
  const cash = `EUR ${P.money.toLocaleString('nl-NL')} · schuld: ${debtText()}`, ol = onlineText();
  const ce = pf.querySelector('.cash'); if (ce.dataset.t !== cash + ol) { ce.dataset.t = cash + ol; ce.innerHTML = `<b>${cash}</b><small>${ol}</small>`; }
  pf.querySelector('.xp i').style.width = `${Math.min(100, 100 * P.xp / P.next)}%`;
  pf.querySelector('.xp span').textContent = `XP ${P.xp} / ${P.next} (tot level ${P.lvl + 1})`;
  paintTargetFrame();
  // actiebalk
  const ak = `${c && c.name}|${P.lvl}`;
  const slots = $('#abar').children;
  if (ak !== _abarKey && c) {
    _abarKey = ak;
    c.abil.forEach((a, i) => { const cv = slots[i].querySelector('canvas'), x = cv.getContext('2d'); x.clearRect(0, 0, 16, 16); x.drawImage(aicon(a.id), 0, 0); slots[i].classList.toggle('locked', P.lvl < a.lvl); slots[i].querySelector('b').textContent = P.lvl < a.lvl ? `lvl ${a.lvl}` : ''; });
  }
  if (c) c.abil.forEach((a, i) => {
    const cd = Math.max(CB.cds[a.id] || 0, CB.gcd);
    const tot = (CB.cds[a.id] || 0) > CB.gcd ? a.cd : 1.5;
    const s = slots[i];
    s.style.setProperty('--cd', cd > 0 ? `${(cd / tot) * 360}deg` : '0deg');
    s.classList.toggle('poor', P.ep < a.cost && P.lvl >= a.lvl);
    const txt = (CB.cds[a.id] || 0) > 1.5 ? String(Math.ceil(CB.cds[a.id])) : '';
    const u = s.querySelector('u'); if (u.textContent !== txt) u.textContent = txt;
  });
}
function paintTargetFrame() {
  const t = CB.target, tf = $('#tframe');
  tf.hidden = !t || !(G.mode === 'map');
  if (!t) return;
  const key = `${t.name}|${t.lvl}`;
  if (tf.dataset.k !== key) { tf.dataset.k = key; tf.querySelector('.nm').textContent = t.name; tf.querySelector('.lv').textContent = `Lvl ${t.lvl}${t.E.boss ? ' · Baas' : t.E.dz ? ' · Elite' : ''}`; }
  tf.querySelector('.hp i').style.width = `${100 * Math.max(0, t.hp) / t.maxHp}%`;
  tf.querySelector('.hp span').textContent = `${Math.max(0, Math.ceil(t.hp))} / ${t.maxHp}`;
  const ts = t.hst || t.st;
  const st = [ts.dot > 0 && 'Misselijk', ts.stun > 0 && 'Verdoofd', ts.slow > 0 && 'Vertraagd', ts.dance > 0 && 'Danst'].filter(Boolean).join(' · ');
  const bf = tf.querySelector('.bf'); if (bf.textContent !== st) bf.textContent = st;
}
function flashSlot(i) { const s = $('#abar').children[i]; if (!s) return; s.classList.remove('hit'); void s.offsetWidth; s.classList.add('hit'); }

// ---------- class kiezen voor een bestaand personage ----------
async function chooseClass(afterDeath) {
  G.busy = true;
  await me(afterDeath ? 'Je begint opnieuw. Misschien ben je dit keer wel een ander type.' : 'Je hoofd bonkt. Maar wacht… je weet ineens weer wat voor type je bent.');
  const k = await ask('', 'Wat voor type ben jij?', CLASS_KEYS.map((key) => `${CLASSES[key].name}: ${CLASSES[key].desc}`));
  G.S.ap.cl = k;
  G.P.ep = G.P.maxEp;
  _abarKey = '';
  await me(`Je bent een ${CLASSES[CLASS_KEYS[k]].name}. Gebruik je abilities met 1 tot en met 5. Klik op een vijand of druk Tab om hem te kiezen.`);
  G.busy = false;
}

// ---------- rechtsboven: al je openstaande taken ----------
// (vervangt het geld-en-schuldvenster; geld en online staan nu in het spelerframe)
updateHud = function () {
  const show = G.S && G.mode === 'map' && !E3.sceneCam && $('#menu').hidden && $('#panel').hidden && $('#casino').hidden && $('#loot').hidden;
  const el = $('#hud');
  if (!show) { if (!el.hidden) el.hidden = true; return; }
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const open = Object.keys(QUESTS).filter((id) => { const st = G.S.quests[id]; return st && st < QUESTS[id].done; });
  const html = `<div class="th">Taken${open.length ? ` (${open.length})` : ''}</div>` + (open.length
    ? open.slice(0, 6).map((id) => `<div class="tq"><b>${esc(QUESTS[id].name)}</b><small>${esc(stepText(QUESTS[id], G.S.quests[id]))}</small></div>`).join('')
    : '<div class="tq"><small>Geen openstaande taken. Praat eens met iemand.</small></div>');
  if (html !== el.dataset.h) { el.dataset.h = html; el.innerHTML = html; }
  if (el.hidden) el.hidden = false;
};
