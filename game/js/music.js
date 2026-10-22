// Soundtrack, helemaal in code (WebAudio): meestal rustige lo-fi, en spannende muziek tijdens cutscenes en zware gevechten.
// Plus het Cobra 20-moment: eens per tien minuten een enorme knal, het scherm trilt, en Puutje is weer bezig.
const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);
const Music = {
  ctx: null, master: null, bus: null, delay: null, mode: null, step: 0, nextT: 0, noise: null, vol: 0.8,
  // akkoorden als MIDI-noten; rustig: Am7 – Fmaj7 – Cmaj7 – G6, spannend: Dm – Bb – Gm – A
  CALM: { bpm: 78, chords: [[57, 60, 64, 67], [53, 57, 60, 64], [48, 55, 59, 64], [55, 59, 62, 64]], bass: [45, 41, 48, 43] },
  TENSE: { bpm: 128, chords: [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]], bass: [38, 34, 31, 33] },

  start() {
    if (this.ctx || !SFX.ctx) return;
    const c = this.ctx = SFX.ctx;
    this.master = c.createGain(); this.master.gain.value = 0;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4;
    this.master.connect(comp); comp.connect(c.destination);
    this.bus = c.createGain(); this.bus.connect(this.master);
    // een beetje echo voor de sfeer
    this.delay = c.createDelay(1.0); this.delay.delayTime.value = 0.38;
    const fb = c.createGain(); fb.gain.value = 0.28;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
    this.delay.connect(lp); lp.connect(fb); fb.connect(this.delay); lp.connect(this.bus);
    const buf = c.createBuffer(1, c.sampleRate * 1, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
    this.nextT = c.currentTime + 0.1;
  },
  // per frame: modus kiezen en de komende noten inplannen
  tick() {
    if (!this.ctx) { this.start(); if (!this.ctx) return; }
    const c = this.ctx;
    const want = !SFX.on || !G.S && G.mode !== 'title' ? 'off' : this.tenseNow() ? 'tense' : 'calm';
    if (want !== this.mode) {
      this.mode = want;
      this.master.gain.cancelScheduledValues(c.currentTime);
      this.master.gain.setTargetAtTime(want === 'off' ? 0 : want === 'tense' ? this.vol * 1.1 : this.vol, c.currentTime, 0.6);
      if (want !== 'off') { this.step = 0; this.nextT = Math.max(this.nextT, c.currentTime + 0.05); }
    }
    if (this.mode === 'off') return;
    const song = this.mode === 'tense' ? this.TENSE : this.CALM;
    const s16 = 60 / song.bpm / 4;
    if (this.nextT < c.currentTime - 0.5) this.nextT = c.currentTime + 0.05;
    while (this.nextT < c.currentTime + 0.25) { this.play(song, this.step, this.nextT, s16); this.step += 1; this.nextT += s16; }
  },
  tenseNow() {
    if (G.mode === 'ride' || G.mode === 'battle') return true;
    if (typeof E3 !== 'undefined' && E3.sceneCam) return true;
    if (typeof CB !== 'undefined' && (CB.story || CB.brawlP)) return true;
    return false;
  },
  // ---------- instrumenten ----------
  osc(type, f, t, d, vol, dest, attack = 0.01, detune = 0) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = detune;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(dest || this.bus); o.start(t); o.stop(t + d + 0.05);
    return o;
  },
  hat(t, vol) {
    const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noise; f.type = 'highpass'; f.frequency.value = 7000;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    s.connect(f); f.connect(g); g.connect(this.bus); s.start(t, Math.random() * 0.5, 0.08);
  },
  kick(t, vol) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.18);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g); g.connect(this.bus); o.start(t); o.stop(t + 0.35);
  },
  play(song, step, t, s16) {
    const bar = Math.floor(step / 16) % 4, i = step % 16, chord = song.chords[bar];
    if (this.mode === 'calm') {
      // zachte pad per maat, langzame bas, af en toe een plukje melodie, rustige drums
      if (i === 0) for (const n of chord) this.osc('triangle', NOTE(n), t, s16 * 16, 0.035, null, 0.6, (Math.random() - 0.5) * 8);
      if (i === 0 || i === 10) this.osc('sine', NOTE(song.bass[bar]), t, s16 * 6, 0.16, null, 0.02);
      if (i % 2 === 0 && Math.random() < 0.38) { const n = chord[Math.floor(Math.random() * chord.length)] + 12 * (Math.random() < 0.6 ? 1 : 2); this.osc('sine', NOTE(n), t, s16 * 3, 0.05, this.delay, 0.005); this.osc('sine', NOTE(n), t, s16 * 3, 0.04, null, 0.005); }
      if (i === 0 || i === 8) this.kick(t, 0.22);
      if (i % 4 === 2) this.hat(t, 0.05);
    } else {
      // spannend: dreigende bas in zestienden, stoten, harde drums, opbouwende ruis
      const ost = [0, 0, 12, 0, 3, 0, 12, 0, 0, 0, 12, 0, 5, 3, 12, 0];
      this.osc('sawtooth', NOTE(song.bass[bar] + ost[i]), t, s16 * 0.9, 0.07, null, 0.005);
      if (i === 0) { for (const n of chord) { this.osc('sawtooth', NOTE(n + 12), t, s16 * 3, 0.045, this.delay, 0.005, 6); this.osc('square', NOTE(n), t, s16 * 14, 0.018, null, 0.4); } }
      if (i === 0 || i === 6 || i === 8 || i === 11) this.kick(t, 0.4);
      if (i % 2 === 1) this.hat(t, 0.06);
      if (i === 4 || i === 12) { this.hat(t, 0.16); this.osc('triangle', 190, t, 0.12, 0.12, null, 0.002); }
      if (bar === 3 && i >= 8) this.osc('sine', NOTE(62 + (i - 8)), t, s16, 0.03, this.delay, 0.005);
    }
  },
};

// ---------- Cobra 20: eens per tien minuten ----------
const COBRA_EVERY = 10 * 60 * 1000;
const Cobra = {
  last: performance.now(),
  tick(now) {
    if (!G.S || G.mode !== 'map') { return; }
    if (now - this.last < COBRA_EVERY) return;
    this.last = now;
    this.boom();
  },
  boom() {
    const c = SFX.ctx;
    if (c && SFX.on) {
      const t = c.currentTime;
      // de knal: een harde klap ruis, een diepe dreun en wat naknetteren
      const buf = c.createBuffer(1, c.sampleRate * 2.5, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = buf; f.type = 'lowpass'; f.frequency.setValueAtTime(9000, t); f.frequency.exponentialRampToValueAtTime(200, t + 1.8);
      g.gain.setValueAtTime(1.0, t); g.gain.exponentialRampToValueAtTime(0.001, t + 2.4);
      s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
      const o = c.createOscillator(), og = c.createGain();
      o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(25, t + 1.2);
      og.gain.setValueAtTime(0.9, t); og.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      o.connect(og); og.connect(c.destination); o.start(t); o.stop(t + 1.6);
      for (let k = 0; k < 10; k++) setTimeout(() => SFX.tone(1200 + Math.random() * 2000, 0.03, 'square', 0.05), 900 + k * 120 + Math.random() * 80);
    }
    // het scherm trilt twee seconden
    const game = $('#game');
    game.classList.remove('cobra'); void game.offsetWidth; game.classList.add('cobra');
    setTimeout(() => game.classList.remove('cobra'), 2000);
    const el = $('#cobra');
    el.hidden = false; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    setTimeout(() => { el.hidden = true; }, 5200);
  },
};
