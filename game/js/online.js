// Online: andere spelers zien (via de room-capability), hun geld zien als je naast ze staat, en ruilen.
// Ruilen loopt via presence: A zet een aanbod in zijn presence, B antwoordt in de zijne.
const SHIRTS = ['#c8463a', '#3a7ac8', '#2e9a5a', '#d08a2a', '#8a4ac8', '#c84a8a', '#3aa8a8', '#7a6a4a'];
const shirtFor = (name) => SHIRTS[[...(name || '?')].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % SHIRTS.length];

const Online = {
  room: null, me: null, peers: [], rt: {}, lastSent: '', status: 'offline',

  async init() {
    try { this.room = await window.claude?.use?.('room'); } catch (e) { this.room = null; }
    if (!this.room) { this.status = 'offline'; return; }
    this.status = 'verbinden';
    const fail = (e) => { this.status = e && (e.code === 'not_granted' || e.code === 'revoked') ? 'geweigerd' : 'offline'; this.err = e && e.code; this.peers = []; };
    this.room.onConnection((c) => { if (this.status !== 'geweigerd') this.status = c ? 'online' : 'verbinden'; }, fail);
    this.room.onPeers((ch) => this.onPeers(ch.peers), fail);
  },

  others() { return this.peers.filter((p) => !p.sameTab && p.kind === 'viewer' && p.presence && p.presence.n); },
  count() { return this.others().length; },

  onPeers(peers) {
    this.peers = peers;
    const mine = peers.find((p) => p.sameTab);
    if (mine) this.me = mine.peer;
    // melding als er iemand bijkomt, met waar die is
    this.known = this.known || new Set();
    for (const p of this.others()) {
      if (this.known.has(p.peer)) continue;
      this.known.add(p.peer);
      if (G.S) UI.toast(`${String(p.presence.n).slice(0, 16)} is online (${placeName(p.presence.m)})`, 3500);
    }
    Trade.onPeers(peers);
  },

  // ---------- eigen presence ----------
  sync() {
    if (!this.room || !G.S || (G.mode !== 'map' && G.mode !== 'battle')) return;
    const P = G.P;
    const state = { n: G.S.name || 'Naamloos', m: G.map.id, x: G.pl.x, y: G.pl.y, d: G.pl.dir, eur: P.money, w: P.wpn || '', wp: (P.weapons || []).slice(0, 20), ap: G.S.ap || null, wr: P.wear || {}, b: G.mode === 'battle' ? 1 : 0 };
    const s = JSON.stringify(state);
    if (s === this.lastSent) return;
    this.lastSent = s;
    this.room.presence(state).then(() => { this.err = null; }, (e) => { this.lastSent = ''; this.err = e && e.code; });
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
      const look = lookFrom(s.ap, s.wr);
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
    if (k === 0) await Trade.request(p);
  },

  tick() { Trade.tick(); },
};

// ---------- ruil-hulpjes ----------
function tradeable(id) { return !!ITEMS[id] && (!ITEMS[id].key || id === 'vape'); }
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
function placeName(m) { return (MAPS[m] && MAPS[m].name) || 'onbekend'; }
function onlineText() {
  const st = Online.status;
  if (st === 'offline') return 'Offline: geen verbinding met de lobby';
  if (st === 'geweigerd') return 'Offline: geen toegang tot de lobby';
  if (st === 'verbinden') return 'Verbinden met de lobby…';
  const o = Online.others();
  if (Online.err) return `Online, maar je positie komt niet door (${Online.err})`;
  if (!o.length) return 'Online. Nog niemand anders in de lobby.';
  const here = o.filter((p) => p.presence.m === G.map.id).length;
  const elders = o.filter((p) => p.presence.m !== G.map.id).slice(0, 2).map((p) => `${String(p.presence.n).slice(0, 12)}: ${placeName(p.presence.m)}`);
  return `${o.length} speler${o.length > 1 ? 's' : ''} online, ${here} hier${elders.length ? ` · ${esc(elders.join(', '))}` : ''}`;
}
let hudLast = '';
function updateHud() {
  const show = G.S && G.mode === 'map' && $('#menu').hidden && $('#panel').hidden && $('#casino').hidden;
  const el = $('#hud');
  if (!show) { if (!el.hidden) el.hidden = true; return; }
  const html = `<div class="row"><span class="lbl">Geld</span><b>EUR ${G.P.money}</b></div><div class="row"><span class="lbl">Schuld</span><span>${debtText()}</span></div><div class="online">${onlineText()}</div>`;
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

// ---------- menu: wie is er online, en er meteen naartoe ----------
async function playersMenu() {
  const panel = $('#panel');
  const o = Online.others();
  panel.innerHTML = `<h3>Spelers online</h3><div id="plist" class="list"></div><p id="pdesc" class="lbl"></p>`;
  panel.hidden = false;
  if (!o.length) {
    $('#pdesc').textContent = Online.status === 'online' ? 'Er is nu niemand anders in de lobby. Laat je vrienden het spel openen.' : onlineText();
    await waitKey(); panel.hidden = true; return false;
  }
  const k = await UI.list('#plist', o.map((p) => ({ label: String(p.presence.n).slice(0, 16), right: placeName(p.presence.m) })), {
    cancel: true, keep: true, onMove: (i) => { $('#pdesc').textContent = `EUR ${Number(o[i].presence.eur) || 0}. Kies om ernaartoe te gaan.`; },
  });
  panel.hidden = true;
  if (k < 0) return false;
  const s = o[k].presence, m = MAPS[s.m];
  if (!m) return false;
  // een vrij vakje naast de ander zoeken
  for (const [dx, dy, dir] of [[0, 1, 'up'], [-1, 0, 'right'], [1, 0, 'left'], [0, -1, 'down']]) {
    const x = s.x + dx, y = s.y + dy, t = tileAt(m, x, y);
    if (!(TILE_DEF[t] || {}).walk || m.doors.some((d) => d.x === x && d.y === y)) continue;
    if (m.props.some((p) => p.solid && p.x === x && p.y === y)) continue;
    $('#menu').hidden = true;
    await G.warp(s.m, x, y, dir);
    UI.toast(`Je staat bij ${String(s.n).slice(0, 16)}.`);
    return true;
  }
  UI.toast('Er is geen plekje vrij naast die speler. Probeer het zo nog eens.');
  return false;
}
