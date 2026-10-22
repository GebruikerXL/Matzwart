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
