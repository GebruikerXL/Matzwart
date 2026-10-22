// De rit met Koen over de A28: een cutscene van 15 seconden. Koen rijdt als een gek, slingert tussen de auto's door,
// en na een paar seconden pak je een handpistool uit het dashboardkastje: klik (of Spatie) om op andere auto's te schieten.
const RIDE_LEN = 15;
const BEER_ICON = makeCanvas(12, 12, (x) => { px(x, 3, 1, 6, 10, '#c8ccd4'); px(x, 3, 3, 6, 6, '#2e7a3a'); px(x, 4, 4, 4, 3, '#f2c22e'); px(x, 4, 0, 4, 1, '#888'); });
const PISTOL_ICON = makeCanvas(12, 12, (x) => { px(x, 1, 3, 9, 3, '#2a2a30'); px(x, 2, 2, 8, 1, '#3a3a44'); px(x, 6, 6, 3, 5, '#3a2a1a'); px(x, 5, 6, 1, 2, '#2a2a30'); px(x, 0, 3, 1, 2, '#555'); });
const Ride = {
  active: false,

  laneTex() {
    return makeCanvas(64, 64, (x) => {
      px(x, 0, 0, 64, 64, '#3a3a40');
      for (let i = 0; i < 40; i++) px(x, (i * 37) % 64, (i * 23) % 64, 1, 1, i % 2 ? '#46464c' : '#303036');
      for (const lx of [16, 32, 48]) px(x, lx - 1, 0, 2, 30, '#e8e6e0');
      px(x, 2, 0, 2, 64, '#e8e6e0'); px(x, 60, 0, 2, 64, '#e8e6e0');
    });
  },
  carMesh(col) {
    const g = new THREE.Group();
    M3.b(g, 1.8, 0.7, 4.2, col, 0, 0.55, 0); M3.b(g, 1.6, 0.55, 2.2, M3.glass(), 0, 1.15, 0.2); M3.b(g, 1.6, 0.06, 2.2, col, 0, 1.44, 0.2);
    for (const [x, z] of [[-0.85, 1.3], [0.85, 1.3], [-0.85, -1.3], [0.85, -1.3]]) { const w = M3.cyl(g, 0.33, 0.33, 0.25, '#111', x, 0.33, z, 10); w.rotation.z = Math.PI / 2; }
    for (const x of [-0.6, 0.6]) M3.b(g, 0.3, 0.12, 0.04, M3.glow('#ff3a2a'), x, 0.65, 2.11);
    return g;
  },
  build(drunk) {
    const R = new THREE.Group(); R.position.x = 5000;
    const L = 2600;
    const road = new THREE.Mesh(new THREE.PlaneGeometry(18, L), new THREE.MeshLambertMaterial({ map: W3.tex(this.laneTex(), [1, L / 12]) }));
    road.rotation.x = -Math.PI / 2; road.position.set(0, 0, -L / 2 + 40); R.add(road);
    const grass = new THREE.MeshLambertMaterial({ map: W3.tex(getTile('grass', 0, 0), [40, L / 4]) });
    for (const s of [-1, 1]) {
      const g = new THREE.Mesh(new THREE.PlaneGeometry(160, L), grass); g.rotation.x = -Math.PI / 2; g.position.set(s * 89, -0.02, -L / 2 + 40); R.add(g);
      M3.b(R, 0.15, 0.35, L, '#c8ccd4', s * 9.6, 0.6, -L / 2 + 40); M3.b(R, 0.1, 0.6, L, '#888', s * 9.7, 0.3, -L / 2 + 40);
    }
    // bomen en weilanden langs de A28
    const trees = [];
    for (let z = 20; z > -L + 60; z -= 9) for (const s of [-1, 1]) if (Math.random() < 0.6) trees.push([s * (14 + Math.random() * 30), z - Math.random() * 6]);
    const dummy = new THREE.Object3D();
    const inst = (geo, mat, f) => { const im = new THREE.InstancedMesh(geo, mat, trees.length); trees.forEach(([x, z], i) => { dummy.position.set(0, 0, 0); dummy.scale.set(1, 1, 1); f(dummy, x, z, i); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); }); R.add(im); };
    inst(new THREE.BoxGeometry(0.5, 3, 0.5), W3.mat(BARK_CANVAS), (d, x, z) => d.position.set(x, 1.5, z));
    inst(new THREE.BoxGeometry(3, 2.6, 3), W3.mat(LEAF_CANVAS), (d, x, z, i) => { d.position.set(x, 4, z); d.scale.setScalar(0.8 + (i % 5) * 0.12); });
    // borden boven de weg
    (drunk ? [['N33  Café Josje 12', '#2a5aa0'], ['Café Josje 5\nALTIJD OPEN', '#c23b2e'], ['Josje 1 km\nNIET MEER RIJDEN', '#2a5aa0'], ['Is dit nog\nde weg?', '#c23b2e']]
      : [['A28  Zwolle 40', '#2a5aa0'], ['Hoogeveen  Meppel', '#2a5aa0'], ['ZWOLLE 12\n☠ wildernis', '#2a5aa0'], ['Koen rijdt hier\naltijd 200', '#c23b2e']]).forEach(([t, bg], i) => {
      const z = -180 - i * 200;
      for (const s of [-1, 1]) M3.b(R, 0.25, 6.5, 0.25, '#9aa0aa', s * 9.2, 3.25, z);
      M3.b(R, 18.6, 0.3, 0.3, '#9aa0aa', 0, 6.4, z);
      M3.b(R, 7, 2.2, 0.12, M3.text(t, 7, 2.2, bg, '#f4f1ea', 'bold 30px Silkscreen'), 3, 5.1, z + 0.2);
    });
    // verkeer
    this.cars = [];
    const cols = ['#c8ccd4', '#2a4a9a', '#1b1b1b', '#c23b2e', '#f4f1ea', '#5a5a62', '#e0b030', '#2e7a3a'];
    for (let i = 0; i < 18; i++) {
      const g = this.carMesh(cols[i % cols.length]);
      const c = { g, lane: [-6.5, -2.2, 2.2, 6.5][i % 4], z: -60 - i * 45 - Math.random() * 20, v: 24 + Math.random() * 9, hit: 0, spin: 0 };
      g.position.set(c.lane, 0, c.z); R.add(g); this.cars.push(c);
    }
    // de auto van Koen: van binnen
    const cab = new THREE.Group();
    M3.b(cab, 1.9, 0.45, 0.7, '#1b1b20', 0, 0.85, -0.95);
    M3.b(cab, 1.9, 0.08, 0.3, '#2a2a30', 0, 1.08, -0.75);
    M3.b(cab, 0.4, 0.12, 0.05, M3.glow('#7ad46a'), -0.42, 1.0, -0.6);
    M3.b(cab, 0.5, 0.18, 0.04, '#3a3a44', 0.45, 0.78, -0.59);
    M3.b(cab, 1.8, 0.35, 2.0, '#8ad030', 0, 0.75, -2.1);
    for (const s of [-1, 1]) M3.b(cab, 0.08, 0.9, 0.08, '#1b1b20', s * 0.92, 1.45, -1.0, (m) => { m.rotation.x = -0.5; });
    M3.b(cab, 1.95, 0.08, 0.6, '#1b1b20', 0, 1.88, -0.55);
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 6, 16), cmat('#1b1b1b')); wheel.position.set(-0.42, 1.12, -0.55); wheel.rotation.x = -0.4; cab.add(wheel);
    // normaal rijdt Koen en zit jij ernaast; dronken rij jij en zit Kjell naast je
    const koen = buildFigure(drunk ? LOOKS.kjell : LOOKS.koen); koen.rotation.y = Math.PI; koen.position.set(drunk ? 0.42 : -0.42, 0.25, 0.05); koen.scale.setScalar(0.95);
    if (drunk) for (let i = 0; i < 5; i++) M3.cyl(cab, 0.035, 0.035, 0.12, ['#2e7a3a', '#c8ccd4', '#c23b2e'][i % 3], 0.1 + i * 0.12, 1.18, -0.8, 8);
    for (const l of koen.userData.legs) l.rotation.x = -Math.PI / 2;
    for (const a of koen.userData.arms) a.rotation.x = -1.2;
    cab.add(koen); this.koen = koen;
    R.add(cab); this.cab = cab;
    return R;
  },

  run(dest, opts = {}) {
    return new Promise((resolve) => {
      this.drunk = !!opts.drunk;
      this.root = this.build(this.drunk);
      E3.scene.add(this.root);
      if (E3.world) E3.world.visible = false;
      this.prevFog = E3.scene.fog;
      E3.scene.fog = new THREE.Fog('#cfc6dc', 40, 320);
      E3.scene.background = null;
      SKY.hazeAmt = 0.5;
      E3.camera.fov = 80; E3.camera.updateProjectionMatrix();
      this.t = 0; this.z = 0; this.x = 2.2; this.tx = 2.2; this.hits = 0; this.gun = false; this.base = E3.yaw; this.said = {}; this.beers = 0; this.sip = 0; this.puked = {};
      this.last = performance.now();
      this.dest = dest;
      this.active = true;
      G.mode = 'ride';
      this.done = resolve;
      $('#ridehud').hidden = false;
      for (const id of ['#pframe', '#tframe', '#abar', '#xpbar', '#prompt', '#atip', '#pvp']) $(id).hidden = true;
      UI.fade(false);
    });
  },
  say(at, text) { if (this.t >= at && !this.said[at]) { this.said[at] = true; UI.toast(text, 2600); Voice.line(text); } },
  frame() {
    const now = performance.now(), dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
    this.t += dt;
    const speed = this.drunk ? 36 : 58;
    this.z -= speed * dt;
    // Koen kiest steeds de baan waar niemand vlak voor hem rijdt
    const ahead = (lane) => this.cars.some((c) => !c.hit && Math.abs(c.lane - lane) < 1 && c.z < this.z && c.z > this.z - 45);
    if (ahead(this.tx) || Math.random() < dt * 0.25) { const free = [-6.5, -2.2, 2.2, 6.5].filter((l) => !ahead(l)); if (free.length) this.tx = free.sort((a, b) => Math.abs(a - this.x) - Math.abs(b - this.x))[Math.random() < 0.3 ? free.length - 1 : 0]; }
    let dx = this.tx - this.x; this.x += Math.sign(dx) * Math.min(Math.abs(dx), dt * 7);
    if (this.drunk) {
      // dronken sturen: steeds meer slingeren, af en toe tegen de vangrail
      const wob = Math.sin(this.t * 1.7) * (0.6 + this.t * 0.25) + Math.sin(this.t * 4.3) * 0.3;
      this.x = Math.max(-7.6, Math.min(7.6, this.x + wob * dt * 2));
      dx = wob * 0.6;
      if (Math.abs(this.x) > 7.5 && Math.random() < dt * 3) { SFX.tone(90, 0.2, 'sawtooth', 0.05, -30); UI.toast(pick(['*SCHRAAAP* Vangrail.', 'Kjell: "Rechtdoor! RECHTDOOR!"']), 1200); }
    }
    for (const c of this.cars) {
      c.z -= c.v * dt;
      if (c.hit) { c.spin += dt * 9; c.g.rotation.y = c.spin; c.g.position.y = Math.max(0, Math.sin(Math.min(1, c.hit) * Math.PI) * 1.4); c.hit += dt; c.v = Math.max(0, c.v - dt * 30); if (Math.random() < 0.4) E3.puff(0x555555, 1, c.g.position.clone().add(new THREE.Vector3(5000, 1, 0)), { size: 0.8, up: 1.2, life: 2, grow: 3 }); }
      if (c.z > this.z + 30) { c.z = this.z - 400 - Math.random() * 300; c.hit = 0; c.spin = 0; c.v = 24 + Math.random() * 9; c.g.rotation.y = 0; c.g.position.y = 0; }
      c.g.position.x = c.lane; c.g.position.z = c.z;
    }
    E3.updateFx(dt);
    // camera op de bijrijdersstoel
    this.cab.position.set(this.x, 0, this.z);
    this.cab.rotation.y = -dx * 0.04;
    this.koen.userData.arms.forEach((a, i) => { a.rotation.z = Math.sin(this.t * 6) * 0.15 * (i ? 1 : -1); });
    const cam = E3.camera;
    const look = Math.max(-1.3, Math.min(1.3, E3.yaw - this.base));
    const drunkK = this.drunk ? Math.min(1, this.t / RIDE_LEN) : 0;
    cam.position.set(5000 + this.x + (this.drunk ? -0.42 : 0.42) + (Math.random() - 0.5) * 0.03, 1.32 + (Math.random() - 0.5) * 0.03, this.z + 0.1);
    cam.rotation.order = 'YXZ'; cam.rotation.set(E3.pitch * 0.7 + Math.sin(this.t * 2.1) * 0.08 * drunkK, look + this.cab.rotation.y + Math.sin(this.t * 1.3) * 0.1 * drunkK, -dx * 0.02 + Math.sin(this.t * 0.9) * 0.15 * drunkK);
    if (this.drunk) $('#view').style.filter = `blur(${(drunkK * 5).toFixed(1)}px) saturate(${(1 + drunkK).toFixed(2)}) hue-rotate(${Math.round(Math.sin(this.t) * 25 * drunkK)}deg)`;
    SKY.update(1 / 60, cam.position, E3.hemi, E3.sun, E3.scene, false);
    if (this.drunk) { this.drunkFrame(dt); this.endFrame(speed); return; }
    // verhaal en pistool
    this.say(0.5, 'Koen: "Gordels zijn voor mensen uit Groningen."');
    if (this.t > 2.5 && !this.gun) { this.gun = true; SFX.item(); UI.toast('Koen: "Dashboardkastje. Pak maar." Je vindt een handpistool. Klik of Spatie om te schieten!', 3000); }
    this.say(6.5, 'Koen: "RECHTS INHALEN MAG GEWOON!"');
    this.say(9.5, 'Koen: "Flitspaal? Welke flitspaal?"');
    this.say(12.5, this.dest === 'zwolle' ? 'Koen: "Zwolle. Wildernis. Ik zeg het je nog één keer."' : 'Koen: "Bijna in Meedhuizen. Saai, maar veilig."');
    this.recoil = Math.max(0, (this.recoil || 0) - dt * 5);
    const hand = $('#hand');
    if (hand.dataset.id !== (this.gun ? 'pistool' : 'null')) { hand.dataset.id = this.gun ? 'pistool' : 'null'; const x = hand.getContext('2d'); x.clearRect(0, 0, 12, 12); if (this.gun) x.drawImage(PISTOL_ICON, 0, 0); }
    hand.hidden = !this.gun;
    hand.style.transform = `translate(${-this.recoil * 20}px, ${-this.recoil * 40}px) rotate(${-10 - this.recoil * 25}deg)`;
    this.endFrame(speed);
  },
  endFrame(speed) {
    const cam = E3.camera;
    const left = Math.max(0, Math.ceil(RIDE_LEN - this.t));
    const txt = this.drunk ? `N33 → CAFÉ JOSJE · ${Math.round(speed * 3.6)} km/u · biertjes: ${this.beers} · nog ${left} s` : `A28 → ${this.dest === 'zwolle' ? 'ZWOLLE' : 'MEEDHUIZEN'} · ${Math.round(speed * 3.6)} km/u · nog ${left} s · geraakt: ${this.hits}`;
    if ($('#ridehud').textContent !== txt) $('#ridehud').textContent = txt;
    E3.renderer.render(E3.scene, cam);
    if (this.t >= RIDE_LEN && this.active) this.finish();
  },
  // dronken: steeds een slok, alles wordt wazig, en af en toe kotsen
  drunkFrame(dt) {
    this.sip -= dt;
    if (this.sip <= 0) { this.sip = 1.4 - Math.min(0.8, this.t * 0.05); this.beers += 1 + Math.floor(this.t / 6); this.recoil = 1; SFX.tone(260, 0.12, 'triangle', 0.03, -120); }
    for (const at of [5.5, 11]) if (this.t >= at && !this.puked[at]) {
      this.puked[at] = true;
      const k = $('#kotsflash'); k.classList.remove('on'); void k.offsetWidth; k.classList.add('on');
      SFX.tone(70, 0.6, 'sawtooth', 0.06, 40);
      const f = E3.camera.getWorldDirection(new THREE.Vector3());
      for (let i = 0; i < 18; i++) E3.puff(0xa8c83a, 1, E3.camera.position.clone().addScaledVector(f, 0.6 + Math.random() * 0.5).add(new THREE.Vector3((Math.random() - 0.5) * 0.4, -0.3 - Math.random() * 0.3, 0)), { size: 0.2, up: -0.4, life: 1.2, grow: 1.5, op: 0.9 });
      UI.toast(at < 8 ? '*KOTS* Uit het raam. Grotendeels.' : '*KOTS* Op het dashboard. Kjell en Jornt juichen.', 2200);
    }
    this.say(0.5, 'Kjell: "Rijden jij! Ik heb er al acht op!"');
    this.say(3, 'Jornt (achterin): "Nog eentje! Nog eentje!"');
    this.say(8, 'Kjell: "Josje is altijd open. ALTIJD."');
    this.say(13, 'Jornt: "Is dat een flitspaal? Zwaaien!"');
    this.recoil = Math.max(0, (this.recoil || 0) - dt * 2);
    const hand = $('#hand');
    if (hand.dataset.id !== 'bier') { hand.dataset.id = 'bier'; const x = hand.getContext('2d'); x.clearRect(0, 0, 12, 12); x.drawImage(BEER_ICON, 0, 0); }
    hand.hidden = false;
    hand.style.transform = `translate(${-this.recoil * 120}px, ${-this.recoil * 160}px) rotate(${-10 - this.recoil * 70}deg)`;
  },
  shoot(cx, cy) {
    if (!this.active || !this.gun || this.drunk || (this.cool || 0) > performance.now()) return;
    this.cool = performance.now() + 220;
    this.recoil = 1;
    SFX.tone(1200, 0.05, 'square', 0.06, -1100); SFX.tone(90, 0.12, 'sawtooth', 0.05, -40);
    const ray = new THREE.Raycaster();
    const r = E3.renderer.domElement.getBoundingClientRect();
    const ndc = cx == null ? new THREE.Vector2(0, 0) : new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, E3.camera);
    const live = this.cars.filter((c) => !c.hit);
    const hits = ray.intersectObjects(live.map((c) => c.g), true);
    if (hits.length && hits[0].distance < 160) {
      const c = live.find((c) => { let o = hits[0].object; while (o) { if (o === c.g) return true; o = o.parent; } return false; });
      if (c) { c.hit = 0.01; this.hits += 1; SFX.crit(); UI.toast(pick(['Raak! Hij spint de vangrail in.', 'BAM. Koen: "Mooi schot!"', 'Raak. Koen toetert goedkeurend.', 'Die rijdt voorlopig niet meer.']), 1200); }
    }
  },
  async finish() {
    this.active = false;
    await UI.fade(true);
    E3.scene.remove(this.root);
    if (E3.world) E3.world.visible = true;
    E3.camera.fov = 70; E3.camera.updateProjectionMatrix();
    $('#view').style.filter = '';
    $('#ridehud').hidden = true;
    $('#hand').hidden = true; $('#hand').dataset.id = '';
    const done = this.done; this.done = null;
    done({ hits: this.hits });
  },
};

// in 3D is de rit een echte cutscene
rideTo = async function (dest) {
  const G_ = G; G_.busy = true;
  PV.dismount(); CB.setTarget(null);
  if (document.pointerLockElement) document.exitPointerLock();
  await UI.fade(true);
  const r = await Ride.run(dest);
  G_.mode = 'map';
  if (dest === 'zwolle') G_.loadMap('zwolle', 25, 37, 'up'); else G_.loadMap('oost', 11, 22, 'up');
  await UI.fade(false);
  if (r.hits) { const eur = r.hits * 15; G_.P.money += eur; UI.toast(`Koen geeft je EUR ${eur}: vijftien per geraakte auto.`, 2600); }
  await UI.say('Koen', dest === 'zwolle' ? `Zwolle.${r.hits ? ` ${r.hits} auto's geraakt. Respect.` : ''} Hier is het wildernis: kijk uit voor andere spelers. Ik wacht bij de auto.` : 'Meedhuizen. Veilig. Saai. Tot de volgende keer.');
  G_.busy = false;
};
(function () {
  const render3d = G.render;
  G.render = function () { if (this.mode === 'ride') { $('#cross').hidden = false; Ride.frame(); return; } render3d.call(this); };
  $('#view').addEventListener('mousedown', (e) => { if (Ride.active) { e.preventDefault(); Ride.shoot(document.pointerLockElement ? null : e.clientX, document.pointerLockElement ? null : e.clientY); } });
  addEventListener('keydown', (e) => { if (Ride.active && (e.code === 'Space' || e.code === 'KeyF') && !e.repeat) { e.preventDefault(); Ride.shoot(); } });
})();

// de dronken rit naar Café Josje: jij rijdt
josjeRide = async function () {
  G.busy = true;
  PV.dismount(); CB.setTarget(null);
  if (document.pointerLockElement) document.exitPointerLock();
  await UI.fade(true);
  await Ride.run('josje', { drunk: true });
  G.mode = 'map';
  await josjeWreck();
  await josjeArrive();
};
