// Ruilen zoals in Old School RuneScape: verzoek → ruilscherm (allebei accepteren) → bevestigscherm (allebei accepteren) → ruil.
// Alles loopt via presence: req = verzoek, rej = weigering, tr = de lopende ruil {id, with, offer, acc, st}.
const Trade = {
  t: null, reqOut: null, seenReq: new Set(), queue: [], lastPartner: '', partnerSeen: false,

  // ---------- verzoek ----------
  async request(p) {
    const name = String(p.presence.n).slice(0, 16);
    if (this.t || this.reqOut) { await G.say('', 'Je bent al met een ruil bezig.'); return; }
    const id = Math.random().toString(36).slice(2, 10);
    this.reqOut = { id, to: p.peer, name, t: performance.now() };
    Online.room.presence({ req: { id, to: p.peer } }).catch(() => {});
    UI.toast(`Ruilverzoek gestuurd naar ${name}…`, 3000);
  },

  onPeers(peers) {
    const me = Online.me;
    // binnenkomende verzoeken
    for (const p of Online.others()) {
      const r = p.presence.req;
      if (r && r.to === me && typeof r.id === 'string' && !this.seenReq.has(r.id)) { this.seenReq.add(r.id); this.queue.push({ peer: p.peer, name: String(p.presence.n).slice(0, 16), id: r.id }); }
    }
    // ons verzoek beantwoord?
    const ro = this.reqOut;
    if (ro) {
      const to = peers.find((p) => p.peer === ro.to);
      const pr = to && to.presence;
      if (!to) this.dropReq(`${ro.name} is weggegaan.`);
      else if (pr.rej && pr.rej.id === ro.id) this.dropReq(`${ro.name} wil nu niet ruilen.`);
      else if (pr.tr && pr.tr.id === ro.id && pr.tr.with === me) { this.reqOut = null; Online.room.presence({ req: null }).catch(() => {}); this.open(ro.id, ro.to, ro.name); }
    }
    if (this.t) this.sync(peers);
  },
  dropReq(msg) { this.reqOut = null; Online.room.presence({ req: null }).catch(() => {}); SFX.no(); UI.toast(msg, 3000); },

  tick() {
    if (this.reqOut && performance.now() - this.reqOut.t > 30000) this.dropReq(`${this.reqOut.name} reageert niet.`);
    if (this.queue.length && !this.t && G.mode === 'map' && !G.busy && !UI.focus && !G.pl.moving) this.answer(this.queue.shift());
  },
  async answer(q) {
    G.busy = true;
    const k = await G.ask(q.name, `${q.name} wil met je ruilen.`, ['Ruilscherm openen', 'Weigeren']);
    const still = Online.others().find((p) => p.peer === q.peer && p.presence.req && p.presence.req.id === q.id);
    if (k === 0 && still) this.open(q.id, q.peer, q.name);
    else { Online.room.presence({ rej: { id: q.id } }).catch(() => {}); G.busy = false; if (k === 0) UI.toast(`${q.name} heeft het verzoek ingetrokken.`); }
  },

  // ---------- het ruilscherm ----------
  open(id, peer, name) {
    G.busy = true;
    this.t = { id, with: peer, name, offer: [], acc: 0, st: 1, done: false };
    this.partner = { offer: [], acc: 0, st: 1 };
    this.lastPartner = ''; this.partnerSeen = false; this.sel = 0;
    this.push();
    this.render();
    UI.focus = (k) => this.key(k);
  },
  push() {
    const t = this.t;
    Online.room.presence({ tr: t ? { id: t.id, with: t.with, offer: t.offer, acc: t.acc, st: t.st } : null, rej: null }).catch(() => {});
  },
  close(msg) {
    this.t = null;
    $('#trade').hidden = true;
    UI.focus = null; G.busy = false;
    Online.room.presence({ tr: null }).catch(() => {});
    if (msg) UI.toast(msg, 3200);
  },

  // partnerstatus bijwerken uit presence
  sync(peers) {
    const t = this.t;
    const p = peers.find((x) => x.peer === t.with);
    const tr = p && p.presence && p.presence.tr;
    const ok = tr && tr.id === t.id && tr.with === Online.me;
    if (!ok) {
      if (t.done) return;
      if (!p || this.partnerSeen) { SFX.no(); this.close(`${t.name} heeft de ruil geannuleerd.`); }
      return;
    }
    this.partnerSeen = true;
    const offer = cleanOffer(tr.offer);
    const key = JSON.stringify(offer);
    if (key !== this.lastPartner) {
      if (this.lastPartner && t.st === 1 && t.acc) { t.acc = 0; this.push(); this.note = `${t.name} heeft het aanbod veranderd.`; }
      this.lastPartner = key;
    }
    this.partner = { offer, acc: tr.acc ? 1 : 0, st: Number(tr.st) || 1 };
    const P = this.partner;
    // allebei akkoord op scherm 1 → naar bevestigscherm
    if (t.st === 1 && t.acc && P.acc && P.st === 1) { t.st = 2; t.acc = 0; this.sel = 0; this.push(); }
    else if (t.st === 1 && t.acc && P.st === 2) { t.st = 2; t.acc = 0; this.sel = 0; this.push(); }
    // allebei akkoord op scherm 2 → ruilen
    if (t.st === 2 && t.acc && !t.done && ((P.st === 2 && P.acc) || P.st === 3)) this.execute();
    this.render();
  },

  execute() {
    const t = this.t;
    for (const e of t.offer) if (!canGive(e)) { this.close('Je hebt niet meer alles wat je aanbood. De ruil gaat niet door.'); return; }
    t.done = true; t.st = 3; this.push();
    for (const e of t.offer) giveAway(e);
    for (const e of this.partner.offer) receive(e);
    SFX.win();
    const got = this.partner.offer.length ? this.partner.offer.map(offerLabel).join(', ') : 'niks';
    setTimeout(() => { if (this.t && this.t.done) this.close(`Ruil met ${t.name} voltooid. Je kreeg: ${got}.`); }, 1200);
    this.render();
  },

  // ---------- bewerken ----------
  available() {
    const P = G.P, t = this.t, out = [];
    const offered = (k, id) => t.offer.filter((e) => e.k === k && e.id === id).reduce((s, e) => s + e.n, 0);
    for (const id of Object.keys(P.items)) {
      if (!tradeable(id)) continue;
      const worn = Object.values(P.wear || {}).includes(id) ? 1 : 0;
      const n = (P.items[id] || 0) - worn - offered('item', id);
      if (n > 0) out.push({ k: 'item', id, n });
    }
    for (const id of P.weapons || []) if (!offered('wpn', id)) out.push({ k: 'wpn', id, n: 1 });
    return out;
  },
  add(e, n = 1) {
    const t = this.t;
    if (e.k === 'wpn') {
      const p = Online.peers.find((x) => x.peer === t.with);
      if (p && Array.isArray(p.presence.wp) && p.presence.wp.includes(e.id)) { SFX.no(); this.note = `${t.name} heeft dit wapen al.`; this.render(); return; }
    }
    const ex = t.offer.find((o) => o.k === e.k && o.id === e.id);
    if (ex) ex.n += n; else t.offer.push({ k: e.k, id: e.id, n });
    t.acc = 0; SFX.tick(); this.push(); this.render();
  },
  addMoney(n) {
    const t = this.t, have = G.P.money - t.offer.filter((e) => e.k === 'eur').reduce((s, e) => s + e.n, 0);
    n = Math.min(n, have); if (n <= 0) { SFX.no(); return; }
    this.add({ k: 'eur', id: 'eur' }, n);
  },
  remove(i) {
    const t = this.t, e = t.offer[i];
    if (!e) return;
    if (e.k === 'eur' || e.n <= 1) t.offer.splice(i, 1); else e.n -= 1;
    t.acc = 0; SFX.tick(); this.push(); this.render();
  },
  accept() { const t = this.t; t.acc = 1; this.note = ''; SFX.ok(); this.push(); this.sync(Online.peers); this.render(); },

  // ---------- tekenen ----------
  render() {
    const t = this.t; if (!t) return;
    const el = $('#trade'); el.hidden = false;
    const P = this.partner;
    const lines = (offer, mine) => (offer.length ? offer.map((e, i) => `<button type="button" class="tline${mine && t.st === 1 ? ' rm' : ''}" ${mine && t.st === 1 ? `data-rm="${i}"` : 'disabled'}>${esc(offerLabel(e))}</button>`).join('') : '<p class="lbl">Niks</p>');
    const status = t.done ? 'Ruilen…' : t.st === 1
      ? (t.acc && P.acc ? '' : t.acc ? `Wachten op ${esc(t.name)}…` : P.acc ? `${esc(t.name)} heeft geaccepteerd.` : (this.note || 'Klik op een spul om het aan te bieden. Klik op je aanbod om het terug te halen.'))
      : (t.acc ? `Wachten op ${esc(t.name)}…` : P.acc ? `${esc(t.name)} heeft geaccepteerd. Jij nog.` : 'Weet je het zeker? Controleer goed wat je krijgt.');
    let html = `<h3>${t.st === 1 ? 'Ruilen' : 'Bevestigen'} met ${esc(t.name)}</h3><div class="tcols">
      <div class="tcol"><h4>Jij geeft${t.acc ? ' ✓' : ''}</h4>${lines(t.offer, true)}</div>
      <div class="tcol"><h4>${esc(t.name)} geeft${P.acc ? ' ✓' : ''}</h4>${lines(P.offer, false)}</div></div>`;
    if (t.st === 1) {
      const av = this.available();
      html += `<h4>Jouw spullen</h4><div class="tinv">${av.map((e, i) => `<button type="button" class="tit" data-add="${i}">${esc(invLabel(e))}</button>`).join('') || '<p class="lbl">Niks om te ruilen.</p>'}</div>
        <div class="tmoney"><span class="lbl">Geld (EUR ${G.P.money}):</span>${[1, 10, 100].map((n) => `<button type="button" data-eur="${n}">+${n}</button>`).join('')}<button type="button" data-eur="all">Alles</button></div>`;
      this._av = av;
    }
    html += `<p class="tstatus">${status}</p><div class="tbtns"><button type="button" class="tacc" ${t.acc || t.done ? 'disabled' : ''}>Accepteren</button><button type="button" class="tdec" ${t.done ? 'disabled' : ''}>${t.st === 1 ? 'Annuleren' : 'Weigeren'}</button></div>`;
    el.innerHTML = html;
    this.btns = [...el.querySelectorAll('button:not([disabled])')];
    this.sel = Math.min(this.sel, this.btns.length - 1);
    this.btns.forEach((b, i) => b.classList.toggle('sel', i === this.sel));
    el.onclick = (e) => { const b = e.target.closest('button'); if (b && !b.disabled) this.act(b); };
  },
  act(b) {
    if (b.dataset.add !== undefined) this.add(this._av[+b.dataset.add]);
    else if (b.dataset.rm !== undefined) this.remove(+b.dataset.rm);
    else if (b.dataset.eur) this.addMoney(b.dataset.eur === 'all' ? 1e9 : +b.dataset.eur);
    else if (b.classList.contains('tacc')) this.accept();
    else if (b.classList.contains('tdec')) { SFX.no(); this.close(this.t.st === 1 ? 'Ruil geannuleerd.' : 'Ruil geweigerd.'); }
  },
  key(k) {
    if (!this.btns || !this.btns.length) return;
    if (k === 'cancel') { this.close('Ruil geannuleerd.'); return; }
    if (k === 'ok') { this.act(this.btns[this.sel]); return; }
    const d = k === 'up' || k === 'left' ? -1 : 1;
    this.sel = (this.sel + d + this.btns.length) % this.btns.length;
    this.btns.forEach((b, i) => b.classList.toggle('sel', i === this.sel));
    this.btns[this.sel].scrollIntoView({ block: 'nearest' });
  },
};

// ---------- hulpjes ----------
function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function offerLabel(e) {
  if (e.k === 'eur') return `EUR ${e.n}`;
  if (e.k === 'wpn') return `${WEAPONS[e.id].name} (wapen)`;
  return `${e.n > 1 ? e.n + '× ' : ''}${ITEMS[e.id].name}`;
}
function invLabel(e) { return e.k === 'wpn' ? `${WEAPONS[e.id].name} (wapen)` : `${ITEMS[e.id].name}${e.n > 1 ? ' ×' + e.n : ''}`; }
// wat een ander stuurt is onbetrouwbaar: alleen bekende spullen met redelijke aantallen
function cleanOffer(o) {
  if (!Array.isArray(o)) return [];
  const out = [];
  for (const e of o.slice(0, 30)) {
    if (!e || typeof e !== 'object') continue;
    const n = Math.floor(Number(e.n));
    if (!(n > 0)) continue;
    if (e.k === 'eur') out.push({ k: 'eur', id: 'eur', n: Math.min(n, 1e12) });
    else if (e.k === 'wpn' && WEAPONS[e.id]) out.push({ k: 'wpn', id: e.id, n: 1 });
    else if (e.k === 'item' && ITEMS[e.id] && tradeable(e.id)) out.push({ k: 'item', id: e.id, n: Math.min(n, 999) });
  }
  return out;
}
function canGive(e) {
  const P = G.P;
  if (e.k === 'eur') return P.money >= e.n;
  if (e.k === 'wpn') return (P.weapons || []).includes(e.id);
  const worn = Object.values(P.wear || {}).includes(e.id) ? 1 : 0;
  return (P.items[e.id] || 0) - worn >= e.n;
}
function giveAway(e) {
  const P = G.P;
  if (e.k === 'eur') P.money -= e.n;
  else if (e.k === 'wpn') { P.weapons = P.weapons.filter((w) => w !== e.id); if (P.wpn === e.id) P.wpn = null; }
  else P.items[e.id] = (P.items[e.id] || 0) - e.n;
}
function receive(e) {
  const P = G.P;
  if (e.k === 'eur') P.money += e.n;
  else if (e.k === 'wpn') { P.weapons = P.weapons || []; if (!P.weapons.includes(e.id)) P.weapons.push(e.id); }
  else P.items[e.id] = (P.items[e.id] || 0) + e.n;
}
