// Cutscenes in de wereld zelf. De bruine meneer bij de uitgang van Café Josje: in slow motion doodgeslagen.
bouncerScene = async function () {
  G.busy = true;
  if (document.pointerLockElement) document.exitPointerLock();
  // een stap terug de gang in; hij staat in de deuropening
  E3.pos = { x: 25.5, z: 19.2 }; E3.fy = 0; E3.yaw = Math.PI; E3.pitch = 0.3;
  G.pl.x = 25; G.pl.y = 19;
  const g = buildFigure(LOOKS.meneer);
  g.scale.setScalar(1.8);
  g.position.set(E3.w(25.5), 0, E3.w(20.9));
  g.rotation.y = Math.PI;
  E3.scene.add(g);
  SFX.tone(55, 1.2, 'sawtooth', 0.06, -10);
  await bouncerTalk();
  // slow motion: letterbox, kleuren eruit, alles traag
  $('#cine').hidden = false;
  $('#view').style.filter = 'saturate(0.3) contrast(1.3) sepia(0.25)';
  const arm = g.userData.arms[1], other = g.userData.arms[0];
  const hit = () => { E3.hurtT = 0.4; SFX.tone(48, 1.4, 'sawtooth', 0.09, -20); SFX.tone(140, 0.5, 'square', 0.05, -120); };
  let roll = 0, drop = 0, shake = 0;
  E3.sceneCam = (cam) => {
    cam.position.y -= drop;
    cam.position.x += (Math.random() - 0.5) * shake; cam.position.y += (Math.random() - 0.5) * shake;
    cam.rotation.z = roll;
  };
  const T = 9;
  await new Promise((resolve) => {
    const t0 = performance.now(); let beats = 0, hits = 0;
    const step = () => {
      const t = (performance.now() - t0) / 1000;
      // hartslag
      if (t > beats * 0.9) { beats += 1; SFX.tone(45, 0.25, 'sine', 0.08, -10); }
      // eerste klap: heel langzaam uithalen
      if (t < 2.4) arm.rotation.x = -2.6 * (t / 2.4);
      else if (t < 3.0) arm.rotation.x = -2.6 + 3.0 * ((t - 2.4) / 0.6);
      if (t >= 2.9 && hits === 0) { hits = 1; hit(); shake = 0.12; }
      if (t > 2.9 && t < 4.5) { roll = Math.min(0.5, (t - 2.9) * 0.4); drop = Math.min(0.7, (t - 2.9) * 0.45); E3.pitch = 0.3 + (t - 2.9) * 0.15; shake *= 0.97; }
      // tweede klap, van de andere kant
      if (t > 4.2 && t < 5.4) other.rotation.x = -2.4 * ((t - 4.2) / 1.2);
      else if (t >= 5.4 && t < 5.9) other.rotation.x = -2.4 + 2.8 * ((t - 5.4) / 0.5);
      if (t >= 5.8 && hits === 1) { hits = 2; hit(); shake = 0.15; }
      if (t > 5.8) { roll = Math.min(1.45, 0.5 + (t - 5.8) * 0.5); drop = Math.min(1.3, 0.7 + (t - 5.8) * 0.4); E3.pitch = Math.min(0.9, E3.pitch + 0.004); shake *= 0.96; }
      // hij buigt zich over je heen
      if (t > 6.5) g.rotation.x = Math.min(0.35, (t - 6.5) * 0.2);
      if (t >= 7.5 && hits === 2) { hits = 3; hit(); }
      E3.hurtT = Math.max(E3.hurtT, t > 7.5 ? Math.min(0.35, (t - 7.5) * 0.3) : 0);
      if (t < T) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
  E3.sceneCam = null;
  E3.scene.remove(g);
  $('#cine').hidden = true;
  $('#view').style.filter = '';
  G.quest('josje', 3);
  await CB.die('De bruine meneer heeft je doodgeslagen. In slow motion. Om 200.000 biertjes.');
};

// Flashback: jij, Kjell en Jornt slopen Café Josje. Stoelen, tafels, barkrukken, flessen en kratten vliegen door de lucht.
function flyingThing(kind) {
  const g = new THREE.Group();
  if (kind === 'stoel') { M3.b(g, 0.5, 0.06, 0.5, '#7a4c2a', 0, 0, 0); M3.b(g, 0.5, 0.5, 0.06, '#6a3c1a', 0, 0.25, -0.22); for (const [x, z] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) M3.b(g, 0.05, 0.45, 0.05, '#5a3c1a', x, -0.22, z); }
  else if (kind === 'tafel') { M3.b(g, 1.0, 0.08, 1.0, '#8c5a32', 0, 0, 0); M3.b(g, 0.12, 0.7, 0.12, '#4a2c18', 0, -0.38, 0); }
  else if (kind === 'kruk') { M3.cyl(g, 0.22, 0.22, 0.08, '#c23b2e', 0, 0, 0, 12); M3.cyl(g, 0.04, 0.04, 0.8, '#888', 0, -0.42, 0, 6); }
  else if (kind === 'fles') { M3.cyl(g, 0.06, 0.07, 0.3, '#2e7a3a', 0, 0, 0, 8); M3.cyl(g, 0.025, 0.03, 0.1, '#2e7a3a', 0, 0.2, 0, 6); }
  else if (kind === 'krat') { M3.b(g, 0.45, 0.3, 0.35, '#e8b030', 0, 0, 0); for (let i = 0; i < 4; i++) M3.cyl(g, 0.04, 0.04, 0.2, '#6a4a1a', -0.15 + i * 0.1, 0.18, 0, 6); }
  else if (kind === 'glas') { M3.cyl(g, 0.06, 0.05, 0.18, '#f2c22e', 0, 0, 0, 8); M3.cyl(g, 0.065, 0.065, 0.04, '#f4f1ea', 0, 0.1, 0, 8); }
  else if (kind === 'dartbord') { const d = M3.cyl(g, 0.3, 0.3, 0.05, '#1b1b1b', 0, 0, 0, 16); d.rotation.x = Math.PI / 2; const r = M3.cyl(g, 0.18, 0.18, 0.06, '#c23b2e', 0, 0, 0, 16); r.rotation.x = Math.PI / 2; }
  return g;
}
josjeWreck = async function () {
  G.busy = true;
  if (document.pointerLockElement) document.exitPointerLock();
  G.wrecking = true;
  G.loadMap('josje', 8, 9, 'up');
  const S = E3.S, at = (tx, tz, y = 0) => new THREE.Vector3(E3.w(tx), y, E3.w(tz));
  // de drie vandalen: Kjell staat op de bar, Jornt en jij ervoor
  const crew = [
    { g: buildFigure(LOOKS.kjell), p: at(6.5, 3.5, 1.05), name: 'Kjell' },
    { g: buildFigure(LOOKS.jornt), p: at(10.5, 7.5), name: 'Jornt' },
    { g: buildFigure(lookFrom(G.S.ap, G.P.wear)), p: at(6.5, 8.5), name: 'Jij' },
  ];
  for (const c of crew) { c.g.position.copy(c.p); E3.scene.add(c.g); }
  E3.hideNpcs = ['kjell_josje', 'jornt_josje'];
  const things = [], kinds = ['stoel', 'stoel', 'tafel', 'kruk', 'kruk', 'fles', 'fles', 'fles', 'krat', 'glas', 'glas', 'dartbord'];
  const caption = $('#cine b');
  const lines = [[0, 'Een uur eerder. Café Josje.'], [1.6, 'Kjell: "RONDJE VAN DE ZAAK!"'], [3.4, 'Jornt: "POLONAISE OVER DE BAR!"'], [5.2, 'Jij: "Wie gooit die barkruk?"  Kjell: "JIJ!"'], [7.2, 'De discobal gaat eraf.'], [8.8, 'Iemand roept iets over 200.000 biertjes. Niemand luistert.']];
  $('#cine').hidden = false;
  $('#view').style.filter = 'sepia(0.35) saturate(1.5) contrast(1.1)';
  const center = at(9, 7.5, 1.0);
  let ang = 0;
  E3.sceneCam = (cam) => { cam.position.set(center.x + Math.cos(ang) * 6.5, 3.3, center.z + Math.sin(ang) * 5.5); cam.lookAt(center); };
  // de discobal die van het plafond valt
  const bal = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), new THREE.MeshLambertMaterial({ color: '#c8ccd4', emissive: '#556070', flatShading: true }));
  bal.position.copy(at(12, 6, ceilH(G.map) - 0.6)); E3.scene.add(bal);
  let balV = 0;
  await UI.fade(false);
  await new Promise((resolve) => {
    const t0 = performance.now(); let last = t0, spawnT = 0, li = 0;
    const step = () => {
      const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000), t = (now - t0) / 1000; last = now;
      ang = 0.6 + t * 0.32;
      if (li < lines.length && t >= lines[li][0]) { caption.textContent = lines[li][1]; Voice.line(lines[li][1].replace('  Kjell: "JIJ!"', '')); li += 1; }
      // dansen, springen en gooien
      crew.forEach((c, i) => {
        animateFigure(c.g, t * (1.2 + i * 0.2), true);
        c.g.position.y = c.p.y + Math.abs(Math.sin(t * 5 + i)) * 0.35;
        c.g.rotation.y = t * (i === 1 ? -2 : 1.5) + i;
        c.g.userData.arms.forEach((a) => { a.rotation.x = -2.4 + Math.sin(t * 9 + i) * 0.6; });
      });
      spawnT -= dt;
      if (spawnT <= 0 && t < 9.2) {
        spawnT = 0.12;
        const c = crew[Math.floor(Math.random() * crew.length)];
        const o = flyingThing(kinds[Math.floor(Math.random() * kinds.length)]);
        o.position.copy(c.p).add(new THREE.Vector3(0, 1.7, 0));
        const a = Math.random() * Math.PI * 2, sp = 3 + Math.random() * 4;
        things.push({ o, v: new THREE.Vector3(Math.cos(a) * sp, 3.5 + Math.random() * 3.5, Math.sin(a) * sp), w: new THREE.Vector3(Math.random() * 9, Math.random() * 9, Math.random() * 9), rest: false });
        E3.scene.add(o);
        if (Math.random() < 0.5) SFX.tone(140 + Math.random() * 300, 0.12, 'square', 0.03, -120);
      }
      for (const th of things) {
        if (th.rest) continue;
        th.v.y -= 9.8 * dt;
        th.o.position.addScaledVector(th.v, dt);
        th.o.rotation.x += th.w.x * dt; th.o.rotation.y += th.w.y * dt; th.o.rotation.z += th.w.z * dt;
        // tegen de muren en het plafond
        const minX = 1.2 * S, maxX = 15.8 * S, minZ = 2.1 * S, maxZ = 12.8 * S, top = ceilH(G.map) - 0.2;
        if (th.o.position.x < minX || th.o.position.x > maxX) { th.v.x *= -0.5; th.o.position.x = Math.max(minX, Math.min(maxX, th.o.position.x)); }
        if (th.o.position.z < minZ || th.o.position.z > maxZ) { th.v.z *= -0.5; th.o.position.z = Math.max(minZ, Math.min(maxZ, th.o.position.z)); }
        if (th.o.position.y > top) { th.v.y = -Math.abs(th.v.y) * 0.4; th.o.position.y = top; }
        if (th.o.position.y < 0.12) {
          th.o.position.y = 0.12; th.v.multiplyScalar(0.4); th.v.y = Math.abs(th.v.y) * 0.5; th.w.multiplyScalar(0.5);
          if (th.v.length() < 0.6) th.rest = true;
          SFX.tone(90 + Math.random() * 80, 0.08, 'sawtooth', 0.03, -40);
          if (Math.random() < 0.3) E3.puff(0xe8b84a, 4, th.o.position.clone(), { size: 0.25, up: 0.6, life: 1, grow: 2, op: 0.8 });
        }
      }
      if (t > 7.2) { balV += 9.8 * dt; bal.position.y = Math.max(0.35, bal.position.y - balV * dt); if (bal.position.y <= 0.35 && balV > 0) { balV = -balV * 0.3; SFX.tone(1800, 0.3, 'square', 0.04, -1500); for (let i = 0; i < 3; i++) E3.puff(0xdde4f0, 4, bal.position.clone(), { size: 0.2, up: 1, life: 1.2 }); } }
      E3.updateFx(dt);
      if (t < 10.5) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
  await UI.fade(true);
  for (const c of crew) E3.scene.remove(c.g);
  for (const th of things) E3.scene.remove(th.o);
  E3.scene.remove(bal);
  E3.sceneCam = null; E3.hideNpcs = null; G.wrecking = false; Voice.stop();
  caption.textContent = '';
  $('#cine').hidden = true;
  $('#view').style.filter = '';
};

// ---------- De vlucht van Hermann: blokken uit het luik, en jij erachteraan ----------
// Het vliegtuig hangt stil in de lucht (ver weg van de kaart); de wereld eronder schuift voorbij.
const FIELDS_CANVAS = makeCanvas(64, 64, (x) => {
  const cols = ['#5f9e3c', '#6aa844', '#c8b050', '#4f8a31', '#8ab040', '#a8783a', '#7ab048'];
  for (let i = 0; i < 64; i += 8) for (let j = 0; j < 64; j += 16) px(x, i, j, 8, 16, cols[(i * 7 + j * 3) % cols.length]);
  for (let i = 0; i < 64; i += 16) px(x, i, 0, 1, 64, '#3a6fb0');
  px(x, 0, 31, 64, 1, '#9a9aa2');
});
const Flight = {
  build() {
    const R = new THREE.Group(); R.position.set(-6000, 700, 0);
    const ft = new THREE.CanvasTexture(FIELDS_CANVAS); ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(45, 45); ft.magFilter = THREE.NearestFilter; ft.minFilter = THREE.LinearMipmapLinearFilter; ft.anisotropy = 8;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), new THREE.MeshLambertMaterial({ map: ft }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -700; R.add(ground); this.ground = ground;
    // wolken
    this.clouds = [];
    for (let i = 0; i < 40; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: W3.tex(PUFF_CANVAS), color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false }));
      const sc = 30 + Math.random() * 50; s.scale.set(sc, sc * 0.55, 1);
      s.position.set((Math.random() - 0.5) * 400, -60 + Math.random() * 120, -Math.random() * 1500);
      R.add(s); this.clouds.push(s);
    }
    // het vliegtuig van binnen (neus naar -z)
    const P = new THREE.Group(); R.add(P); this.plane = P;
    const wall = W3.mat(makeCanvas(16, 16, (x) => { px(x, 0, 0, 16, 16, '#d8d4c8'); px(x, 0, 7, 16, 2, '#c23b2e'); }));
    M3.b(P, 1.7, 0.1, 5.4, '#4a4a52', 0, 0, 0);
    for (const s of [-1, 1]) { M3.b(P, 0.1, 0.5, 5.4, wall, s * 0.85, 0.25, 0); M3.b(P, 0.08, 0.45, 5.4, M3.glass(), s * 0.85, 0.75, 0); M3.b(P, 0.1, 0.45, 5.4, wall, s * 0.85, 1.2, 0); }
    M3.b(P, 1.7, 0.1, 5.4, wall, 0, 1.45, 0);
    M3.b(P, 1.6, 0.5, 0.3, '#2a2a30', 0, 0.75, -2.4);
    for (let i = 0; i < 5; i++) M3.b(P, 0.14, 0.14, 0.02, M3.glow(['#7ad46a', '#f2c22e', '#e8433a', '#5ad0f0', '#f4f1ea'][i]), -0.55 + i * 0.27, 0.85, -2.24);
    M3.b(P, 1.6, 0.45, 0.05, M3.glass(), 0, 1.2, -2.6);
    M3.b(P, 0.5, 0.45, 0.5, '#3a3a44', -0.35, 0.3, -1.5); M3.b(P, 0.5, 0.35, 0.1, '#3a3a44', -0.35, 0.6, -1.25);
    M3.b(P, 0.5, 0.45, 0.5, '#3a3a44', 0.35, 0.3, 0.4); M3.b(P, 0.5, 0.7, 0.1, '#3a3a44', 0.35, 0.7, 0.65);
    // het luik achterin staat open; de deur klappert ernaast
    this.door = M3.b(P, 0.05, 1.3, 0.9, wall, 0.9, 0.7, 2.9);
    for (const s of [-1, 1]) M3.b(P, 11, 0.12, 1.4, '#f4f1ea', s * 6, 1.5, -0.6);
    const prop = new THREE.Group(); prop.position.set(0, 0.75, -3.1); prop.add(box(0.15, 2.2, 0.06, cmat('#2a2a2a'), 0, 0, 0)); P.add(prop); this.prop = prop;
    // Hermann aan de stuurknuppel
    const h = buildFigure(LOOKS.hermann); h.rotation.y = Math.PI; h.position.set(-0.35, 0.05, -1.45); h.scale.setScalar(0.9);
    for (const l of h.userData.legs) l.rotation.x = -Math.PI / 2;
    for (const a of h.userData.arms) a.rotation.x = -1.3;
    P.add(h); this.hermann = h;
    // tien witte blokken, met tape
    this.blocks = [];
    for (let i = 0; i < 10; i++) {
      const b = new THREE.Group();
      M3.b(b, 0.42, 0.26, 0.3, '#f4f4f0', 0, 0, 0); M3.b(b, 0.43, 0.27, 0.05, '#a8784a', 0, 0, 0); M3.b(b, 0.05, 0.27, 0.31, '#a8784a', 0, 0, 0);
      const home = new THREE.Vector3(-0.45 + (i % 2) * 0.46, 0.18 + Math.floor(i / 4) * 0.28, 1.5 + (Math.floor(i / 2) % 2) * 0.34);
      b.position.copy(home); b.rotation.y = (i % 3) * 0.1;
      P.add(b); this.blocks.push({ b, home, t: -1 });
    }
    return R;
  },
  camLocal(v) { return v.clone().add(this.root.position); },
  engine(on) {
    const c = SFX.ctx;
    if (!c) return;
    if (on && !this.eng) {
      const o = c.createOscillator(), o2 = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
      o.type = 'sawtooth'; o.frequency.value = 62; o2.type = 'square'; o2.frequency.value = 31; f.type = 'lowpass'; f.frequency.value = 520;
      lfo.frequency.value = 18; lg.gain.value = 0.03; lfo.connect(lg); lg.connect(g.gain);
      g.gain.value = SFX.on ? 0.09 : 0;
      o.connect(f); o2.connect(f); f.connect(g); g.connect(c.destination); o.start(); o2.start(); lfo.start();
      this.eng = { o, o2, g, lfo };
    } else if (!on && this.eng) {
      const e = this.eng; this.eng = null;
      e.g.gain.setTargetAtTime(0, c.currentTime, 0.4);
      setTimeout(() => { try { e.o.stop(); e.o2.stop(); e.lfo.stop(); } catch (x) {} }, 2000);
    }
  },
  run() {
    return new Promise((resolve) => {
      this.root = this.build();
      E3.scene.add(this.root);
      if (E3.world) E3.world.visible = false;
      E3.scene.fog = new THREE.Fog('#cfe0f2', 400, 2600);
      E3.scene.background = null;
      SKY.hazeAmt = 0.25;
      E3.camera.fov = 75; E3.camera.far = 6000; E3.camera.updateProjectionMatrix();
      this.t = 0; this.phase = 'vlieg'; this.thrown = 0; this.idle = 0; this.last = performance.now(); this.done = resolve; this.lines = {};
      $('#cine').hidden = false;
      $('#ridehud').hidden = true;
      for (const id of ['#pframe', '#tframe', '#abar', '#xpbar', '#prompt', '#atip', '#pvp', '#hud']) $(id).hidden = true;
      G.mode = 'cut';
      this.engine(true);
      UI.fade(false);
    });
  },
  say(at, text, big) { if (this.t >= at && !this.lines[at]) { this.lines[at] = true; $('#cine b').textContent = text; $('#cine b').classList.toggle('big', !!big); Voice.line(text, big ? 'Hermann' : null); } },
  throwOne() {
    if (this.phase !== 'gooi' || this.thrown >= 10) return;
    const k = this.blocks[this.thrown];
    k.t = 0; this.thrown += 1; this.idle = 0;
    SFX.tone(200, 0.15, 'triangle', 0.05, -120);
    $('#cine b').textContent = `Pakket ${this.thrown} van 10 eruit!${this.thrown < 10 ? '  (klik of Spatie)' : ''}`;
    if (this.thrown >= 10) { this.phase = 'val'; this.fallT = 0; }
  },
  frame() {
    const now = performance.now(), dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
    this.t += dt;
    const cam = E3.camera, P = this.plane;
    // de wereld schuift onder het vliegtuig door
    const slow = this.phase === 'val' ? 0.25 : 1;
    this.ground.material.map.offset.y -= dt * 0.012 * slow;
    for (const c of this.clouds) { c.position.z += dt * 55 * slow; if (c.position.z > 60) c.position.z -= 1500; }
    this.prop.rotation.z += dt * 40 * slow;
    this.door.rotation.y = Math.sin(this.t * 7) * 0.25;
    const shake = this.phase === 'val' ? 0 : 0.012;
    P.rotation.z = Math.sin(this.t * 0.8) * 0.03;
    // blokken die uit het luik vliegen
    for (const k of this.blocks) {
      if (k.t < 0) continue;
      k.t += dt * slow;
      const hatch = new THREE.Vector3(0.1, 0.7, 2.9);
      if (k.t < 0.35) k.b.position.lerpVectors(k.home, hatch, k.t / 0.35);
      else { const u = k.t - 0.35; k.b.position.set(hatch.x + u * 0.5, hatch.y - 4.9 * u * u, hatch.z + u * 30); }
      k.b.rotation.x += dt * 6 * slow; k.b.rotation.z += dt * 4 * slow;
    }
    if (this.phase === 'vlieg') {
      // over de schouder van Hermann
      this.say(0.3, 'Hermann: "Eerlijk verhaal: vijf jaar geleden had ik niks. Nu heb ik een vliegtuig."');
      this.say(2.4, 'Hermann: "We vliegen nu boven Duitsland. Of Drenthe. Agree?"');
      const p = this.camLocal(new THREE.Vector3(0.4, 1.18, 0.3));
      cam.position.set(p.x + (Math.random() - 0.5) * shake, p.y + (Math.random() - 0.5) * shake, p.z);
      cam.lookAt(this.camLocal(new THREE.Vector3(-0.2, 0.95, -3.5)));
      if (this.t > 4.4) { this.phase = 'nu'; this.nuT = 0; }
    } else if (this.phase === 'nu') {
      // Hermann draait zich om: NU NU NU
      this.nuT += dt;
      const turn = Math.min(1, this.nuT / 0.4);
      this.hermann.rotation.y = Math.PI - turn * 2.6;
      this.hermann.userData.arms[1].rotation.x = -1.3 - turn * 1.4 + Math.sin(this.nuT * 25) * 0.3 * turn;
      this.say(4.6, 'NU NU NU!', true);
      if (this.nuT > 0.5 && !this.shout) { this.shout = true; [0, 180, 360].forEach((d) => setTimeout(() => SFX.tone(520, 0.14, 'square', 0.07, -80), d)); }
      const p = this.camLocal(new THREE.Vector3(0.4, 1.18, 0.3));
      cam.position.set(p.x + (Math.random() - 0.5) * 0.03, p.y + (Math.random() - 0.5) * 0.03, p.z);
      // de speler draait zich om naar het luik
      const k = Math.max(0, Math.min(1, (this.nuT - 1.2) / 0.9));
      const fwd = this.camLocal(new THREE.Vector3(-0.2, 0.95, -3.5)), back = this.camLocal(new THREE.Vector3(0.1, 0.45, 3.2));
      cam.lookAt(fwd.lerp(back, k * k * (3 - 2 * k)));
      if (this.nuT > 2.2) { this.phase = 'gooi'; $('#cine b').classList.remove('big'); $('#cine b').textContent = 'Gooi de 10 pakketten uit het luik! (klik of Spatie)'; }
    } else if (this.phase === 'gooi') {
      const p = this.camLocal(new THREE.Vector3(0.2, 1.05, 0.7));
      cam.position.set(p.x + (Math.random() - 0.5) * shake, p.y + (Math.random() - 0.5) * shake, p.z);
      cam.lookAt(this.camLocal(new THREE.Vector3(0.1, 0.45, 3.2)));
      this.idle += dt;
      if (this.idle > 4) this.throwOne(); // wie niks doet, gooit toch (Hermann schreeuwt)
    } else if (this.phase === 'val') {
      // jij glijdt mee naar buiten: slow motion
      this.fallT += dt;
      if (!this.slowmo) { this.slowmo = true; $('#view').style.filter = 'saturate(0.35) contrast(1.25)'; $('#cine b').textContent = 'Oei.'; SFX.tone(70, 2.5, 'sawtooth', 0.06, -30); this.engine(false); }
      const u = Math.max(0, this.fallT - 0.6) * 0.32;
      const local = new THREE.Vector3(0.2 + u * 0.3, 1.05 - u * u * 20, 0.7 + this.fallT * 1.1 + u * 25);
      cam.position.copy(this.camLocal(local));
      P.position.z -= dt * (this.fallT > 0.6 ? 6 : 0);
      cam.lookAt(this.camLocal(new THREE.Vector3(0, -6 - u * 30, -6 + u * 10)));
      cam.rotation.z += Math.sin(this.fallT * 1.3) * 0.6 * Math.min(1, u);
      if (this.fallT > 1.5) $('#cine b').textContent = 'Alles gaat heel langzaam. Hermann zwaait. Of hij post er al over.';
      if (this.fallT > 5) { this.phase = 'chute'; this.chuteT = 0; this.canopy = parachute(); E3.scene.add(this.canopy); SFX.tone(180, 0.4, 'triangle', 0.08, 300); $('#view').style.filter = ''; $('#cine b').textContent = 'RUK. Je parachute gaat open.'; this.camBase = cam.position.clone(); }
    } else if (this.phase === 'chute') {
      this.chuteT += dt;
      const p = this.camBase.clone().add(new THREE.Vector3(Math.sin(this.chuteT) * 0.6, 1.2 * Math.exp(-this.chuteT * 3) - this.chuteT * 4, 0));
      cam.position.copy(p);
      this.canopy.position.copy(p).add(new THREE.Vector3(0, 6, 0));
      const k = Math.min(1, this.chuteT / 1.5);
      cam.lookAt(p.clone().add(new THREE.Vector3(0, 6 * (1 - k) - 10 * k, -2 - 8 * k)));
      if (this.chuteT > 3.6 && !this.ending) { this.ending = true; this.finish(); }
    }
    SKY.update(1 / 60, cam.position, E3.hemi, E3.sun, E3.scene, false);
    E3.updateFx(dt);
    E3.renderer.render(E3.scene, cam);
  },
  async finish() {
    $('#fade').style.background = '#fff';
    await UI.fade(true);
    E3.scene.remove(this.root); E3.scene.remove(this.canopy);
    if (E3.world) E3.world.visible = true;
    E3.camera.fov = 70; E3.camera.far = 300; E3.camera.updateProjectionMatrix();
    this.engine(false);
    this.slowmo = false; this.shout = false; this.ending = false;
    $('#cine b').textContent = '';
    const done = this.done; this.done = null;
    done();
  },
};
function parachute() {
  const g = new THREE.Group();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(3.2, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2.6), new THREE.MeshLambertMaterial({ color: '#e8433a', side: THREE.DoubleSide }));
  g.add(dome);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const st = new THREE.Mesh(new THREE.SphereGeometry(3.22, 12, 6, a, 0.35, 0, Math.PI / 2.6), new THREE.MeshLambertMaterial({ color: '#f4f1ea', side: THREE.DoubleSide })); g.add(st); }
  for (const [x, z] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) { const l = box(0.02, 5.2, 0.02, cmat('#888'), x * 0.5, -2.4, z * 0.5); l.rotation.z = -x * 0.08; l.rotation.x = z * 0.08; g.add(l); }
  return g;
}
(function () {
  const render3d = G.render;
  G.render = function () { if (this.mode === 'cut') { Flight.frame(); return; } render3d.call(this); };
  $('#view').addEventListener('mousedown', (e) => { if (G.mode === 'cut') { e.preventDefault(); Flight.throwOne(); } });
  addEventListener('keydown', (e) => { if (G.mode === 'cut' && (e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') && !e.repeat) { e.preventDefault(); Flight.throwOne(); } });
})();
hermannFlight = async function () {
  G.busy = true;
  PV.dismount(); CB.setTarget(null);
  if (document.pointerLockElement) document.exitPointerLock();
  await UI.fade(true);
  await Flight.run();
  // landen in de Dorpsstraat: langzaam aan de parachute naar beneden
  G.mode = 'map';
  G.loadMap('dorp', 17, 15, 'up');
  const haze = E3.scene.fog, hazeAmt = SKY.hazeAmt;
  E3.scene.fog = new THREE.Fog(haze.color.getHex(), 30, 190); SKY.hazeAmt = 0.35;
  const canopy = parachute(); E3.scene.add(canopy);
  const H = 42, T = 9;
  let fy = H;
  E3.sceneCam = (cam) => {
    cam.position.y = fy + 1.6;
    cam.position.x += Math.sin(performance.now() / 900) * 0.4;
    cam.rotation.set(-0.45 + Math.sin(performance.now() / 1300) * 0.05, E3.yaw, Math.sin(performance.now() / 1100) * 0.05, 'YXZ');
    canopy.position.set(cam.position.x, fy + 7.5, cam.position.z);
  };
  $('#cine b').textContent = 'Je zweeft boven Meedhuizen. Je ziet de kerk, het dorpshuis en Lanting.';
  await UI.fade(false);
  $('#fade').style.background = '';
  await new Promise((resolve) => {
    const t0 = performance.now();
    const step = () => {
      const t = (performance.now() - t0) / 1000;
      fy = H * Math.pow(Math.max(0, 1 - t / T), 1.4);
      // hoe lager je komt, hoe dikker de vapedamp weer wordt
      const k = Math.min(1, t / T);
      E3.scene.fog.near = 30 * (1 - k) + haze.near * k; E3.scene.fog.far = 190 * (1 - k) + haze.far * k;
      if (t > 4) $('#cine b').textContent = 'Langzaam. Heel langzaam. Recht op de Dorpsstraat af.';
      if (t < T) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
  SFX.tone(110, 0.2, 'triangle', 0.06, -40);
  E3.sceneCam = null;
  E3.scene.fog = haze; SKY.hazeAmt = hazeAmt;
  E3.scene.remove(canopy);
  E3.fy = 0; E3.pitch = 0;
  $('#cine').hidden = true; $('#cine b').textContent = '';
  await hermannLanding();
};
