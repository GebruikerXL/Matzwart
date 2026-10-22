// HARDCORE in 3D: spullen die op de grond vallen als je doodgaat (anderen kunnen ze oprapen),
// spelers die elkaar aanvallen in de wildernis van Zwolle, en de fatbike als mount.
// Alles loopt via presence (net als ruilen): ook spelers die alleen mogen kijken doen dan mee.
// Wie spullen liet vallen beslist wie ze krijgt: de eerste die erom vraagt.
const PILE_TTL = 15 * 60 * 1000;
const PV = {
  piles: [], hits: [], seq: 0, seen: {}, grants: [], pending: null, killedBy: null, kbSeen: {}, proxies: {}, models: {}, bike: null,

  // ---------- spullen op de grond ----------
  addPile(loot) {
    const i = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    this.piles.push({ i, m: G.map.id, x: Math.round(E3.pos.x * 100) / 100, z: Math.round(E3.pos.z * 100) / 100, l: loot, t: Date.now(), n: String(G.S.name || 'Iemand').slice(0, 16) });
    while (this.piles.length > 5) this.piles.shift();
  },
  // alle hopen op deze kaart: die van jezelf en die van anderen (uit hun presence)
  visible() {
    if (!G.map) return [];
    const now = Date.now(), out = [];
    for (const p of this.piles) if (p.m === G.map.id && now - p.t < PILE_TTL && p.l.length) out.push({ ...p, own: true, ref: p });
    for (const o of Online.others()) for (const p of Array.isArray(o.presence.dr) ? o.presence.dr : []) {
      if (!p || p.m !== G.map.id || now - Number(p.t) > PILE_TTL || !Array.isArray(p.l) || !p.l.length) continue;
      if (this.pending && this.pending.i === p.i) continue;
      out.push({ i: String(p.i), m: p.m, x: Number(p.x) || 0, z: Number(p.z) || 0, l: p.l.filter(validLoot).slice(0, 40), t: p.t, n: String(p.n || '?').slice(0, 16), owner: o.peer });
    }
    return out;
  },
  open(pile) {
    if (pile.own) CB.openLoot({ name: 'Jouw spullen', loot: pile.ref.l, pile: pile.ref });
    else CB.openLoot({ name: `Spullen van ${pile.n}`, loot: pile.l.map((l) => ({ ...l })), foreign: pile });
  },
  claim(pile) {
    this.pending = { o: pile.owner, i: pile.i, s: Date.now(), loot: pile.l.map((l) => ({ ...l })), n: pile.n };
    UI.toast(`Je graait in de spullen van ${pile.n}…`, 1600);
  },
  give(loot) {
    for (const l of loot) {
      if (l.kind === 'geld') G.P.money += Math.max(0, Math.min(1e9, Math.floor(Number(l.n) || 0)));
      else if (l.kind === 'wapen' && WEAPONS[l.id]) { G.P.weapons = G.P.weapons || []; if (!G.P.weapons.includes(l.id)) G.P.weapons.push(l.id); }
      else if (l.kind === 'item' && ITEMS[l.id]) G.give(l.id, Math.max(1, Math.min(99, Math.floor(Number(l.n) || 1))), true);
    }
  },

  // ---------- spelers aanvallen (alleen in de wildernis) ----------
  pvpHere() { return !!(G.map && G.map.pvp); },
  targets() {
    if (!this.pvpHere()) return [];
    const out = [];
    for (const p of Online.others()) {
      const s = p.presence;
      if (s.m !== G.map.id || !(Number(s.hp) > 0)) continue;
      const e = E3.peers[p.peer];
      let t = this.proxies[p.peer];
      if (!t) t = this.proxies[p.peer] = { isPeer: true, peer: p.peer, st: {}, E: { name: '' }, def: 0 };
      const q = e ? { x: e.x, z: e.z } : E3.peerPos(p);
      Object.assign(t, { name: String(s.n).slice(0, 16), lvl: Number(s.lvl) || 1, hp: Number(s.hp), maxHp: Math.max(1, Number(s.mh) || 1), x: q.x, z: q.z, g: e && e.g, state: 'chase' });
      out.push(t);
    }
    return out;
  },
  sendHit(peer, dmg) {
    this.hits.push({ s: ++this.seq, to: peer, d: Math.max(1, Math.min(999, Math.round(dmg))) });
    while (this.hits.length > 8) this.hits.shift();
  },

  // ---------- fatbike ----------
  toggleMount() {
    if (E3.mounted) { this.dismount(); return; }
    if (!(G.P.items.fatbike > 0)) { UI.toast('Je hebt geen fatbike. Otto in het dorpshuis verkoopt er een (EUR 10.000, vanaf level 10).', 2600); return; }
    if (G.map.inside) { UI.toast('Niet binnen fietsen.', 1400); return; }
    if (CB.inCombat()) { UI.toast('Niet tijdens een gevecht.', 1400); return; }
    if (E3.seat) E3.standUp();
    E3.mounted = true;
    SFX.tone(120, 0.4, 'sawtooth', 0.03, 200);
    UI.toast('Op de fatbike. 100% sneller.', 1400);
  },
  dismount() { if (!E3.mounted) return; E3.mounted = false; SFX.tone(200, 0.12, 'triangle', 0.03, -80); },
  bikeModel() { return propModel({ name: 'fatbike' }); },

  // ---------- per frame ----------
  update() {
    const me = Online.me, now = Date.now();
    for (const p of Online.others()) {
      const s = p.presence;
      // klappen van anderen (alleen geldig als jullie allebei in de wildernis staan)
      const hx = Array.isArray(s.hx) ? s.hx : [];
      const maxS = hx.reduce((a, h) => Math.max(a, Number(h && h.s) || 0), 0);
      if (this.seen[p.peer] === undefined) this.seen[p.peer] = maxS;
      for (const h of hx) {
        if (!h || h.to !== me || !(Number(h.s) > this.seen[p.peer])) continue;
        this.seen[p.peer] = Math.max(this.seen[p.peer], Number(h.s));
        if (this.pvpHere() && s.m === G.map.id && G.mode === 'map' && !CB.dying) {
          CB.lastAttacker = p.peer;
          CB.hurtMe(Math.max(1, Math.min(999, Number(h.d) || 1)), '#ff4a3a', `${String(s.n).slice(0, 16)} heeft je vermoord in de wildernis van Zwolle.`);
        }
      }
      // iemand wil mijn spullen: de eerste krijgt ze
      const pk = s.pk;
      if (pk && pk.o === me) {
        const pile = this.piles.find((x) => x.i === pk.i);
        if (pile && !this.grants.some((g) => g.i === pk.i)) {
          this.grants.push({ i: pk.i, to: p.peer });
          while (this.grants.length > 8) this.grants.shift();
          this.piles = this.piles.filter((x) => x !== pile);
          UI.toast(`${String(s.n).slice(0, 16)} raapt jouw spullen op.`, 2600);
        }
      }
      // ik vroeg om spullen: heb ik ze gekregen?
      if (this.pending && p.peer === this.pending.o && Array.isArray(s.pg) && s.pg.some((g) => g && g.i === this.pending.i && g.to === me)) {
        const got = this.pending; this.pending = null;
        this.give(got.loot);
        SFX.item();
        UI.toast(`Je raapt de spullen van ${got.n} op: ${got.loot.map((l) => CB.lootName(l)).join(', ')}`, 3600);
      }
      // ik heb iemand vermoord
      if (s.kb && s.kb.to === me && s.kb.s !== this.kbSeen[p.peer]) {
        if (this.kbSeen[p.peer] !== undefined) { UI.toast(`Je hebt ${String(s.n).slice(0, 16)} vermoord! Zijn spullen liggen op de grond.`, 3600); SFX.win(); }
        this.kbSeen[p.peer] = s.kb.s;
      } else if (this.kbSeen[p.peer] === undefined) this.kbSeen[p.peer] = s.kb ? s.kb.s : null;
    }
    if (this.pending && now - this.pending.s > 8000) { this.pending = null; UI.toast('Iemand was je voor. Of de eigenaar is weg.', 2200); }
    this.piles = this.piles.filter((p) => p.l.length && now - p.t < PILE_TTL);
    if (E3.mounted && (!G.map || G.map.inside || !(G.P.items.fatbike > 0))) this.dismount();
  },
  render() {
    const seen = new Set();
    if (G.map && G.mode !== 'title') for (const p of this.visible()) {
      seen.add(p.i);
      let o = this.models[p.i];
      if (!o) {
        o = new THREE.Group();
        M3.b(o, 0.7, 0.45, 0.5, '#6e4a2c', 0, 0.22, 0); M3.b(o, 0.5, 0.15, 0.4, '#8c5a32', 0.1, 0.5, 0.05);
        M3.b(o, 0.5, 0.7, 0.12, '#9aa0aa', -0.6, 0.35, -0.4); M3.b(o, 0.3, 0.06, 0.13, '#5a5a62', -0.6, 0.55, -0.4);
        const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: W3.tex(PUFF_CANVAS), color: 0xffe080, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        glint.scale.set(1.1, 1.1, 1); glint.position.y = 0.5; o.add(glint); o.userData.glint = glint;
        const tag = textSprite(`☠ ${p.n}`, p.own ? '#ffd25a' : '#ff8a7a'); tag.position.y = 1.3; o.add(tag);
        E3.scene.add(o); this.models[p.i] = o;
      }
      o.position.set(E3.w(p.x), E3.ground(p.x, p.z), E3.w(p.z));
      o.userData.glint.material.opacity = 0.55 + Math.sin(E3.t * 5) * 0.35;
    }
    for (const k of Object.keys(this.models)) if (!seen.has(k)) { E3.scene.remove(this.models[k]); delete this.models[k]; }
    // je eigen fatbike
    if (!this.bike) { this.bike = this.bikeModel(); E3.scene.add(this.bike); }
    this.bike.visible = !!(E3.mounted && G.mode === 'map');
    if (this.bike.visible) { this.bike.position.set(E3.w(E3.pos.x) - Math.sin(E3.yaw) * 0.35, E3.fy, E3.w(E3.pos.z) - Math.cos(E3.yaw) * 0.35); this.bike.rotation.y = E3.yaw + Math.PI; }
    $('#pvp').hidden = !(this.pvpHere() && G.mode === 'map');
  },
  presence() {
    return {
      hp: Math.ceil(G.P.hp), mh: G.P.maxHp, mt: E3.mounted ? 1 : 0,
      dr: this.piles.map((p) => ({ i: p.i, m: p.m, x: p.x, z: p.z, t: p.t, n: p.n, l: p.l.slice(0, 40) })),
      hx: this.hits, pk: this.pending ? { o: this.pending.o, i: this.pending.i } : null, pg: this.grants, kb: this.killedBy,
    };
  },
};
function validLoot(l) { return l && ((l.kind === 'geld' && Number(l.n) > 0) || (l.kind === 'wapen' && WEAPONS[l.id]) || (l.kind === 'item' && ITEMS[l.id])); }

// wat je bij je had, valt op de grond waar je doodging
G.onDeathDrop = (lost) => {
  const loot = [];
  if (lost.money > 0) loot.push({ kind: 'geld', n: lost.money });
  for (const [id, n] of Object.entries(lost.items)) if (ITEMS[id]) loot.push({ kind: 'item', id, n });
  for (const id of lost.weapons) if (WEAPONS[id]) loot.push({ kind: 'wapen', id });
  if (loot.length) PV.addPile(loot);
};
