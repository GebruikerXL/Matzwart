// Samen vechten: iedereen in hetzelfde gebied ziet dezelfde vijanden en kan ze tegelijk aanvallen.
// Eén speler per gebied, de gastheer (wie er het langst is), laat de vijanden lopen en vechten en zet ze in zijn presence.
// De anderen tonen die vijanden, sturen hun klappen naar de gastheer, en krijgen van hem de klappen die de vijanden uitdelen.
// Wie meesloeg krijgt XP en zijn eigen buit als de vijand sterft. Valt de gastheer weg, dan neemt de volgende het over.
// Verhaalgevechten en de kleedkamer blijven van jezelf. Alles loopt via presence, dus ook spelers die alleen mogen kijken doen mee.
const NET = {
  seq: 0, hits: [], atks: [], seenH: {}, seenA: {}, hb: {}, ms: 0, msMap: null, lastT: 0, host: true, hostPeer: null, K: null,

  keys() { return this.K || (this.K = Object.keys(ENEMIES)); },
  short(peer) { return String(peer || 'ik').slice(-6); },
  myShort() { return this.short(Online.me); },
  newId() { return Math.random().toString(36).slice(2, 7); },
  // staat iemand er echt (niet in een cutscene, tabblad niet weggeklikt)?
  fresh(p) { const h = this.hb[p.peer]; return !!h && performance.now() - h.t < 4000; },
  here() { return G.map ? Online.others().filter((p) => p.presence.m === G.map.id && this.fresh(p)) : []; },
  othersClaim(mapId) { return Online.others().some((p) => p.presence.m === mapId && Array.isArray(p.presence.mb) && this.fresh(p)); },

  // ---------- wie is de gastheer? ----------
  // wie al vijanden laat lopen gaat voor, dan wie er het langst is
  before(a, b) { if (a.claim !== b.claim) return a.claim; if (a.ms !== b.ms) return a.ms < b.ms; return a.peer < b.peer; },
  elect() {
    let best = { me: true, claim: this.host, ms: this.ms, peer: Online.me || '' };
    for (const p of this.here()) {
      const s = p.presence, c = { me: false, claim: Array.isArray(s.mb), ms: Number(s.ms) || 0, peer: p.peer, p };
      if (this.before(c, best)) best = c;
    }
    return best;
  },

  // ---------- per frame ----------
  tick() {
    const now = performance.now();
    // waren we even weg (cutscene, ander tabblad)? dan sluiten we achteraan aan
    if (now - this.lastT > 3000) { this.ms = Date.now(); this.host = false; }
    this.lastT = now;
    if (G.map.id !== this.msMap) { this.msMap = G.map.id; this.ms = Date.now(); this.host = false; }
    for (const p of Online.others()) { const h = this.hb[p.peer], v = p.presence.hb; if (!h || h.v !== v) this.hb[p.peer] = { v, t: now }; }
    const best = this.elect();
    this.host = best.me;
    this.hostPeer = best.me ? null : best.p.peer;
    this.flushEffects();
    if (this.host) this.adopt(); else this.mirror(best.p);
    this.readHits();
    this.readAtks();
  },

  // de vorige gastheer is weg: zijn vijanden zijn nu van ons
  adopt() {
    for (const v of CB.mobs) {
      if (!v.remote) continue;
      v.remote = false; v.hst = null; v.st = {};
      if (v.sx === undefined) { v.sx = v.x; v.sz = v.z; }
      v.tx = v.x; v.tz = v.z;
    }
  },
  // de vijanden van de gastheer overnemen in beeld
  mirror(p) {
    const list = Array.isArray(p.presence.mb) ? p.presence.mb.slice(0, 16) : [];
    const K = this.keys(), seen = new Set();
    for (const e of list) {
      if (!Array.isArray(e) || typeof e[0] !== 'string') continue;
      const [nid, k, x, z, hp, mh, lvl, sc, r, tg, fl] = e;
      const key = K[k]; if (!key) continue;
      seen.add(nid);
      let v = CB.mobs.find((m) => m.nid === nid);
      if (!v) {
        if (sc === 3) continue;
        v = CB.makeMob(key, x / 100, z / 100, { nid });
        v.remote = true; v.st = {};
      }
      if (!v.remote) { if (v.state === 'dead') continue; v.remote = true; v.st = {}; }
      v.nx = x / 100; v.nz = z / 100; v.nr = r / 100;
      v.maxHp = Math.max(1, Number(mh) || 1); v.lvl = Number(lvl) || v.lvl;
      const hpNow = Math.max(0, Number(hp) || 0);
      v.hp = v.predT > 0 ? Math.min(v.hp, hpNow) : hpNow;
      v.tgt = tg || null;
      v.hst = { dot: fl & 1, stun: fl & 2, slow: fl & 4, dance: fl & 8 };
      if (sc === 3) { v.remote = false; v.hst = null; CB.killMob(v); continue; }
      const st = ['idle', 'chase', 'return'][sc] || 'idle';
      const key2 = `${st}|${Math.ceil(v.hp)}|${v.maxHp}|${fl}`;
      if (st !== v.state || key2 !== v.pk) { v.state = st; v.pk = key2; CB.paintPlate(v); }
    }
    // weg bij de gastheer: lijken blijven liggen (met jouw buit), de rest verdwijnt
    for (const v of CB.mobs.slice()) {
      if (!v.nid || !CB.shared(v) || seen.has(v.nid)) continue;
      if (v.state === 'dead') { v.remote = false; continue; }
      CB.removeMob(v);
    }
  },
  // vijanden in beeld laten bewegen zoals de gastheer ze ziet
  step(v, dt) {
    const dx = v.nx - v.x, dz = v.nz - v.z, l = Math.hypot(dx, dz);
    if (l > 3) { v.x = v.nx; v.z = v.nz; } else if (l > 0.001) { const k = Math.min(1, dt * 8); v.x += dx * k; v.z += dz * k; }
    if (typeof v.nr === 'number') v.g.rotation.y = v.nr;
    v.predT = Math.max(0, (v.predT || 0) - dt);
    v.g.position.set(E3.w(v.x), E3.ground(v.x, v.z), E3.w(v.z));
    animateFigure(v.g, E3.t, l > 0.01);
    if (v.g.userData.cloud) animateCloud(v.g.userData.cloud, E3.t);
    v.g.rotation.z = v.hst && v.hst.stun ? Math.sin(E3.t * 10) * 0.08 : 0;
  },

  // ---------- klappen ----------
  // jij raakt een vijand van de gastheer
  hit(v, d, e) {
    this.hits.push({ s: ++this.seq, i: v.nid, d: Math.max(0, Math.round(d)), ...(e ? { e } : {}) });
    while (this.hits.length > 8) this.hits.shift();
  },
  // effecten (verdoofd, vertraagd, dansen, misselijk, wegduwen) die jouw abilities op een vijand van de gastheer zetten
  flushEffects() {
    for (const v of CB.mobs) {
      if (!v.remote) continue;
      const st = v.st, e = {};
      for (const k of ['stun', 'slow', 'dance', 'dot']) if (st[k] > 0) e[k] = Math.round(st[k] * 10) / 10;
      if (e.dot) e.dps = Math.round(st.dps || 0);
      if (st.p) e.p = st.p;
      if (Object.keys(e).length) this.hit(v, 0, e);
      v.st = {};
    }
  },
  // gastheer: een vijand raakt een andere speler
  attack(v, T, d, blow) {
    this.atks.push({ s: ++this.seq, to: T.id, d: Math.max(1, Math.round(d)), k: this.keys().indexOf(v.id), ...(blow ? { b: 1 } : {}) });
    while (this.atks.length > 8) this.atks.shift();
  },
  // nieuwe berichten van een ander (de eerste keer slaan we de oude over)
  fresh2(seen, p, list) {
    const max = list.reduce((a, h) => Math.max(a, Number(h && h.s) || 0), 0);
    if (seen[p.peer] === undefined) { seen[p.peer] = max; return []; }
    const out = list.filter((h) => h && Number(h.s) > seen[p.peer]);
    seen[p.peer] = Math.max(seen[p.peer], max);
    return out;
  },
  readHits() {
    for (const p of Online.others()) {
      const s = p.presence;
      for (const h of this.fresh2(this.seenH, p, Array.isArray(s.mx) ? s.mx : [])) {
        if (!this.host || s.m !== G.map.id) continue;
        const v = CB.mobs.find((m) => m.nid === h.i && !m.remote);
        if (v) CB.netHit(v, h, p);
      }
    }
  },
  readAtks() {
    const me = this.myShort();
    for (const p of Online.others()) {
      const s = p.presence;
      for (const h of this.fresh2(this.seenA, p, Array.isArray(s.ma) ? s.ma : [])) {
        if (h.to !== me || s.m !== G.map.id || G.mode !== 'map') continue;
        const E = ENEMIES[this.keys()[h.k]] || { name: 'Iemand' };
        const d = Math.max(1, Math.min(999, Number(h.d) || 1));
        if (h.b) {
          CB.hurtMe(d, '#b8f070', `${E.name} heeft je weggeblazen.`);
          CB.buffs.misselijk = Math.max(CB.buffs.misselijk || 0, 3);
          const hz = $('#haze'); hz.classList.remove('on'); void hz.offsetWidth; hz.classList.add('on');
        } else {
          CB.hurtMe(d, E.knife ? '#ff4a3a' : '#ff8a6a', `${E.name} heeft je ${E.knife ? 'neergestoken' : 'neergeslagen'}.`);
          if (E.inflict && Math.random() < E.inflict.ch * 0.5) { CB.buffs.misselijk = 5; UI.toast(E.inflict.t, 2000); }
        }
      }
    }
  },

  // ---------- wat wij de anderen laten zien ----------
  presence() {
    const out = { hb: Math.floor(performance.now() / 1000), ms: this.ms, mx: this.hits, ma: this.atks, dp: CB.buffs.damp > 0 ? 1 : 0, mb: null };
    if (this.host && G.map) {
      const K = this.keys(), S = { idle: 0, chase: 1, return: 2, dead: 3 };
      const list = CB.mobs.filter((v) => v.nid && CB.shared(v) && !v.remote).sort((a, b) => (a.state === 'dead') - (b.state === 'dead')).slice(0, 14);
      out.mb = list.map((v) => [v.nid, K.indexOf(v.id), Math.round(v.x * 100), Math.round(v.z * 100), Math.max(0, Math.ceil(v.hp)), v.maxHp, v.lvl, S[v.state] || 0,
        Math.round((v.g ? v.g.rotation.y : 0) * 100), v.state === 'chase' ? v.tgt || this.myShort() : '',
        (v.st.dot > 0 ? 1 : 0) | (v.st.stun > 0 ? 2 : 0) | (v.st.slow > 0 ? 4 : 0) | (v.st.dance > 0 ? 8 : 0)]);
    }
    return out;
  },
};
