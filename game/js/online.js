// Online: andere spelers zien (via de room-capability), hun geld zien als je naast ze staat, en ruilen.
// Ruilen loopt via presence: A zet een aanbod in zijn presence, B antwoordt in de zijne.
const SHIRTS = ['#c8463a', '#3a7ac8', '#2e9a5a', '#d08a2a', '#8a4ac8', '#c84a8a', '#3aa8a8', '#7a6a4a'];
const shirtFor = (name) => SHIRTS[[...(name || '?')].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % SHIRTS.length];

const Online = {
  room: null, me: null, peers: [], rt: {}, pending: null, seen: new Set(), queue: [], lastSent: '', status: 'offline',

  async init() {
    try { this.room = await window.claude?.use?.('room'); } catch (e) { this.room = null; }
    if (!this.room) { this.status = 'offline'; return; }
    this.status = 'verbinden';
    this.room.onConnection((c) => { this.status = c ? 'online' : 'verbinden'; }, () => { this.status = 'offline'; this.room = null; });
    this.room.onPeers((ch) => this.onPeers(ch.peers), () => { this.peers = []; });
  },

  others() { return this.peers.filter((p) => !p.sameTab && p.kind === 'viewer' && p.presence && p.presence.n); },
  count() { return this.others().length; },

  onPeers(peers) {
    this.peers = peers;
    const mine = peers.find((p) => p.sameTab);
    if (mine) this.me = mine.peer;
    // antwoord op ons openstaande aanbod?
    const pd = this.pending;
    if (pd) {
      const to = peers.find((p) => p.peer === pd.to);
      const ans = to && to.presence && to.presence.answer;
      if (ans && ans.id === pd.id) this.finishOffer(!!ans.ok, to.presence.n);
      else if (!to) this.finishOffer(false, pd.name, 'is weggegaan');
    }
    // nieuwe aanbiedingen aan ons
    for (const p of this.others()) {
      const o = p.presence.offer;
      if (o && o.to === this.me && !this.seen.has(o.id)) { this.seen.add(o.id); this.queue.push({ from: p.peer, name: String(p.presence.n).slice(0, 16), offer: o }); }
    }
  },

  // ---------- eigen presence ----------
  sync() {
    if (!this.room || !G.S || (G.mode !== 'map' && G.mode !== 'battle')) return;
    const P = G.P;
    const inv = {};
    for (const id of Object.keys(P.items)) if (P.items[id] > 0 && tradeable(id)) inv[id] = P.items[id];
    const state = { n: G.S.name || 'Naamloos', m: G.map.id, x: G.pl.x, y: G.pl.y, d: G.pl.dir, eur: P.money, w: P.wpn || '', inv, wp: (P.weapons || []).slice(0, 20), b: G.mode === 'battle' ? 1 : 0 };
    const s = JSON.stringify(state);
    if (s === this.lastSent) return;
    this.lastSent = s;
    this.room.presence(state).catch(() => {});
  },

  // ---------- tekenen ----------
  sprites(list, cx, cy) {
    for (const p of this.others()) {
      const s = p.presence;
      if (s.m !== G.map.id) continue;
      const r = this.rt[p.peer] || (this.rt[p.peer] = { px: s.x * TS, py: s.y * TS, moving: 0, frame: 0 });
      const tx = s.x * TS, ty = s.y * TS;
      const dist = Math.abs(tx - r.px) + Math.abs(ty - r.py);
      if (dist > 64) { r.px = tx; r.py = ty; }
      r.px += Math.sign(tx - r.px) * Math.min(Math.abs(tx - r.px), 2);
      r.py += Math.sign(ty - r.py) * Math.min(Math.abs(ty - r.py), 2);
      r.moving = dist > 0 ? r.moving + 1 : 0;
      const fr = r.moving ? 1 + (Math.floor(r.moving / 8) % 2) : 0;
      const look = { ...PLAYER_LOOK, shirt: shirtFor(s.n) };
      const w = WEAPONS[s.w] ? s.w : null;
      const dir = DIRS[s.d] ? s.d : 'down';
      const x = r.px - cx, y = r.py - cy;
      const near = Math.abs(s.x - G.pl.x) + Math.abs(s.y - G.pl.y) === 1;
      list.push({ y: r.py, draw: () => {
        drawHeld(ctx, w, dir, x, y, fr, true);
        drawPerson(look, dir, fr, x, y);
        drawHeld(ctx, w, dir, x, y, fr, false);
        nameTag(String(s.n).slice(0, 16) + (s.b ? ' (vecht)' : ''), x + 8, y - 6, '#f4f1ea');
        if (near) nameTag(`EUR ${Number(s.eur) || 0}`, x + 8, y - 16, '#ffd25a');
      } });
    }
  },
  peerAt(x, y) { return this.others().find((p) => p.presence.m === G.map.id && p.presence.x === x && p.presence.y === y); },

  // ---------- ruilen ----------
  async talkTo(p) {
    const s = p.presence, name = String(s.n).slice(0, 16);
    const k = await G.ask(name, `${name} heeft EUR ${Number(s.eur) || 0}. Wat wil je doen?`, ['Ruilen', 'Zwaaien', 'Laat maar'], true);
    if (k === 1) { await G.say('', `Je zwaait naar ${name}. Vanuit een ander deel van het internet zwaait ${name} misschien terug.`); return; }
    if (k !== 0) return;
    if (this.pending) { await G.say('', `Je wacht nog op een antwoord van ${this.pending.name}.`); return; }
    const mine = tradeList(G.P, null);
    const give = await pickTrade(`Wat geef jij aan ${name}?`, mine, s.wp || []);
    if (give === undefined) return;
    const theirs = tradeList({ items: s.inv || {}, weapons: s.wp || [], money: Number(s.eur) || 0 }, G.P.weapons || []);
    const want = await pickTrade(`Wat wil je van ${name} terug?`, theirs, G.P.weapons || []);
    if (want === undefined) return;
    if (!give && !want) { await G.say('', 'Niks voor niks. Dat is geen ruil, dat is een gesprek.'); return; }
    if (give) take(give);
    const id = Math.random().toString(36).slice(2, 10);
    this.pending = { id, to: p.peer, name, give, want, t: performance.now() };
    this.room.presence({ offer: { id, to: p.peer, give, want } }).catch(() => {});
    UI.toast(`Aanbod verstuurd naar ${name}. Even wachten…`, 3000);
  },

  finishOffer(ok, name, why) {
    const pd = this.pending;
    if (!pd) return;
    this.pending = null;
    if (this.room) this.room.presence({ offer: null }).catch(() => {});
    if (ok) {
      if (pd.want) put(pd.want);
      SFX.win(); UI.toast(`Ruil met ${name} gelukt!${pd.want ? ` Je kreeg ${tradeLabel(pd.want)}.` : ''}`, 3200);
    } else {
      if (pd.give) put(pd.give);
      SFX.no(); UI.toast(`${name} ${why || 'wil niet ruilen'}. Je houdt je spullen.`, 3200);
    }
  },

  async handleIncoming() {
    const q = this.queue.shift();
    if (!q) return;
    const o = q.offer;
    const valid = (e) => !e || ['item', 'wpn', 'eur'].includes(e.k);
    if (!valid(o.give) || !valid(o.want)) return;
    G.busy = true;
    const txt = `${q.name} wil ruilen. Jij krijgt: ${o.give ? tradeLabel(o.give) : 'niks'}. ${q.name} krijgt: ${o.want ? tradeLabel(o.want) : 'niks'}.`;
    const k = await G.ask(q.name, txt, ['Accepteren', 'Weigeren']);
    let ok = false;
    if (k === 0) {
      if (o.want && !has(o.want)) { await G.say('', `Dat heb je niet (meer). De ruil gaat niet door.`); }
      else {
        if (o.want) take(o.want);
        if (o.give) put(o.give);
        ok = true; SFX.win(); UI.toast('Ruil gelukt!', 2400);
      }
    }
    this.room.presence({ answer: { id: o.id, ok } }).catch(() => {});
    setTimeout(() => this.room && this.room.presence({ answer: null }).catch(() => {}), 15000);
    G.busy = false;
  },

  tick() {
    if (this.pending && performance.now() - this.pending.t > 45000) this.finishOffer(false, this.pending.name, 'reageerde niet');
    if (this.queue.length && G.mode === 'map' && !G.busy && !UI.focus && !G.pl.moving) this.handleIncoming();
  },
};

// ---------- ruil-hulpjes ----------
function tradeable(id) { return ITEMS[id] && (!ITEMS[id].key || id === 'vape'); }
function tradeLabel(e) {
  if (e.k === 'eur') return `EUR ${e.n}`;
  if (e.k === 'wpn') return WEAPONS[e.id] ? `${WEAPONS[e.id].name} (wapen)` : 'een wapen';
  return ITEMS[e.id] ? ITEMS[e.id].name : 'iets';
}
function tradeList(src, excludeWeapons) {
  const out = [];
  for (const id of Object.keys(src.items || {})) if ((src.items[id] || 0) > 0 && tradeable(id)) out.push({ k: 'item', id, n: 1, max: src.items[id] });
  for (const id of src.weapons || []) if (WEAPONS[id] && !(excludeWeapons || []).includes(id)) out.push({ k: 'wpn', id });
  for (const n of [5, 10, 25, 50, 100]) if ((src.money || 0) >= n) out.push({ k: 'eur', n });
  return out;
}
async function pickTrade(q, list, theirWeapons) {
  const opts = list.filter((e) => !(e.k === 'wpn' && theirWeapons.includes(e.id)));
  const labels = opts.map((e) => ({ label: tradeLabel(e), right: e.max > 1 ? '×' + e.max : '' }));
  labels.push('Niks');
  const k = await G.ask('', q, labels, true);
  if (k < 0) return undefined;
  if (k === opts.length) return null;
  const { max, ...e } = opts[k];
  return e;
}
function has(e) {
  const P = G.P;
  if (e.k === 'eur') return P.money >= e.n;
  if (e.k === 'wpn') return (P.weapons || []).includes(e.id);
  return (P.items[e.id] || 0) >= 1;
}
function take(e) {
  const P = G.P;
  if (e.k === 'eur') P.money -= e.n;
  else if (e.k === 'wpn') { P.weapons = (P.weapons || []).filter((w) => w !== e.id); if (P.wpn === e.id) P.wpn = null; }
  else P.items[e.id] = Math.max(0, (P.items[e.id] || 0) - 1);
}
function put(e) {
  const P = G.P;
  if (e.k === 'eur') P.money += Math.max(0, Math.min(1000, Number(e.n) || 0));
  else if (e.k === 'wpn') { if (WEAPONS[e.id] && !(P.weapons || []).includes(e.id)) P.weapons.push(e.id); }
  else if (ITEMS[e.id]) P.items[e.id] = (P.items[e.id] || 0) + 1;
}
function nameTag(text, cx, y, col) {
  ctx.font = '8px Silkscreen, monospace';
  ctx.textBaseline = 'top';
  const w = Math.ceil(ctx.measureText(text).width) + 4;
  const x = Math.round(cx - w / 2);
  ctx.fillStyle = 'rgba(10,8,20,.7)'; ctx.fillRect(x, y - 1, w, 9);
  ctx.fillStyle = col; ctx.fillText(text, x + 2, y - 1);
}

// ---------- geld en schulden altijd in beeld ----------
function debtText() {
  const d = [];
  if (G.quest('rekening') === 1) d.push(`EUR ${REKENING} Lanting`);
  if (G.quest('onbetaald') >= 1 && G.quest('onbetaald') < 3) d.push('24 frikandellen EKA');
  return d.length ? d.join(' + ') : 'geen';
}
let hudLast = '';
function updateHud() {
  const show = G.S && G.mode === 'map' && $('#menu').hidden && $('#panel').hidden && $('#casino').hidden;
  const el = $('#hud');
  if (!show) { if (!el.hidden) el.hidden = true; return; }
  const n = Online.count();
  const html = `<div class="row"><span class="lbl">Geld</span><b>EUR ${G.P.money}</b></div><div class="row"><span class="lbl">Schuld</span><span>${debtText()}</span></div><div class="online">${Online.status === 'offline' ? 'offline' : n ? `${n} andere speler${n > 1 ? 's' : ''} online` : 'alleen online'}</div>`;
  if (html !== hudLast) { el.innerHTML = html; hudLast = html; }
  if (el.hidden) el.hidden = false;
}

// ---------- naam kiezen ----------
function askName(current) {
  const f = $('#nameform'), inp = $('#pname');
  f.hidden = false; inp.value = current || '';
  setTimeout(() => inp.focus(), 50);
  return new Promise((resolve) => {
    UI.focus = () => {};
    f.onsubmit = (e) => {
      e.preventDefault();
      const v = inp.value.replace(/[^\p{L}\p{N} _.-]/gu, '').trim().slice(0, 16);
      if (!v) { inp.focus(); return; }
      f.hidden = true; UI.focus = null; inp.blur();
      resolve(v);
    };
  });
}
