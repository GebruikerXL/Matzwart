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
      if (li < lines.length && t >= lines[li][0]) { caption.textContent = lines[li][1]; li += 1; }
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
  E3.sceneCam = null; E3.hideNpcs = null; G.wrecking = false;
  caption.textContent = '';
  $('#cine').hidden = true;
  $('#view').style.filter = '';
};
