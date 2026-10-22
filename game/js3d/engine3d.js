// 3D-engine: vervangt het tekenen, lopen en de besturing van de 2D-engine. De spellogica (G, verhaal) blijft gedeeld;
// gevechten zijn in 3D realtime (combat3d.js). Posities zijn in tegels; pas bij het tekenen gaat alles keer S (meters per tegel).
// Hoogte (fy) is in meters: je kunt springen en op kliko's, kratten en platte daken staan.
const E3 = {
  pos: { x: 3.5, z: 5.5 }, yaw: Math.PI, pitch: 0, keys: new Set(), figs: {}, peers: {}, vaperTimer: 0, S: 2, fy: 0, vy: 0,
  t: 0, bob: 0, target: null, warnAt: -99, safe: null, swingT: 0, puffs: [], lastPuff: 0,
  seat: null, smokeT: 0, hurtT: 0, fallT: 0, slideT: 0, hideNpc: null, talking: null, lights: [], lightT: 0, night: 0,

  init() {
    const cv = $('#view');
    this.renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, 4 / 3, 0.05, 300);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x556644, 0.85); this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xfff2dd, 0.55); this.sun.position.set(-20, 40, 30); this.scene.add(this.sun);
    // vaste set lampen die 's avonds naar de dichtstbijzijnde lantaarnpalen springen (vast aantal: geen shader-wissels)
    for (let i = 0; i < 6; i++) { const l = new THREE.PointLight(0xffc878, 0, 15, 1.6); l.position.set(0, -50, 0); this.scene.add(l); this.lights.push(l); }
    this.scene.fog = new THREE.Fog('#b8d4ee', 45, 170);
    SKY.build(this.scene);
    const resize = () => { const r = $('#game').getBoundingClientRect(); this.renderer.setSize(r.width, r.height, false); this.camera.aspect = r.width / r.height; this.camera.updateProjectionMatrix(); };
    addEventListener('resize', resize); resize();
    buildCombatUI();
    this.input();
  },

  // ---------- kaart opbouwen ----------
  build(id) {
    if (this.world) { this.scene.remove(this.world); this.world.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
    for (const k of Object.keys(this.figs)) this.scene.remove(this.figs[k]);
    for (const k of Object.keys(this.peers)) this.scene.remove(this.peers[k].g);
    for (const p of this.puffs) this.scene.remove(p.s);
    CB.clear();
    this.figs = {}; this.peers = {}; this.puffs = []; this.seat = null; this.hideNpc = null;
    for (const k of Object.keys(PV.models)) { this.scene.remove(PV.models[k]); delete PV.models[k]; }
    if (MAPS[id].inside) this.mounted = false;
    const m = MAPS[id];
    this.world = buildWorld(m);
    this.S = this.world.userData.S;
    this.scene.add(this.world);
    this.scene.background = m.inside ? new THREE.Color('#140f1c') : null;
    // buiten hangt overal vapedamp: je ziet maar zo'n 20 meter ver (in Delfzijl nog minder)
    if (m.inside) this.scene.fog = new THREE.Fog('#2a2018', 14, m.palace ? 60 : 36);
    else this.scene.fog = m.id === 'delfzijl' ? new THREE.Fog('#cfc6dc', 3, 17) : new THREE.Fog('#cfc6dc', 4, 22);
    SKY.hazeAmt = m.inside ? 0 : m.id === 'delfzijl' ? 1 : 0.9;
    if (m.inside) { this.hemi.intensity = 0.6; this.hemi.color.set('#fff0dd'); this.hemi.groundColor.set('#c8b090'); this.sun.intensity = 0.15; }
    else this.hemi.groundColor.set('#556644');
    this.eye = m.inside && ceilH(m) < 2.2 ? ceilH(m) - 0.35 : 1.6;
    for (const n of NPCS.filter((n) => n.map === id)) { const g = buildFigure(n.look); this.figs[n.id] = g; this.scene.add(g); }
    for (const l of this.lights) l.intensity = 0;
    this.lightT = 0;
    // huizen met vijanden
    if (m.foes && foesReady(id)) CB.spawnIndoor(m);
    this.vaperTimer = 2;
  },
  w(v) { return v * this.S; },
  ground(tx, tz) { return G.map ? groundH(G.map, Math.floor(tx), Math.floor(tz)) : 0; },

  // ---------- hoogtes en botsen ----------
  // hoe hoog is de bovenkant van deze tegel? Infinity = muur
  standH(tx, ty) {
    const m = G.map;
    const rb = roofAt(m, tx, ty);
    if (rb) return roofTop(rb);
    const t = tileAt(m, tx, ty);
    let solid = false, climb = null;
    for (const p of m.props) if (p.x === tx && p.y === ty) { const h = climbH(p); if (h != null) climb = h; else if (p.solid) solid = true; }
    if (climb != null) return groundH(m, tx, ty) + climb;
    if (t === 'hedge' && !m.inside) return 1.2;
    if (!(TILE_DEF[t] || {}).walk || solid || G.npcAt(tx, ty)) return Infinity;
    return groundH(m, tx, ty);
  },
  corners(x, z) { const r = Math.min(0.28, 0.32 / this.S); return [[-r, -r], [r, -r], [-r, r], [r, r]].map(([dx, dz]) => [Math.floor(x + dx), Math.floor(z + dz)]); },
  free(x, z) { for (const [a, b] of this.corners(x, z)) if (this.standH(a, b) > this.fy + 0.45) return false; return true; },
  floorAt(x, z) { let f = -1; for (const [a, b] of this.corners(x, z)) { const h = this.standH(a, b); if (h <= this.fy + 0.45) f = Math.max(f, h); } return Math.max(0, f); },
  onGround() { return this.fy - this.floorAt(this.pos.x, this.pos.z) < 0.03; },

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
      else if ((f || s) && this.fallT <= 0) {
        const run = k.has('ShiftLeft') || k.has('ShiftRight') ? 7.5 : 4.2;
        const sp = run * (this.mounted || CB.buffs.speed > 0 ? 2 : 1) * (f < 0 && !s ? 0.6 : 1) / this.S * dt / Math.hypot(f, s);
        const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
        const dx = (-sin * f + cos * s) * sp, dz = (-cos * f - sin * s) * sp;
        const nx = this.pos.x + dx, nz = this.pos.z + dz;
        if (this.free(nx, this.pos.z)) this.pos.x = nx;
        if (this.free(this.pos.x, nz)) this.pos.z = nz;
        moving = true;
      }
    }
    // zwaartekracht, springen en traptreden
    if (this.seat) this.fy = this.seat.gy;
    else {
      const floor = this.floorAt(this.pos.x, this.pos.z);
      if (this.fy > floor + 0.001 || this.vy > 0) { this.vy -= 14 * dt; this.fy += this.vy * dt; if (this.fy <= floor) { if (this.vy < -7) SFX.tone(90, 0.08, 'triangle', 0.04); this.fy = floor; this.vy = 0; } }
      else if (this.fy < floor) this.fy = Math.min(floor, this.fy + dt * 6);
    }
    this.bob = moving && this.onGround() ? this.bob + dt * 9 : this.bob * 0.9;
    this.hurtT = Math.max(0, this.hurtT - dt); this.fallT = Math.max(0, this.fallT - dt); this.slideT = Math.max(0, this.slideT - dt);
    // tegel gewisseld? dan deuren, randen en waarschuwingen afhandelen (alleen met je voeten op de grond)
    const pl = G.pl, tx = Math.floor(this.pos.x), ty = Math.floor(this.pos.z);
    pl.dir = this.dirName();
    const low = this.fy - this.ground(this.pos.x, this.pos.z) < 0.3;
    if (!this.seat && low && (tx !== pl.x || ty !== pl.y)) {
      const prev = { x: pl.x + 0.5, z: pl.y + 0.5 };
      pl.x = tx; pl.y = ty; pl.px = tx * TS; pl.py = ty * TS;
      if (!m_tile_door(G.map, prev.x - 0.5, prev.z - 0.5)) this.safe = prev;
      if (!G.busy) G.arrive();
    }
    G.updateNpcs(dt);
    CB.update(dt);
    this.updateFx(dt);
    this.findTarget();
  },
  jump() {
    if (this.seat) { this.standUp(); return; }
    if (this.onGround() && this.fallT <= 0) { this.vy = 5.6; this.fy += 0.01; SFX.tone(300, 0.1, 'square', 0.03, 200); }
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
    this.fy = this.ground(this.pos.x, this.pos.z);
    this.seat = null;
    SFX.tone(260, 0.08, 'triangle', 0.03, 80);
  },

  // ---------- effecten: dampwolkjes en rook ----------
  updateFx(dt) {
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
  },
  forward() { return new THREE.Vector3(-Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), -Math.cos(this.yaw) * Math.cos(this.pitch)); },
  eyePos() {
    const eye = this.seat ? 1.2 : this.fallT > 0 ? 0.45 : this.slideT > 0 ? 0.8 : (this.eye || 1.6) + (this.mounted ? 0.35 : 0);
    return new THREE.Vector3(this.w(this.pos.x), this.fy + eye, this.w(this.pos.z));
  },
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
    if (!from) this.lastPuff = Date.now();
  },
  flash() { const f = $('#flash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); },
  // wie of wat staat er voor je? afstanden in meters
  aim(list, maxAng) {
    const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw);
    let best = null;
    for (const [x, z, reach, kind, obj, label, extra] of list) {
      const dx = this.w(x - this.pos.x), dz = this.w(z - this.pos.z), d = Math.hypot(dx, dz);
      if (d > reach) continue;
      const ang = d < 0.05 ? 0 : Math.acos(Math.max(-1, Math.min(1, (dx * fx + dz * fz) / d)));
      if (ang > maxAng) continue;
      const score = d / this.S + ang + (extra || 0);
      if (!best || score < best.score) best = { kind, obj, label, score };
    }
    return best;
  },
  npcXZ(n) { const r = G.npcRt[n.id]; return r ? [r.px / TS + 0.5, r.py / TS + 0.5] : null; },
  dirName() {
    const a = ((this.yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    return a < Math.PI / 4 || a > Math.PI * 7 / 4 ? 'up' : a < Math.PI * 3 / 4 ? 'left' : a < Math.PI * 5 / 4 ? 'down' : 'right';
  },
  // vijandfiguur met wolk en (in Delfzijl) mes
  enemyFigure(id) {
    const E = ENEMIES[id];
    const g = buildFigure(LOOKS[E.look]);
    if (E.dz) g.scale.setScalar(1.12);
    if (E.knife) addKnife(g);
    if (E.vaper) { const cloud = vapeCloud(E.cloud, E.cloudScale || 1); g.add(cloud); g.userData.cloud = cloud; }
    return g;
  },

  // ---------- waar kijk je naar? ----------
  findTarget() {
    if (G.mode !== 'map' || G.busy || UI.focus) { this.target = null; this.showPrompt(); return; }
    if (this.seat) { this.target = { kind: 'stand', label: 'Opstaan' }; this.showPrompt(); return; }
    const list = [];
    if (this.fy - this.ground(this.pos.x, this.pos.z) < 0.6) for (const n of G.npcsHere()) { if (n.id === this.hideNpc) continue; const q = this.npcXZ(n); if (q) list.push([q[0], q[1], 3.4, 'npc', n, 'Praten']); }
    for (const v of CB.lootable()) list.push([v.x, v.z, 3.4, 'loot', v, `Looten: ${v.name}`, -0.5]);
    for (const p of PV.visible()) list.push([p.x, p.z, 3.4, 'pile', p, p.own ? 'Je eigen spullen oprapen' : `Spullen van ${p.n} oprapen`, -0.6]);
    // personages gaan voor decor (zoals in 2D: eerst wie er staat, dan wat er ligt)
    if (this.world) for (const o of this.world.userData.props) {
      const p = o.userData.prop;
      if (Math.abs((o.userData.baseY || 0) - this.fy) > 2.2) continue;
      if (p.id && PROPS[p.id] && !(PROP_HIDE[p.id] && PROP_HIDE[p.id]())) list.push([p.x + 0.5, p.y + 0.5, p.name === 'schip' || p.name === 'kraan' ? 5 : 3.0, 'prop', o, p.name === 'bank' ? 'Gaan zitten' : p.name === 'paashaas' || p.name === 'dakbuit' ? 'Oppakken' : 'Bekijken', p.name === 'paashaas' || p.name === 'dakbuit' ? 0 : 1.5]);
    }
    for (const p of Online.others()) if (p.presence.m === G.map.id) { const q = this.peerPos(p); list.push([q.x, q.z, 3, 'peer', p, `${String(p.presence.n).slice(0, 16)}: ruilen of zwaaien`]); }
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
    if (t.kind === 'loot') { CB.openLoot(t.obj); return; }
    if (t.kind === 'pile') { PV.open(t.obj); return; }
    G.busy = true;
    try {
      if (t.kind === 'npc') {
        const r = G.npcRt[t.obj.id];
        const dx = this.pos.x - (r.px / TS + 0.5), dz = this.pos.z - (r.py / TS + 0.5);
        r.dir = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'right' : 'left') : (dz > 0 ? 'down' : 'up');
        this.talking = t.obj;
        await t.obj.talk();
      } else if (t.kind === 'prop') {
        const p = t.obj.userData.prop;
        if (p.name === 'bank') await this.sit(t.obj);
        else await PROPS[p.id]();
      } else if (t.kind === 'peer') await Online.talkTo(t.obj);
    } finally { this.talking = null; if (G.mode === 'map' && !Trade.t && !CB.loot) G.busy = false; }
  },

  peerPos(p) { const s = p.presence; return { x: typeof s.px === 'number' ? s.px : s.x + 0.5, z: typeof s.pz === 'number' ? s.pz : s.y + 0.5 }; },

  // ---------- 's avonds: lantaarnpalen en ramen ----------
  updateLights(dt) {
    const inside = !!(G.map && G.map.inside);
    const night = inside || G.mode === 'title' ? 0 : 1 - (SKY.dayF == null ? 1 : SKY.dayF);
    this.night = night;
    const on = THREE.MathUtils.smoothstep(night, 0.25, 0.7);
    for (const m of GLOW_MATS) m.emissiveIntensity = on * 0.95;
    const lamps = this.world ? this.world.userData.lamps : [];
    for (const l of lamps) { l.halo.material.opacity = on * 0.85; l.pool.material.opacity = on * 0.75; }
    this.lightT -= dt;
    if (this.lightT <= 0) {
      this.lightT = 0.5;
      const me = this.eyePos();
      const near = lamps.slice().sort((a, b) => a.pos.distanceToSquared(me) - b.pos.distanceToSquared(me));
      this.lights.forEach((L, i) => { const l = near[i]; if (l) L.position.copy(l.pos); L.userData.on = !!l; });
    }
    for (const L of this.lights) L.intensity = L.userData.on ? on * 1.6 : 0;
  },

  // ---------- tekenen ----------
  render() {
    const cam = this.camera;
    if (G.mode === 'title' || !G.map) {
      const a = this.t * 0.08 + performance.now() / 12000;
      cam.position.set(40 + Math.cos(a) * 9, 7, 30 + Math.sin(a) * 9);
      cam.lookAt(40, 2, 28);
    } else {
      cam.position.copy(this.eyePos()); cam.position.y += Math.abs(Math.sin(this.bob)) * 0.05;
      cam.rotation.order = 'YXZ';
      cam.rotation.set(this.pitch, this.yaw, this.fallT > 0 ? 0.9 : 0);
      if (this.sceneCam) this.sceneCam(cam);
    }
    SKY.update(1 / 60, cam.position, this.hemi, this.sun, this.scene, !!(G.map && G.map.inside && G.mode !== 'title'));
    this.updateLights(1 / 60);
    // NPC's
    for (const n of NPCS) {
      const g = this.figs[n.id]; if (!g) continue;
      const r = G.npcRt[n.id];
      g.visible = !!r && (!n.show || n.show()) && n.id !== this.hideNpc && !(this.hideNpcs && this.hideNpcs.includes(n.id));
      if (!g.visible) continue;
      const x = r.px / TS + 0.5, z = r.py / TS + 0.5;
      g.position.set(this.w(x), this.ground(x, z), this.w(z));
      g.rotation.y = { down: 0, up: Math.PI, left: -Math.PI / 2, right: Math.PI / 2 }[r.dir] || 0;
      animateFigure(g, this.t, r.moving);
    }
    // decor dat soms verdwijnt
    if (this.world) for (const o of this.world.userData.props) { const p = o.userData.prop; o.visible = !(p.id && PROP_HIDE[p.id] && PROP_HIDE[p.id]()); }
    this.renderPeers();
    PV.render();
    this.renderHand();
    const hurt = $('#hurt'), op = String(Math.min(0.85, this.hurtT * 2.4)); if (hurt.style.opacity !== op) hurt.style.opacity = op;
    if (document.pointerLockElement && this.menuOpen()) document.exitPointerLock();
    this.renderer.render(this.scene, cam);
  },
  menuOpen() { return ['#menu', '#trade', '#creator', '#choices', '#casino', '#qte', '#loot'].some((s) => !$(s).hidden) || !$('#nameform').hidden; },

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
      const fy = typeof s.fy === 'number' ? s.fy : this.ground(e.x, e.z);
      e.g.position.set(this.w(e.x), fy - (sitting ? 0.25 : 0), this.w(e.z));
      e.g.rotation.y = (typeof s.r === 'number' ? s.r : 0) + Math.PI;
      animateFigure(e.g, this.t, mv > 0.01);
      if (sitting) for (const l of e.g.userData.legs || []) l.rotation.x = -Math.PI / 2;
      // op de fatbike
      if (s.mt && !e.bike) { e.bike = PV.bikeModel(); e.bike.rotation.y = Math.PI; e.bike.position.y = -0.35; e.g.add(e.bike); }
      if (e.bike) { e.bike.visible = !!s.mt; if (s.mt) { e.g.position.y += 0.35; for (const l of e.g.userData.legs || []) l.rotation.x = -0.9; } }
      setHeld(e.g, WEAPONS[s.w] ? s.w : null);
      if (typeof s.vp === 'number' && s.vp !== e.vp) { if (e.vp !== undefined) this.puff(0xffe0c0, 10, new THREE.Vector3(this.w(e.x), e.g.position.y + 1.5, this.w(e.z))); e.vp = s.vp; }
      const cl = s.ap && CLASSES[CLASS_KEYS[s.ap.cl]];
      const line2 = `Lvl ${Number(s.lvl) || 1}${cl ? ` ${cl.name}` : ''} · EUR ${(Number(s.eur) || 0).toLocaleString('nl-NL')}`;
      const text = `${String(s.n).slice(0, 16)}${s.b ? ' (vecht)' : ''}\n${line2}`;
      if (text !== e.tagText) { if (e.tag) e.g.remove(e.tag); e.tag = textSprite2(String(s.n).slice(0, 16), line2, cl ? cl.col : '#c8d0e8'); e.tag.position.y = 2.4; e.g.add(e.tag); e.tagText = text; }
    }
    for (const k of Object.keys(this.peers)) if (!seen.has(k)) { this.scene.remove(this.peers[k].g); delete this.peers[k]; }
  },

  // je wapen in beeld (alleen voor de stats, maar je zwaait er wel mee)
  renderHand() {
    const el = $('#hand');
    const id = G.mode === 'map' && G.S && G.P.wpn && !this.seat && this.fallT <= 0 ? G.P.wpn : null;
    if (el.dataset.id !== String(id)) {
      el.dataset.id = String(id);
      const x = el.getContext('2d'); x.clearRect(0, 0, 12, 12);
      if (id) x.drawImage(heldIcon(id), 0, 0);
    }
    el.hidden = !id;
    const sw = this.swingT > 0 ? Math.sin((1 - this.swingT / 0.35) * Math.PI) : 0;
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
      if (G.mode !== 'map' || G.busy) return;
      if (e.code === 'Space') { this.jump(); return; }
      if (e.repeat) return;
      const dg = /^Digit([1-5])$/.exec(e.code);
      if (dg) { CB.use(+dg[1] - 1); return; }
      if (e.code === 'Tab') { CB.tab(); return; }
      if (e.code === 'KeyR') { PV.toggleMount(); return; }
      if (e.code === 'KeyE' || e.code === 'Enter') this.interact();
      else if (e.code === 'Escape' && CB.target) CB.setTarget(null);
      else if (['KeyM', 'KeyQ', 'Escape'].includes(e.code)) { this.keys.clear(); G.menu(); }
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
    const cv = $('#view');
    cv.addEventListener('click', () => {
      if (G.mode !== 'map' || UI.focus) return;
      if (document.pointerLockElement === cv) { CB.pick(); return; }
      try { const r = cv.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) {}
    });
    cv.addEventListener('contextmenu', (e) => { e.preventDefault(); if (G.mode === 'map' && !G.busy && !UI.focus) this.interact(); });
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

// ---------- alleen in 3D: de jump puzzle achter het dorpshuis en extra lantaarnpalen ----------
(function () {
  const d = MAPS.dorp;
  const dh = d.buildings.find((b) => b.id === 'dorpshuis'); if (dh) dh.flat = true;
  setT(d, 25, 5, 'grass');
  prop(d, 23, 4, 'kliko', true);
  prop(d, 24, 4, 'kratten', true, 'kratten');
  prop(d, 25, 4, 'kist', true);
  prop(d, 25, 5, 'steiger', true, 'steiger');
  prop(d, 22, 3, 'bordje', true, 'dakbord');
  prop(d, 27, 9, 'paashaas', false, 'paashaas');
  // meer licht op straat
  const lamp = (m, list) => { for (const [x, y] of list) if ((TILE_DEF[tileAt(m, x, y)] || {}).walk && !m.props.some((p) => p.x === x && p.y === y) && !m.doors.some((q) => q.x === x && q.y === y)) prop(m, x, y, 'lamp', true); };
  lamp(d, [[13, 4], [10, 20], [24, 25], [36, 25], [30, 29]]);
  lamp(MAPS.oost, [[22, 12], [33, 12], [3, 12]]);
  lamp(MAPS.zuid, [[4, 4], [14, 4], [26, 4], [36, 4], [12, 18], [24, 20]]);
  lamp(MAPS.delfzijl, [[5, 8], [16, 8], [27, 8], [35, 8], [41, 12], [41, 20], [41, 30], [8, 22], [20, 22], [36, 24], [29, 40]]);
})();

// ---------- de gedeelde engine (G) aanpassen voor 3D ----------
(function () {
  const loadMap2d = G.loadMap.bind(G), place2d = G.placePlayer.bind(G), begin2d = G.begin.bind(G);
  G.noRandom = true;
  G.loadMap = function (id, x, y, dir) { loadMap2d(id, x, y, dir); E3.build(id); };
  G.placePlayer = function (x, y, dir) {
    place2d(x, y, dir);
    E3.seat = null;
    E3.pos = { x: x + 0.5, z: y + 0.5 }; E3.safe = { ...E3.pos };
    E3.fy = E3.ground(E3.pos.x, E3.pos.z); E3.vy = 0;
    E3.yaw = { up: 0, down: Math.PI, left: Math.PI / 2, right: -Math.PI / 2 }[dir || 'down'];
    E3.pitch = 0;
  };
  G.stepBack = function () {
    const s = E3.safe || E3.pos;
    E3.pos = { x: s.x, z: s.z };
    E3.fy = E3.ground(s.x, s.z);
    this.pl.x = Math.floor(s.x); this.pl.y = Math.floor(s.z);
  };
  G.update = function (dt) { this.time += dt; E3.update(dt); };
  G.render = function () {
    $('#screen').hidden = true;
    $('#hotwrap').hidden = true;
    $('#cross').hidden = this.mode !== 'map';
    E3.render();
  };
  G.interact = () => E3.interact();
  // verhaalgevechten zijn in 3D ook gewoon realtime; Derkje doe je na in geluiden
  G.fight = async function (id) {
    if (id === 'derkje') return derkjeScene();
    const wasBusy = this.busy;
    this.busy = false; UI.focus = null;
    SFX.battle();
    UI.toast(`${ENEMIES[id].name} valt aan! Gebruik 1-5.`, 2200);
    const r = await CB.storyFight(id);
    E3.hideNpc = null;
    // verloren = permadeath, dat is in CB.die al afgehandeld
    this.busy = r === 'lose' ? true : wasBusy;
    return r;
  };
  G.begin = function (st, fresh) {
    const r = begin2d(st, fresh);
    CB.fixEnergy(); if (fresh) G.P.ep = G.P.maxEp;
    if (G.S.ap && G.S.ap.cl == null) setTimeout(() => chooseClass(), 600);
    return r;
  };
  G.presenceExtra = () => ({ ...PV.presence(), px: Math.round(E3.pos.x * 100) / 100, pz: Math.round(E3.pos.z * 100) / 100, fy: Math.round(E3.fy * 100) / 100, r: Math.round(E3.yaw * 100) / 100, vp: E3.lastPuff, st: E3.seat ? 1 : 0 });
  E3.init();
})();
