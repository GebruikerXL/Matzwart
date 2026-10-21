// Vensters, dialogen en keuzelijsten. Alles wordt bestuurd via UI.focus (één actieve ontvanger van toetsen).
const $ = (s) => document.querySelector(s);
const UI = {
  focus: null,
  typing: false,

  key(k) { if (this.focus) { this.focus(k); return true; } return false; },

  show(el, on = true) { (typeof el === 'string' ? $(el) : el).hidden = !on; },

  toast(text, ms = 1800) {
    const t = $('#toast');
    t.textContent = text; t.hidden = false;
    clearTimeout(this._tt);
    this._tt = setTimeout(() => (t.hidden = true), ms);
  },

  fade(on) {
    $('#fade').classList.toggle('on', on);
    return new Promise((r) => setTimeout(r, 380));
  },

  // Typemachine-tekst in het dialoogvenster
  say(name, text) {
    const box = $('#dialog'), nm = box.querySelector('.name'), tx = box.querySelector('.text'), more = box.querySelector('.more');
    box.hidden = false;
    nm.hidden = !name; nm.textContent = name || '';
    tx.textContent = ''; more.hidden = true;
    return new Promise((resolve) => {
      let i = 0, done = false;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const finish = () => { done = true; clearInterval(iv); tx.textContent = text; more.hidden = false; };
      const iv = setInterval(() => {
        i += 1;
        tx.textContent = text.slice(0, i);
        if (i % 3 === 0 && text[i] && text[i] !== ' ') SFX.blip();
        if (i >= text.length) finish();
      }, 22);
      if (reduce) finish();
      const close = () => { this.focus = null; box.hidden = true; box.onclick = null; resolve(); };
      this.focus = (k) => {
        if (k !== 'ok' && k !== 'cancel') return;
        if (!done) finish(); else { SFX.tick(); close(); }
      };
      box.onclick = () => this.focus && this.focus('ok');
    });
  },

  // Keuzelijst. items: string | {label, off, right}. Geeft index terug, of -1 bij annuleren.
  list(el, items, opts = {}) {
    el = typeof el === 'string' ? $(el) : el;
    el.innerHTML = '';
    el.hidden = false;
    const norm = items.map((it) => (typeof it === 'string' ? { label: it } : it));
    let sel = Math.min(opts.start || 0, norm.length - 1);
    const nodes = norm.map((it, i) => {
      const d = document.createElement('div');
      d.className = 'opt' + (it.off ? ' off' : '');
      d.textContent = it.label;
      if (it.right != null) { const r = document.createElement('span'); r.className = 'r'; r.textContent = it.right; d.appendChild(r); }
      d.onclick = (e) => { e.stopPropagation(); sel = i; paint(); this.focus && this.focus('ok'); };
      d.onmouseenter = () => { if (sel !== i) { sel = i; paint(); } };
      el.appendChild(d);
      return d;
    });
    const paint = () => { nodes.forEach((n, i) => n.classList.toggle('sel', i === sel)); opts.onMove && opts.onMove(sel); };
    paint();
    return new Promise((resolve) => {
      const end = (v) => { this.focus = prev; if (!opts.keep) el.hidden = true; resolve(v); };
      const prev = opts.stack ? this.focus : null;
      this.focus = (k) => {
        if (k === 'up') { sel = (sel - 1 + norm.length) % norm.length; SFX.tick(); paint(); }
        else if (k === 'down') { sel = (sel + 1) % norm.length; SFX.tick(); paint(); }
        else if (k === 'ok') {
          if (norm[sel].off) { SFX.no(); return; }
          SFX.ok(); end(sel);
        } else if (k === 'cancel' && opts.cancel) { SFX.tick(); end(-1); }
      };
    });
  },

  // Vraag met tekst in dialoogvenster en keuzes erboven
  async ask(name, text, items, cancel = false) {
    const box = $('#dialog'), nm = box.querySelector('.name'), tx = box.querySelector('.text');
    box.hidden = false; nm.hidden = !name; nm.textContent = name || ''; tx.textContent = text;
    box.querySelector('.more').hidden = true;
    const r = await this.list('#choices', items, { cancel });
    box.hidden = true;
    return r;
  },
};

// ---------- Geluid: kleine chiptune-bliepjes via WebAudio ----------
const SFX = {
  ctx: null, on: true,
  init() { try { this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); } catch (e) { this.ctx = null; } },
  tone(f, d = 0.06, type = 'square', vol = 0.05, slide = 0) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + d + 0.02);
  },
  blip() { this.tone(520 + Math.random() * 60, 0.03, 'square', 0.02); },
  tick() { this.tone(880, 0.03); },
  ok() { this.tone(660, 0.05); setTimeout(() => this.tone(990, 0.06), 50); },
  no() { this.tone(160, 0.12, 'sawtooth', 0.04); },
  hit() { this.tone(220, 0.12, 'sawtooth', 0.07, -160); },
  crit() { this.tone(400, 0.2, 'square', 0.07, -340); },
  heal() { [523, 659, 784].forEach((f, i) => setTimeout(() => this.tone(f, 0.08, 'triangle', 0.06), i * 70)); },
  item() { [784, 988, 1175, 1568].forEach((f, i) => setTimeout(() => this.tone(f, 0.08, 'square', 0.04), i * 80)); },
  battle() { [196, 247, 294, 392, 294, 392].forEach((f, i) => setTimeout(() => this.tone(f, 0.09, 'square', 0.05), i * 70)); },
  win() { [523, 523, 523, 659, 587, 659, 784].forEach((f, i) => setTimeout(() => this.tone(f, 0.12, 'square', 0.05), i * 110)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => setTimeout(() => this.tone(f, 0.25, 'triangle', 0.06), i * 220)); },
  step() { this.tone(90, 0.03, 'triangle', 0.02); },
  phone() { [0, 1, 2, 3].forEach((i) => setTimeout(() => this.tone(i % 2 ? 1320 : 1760, 0.1, 'square', 0.04), i * 120)); },
};
