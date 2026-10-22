// 3D-engine: vervangt het tekenen, lopen en de besturing van de 2D-engine. De spellogica (G, verhaal, gevechten) blijft gedeeld.
// Posities (pos, vapers, NPC's, spelers) zijn in tegels; pas bij het tekenen gaat alles keer S (meters per tegel).
const E3 = {
  pos: { x: 3.5, z: 5.5 }, yaw: Math.PI, pitch: 0, keys: new Set(), figs: {}, peers: {}, vapers: [], vaperTimer: 0, S: 2, gy: 0,
  t: 0, bob: 0, target: null, warnAt: -99, safe: null, jy: 0, jv: 0, swingT: 0, puffs: [], things: [], lastPuff: 0, puffCount: 0, umbrella: false,
  seat: null, fightAt: null, bt: null, smokeT: 0,

  init() {
    const cv = $('#view');
    this.renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, 4 / 3, 0.05, 300);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x556644, 0.85); this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xfff2dd, 0.55); this.sun.position.set(-20, 40, 30); this.scene.add(this.sun);
    SKY.build(this.scene);
    const resize = () => { const r = $('#game').getBoundingClientRect(); this.renderer.setSize(r.width, r.height, false); this.camera.aspect = r.width / r.height; this.camera.updateProjectionMatrix(); };
    addEventListener('resize', resize); resize();
    this.input();
  },

  // ---------- kaart opbouwen ----------
  build(id) {
    if (this.world) { this.scene.remove(this.world); this.world.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
    for (const k of Object.keys(this.figs)) this.scene.remove(this.figs[k]);
    for (const k of Object.keys(this.peers)) this.scene.remove(this.peers[k].g);
    for (const v of this.vapers) this.scene.remove(v.g);
    for (const p of this.puffs) this.scene.remove(p.s);
    this.figs = {}; this.peers = {}; this.vapers = []; this.puffs = []; this.seat = null;
    const m = MAPS[id];
    this.world = buildWorld(m);
    this.S = this.world.userData.S;
    this.scene.add(this.world);
    this.scene.background = m.inside ? new THREE.Color('#140f1c') : null;
    this.scene.fog = m.inside ? new THREE.Fog('#2a2018', 14, m.palace ? 60 : 36) : new THREE.Fog('#b8d4ee', 45, 170);
    if (m.inside) { this.hemi.intensity = 0.6; this.hemi.color.set('#fff0dd'); this.hemi.groundColor.set('#c8b090'); this.sun.intensity = 0.15; }
    else this.hemi.groundColor.set('#556644');
    this.eye = m.inside && ceilH(m) < 2.2 ? ceilH(m) - 0.35 : 1.6;
    for (const n of NPCS.filter((n) => n.map === id)) { const g = buildFigure(n.look); this.figs[n.id] = g; this.scene.add(g); }
    this.vaperTimer = 2;
  },
  w(v) { return v * this.S; },
  ground(tx, tz) { return G.map ? groundH(G.map, Math.floor(tx), Math.floor(tz)) : 0; },

  // ---------- botsen ----------
  blocked(tx, ty) {
    const m = G.map;
    const t = tileAt(m, tx, ty);
    if (!(TILE_DEF[t] || {}).walk) return true;
    if (G.propAt(tx, ty) && G.propAt(tx, ty).solid) return true;
    if (G.npcAt(tx, ty)) return true;
    return false;
  },
  free(x, z) {
    const r = Math.min(0.28, 0.32 / this.S);
    for (const [dx, dz] of [[-r, -r], [r, -r], [-r, r], [r, r]]) if (this.blocked(Math.floor(x + dx), Math.floor(z + dz))) return false;
    return true;
  },

  // ---------- per frame ----------
  update(dt) {
    this.t += dt;
    const free = !G.busy && !UI.focus && G.mode === 'map';
    let moving = false;
    if (free) {
      const k = this.keys;
      if (k.has('ArrowLeft')) this.yaw += dt * 2.2;
      if (k.has('ArrowRight')) this.yaw -= dt * 2.2;
      let f = 0, s = 0;
      if (k.has('KeyW') || k.has('ArrowUp')) f += 1;
      if (k.has('KeyS') || k.has('ArrowDown')) f -= 1;
      if (k.has('KeyD')) s += 1;
      if (k.has('KeyA')) s -= 1;
      if ((f || s) && this.seat) this.standUp();
      else if (f || s) {
        const sp = (k.has('ShiftLeft') || k.has('ShiftRight') ? 7.5 : 4.2) / this.S * dt / Math.hypot(f, s);
        const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
        const dx = (-sin * f + cos * s) * sp, dz = (-cos * f - sin * s) * sp;
        const nx = this.pos.x + dx, nz = this.pos.z + dz;
        if (this.free(nx, this.pos.z)) this.pos.x = nx;
        if (this.free(this.pos.x, nz)) this.pos.z = nz;
        moving = true;
      }
    }
    this.bob = moving ? this.bob + dt * 9 : this.bob * 0.9;
    const gTarget = this.seat ? this.seat.gy : this.ground(this.pos.x, this.pos.z);
    this.gy += (gTarget - this.gy) * Math.min(1, dt * 8);
    // tegel gewisseld? dan deuren, randen en waarschuwingen afhandelen
    const pl = G.pl, tx = Math.floor(this.pos.x), ty = Math.floor(this.pos.z);
    pl.dir = this.dirName();
    if (!this.seat && (tx !== pl.x || ty !== pl.y)) {
      const prev = { x: pl.x + 0.5, z: pl.y + 0.5 };
      const wasTall = tileAt(G.map, pl.x, pl.y) === 'tall';
      pl.x = tx; pl.y = ty; pl.px = tx * TS; pl.py = ty * TS;
      if (!m_tile_door(G.map, prev.x - 0.5, prev.z - 0.5)) this.safe = prev;
      if (G.map.encounters && G.flags.intro && tileAt(G.map, tx, ty) === 'tall' && !wasTall && this.t - this.warnAt > 45) {
        this.warnAt = this.t;
        G.busy = true;
        UI.say('', G.map.warn || 'Je ruikt een sterke vape-lucht. Kijk uit, er kunnen vapende tieners in het gras zitten!').then(() => { G.busy = false; });
      } else if (!G.busy) G.arrive();
    }
    G.updateNpcs(dt);
    this.updateVapers(dt);
    this.updateFx(dt);
    this.findTarget();
  },

  // ---------- zitten op een bankje ----------
  async sit(o) {
    const p = o.userData.prop, flip = o.rotation.y !== 0;
    this.seat = { back: { ...this.pos }, gy: groundH(G.map, p.x, p.y), yaw: flip ? 0 : Math.PI };
    this.pos = { x: p.x + 0.5, z: p.y + 0.5 };
    this.yaw = this.seat.yaw; this.pitch = -0.05; this.keys.clear();
    SFX.tone(220, 0.12, 'triangle', 0.04, -60);
    await PROPS.bank();
    if (this.seat) UI.toast('Je blijft lekker zitten. Loop weg of druk E om op te staan.', 2600);
  },
  standUp() {
    if (!this.seat) return;
    this.pos = { ...this.seat.back };
    this.seat = null;
    SFX.tone(260, 0.08, 'triangle', 0.03, 80);
  },

  // ---------- effecten: springen, zwaaien, dampwolkjes, rook, gegooide dingen ----------
  updateFx(dt) {
    if (this.jy > 0 || this.jv > 0) { this.jv -= 12 * dt; this.jy = Math.max(0, this.jy + this.jv * dt); if (this.jy === 0) this.jv = 0; }
    this.swingT = Math.max(0, this.swingT - dt);
    if (this.world) {
      for (const f of this.world.userData.anim) f(this.t);
      this.smokeT -= dt;
      if (this.smokeT <= 0) {
        this.smokeT = 0.45;
        const me = new THREE.Vector3(this.w(this.pos.x), 0, this.w(this.pos.z));
        for (const s of this.world.userData.smoke) if (s.distanceTo(me) < 110) this.puff(0xc8c4c0, 1, s, { size: 1.4, up: 1.6, life: 5, grow: 4 });
      }
    }
    for (const p of this.puffs) {
      p.life += dt;
      p.s.position.addScaledVector(p.v, dt); p.v.multiplyScalar(0.96); p.v.y += 0.25 * dt;
      const k = p.life / p.max, sc = p.size * (1 + k * p.grow);
      p.s.scale.set(sc, sc, 1); p.s.material.opacity = p.op * (1 - k);
    }
    for (const p of this.puffs.filter((p) => p.life >= p.max)) this.scene.remove(p.s);
    this.puffs = this.puffs.filter((p) => p.life < p.max);
    for (const t of this.things) {
      t.life += dt; t.v.y -= 9.8 * t.g * dt;
      t.s.position.addScaledVector(t.v, dt);
      if (t.s.position.y < t.floor + 0.15) { t.s.position.y = t.floor + 0.15; t.v.y = Math.abs(t.v.y) * 0.45; t.v.x *= 0.7; t.v.z *= 0.7; }
    }
    for (const t of this.things.filter((t) => t.life > 1.6)) this.scene.remove(t.s);
    this.things = this.things.filter((t) => t.life <= 1.6);
  },
  forward() { return new THREE.Vector3(-Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), -Math.cos(this.yaw) * Math.cos(this.pitch)); },
  eyePos() { return new THREE.Vector3(this.w(this.pos.x), this.gy + (this.seat ? 1.2 : this.eye || 1.6) + this.jy, this.w(this.pos.z)); },
  puff(color, n, from, o = {}) {
    const f = this.forward();
    const origin = from || this.eyePos().add(new THREE.Vector3(0, -0.15, 0)).addScaledVector(f, 0.35);
    for (let i = 0; i < n; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: W3.tex(PUFF_CANVAS), color, transparent: true, depthWrite: false }));
      s.position.copy(origin);
      const v = (from ? new THREE.Vector3(0, o.up || 0.3, 0) : f.clone().multiplyScalar(1.2 + Math.random() * 0.8)).add(new THREE.Vector3((Math.random() - 0.5) * 0.5, Math.random() * 0.3, (Math.random() - 0.5) * 0.5));
      this.scene.add(s);
      this.puffs.push({ s, v, life: 0, max: (o.life || 1.6) + Math.random() * 1.4, size: (o.size || 0.18) + Math.random() * 0.15, grow: o.grow || 2.5, op: o.op || 0.75 });
    }
  },
  vape() {
    const cols = [0xffd9a0, 0xffc0e0, 0xc0d0ff, 0xc8f0e0, 0xffffff];
    this.puff(cols[this.puffCount % cols.length], 14);
    this.lastPuff = Date.now(); this.puffCount += 1;
    SFX.tone(110, 0.5, 'sawtooth', 0.02, -40);
    const hz = $('#haze'); hz.classList.remove('on'); void hz.offsetWidth; hz.classList.add('on');
    if (Math.random() < 0.22) setTimeout(() => { UI.toast(pick(['*kuch* *kuch*', '*kuch* Lekker hoor. *kuch*', 'Je ogen tranen. Mango, denk je.']), 1600); SFX.no(); }, 500);
    else if (this.puffCount % 5 === 0) UI.toast(pick(['Je voelt je heel even stoer.', 'Een wolk zo groot als de kerk.', 'Ergens in het gras knikt een tiener goedkeurend.']), 2000);
  },
  flash() { const f = $('#flash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); SFX.tone(1400, 0.08, 'square', 0.04); },
  jump() { if (this.jy === 0 && !this.seat) { this.jv = 4.6; SFX.tone(300, 0.1, 'square', 0.03, 200); } },
  throwThing(id, speed, g) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: W3.tex(heldIcon(id)), alphaTest: 0.5 }));
    s.scale.set(0.4, 0.4, 1);
    s.position.copy(this.eyePos()).add(new THREE.Vector3(0, -0.2, 0)).addScaledVector(this.forward(), 0.4);
    this.scene.add(s);
    this.things.push({ s, v: this.forward().multiplyScalar(speed).add(new THREE.Vector3(0, 1.5, 0)), g, life: 0, floor: this.gy });
    SFX.tone(500, 0.1, 'triangle', 0.04, -200);
  },
  // wie of wat staat er voor je? afstanden in meters
  aim(list, maxAng) {
    const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw);
    let best = null;
    for (const [x, z, reach, kind, obj, label, extra] of list) {
      const dx = this.w(x - this.pos.x), dz = this.w(z - this.pos.z), d = Math.hypot(dx, dz);
      if (d > reach || d < 0.05) continue;
      const ang = Math.acos(Math.max(-1, Math.min(1, (dx * fx + dz * fz) / d)));
      if (ang > maxAng) continue;
      const score = d / this.S + ang + (extra || 0);
      if (!best || score < best.score) best = { kind, obj, label, score };
    }
    return best;
  },
  npcXZ(n) { const r = G.npcRt[n.id]; return r ? [r.px / TS + 0.5, r.py / TS + 0.5] : null; },
  meleeTarget() {
    const list = [];
    for (const v of this.vapers) list.push([v.x, v.z, 3, 'vaper', v]);
    for (const n of G.npcsHere()) { const q = this.npcXZ(n); if (q) list.push([q[0], q[1], 3, 'npc', n]); }
    for (const p of Online.others()) if (p.presence.m === G.map.id) { const q = this.peerPos(p); list.push([q.x, q.z, 3, 'peer', p]); }
    return this.aim(list, 0.7);
  },
  dirName() {
    const a = ((this.yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    return a < Math.PI / 4 || a > Math.PI * 7 / 4 ? 'up' : a < Math.PI * 3 / 4 ? 'left' : a < Math.PI * 5 / 4 ? 'down' : 'right';
  },

  // ---------- vapers die echt in het gras staan (in Delfzijl: zware jongens met messen) ----------
  enemyFigure(id) {
    const E = ENEMIES[id];
    const g = buildFigure(LOOKS[E.look]);
    if (E.dz) g.scale.setScalar(1.12);
    if (E.knife) addKnife(g);
    if (E.vaper) { const cloud = vapeCloud(E.cloud, E.cloudScale || 1); g.add(cloud); g.userData.cloud = cloud; }
    return g;
  },
  updateVapers(dt) {
    const m = G.map;
    if (!m.encounters || !G.flags.intro) return;
    const pool = m.pool || RANDOM_POOL;
    const want = m.id === 'delfzijl' ? 6 : m.id === 'dorp' ? 4 : 3;
    this.vaperTimer -= dt;
    if (this.vapers.length < want && this.vaperTimer <= 0) {
      this.vaperTimer = m.id === 'delfzijl' ? 15 : 25;
      const tall = [];
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.tiles[y][x] === 'tall' && this.w(Math.hypot(x + 0.5 - this.pos.x, y + 0.5 - this.pos.z)) > 14) tall.push([x, y]);
      if (tall.length) {
        const [x, y] = tall[Math.floor(Math.random() * tall.length)];
        const id = pool[Math.floor(Math.random() * pool.length)];
        const g = this.enemyFigure(id);
        this.scene.add(g);
        this.vapers.push({ id, g, x: x + 0.5, z: y + 0.5, tx: x + 0.5, tz: y + 0.5, wait: 1 });
      }
    }
    for (const v of this.vapers) {
      const d = this.w(Math.hypot(v.x - this.pos.x, v.z - this.pos.z));
      v.wait -= dt;
      if (v.wait <= 0 && Math.hypot(v.tx - v.x, v.tz - v.z) < 0.05) {
        v.wait = 1 + Math.random() * 3;
        const cx = Math.floor(v.x), cy = Math.floor(v.z);
        const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [cx + a, cy + b]).filter(([a, b]) => tileAt(m, a, b) === 'tall');
        if (opts.length) { const [a, b] = opts[Math.floor(Math.random() * opts.length)]; v.tx = a + 0.5; v.tz = b + 0.5; }
      }
      const mx = v.tx - v.x, mz = v.tz - v.z, ml = Math.hypot(mx, mz);
      const mv = ml > 0.02;
      if (mv) { const st = Math.min(ml, dt * 0.9 / this.S); v.x += (mx / ml) * st; v.z += (mz / ml) * st; v.g.rotation.y = Math.atan2(mx, mz); }
      if (d < 6) v.g.rotation.y = Math.atan2(this.pos.x - v.x, this.pos.z - v.z);
      v.g.position.set(this.w(v.x), 0, this.w(v.z));
      animateFigure(v.g, this.t, mv);
      if (v.g.userData.cloud) animateCloud(v.g.userData.cloud, this.t);
      if (d < 1.3 && !G.busy && !UI.focus && G.mode === 'map') this.fightVaper(v);
    }
  },
  async fightVaper(v) {
    this.vapers = this.vapers.filter((x) => x !== v);
    this.scene.remove(v.g);
    this.vaperTimer = 30;
    this.standUp();
    this.fightAt = { x: v.x, z: v.z };
    await G.fight(v.id);
  },

  // ---------- het gevecht in 3D: de tegenstander staat gewoon voor je ----------
  battleSpot() {
    const p = this.pos, dist = 3.4 / this.S;
    const ok = (yaw) => { for (let k = 0.5; k <= dist + 0.3; k += 0.25) { const t = tileAt(G.map, Math.floor(p.x - Math.sin(yaw) * k), Math.floor(p.z - Math.cos(yaw) * k)); if (!(TILE_DEF[t] || {}).walk) return false; } return true; };
    let yaw = this.yaw;
    if (this.fightAt) yaw = Math.atan2(-(this.fightAt.x - p.x), -(this.fightAt.z - p.z));
    if (!ok(yaw)) for (let i = 1; i < 8; i++) { const y2 = this.yaw + i * Math.PI / 4; if (ok(y2)) { yaw = y2; break; } }
    this.fightAt = null;
    return { yaw, x: p.x - Math.sin(yaw) * dist, z: p.z - Math.cos(yaw) * dist };
  },
  renderBattle() {
    const B = Battle, f = B.foe;
    if (!f) return;
    if (!this.bt || this.bt.foe !== f) {
      if (this.bt) this.scene.remove(this.bt.g);
      const g = this.enemyFigure(f.id);
      if (f.boss) g.scale.multiplyScalar(1.12);
      const spot = this.battleSpot();
      g.position.set(this.w(spot.x), this.ground(spot.x, spot.z), this.w(spot.z));
      g.rotation.y = Math.atan2(this.pos.x - spot.x, this.pos.z - spot.z);
      this.scene.add(g);
      this.bt = { foe: f, g, spot, y0: g.position.y };
      this.yaw = spot.yaw; this.pitch = -0.08;
    }
    const bt = this.bt, g = bt.g;
    animateFigure(g, this.t, false);
    if (g.userData.cloud) g.userData.cloud.visible = !B.foeGone;
    if (g.userData.cloud) animateCloud(g.userData.cloud, this.t);
    g.position.y = bt.y0 + Math.sin(this.t * 3) * 0.03;
    g.visible = true;
    if (B.foeHit > 0) { B.foeHit -= 1; g.visible = B.foeHit % 4 >= 2; }
    if (B.foeGone) { B.foeGone += 0.02; g.position.y = bt.y0 - (B.foeGone - 1) * 2.2; g.rotation.z = (B.foeGone - 1) * 0.9; }
    let sx = 0;
    if (B.shake > 0) { sx = (Math.random() - 0.5) * 0.12; B.shake -= 1; }
    const hurt = $('#hurt');
    if (B.flash > 0) { hurt.style.opacity = String(B.flash / 14); B.flash -= 1; } else if (hurt.style.opacity !== '0') hurt.style.opacity = '0';
    const cam = this.camera, eye = this.eyePos();
    cam.position.set(eye.x + Math.cos(this.yaw) * sx, eye.y, eye.z - Math.sin(this.yaw) * sx);
    cam.rotation.order = 'YXZ'; cam.rotation.set(this.pitch, this.yaw, 0);
  },
  endBattle() { if (this.bt) { this.scene.remove(this.bt.g); this.bt = null; } $('#hurt').style.opacity = '0'; },

  // ---------- waar kijk je naar? ----------
  findTarget() {
    if (G.mode !== 'map' || G.busy || UI.focus) { this.target = null; this.showPrompt(); return; }
    if (this.seat) { this.target = { kind: 'stand', label: 'Opstaan' }; this.showPrompt(); return; }
    const list = [];
    for (const n of G.npcsHere()) { const q = this.npcXZ(n); if (q) list.push([q[0], q[1], 3.4, 'npc', n, 'Praten']); }
    // personages gaan voor decor (zoals in 2D: eerst wie er staat, dan wat er ligt)
    if (this.world) for (const o of this.world.userData.props) {
      const p = o.userData.prop;
      if (p.id && PROPS[p.id] && !(PROP_HIDE[p.id] && PROP_HIDE[p.id]())) list.push([p.x + 0.5, p.y + 0.5, p.name === 'schip' || p.name === 'kraan' ? 5 : 3.0, 'prop', o, p.name === 'bank' ? 'Gaan zitten' : 'Bekijken', 1.5]);
    }
    for (const p of Online.others()) if (p.presence.m === G.map.id) { const q = this.peerPos(p); list.push([q.x, q.z, 3, 'peer', p, `${String(p.presence.n).slice(0, 16)}: ruilen of zwaaien`]); }
    for (const v of this.vapers) list.push([v.x, v.z, 3, 'vaper', v, `Vechten met ${ENEMIES[v.id].name.toLowerCase()}`]);
    this.target = this.aim(list, 0.65);
    this.showPrompt();
  },
  showPrompt() {
    const el = $('#prompt');
    const txt = this.target ? `E · ${this.target.label}` : '';
    if (el.textContent !== txt) el.textContent = txt;
    el.hidden = !txt;
  },
  async interact() {
    const t = this.target; if (!t) return;
    if (t.kind === 'stand') { this.standUp(); return; }
    G.busy = true;
    try {
      if (t.kind === 'npc') {
        const r = G.npcRt[t.obj.id];
        const dx = this.pos.x - (r.px / TS + 0.5), dz = this.pos.z - (r.py / TS + 0.5);
        r.dir = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'right' : 'left') : (dz > 0 ? 'down' : 'up');
        await t.obj.talk();
      } else if (t.kind === 'prop') {
        const p = t.obj.userData.prop;
        if (p.name === 'bank') await this.sit(t.obj);
        else await PROPS[p.id]();
      } else if (t.kind === 'peer') await Online.talkTo(t.obj);
      else if (t.kind === 'vaper') { G.busy = false; await this.fightVaper(t.obj); return; }
    } finally { if (G.mode === 'map' && !Trade.t) G.busy = false; }
  },

  peerPos(p) { const s = p.presence; return { x: typeof s.px === 'number' ? s.px : s.x + 0.5, z: typeof s.pz === 'number' ? s.pz : s.y + 0.5 }; },

  // ---------- tekenen ----------
  render() {
    const cam = this.camera;
    if (G.mode === 'title' || !G.map) {
      const a = this.t * 0.08 + performance.now() / 12000;
      cam.position.set(40 + Math.cos(a) * 30, 16, 32 + Math.sin(a) * 30);
      cam.lookAt(40, 2, 30);
    } else if (G.mode === 'battle') {
      this.renderBattle();
    } else {
      if (this.bt) this.endBattle();
      cam.position.copy(this.eyePos()); cam.position.y += Math.abs(Math.sin(this.bob)) * 0.05;
      cam.rotation.order = 'YXZ';
      cam.rotation.set(this.pitch, this.yaw, 0);
    }
    SKY.update(1 / 60, cam.position, this.hemi, this.sun, this.scene, !!(G.map && G.map.inside && G.mode !== 'title'));
    // NPC's
    for (const n of NPCS) {
      const g = this.figs[n.id]; if (!g) continue;
      const r = G.npcRt[n.id];
      g.visible = !!r && (!n.show || n.show());
      if (!g.visible) continue;
      const x = r.px / TS + 0.5, z = r.py / TS + 0.5;
      g.position.set(this.w(x), this.ground(x, z), this.w(z));
      g.rotation.y = { down: 0, up: Math.PI, left: -Math.PI / 2, right: Math.PI / 2 }[r.dir] || 0;
      animateFigure(g, this.t, r.moving);
    }
    // decor dat soms verdwijnt
    if (this.world) for (const o of this.world.userData.props) { const p = o.userData.prop; o.visible = !(p.id && PROP_HIDE[p.id] && PROP_HIDE[p.id]()); }
    this.renderPeers();
    this.renderHand();
    if (document.pointerLockElement && (this.menuOpen() || G.mode === 'battle')) document.exitPointerLock();
    this.renderer.render(this.scene, cam);
  },
  menuOpen() { return ['#menu', '#trade', '#creator', '#choices', '#casino', '#qte'].some((s) => !$(s).hidden) || !$('#nameform').hidden; },

  renderPeers() {
    const seen = new Set();
    if (G.map && G.mode !== 'title') for (const p of Online.others()) {
      const s = p.presence; if (s.m !== G.map.id) continue;
      seen.add(p.peer);
      let e = this.peers[p.peer];
      const lookKey = JSON.stringify([s.ap, s.wr]);
      if (!e || e.lookKey !== lookKey) {
        if (e) this.scene.remove(e.g);
        const g = buildFigure(lookFrom(s.ap, s.wr));
        const q = this.peerPos(p);
        e = this.peers[p.peer] = { g, lookKey, x: q.x, z: q.z, tag: null, tagText: '' };
        this.scene.add(g);
      }
      const q = this.peerPos(p);
      const mv = Math.hypot(q.x - e.x, q.z - e.z);
      if (mv > 4) { e.x = q.x; e.z = q.z; } else { e.x += (q.x - e.x) * 0.25; e.z += (q.z - e.z) * 0.25; }
      const sitting = !!s.st;
      e.g.position.set(this.w(e.x), this.ground(e.x, e.z) - (sitting ? 0.25 : 0), this.w(e.z));
      e.g.rotation.y = (typeof s.r === 'number' ? s.r : 0) + Math.PI;
      animateFigure(e.g, this.t, mv > 0.01);
      if (sitting) for (const l of e.g.userData.legs || []) l.rotation.x = -Math.PI / 2;
      setHeld(e.g, typeof s.h === 'string' && (WEAPONS[s.h] || ITEMS[s.h]) ? s.h : WEAPONS[s.w] ? s.w : null);
      if (typeof s.vp === 'number' && s.vp !== e.vp) { if (e.vp !== undefined) this.puff(0xffe0c0, 10, new THREE.Vector3(this.w(e.x), e.g.position.y + 1.5, this.w(e.z))); e.vp = s.vp; }
      const near = this.w(Math.hypot(e.x - this.pos.x, e.z - this.pos.z)) < 3.5;
      const text = `${String(s.n).slice(0, 16)}${s.b ? ' (vecht)' : ''}${near ? ` · EUR ${(Number(s.eur) || 0).toLocaleString('nl-NL')}` : ''}`;
      if (text !== e.tagText) { if (e.tag) e.g.remove(e.tag); e.tag = textSprite(text, near ? '#ffd25a' : '#f4f1ea'); e.tag.position.y = 2.25; e.g.add(e.tag); e.tagText = text; }
    }
    for (const k of Object.keys(this.peers)) if (!seen.has(k)) { this.scene.remove(this.peers[k].g); delete this.peers[k]; }
  },

  renderHand() {
    const el = $('#hand');
    const B = Battle;
    let id = null, sw = 0;
    if (G.mode === 'battle' && B.swing) {
      // klap uitdelen in het gevecht: het wapen zwiept door beeld
      id = B.swing.id; sw = Math.sin(Math.min(1, B.swing.t / 14) * Math.PI);
      if (++B.swing.t > 16) B.swing = null;
    } else if (G.mode === 'map' && G.S) {
      const h = Hotbar.hand();
      id = h ? (h.id === 'paraplu' && this.umbrella ? 'paraplu_open' : h.id) : null;
      sw = this.swingT > 0 ? Math.sin((1 - this.swingT / 0.35) * Math.PI) : 0;
    }
    if (el.dataset.id !== String(id)) {
      el.dataset.id = String(id);
      const x = el.getContext('2d'); x.clearRect(0, 0, 12, 12);
      if (id) x.drawImage(heldIcon(id), 0, 0);
    }
    el.hidden = !id;
    if (id) el.style.transform = `translate(${Math.sin(this.bob) * 6 - sw * 90}px, ${Math.abs(Math.cos(this.bob)) * 8 - sw * 50}px) rotate(${-8 - sw * 55}deg)`;
  },

  // ---------- besturing ----------
  input() {
    const UIKEY = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Enter: 'ok', Space: 'ok', KeyE: 'ok', Escape: 'cancel', KeyQ: 'cancel', Backspace: 'cancel', Tab: 'cancel', KeyM: 'cancel' };
    addEventListener('keydown', (e) => {
      if (e.target && e.target.tagName === 'INPUT') return;
      SFX.init();
      const k = UIKEY[e.code];
      if (UI.focus) {
        if (k) { e.preventDefault(); if (!e.repeat || ['up', 'down', 'left', 'right'].includes(k)) UI.key(k); }
        return;
      }
      this.keys.add(e.code);
      if (['Tab', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
      if (e.repeat || G.mode !== 'map' || G.busy) return;
      if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') this.interact();
      else if (['Tab', 'KeyM', 'KeyQ', 'Escape'].includes(e.code)) { this.keys.clear(); G.menu(); }
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
    const cv = $('#view');
    cv.addEventListener('click', () => {
      if (G.mode !== 'map' || UI.focus) return;
      if (document.pointerLockElement === cv) { Hotbar.use(); return; }
      try { const r = cv.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) {}
    });
    cv.addEventListener('contextmenu', (e) => { e.preventDefault(); if (G.mode === 'map' && !G.busy && !UI.focus) this.interact(); });
    addEventListener('wheel', (e) => { if (G.mode === 'map' && !UI.focus && !G.busy && document.pointerLockElement === cv) Hotbar.select(Hotbar.sel + (e.deltaY > 0 ? 1 : -1)); }, { passive: true });
    addEventListener('keydown', (e) => {
      if (UI.focus || G.mode !== 'map' || G.busy || (e.target && e.target.tagName === 'INPUT')) return;
      const m = /^Digit([1-9])$/.exec(e.code);
      if (m) Hotbar.select(+m[1] - 1);
      if (e.code === 'KeyF' && !e.repeat) Hotbar.use();
    });
    addEventListener('mousemove', (e) => {
      if (document.pointerLockElement !== cv) return;
      this.yaw -= e.movementX * 0.0025;
      this.pitch = Math.max(-1.3, Math.min(1.3, this.pitch - e.movementY * 0.0025));
    });
  },
};

// groot mes in de rechterhand (de zware jongens uit Delfzijl)
function addKnife(g) {
  const h = g.userData.rightHand; if (!h) return;
  const k = new THREE.Group();
  k.add(box(0.06, 0.06, 0.16, cmat('#3a2a1a'), 0, 0, 0));
  k.add(box(0.12, 0.03, 0.03, cmat('#888'), 0, 0, 0.09));
  k.add(box(0.025, 0.09, 0.55, new THREE.MeshLambertMaterial({ color: '#d8dce4', emissive: '#22262e' }), 0, 0.01, 0.38));
  k.position.set(0, -0.6, 0.06);
  h.add(k);
}

// 3D-voorbeeld in de karaktermaker
window.CreatorPreview = function (cv, L, t) {
  let P = E3.preview;
  if (!P) {
    const c = document.createElement('canvas'); c.width = c.height = 160;
    const r = new THREE.WebGLRenderer({ canvas: c, alpha: true, preserveDrawingBuffer: true });
    const s = new THREE.Scene();
    s.add(new THREE.HemisphereLight(0xffffff, 0x667788, 1.0));
    const d = new THREE.DirectionalLight(0xffffff, 0.5); d.position.set(2, 3, 4); s.add(d);
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 20); cam.position.set(0, 1.2, 4.4); cam.lookAt(0, 0.95, 0);
    P = E3.preview = { c, r, s, cam, key: '', g: null };
  }
  const key = JSON.stringify(L);
  if (key !== P.key) { if (P.g) P.s.remove(P.g); P.g = buildFigure(L); P.s.add(P.g); P.key = key; }
  P.g.rotation.y = Math.sin(t * 0.9) * 1.1;
  animateFigure(P.g, t, false);
  P.r.render(P.s, P.cam);
  const x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height); x.drawImage(P.c, 0, 0, cv.width, cv.height);
};

// ---------- de gedeelde engine (G) aanpassen voor 3D ----------
(function () {
  const loadMap2d = G.loadMap.bind(G), place2d = G.placePlayer.bind(G);
  G.noRandom = true;
  G.loadMap = function (id, x, y, dir) { loadMap2d(id, x, y, dir); E3.build(id); };
  G.placePlayer = function (x, y, dir) {
    place2d(x, y, dir);
    E3.seat = null;
    E3.pos = { x: x + 0.5, z: y + 0.5 }; E3.safe = { ...E3.pos };
    E3.gy = E3.ground(E3.pos.x, E3.pos.z);
    E3.yaw = { up: 0, down: Math.PI, left: Math.PI / 2, right: -Math.PI / 2 }[dir || 'down'];
    E3.pitch = 0;
  };
  G.stepBack = function () {
    const s = E3.safe || E3.pos;
    E3.pos = { x: s.x, z: s.z };
    this.pl.x = Math.floor(s.x); this.pl.y = Math.floor(s.z);
  };
  G.update = function (dt) { this.time += dt; E3.update(dt); };
  G.render = function () {
    $('#screen').hidden = true;
    $('#hotwrap').hidden = !(this.S && this.mode === 'map');
    $('#cross').hidden = this.mode !== 'map';
    if (this.S && this.mode === 'map') Hotbar.paint();
    E3.render();
  };
  G.interact = () => E3.interact();
  G.presenceExtra = () => { const h = G.S && Hotbar.hand(); return { px: Math.round(E3.pos.x * 100) / 100, pz: Math.round(E3.pos.z * 100) / 100, r: Math.round(E3.yaw * 100) / 100, h: h ? h.id : '', vp: E3.lastPuff, st: E3.seat ? 1 : 0 }; };
  E3.init();
})();
