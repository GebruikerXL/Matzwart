// 3D-engine: vervangt het tekenen, lopen en de besturing van de 2D-engine. De spellogica (G, verhaal, gevechten) blijft gedeeld.
const E3 = {
  pos: { x: 3.5, z: 5.5 }, yaw: Math.PI, pitch: 0, keys: new Set(), figs: {}, peers: {}, vapers: [], vaperTimer: 0,
  t: 0, bob: 0, target: null, warnAt: -99, safe: null,

  init() {
    const cv = $('#view');
    this.renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, 4 / 3, 0.05, 200);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x556644, 0.85));
    const sun = new THREE.DirectionalLight(0xfff2dd, 0.55); sun.position.set(-20, 40, 30); this.scene.add(sun);
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
    this.figs = {}; this.peers = {}; this.vapers = [];
    const m = MAPS[id];
    this.world = buildWorld(m);
    this.scene.add(this.world);
    this.scene.background = new THREE.Color(m.inside ? '#140f1c' : '#9cc8f0');
    this.scene.fog = m.inside ? new THREE.Fog('#140f1c', 8, 20) : new THREE.Fog('#b8d4ee', 22, 60);
    for (const n of NPCS.filter((n) => n.map === id)) { const g = buildFigure(n.look); this.figs[n.id] = g; this.scene.add(g); }
    this.vaperTimer = 2;
  },

  // ---------- botsen ----------
  blocked(tx, ty) {
    const m = G.map;
    const t = tileAt(m, tx, ty);
    if (!(TILE_DEF[t] || {}).walk) return true;
    if (G.propAt(tx, ty) && G.propAt(tx, ty).solid) return true;
    if (G.npcAt(tx, ty)) return true;
    return false;
  },
  free(x, z, r = 0.28) {
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
      if (f || s) {
        const sp = (k.has('ShiftLeft') || k.has('ShiftRight') ? 5.5 : 3.4) * dt / Math.hypot(f, s);
        const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
        const dx = (-sin * f + cos * s) * sp, dz = (-cos * f - sin * s) * sp;
        const nx = this.pos.x + dx, nz = this.pos.z + dz;
        if (this.free(nx, this.pos.z)) this.pos.x = nx;
        if (this.free(this.pos.x, nz)) this.pos.z = nz;
        moving = true;
      }
    }
    this.bob = moving ? this.bob + dt * 9 : this.bob * 0.9;
    // tegel gewisseld? dan deuren, randen en waarschuwingen afhandelen
    const pl = G.pl, tx = Math.floor(this.pos.x), ty = Math.floor(this.pos.z);
    pl.dir = this.dirName();
    if (tx !== pl.x || ty !== pl.y) {
      const prev = { x: pl.x + 0.5, z: pl.y + 0.5 };
      const wasTall = tileAt(G.map, pl.x, pl.y) === 'tall';
      pl.x = tx; pl.y = ty; pl.px = tx * TS; pl.py = ty * TS;
      if (!m_tile_door(G.map, prev.x - 0.5, prev.z - 0.5)) this.safe = prev;
      if (G.map.encounters && G.flags.intro && tileAt(G.map, tx, ty) === 'tall' && !wasTall && this.t - this.warnAt > 45) {
        this.warnAt = this.t;
        G.busy = true;
        UI.say('', 'Je ruikt een sterke vape-lucht. Kijk uit, er kunnen vapende tieners in het gras zitten!').then(() => { G.busy = false; });
      } else if (!G.busy) G.arrive();
    }
    G.updateNpcs(dt);
    this.updateVapers(dt);
    this.findTarget();
  },
  dirName() {
    const a = ((this.yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    return a < Math.PI / 4 || a > Math.PI * 7 / 4 ? 'up' : a < Math.PI * 3 / 4 ? 'left' : a < Math.PI * 5 / 4 ? 'down' : 'right';
  },

  // ---------- vapers die echt in het gras staan ----------
  updateVapers(dt) {
    const m = G.map;
    if (!m.encounters || !G.flags.intro) return;
    const want = m.id === 'dorp' ? 4 : 3;
    this.vaperTimer -= dt;
    if (this.vapers.length < want && this.vaperTimer <= 0) {
      this.vaperTimer = 25;
      const tall = [];
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.tiles[y][x] === 'tall' && Math.hypot(x + 0.5 - this.pos.x, y + 0.5 - this.pos.z) > 7) tall.push([x, y]);
      if (tall.length) {
        const [x, y] = tall[Math.floor(Math.random() * tall.length)];
        const id = RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)];
        const g = buildFigure(LOOKS[ENEMIES[id].look]);
        const cloud = vapeCloud(ENEMIES[id].cloud); g.add(cloud);
        g.position.set(x + 0.5, 0, y + 0.5);
        this.scene.add(g);
        this.vapers.push({ id, g, cloud, x: x + 0.5, z: y + 0.5, tx: x + 0.5, tz: y + 0.5, wait: 1 });
      }
    }
    for (const v of this.vapers) {
      const d = Math.hypot(v.x - this.pos.x, v.z - this.pos.z);
      v.wait -= dt;
      if (v.wait <= 0 && Math.hypot(v.tx - v.x, v.tz - v.z) < 0.05) {
        v.wait = 1 + Math.random() * 3;
        const cx = Math.floor(v.x), cy = Math.floor(v.z);
        const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [cx + a, cy + b]).filter(([a, b]) => tileAt(m, a, b) === 'tall');
        if (opts.length) { const [a, b] = opts[Math.floor(Math.random() * opts.length)]; v.tx = a + 0.5; v.tz = b + 0.5; }
      }
      const mx = v.tx - v.x, mz = v.tz - v.z, ml = Math.hypot(mx, mz);
      const mv = ml > 0.02;
      if (mv) { const st = Math.min(ml, dt * 0.9); v.x += (mx / ml) * st; v.z += (mz / ml) * st; v.g.rotation.y = Math.atan2(mx, mz); }
      if (d < 3) v.g.rotation.y = Math.atan2(this.pos.x - v.x, this.pos.z - v.z);
      v.g.position.set(v.x, 0, v.z);
      animateFigure(v.g, this.t, mv);
      animateCloud(v.cloud, this.t);
      if (d < 0.8 && !G.busy && !UI.focus && G.mode === 'map') this.fightVaper(v);
    }
  },
  async fightVaper(v) {
    this.vapers = this.vapers.filter((x) => x !== v);
    this.scene.remove(v.g);
    this.vaperTimer = 30;
    await G.fight(v.id);
  },

  // ---------- waar kijk je naar? ----------
  findTarget() {
    if (G.mode !== 'map' || G.busy || UI.focus) { this.target = null; this.showPrompt(); return; }
    const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw);
    let best = null;
    const consider = (x, z, reach, kind, obj, label) => {
      const dx = x - this.pos.x, dz = z - this.pos.z, d = Math.hypot(dx, dz);
      if (d > reach || d < 0.05) return;
      const ang = Math.acos(Math.max(-1, Math.min(1, (dx * fx + dz * fz) / d)));
      if (ang > 0.65) return;
      // personages gaan voor decor (zoals in 2D: eerst wie er staat, dan wat er ligt)
      const score = d + ang + (kind === 'prop' ? 1.5 : 0);
      if (!best || score < best.score) best = { kind, obj, label, score };
    };
    for (const n of G.npcsHere()) { const r = G.npcRt[n.id]; if (r) consider(r.px / TS + 0.5, r.py / TS + 0.5, 2.6, 'npc', n, 'Praten'); }
    for (const p of G.map.props) if (p.id && PROPS[p.id] && !(PROP_HIDE[p.id] && PROP_HIDE[p.id]())) consider(p.x + 0.5, p.y + 0.5, 1.9, 'prop', p, 'Bekijken');
    for (const p of Online.others()) if (p.presence.m === G.map.id) { const q = this.peerPos(p); consider(q.x, q.z, 2, 'peer', p, `${String(p.presence.n).slice(0, 16)}: ruilen of zwaaien`); }
    for (const v of this.vapers) consider(v.x, v.z, 2, 'vaper', v, `Vechten met ${ENEMIES[v.id].name.toLowerCase()}`);
    this.target = best;
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
    G.busy = true;
    try {
      if (t.kind === 'npc') {
        const r = G.npcRt[t.obj.id];
        const dx = this.pos.x - (r.px / TS + 0.5), dz = this.pos.z - (r.py / TS + 0.5);
        r.dir = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'right' : 'left') : (dz > 0 ? 'down' : 'up');
        await t.obj.talk();
      } else if (t.kind === 'prop') await PROPS[t.obj.id]();
      else if (t.kind === 'peer') await Online.talkTo(t.obj);
      else if (t.kind === 'vaper') { G.busy = false; await this.fightVaper(t.obj); return; }
    } finally { if (G.mode === 'map' && !Trade.t) G.busy = false; }
  },

  peerPos(p) { const s = p.presence; return { x: typeof s.px === 'number' ? s.px : s.x + 0.5, z: typeof s.pz === 'number' ? s.pz : s.y + 0.5 }; },

  // ---------- tekenen ----------
  render() {
    const cam = this.camera;
    if (G.mode === 'title' || !G.map) {
      const a = this.t * 0.08 + performance.now() / 12000;
      cam.position.set(20 + Math.cos(a) * 16, 9, 15 + Math.sin(a) * 16);
      cam.lookAt(20, 1, 15);
    } else {
      cam.position.set(this.pos.x, 1.55 + Math.abs(Math.sin(this.bob)) * 0.05, this.pos.z);
      cam.rotation.order = 'YXZ';
      cam.rotation.set(this.pitch, this.yaw, 0);
    }
    // NPC's
    for (const n of NPCS) {
      const g = this.figs[n.id]; if (!g) continue;
      const r = G.npcRt[n.id];
      g.visible = !!r && (!n.show || n.show());
      if (!g.visible) continue;
      g.position.set(r.px / TS + 0.5, 0, r.py / TS + 0.5);
      g.rotation.y = { down: 0, up: Math.PI, left: -Math.PI / 2, right: Math.PI / 2 }[r.dir] || 0;
      animateFigure(g, this.t, r.moving);
    }
    // decor dat soms verdwijnt
    if (this.world) for (const o of this.world.userData.props) { const p = o.userData.prop; o.visible = !(p.id && PROP_HIDE[p.id] && PROP_HIDE[p.id]()); }
    this.renderPeers();
    this.renderHand();
    if (document.pointerLockElement && this.menuOpen()) document.exitPointerLock();
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
      e.g.position.set(e.x, 0, e.z);
      e.g.rotation.y = (typeof s.r === 'number' ? s.r : 0) + Math.PI;
      animateFigure(e.g, this.t, mv > 0.02);
      setHeld(e.g, WEAPONS[s.w] ? s.w : null);
      const near = Math.hypot(e.x - this.pos.x, e.z - this.pos.z) < 2.2;
      const text = `${String(s.n).slice(0, 16)}${s.b ? ' (vecht)' : ''}${near ? ` · EUR ${(Number(s.eur) || 0).toLocaleString('nl-NL')}` : ''}`;
      if (text !== e.tagText) { if (e.tag) e.g.remove(e.tag); e.tag = textSprite(text, near ? '#ffd25a' : '#f4f1ea'); e.tag.position.y = 2.25; e.g.add(e.tag); e.tagText = text; }
    }
    for (const k of Object.keys(this.peers)) if (!seen.has(k)) { this.scene.remove(this.peers[k].g); delete this.peers[k]; }
  },

  renderHand() {
    const el = $('#hand');
    const id = G.S && G.mode === 'map' ? G.P.wpn : null;
    if (el.dataset.id !== String(id)) {
      el.dataset.id = String(id);
      const x = el.getContext('2d'); x.clearRect(0, 0, 12, 12);
      if (id) x.drawImage(wicon(id), 0, 0);
    }
    el.hidden = !id;
    if (id) el.style.transform = `translate(${Math.sin(this.bob) * 6}px, ${Math.abs(Math.cos(this.bob)) * 8}px) rotate(-8deg)`;
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
      if (document.pointerLockElement === cv) { if (!G.busy) this.interact(); return; }
      try { const r = cv.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) {}
    });
    addEventListener('mousemove', (e) => {
      if (document.pointerLockElement !== cv) return;
      this.yaw -= e.movementX * 0.0025;
      this.pitch = Math.max(-1.3, Math.min(1.3, this.pitch - e.movementY * 0.0025));
    });
  },
};

// ---------- de gedeelde engine (G) aanpassen voor 3D ----------
(function () {
  const loadMap2d = G.loadMap.bind(G), place2d = G.placePlayer.bind(G);
  G.noRandom = true;
  G.loadMap = function (id, x, y, dir) { loadMap2d(id, x, y, dir); E3.build(id); };
  G.placePlayer = function (x, y, dir) {
    place2d(x, y, dir);
    E3.pos = { x: x + 0.5, z: y + 0.5 }; E3.safe = { ...E3.pos };
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
    const battle = this.mode === 'battle';
    $('#screen').hidden = !battle;
    if (battle) { this.drawBattle(); return; }
    E3.render();
  };
  G.interact = () => E3.interact();
  G.presenceExtra = () => ({ px: Math.round(E3.pos.x * 100) / 100, pz: Math.round(E3.pos.z * 100) / 100, r: Math.round(E3.yaw * 100) / 100 });
  E3.init();
})();
