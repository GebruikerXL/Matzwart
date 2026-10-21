// Engine: invoer, lopen, camera, tekenen, menu, opslaan.
const cv = $('#screen'), ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
const VW = 320, VH = 240, MOVE_T = 0.15;
const SAVE_KEY = 'brak-in-meedhuizen-v1';
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

const PLAYER_LOOK = { skin: '#f0c4a0', hair: '#6b4226', style: 'messy', shirt: '#c8463a', pants: '#2f3b5c', extra: ['tired'] };

function freshState() {
  return {
    P: { lvl: 1, xp: 0, next: 22, hp: 40, maxHp: 40, ep: 12, maxEp: 12, atk: 6, def: 3, money: 12, stoer: 0, weapons: [], wpn: null, wear: {}, items: { krentenbol: 2, sleutel: 1, telefoon: 1 } },
    flags: {}, quests: {},
    pos: { map: 'schuur', x: 3, y: 5, dir: 'down' },
  };
}

const G = {
  mode: 'title', busy: false, map: null, S: null,
  pl: { x: 0, y: 0, px: 0, py: 0, dir: 'down', moving: false, t: 0, fx: 0, fy: 0, frame: 0, anim: 0 },
  npcRt: {}, held: [], steps: 0, time: 0, buildingImgs: {},

  get P() { return this.S.P; },
  get flags() { return this.S ? this.S.flags : {}; },

  // ---------- story-API ----------
  say: (n, t) => UI.say(n, t),
  ask: (n, t, o, c) => UI.ask(n, t, o, c),
  has(id) { return (this.P.items[id] || 0) > 0; },
  give(id, n = 1, quiet) { this.P.items[id] = (this.P.items[id] || 0) + n; if (!quiet) { SFX.item(); UI.toast(`Gekregen: ${ITEMS[id].name}${n > 1 ? ' ×' + n : ''}`); } },
  take(id, n = 1) { this.P.items[id] = Math.max(0, (this.P.items[id] || 0) - n); },
  quest(id, stage) {
    if (stage === undefined) return this.S.quests[id] || 0;
    const was = this.S.quests[id] || 0;
    this.S.quests[id] = stage;
    const q = QUESTS[id];
    if (!was) UI.toast(`Nieuwe opdracht: ${q.name}`, 2400);
    else if (stage >= q.done) UI.toast(`Opdracht voltooid: ${q.name}`, 2400);
  },
  async warp(map, x, y, dir) {
    this.busy = true;
    await UI.fade(true);
    this.loadMap(map, x, y, dir);
    await UI.fade(false);
    this.busy = false;
    UI.toast(this.map.name, 1400);
  },
  stepBack() {
    const [dx, dy] = DIRS[this.pl.dir];
    this.placePlayer(this.pl.x - dx, this.pl.y - dy, this.pl.dir);
  },
  async fight(id, opts = {}) {
    this.busy = true;
    await this.flashIn();
    this.mode = 'battle';
    const r = await Battle.start(id, this.P);
    await UI.fade(true);
    this.mode = 'map';
    if (r === 'lose' && !opts.noWake) {
      this.P.hp = this.P.maxHp; this.P.ep = this.P.maxEp;
      const lost = Math.floor(this.P.money / 2); this.P.money -= lost;
      this.loadMap('schuur', 3, 5, 'down');
      await UI.fade(false);
      await UI.say('', `Je wordt wakker in de schuur. Alweer.${lost ? ` Je mist EUR ${lost}.` : ''}`);
    } else {
      if (r === 'lose') { this.P.hp = Math.max(1, Math.round(this.P.maxHp * 0.3)); }
      await UI.fade(false);
    }
    this.busy = false;
    return r;
  },
  async flashIn() {
    for (let i = 0; i < 3; i++) { $('#fade').style.transition = 'none'; $('#fade').classList.add('on'); await wait(60); $('#fade').classList.remove('on'); await wait(60); }
    $('#fade').style.transition = '';
    await UI.fade(true);
    setTimeout(() => UI.fade(false), 50);
  },
  async shop(items, who, korting = 0) {
    const prijs = (id) => Math.max(1, Math.round(ITEMS[id].price * (1 - korting)));
    for (;;) {
      const list = items.map((id) => ({ label: ITEMS[id].name, right: ITEMS[id].weapon && ownsWeapon(ITEMS[id].weapon) ? 'gekocht' : 'EUR ' + prijs(id), off: this.P.money < prijs(id) || (ITEMS[id].weapon && ownsWeapon(ITEMS[id].weapon)) }));
      list.push('Klaar');
      const k = await UI.ask(who, `Wat mag het zijn? Je hebt EUR ${this.P.money}.`, list, true);
      if (k < 0 || k === items.length) return;
      const id = items[k], it = ITEMS[id];
      this.P.money -= prijs(id);
      if (it.weapon) { await giveWeapon(it.weapon); continue; }
      if (it.pack) this.give(it.pack[0], it.pack[1], true); else this.give(id, 1, true);
      SFX.item();
      UI.toast(`${it.name} gekocht`);
    }
  },
  async levelUpNow() {
    const nieuw = levelUp(this.P);
    SFX.item();
    await UI.say('', `LEVEL UP! Je bent nu level ${this.P.lvl}. HP en EP zijn vol.${nieuw ? ` Nieuwe skill: ${nieuw.name}.` : ''}`);
  },
  async ending(text) {
    this.busy = true; this.mode = 'end';
    $('#ending .sub').textContent = text;
    UI.show('#ending');
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    await wait(2500);
    UI.focus = (k) => { if (k === 'ok' || k === 'cancel') { UI.focus = null; UI.show('#ending', false); this.busy = false; const st = freshState(); st.name = this.S.name; st.ap = this.S.ap; this.begin(st, true); } };
  },

  // ---------- kaart ----------
  loadMap(id, x, y, dir) {
    this.map = MAPS[id];
    this.placePlayer(x, y, dir);
    this.npcRt = {};
    for (const n of NPCS.filter((n) => n.map === id)) this.npcRt[n.id] = { x: n.x, y: n.y, px: n.x * TS, py: n.y * TS, dir: n.dir || 'down', t: 0, moving: false, wait: 1 + Math.random() * 2, frame: 0 };
    this.steps = 0;
  },
  placePlayer(x, y, dir) {
    Object.assign(this.pl, { x, y, px: x * TS, py: y * TS, dir: dir || this.pl.dir, moving: false });
  },
  npcsHere() { return NPCS.filter((n) => n.map === this.map.id && (!n.show || n.show())); },
  npcAt(x, y) { return this.npcsHere().find((n) => { const r = this.npcRt[n.id]; return r && r.x === x && r.y === y; }); },
  propAt(x, y) { return this.map.props.find((p) => p.x === x && p.y === y && (!p.id || !PROP_HIDE[p.id] || !PROP_HIDE[p.id]())); },
  free(x, y, self) {
    const t = tileAt(this.map, x, y);
    if (!(TILE_DEF[t] || {}).walk) return false;
    const p = this.propAt(x, y); if (p && p.solid) return false;
    if (this.npcAt(x, y) && this.npcAt(x, y) !== self) return false;
    if (self && this.pl.x === x && this.pl.y === y) return false;
    return true;
  },

  tryMove(dir) {
    const pl = this.pl;
    pl.dir = dir;
    const [dx, dy] = DIRS[dir];
    const nx = pl.x + dx, ny = pl.y + dy;
    if (!this.free(nx, ny)) return;
    // waarschuwing vlak voordat je het hoge gras in stapt
    if (this.map.encounters && this.flags.intro && tileAt(this.map, nx, ny) === 'tall' && tileAt(this.map, pl.x, pl.y) !== 'tall' && this.time - (this.vapeWarn || -99) > 45) {
      this.vapeWarn = this.time;
      this.busy = true;
      UI.say('', 'Je ruikt een sterke vape-lucht. Kijk uit, er kunnen vapende tieners in het gras zitten!').then(() => { this.busy = false; });
      return;
    }
    pl.fx = pl.x; pl.fy = pl.y; pl.x = nx; pl.y = ny; pl.moving = true; pl.t = 0;
    pl.anim = (pl.anim + 1) % 2;
  },

  async arrive() {
    const m = this.map, pl = this.pl;
    const door = m.doors.find((d) => d.x === pl.x && d.y === pl.y);
    if (door && DOORS[door.id]) { this.busy = true; await DOORS[door.id](); this.busy = false; return; }
    if (m.edges && m.edges.some((e) => e.x === pl.x && e.y === pl.y)) { this.busy = true; await onEdge(); this.stepBack(); this.busy = false; return; }
    if (STEP_EVENTS[m.id]) { const ev = STEP_EVENTS[m.id](pl.x, pl.y); if (ev) { this.busy = true; await ev(); this.busy = false; return; } }
    if (m.encounters && tileAt(m, pl.x, pl.y) === 'tall' && this.flags.intro) {
      this.steps += 1;
      if (this.steps > 4 && Math.random() < 0.11) {
        this.steps = 0;
        const id = RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)];
        await this.fight(id);
      }
    }
  },

  async interact() {
    const pl = this.pl, [dx, dy] = DIRS[pl.dir];
    let tx = pl.x + dx, ty = pl.y + dy;
    let npc = this.npcAt(tx, ty);
    if (!npc && tileAt(this.map, tx, ty) === 'counter') npc = this.npcAt(tx + dx, ty + dy);
    const peer = !npc && Online.peerAt(tx, ty);
    if (peer) { this.busy = true; await Online.talkTo(peer); this.busy = false; return; }
    if (npc) {
      const r = this.npcRt[npc.id];
      r.dir = { up: 'down', down: 'up', left: 'right', right: 'left' }[pl.dir];
      this.busy = true; await npc.talk(); this.busy = false; return;
    }
    const p = this.propAt(tx, ty);
    if (p && p.id && PROPS[p.id]) { this.busy = true; await PROPS[p.id](); this.busy = false; }
  },

  update(dt) {
    this.time += dt;
    const pl = this.pl;
    if (pl.moving) {
      pl.t += dt / MOVE_T;
      if (pl.t >= 1) {
        pl.t = 1; pl.moving = false; pl.px = pl.x * TS; pl.py = pl.y * TS;
        if (!this.busy) this.arrive();
      } else {
        pl.px = (pl.fx + (pl.x - pl.fx) * pl.t) * TS; pl.py = (pl.fy + (pl.y - pl.fy) * pl.t) * TS;
      }
    }
    if (!pl.moving && !this.busy && !UI.focus && this.mode === 'map') {
      const d = this.held[this.held.length - 1];
      if (d) this.tryMove(d);
    }
    // NPC's die rondscharrelen
    for (const n of this.npcsHere()) {
      const r = this.npcRt[n.id]; if (!r) continue;
      if (r.moving) {
        r.t += dt / (MOVE_T * 1.6);
        if (r.t >= 1) { r.moving = false; r.px = r.x * TS; r.py = r.y * TS; }
        else { r.px = (r.fx + (r.x - r.fx) * r.t) * TS; r.py = (r.fy + (r.y - r.fy) * r.t) * TS; }
        continue;
      }
      if (!n.wander || this.busy || UI.focus) continue;
      r.wait -= dt;
      if (r.wait <= 0) {
        r.wait = 1.5 + Math.random() * 2.5;
        const ds = Object.keys(DIRS), d = ds[Math.floor(Math.random() * 4)], [dx, dy] = DIRS[d];
        const nx = r.x + dx, ny = r.y + dy;
        r.dir = d;
        if (Math.abs(nx - n.x) <= 2 && Math.abs(ny - n.y) <= 2 && this.free(nx, ny, n) && !(m_tile_door(this.map, nx, ny))) {
          r.fx = r.x; r.fy = r.y; r.x = nx; r.y = ny; r.moving = true; r.t = 0; r.frame = (r.frame + 1) % 2;
        }
      }
    }
  },

  // ---------- tekenen ----------
  cam() {
    const m = this.map, pl = this.pl;
    const W = m.w * TS, H = m.h * TS;
    let cx = pl.px + 8 - VW / 2, cy = pl.py + 8 - VH / 2;
    cx = W <= VW ? (W - VW) / 2 : Math.max(0, Math.min(W - VW, cx));
    cy = H <= VH ? (H - VH) / 2 : Math.max(0, Math.min(H - VH, cy));
    return [Math.round(cx), Math.round(cy)];
  },

  drawMap(cx, cy) {
    const m = this.map;
    ctx.fillStyle = '#0d0b12'; ctx.fillRect(0, 0, VW, VH);
    const f = Math.floor(this.time * 2) % 2;
    const x0 = Math.max(0, Math.floor(cx / TS)), y0 = Math.max(0, Math.floor(cy / TS));
    const x1 = Math.min(m.w - 1, Math.floor((cx + VW) / TS)), y1 = Math.min(m.h - 1, Math.floor((cy + VH) / TS));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      let t = m.tiles[y][x];
      if (t === 'block') t = TILE_DEF.block.under;
      if (t === 'mat_out' && !m.inside) t = 'path';
      ctx.drawImage(getTile(t, x, y, f), x * TS - cx, y * TS - cy);
    }
    for (const b of m.buildings) {
      if (!this.buildingImgs[b.id]) this.buildingImgs[b.id] = renderBuilding(b);
      ctx.drawImage(this.buildingImgs[b.id], b.x * TS - cx, b.y * TS - cy);
    }
    // sprites op y-volgorde
    const list = [];
    for (const p of m.props) if (!p.id || !PROP_HIDE[p.id] || !PROP_HIDE[p.id]()) list.push({ y: p.y * TS, draw: () => ctx.drawImage(getProp(p.name), p.x * TS - cx, p.y * TS - cy) });
    for (const n of this.npcsHere()) {
      const r = this.npcRt[n.id]; if (!r) continue;
      const fr = r.moving ? 1 + r.frame : 0;
      list.push({ y: r.py, draw: () => drawPerson(n.look, r.dir, fr, r.px - cx, r.py - cy) });
    }
    const pl = this.pl;
    if (this.mode !== 'title') {
    const pfr = pl.moving ? 1 + pl.anim : 0;
    list.push({ y: pl.py + 0.5, draw: () => {
      const w = this.P && this.P.wpn, x = pl.px - cx, y = pl.py - cy;
      drawHeld(ctx, w, pl.dir, x, y, pfr, true);
      drawPerson(lookFrom(this.S && this.S.ap, this.P && this.P.wear), pl.dir, pfr, x, y);
      drawHeld(ctx, w, pl.dir, x, y, pfr, false);
    } });
    }
    if (this.mode !== 'title') Online.sprites(list, cx, cy);
    list.sort((a, b) => a.y - b.y).forEach((s) => s.draw());
    if (!m.inside) {
      // ochtendlicht
      ctx.fillStyle = 'rgba(255,220,170,0.06)'; ctx.fillRect(0, 0, VW, VH);
    }
  },

  drawBattle() {
    const t = this.time, B = Battle;
    let sx = 0;
    if (B.shake > 0) { sx = (Math.random() - 0.5) * 6; B.shake -= 1; }
    // lucht, weiland, sloot
    const g = ctx.createLinearGradient(0, 0, 0, 150);
    g.addColorStop(0, '#7fb2e0'); g.addColorStop(1, '#cfe3f0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, 150);
    ctx.fillStyle = '#e9eef4';
    for (let i = 0; i < 4; i++) { const x = ((i * 97 + t * 6) % 380) - 40; ctx.fillRect(x, 20 + i * 12, 34, 6); ctx.fillRect(x + 6, 16 + i * 12, 20, 6); }
    ctx.fillStyle = '#3c4f3a'; ctx.fillRect(0, 118, VW, 6);
    for (let i = 0; i < 9; i++) { ctx.fillStyle = '#2f5a2a'; ctx.fillRect(i * 40 + 6, 106, 14, 14); ctx.fillRect(i * 40 + 10, 100, 6, 8); }
    ctx.fillStyle = '#5f9e3c'; ctx.fillRect(0, 124, VW, 116);
    ctx.fillStyle = '#4f8a31'; for (let i = 0; i < 40; i++) ctx.fillRect((i * 53) % VW, 130 + (i * 29) % 100, 2, 3);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(VW / 2 + sx, 166, 34, 7, 0, 0, Math.PI * 2); ctx.fill();
    if (B.foe && B.foeGone < 1.5) {
      const look = LOOKS[B.foe.look];
      const bob = Math.round(Math.sin(t * 3) * 1.5);
      const img = getChar(look, 'down', Math.floor(t * 2) % 3 === 2 ? 1 : 0);
      ctx.save();
      if (B.foeHit > 0) { B.foeHit -= 1; if (B.foeHit % 4 < 2) ctx.globalAlpha = 0.3; }
      if (B.foeGone) { B.foeGone += 0.02; ctx.globalAlpha = Math.max(0, 1.5 - B.foeGone); }
      if (look.small) ctx.drawImage(img, VW / 2 - 25 + sx, 112 + bob, 50, 50);
      else ctx.drawImage(img, VW / 2 - 40 + sx, 72 + bob, 80, 80);
      if (B.foe.id === 'vaper_scooter' || B.foe.id === 'vaper_fatbike') { ctx.drawImage(getProp('fiets'), VW / 2 - 54 + sx, 120 + bob, 48, 48); }
      if (B.foe.vaper && !B.foeGone) drawVapeCloud(ctx, t, B.foe.cloud, VW / 2 + sx, 100 + bob);
      ctx.restore();
    }
    if (B.swing) {
      const s = B.swing, k = Math.min(1, s.t / 12);
      ctx.save();
      ctx.translate(40 + (VW / 2 - 40) * k, 210 - 90 * k - Math.sin(k * Math.PI) * 40);
      ctx.rotate(-1.2 + k * 2.4);
      ctx.drawImage(wicon(s.id), -24, -24, 48, 48);
      ctx.restore();
      if (++s.t > 16) B.swing = null;
    }
    if (B.flash > 0) { ctx.fillStyle = `rgba(220,40,40,${B.flash / 20})`; ctx.fillRect(0, 0, VW, VH); B.flash -= 1; }
  },

  render() {
    if (this.mode === 'battle') return this.drawBattle();
    if (!this.map) return;
    if (this.mode === 'title') {
      // langzaam over het dorp zweven
      const m = this.map, W = m.w * TS - VW;
      const cx = Math.round((Math.sin(this.time * 0.08) * 0.5 + 0.5) * W), cy = 150;
      this.drawMap(cx, cy);
      return;
    }
    const [cx, cy] = this.cam();
    this.drawMap(cx, cy);
  },

  // ---------- menu ----------
  async menu() {
    this.busy = true; SFX.ok();
    let start = 0;
    for (;;) {
      const k0 = await UI.list('#menu', ['Spullen', 'Wapens', 'Kleding', 'Opdrachten', 'Status', 'Opslaan', SFX.on ? 'Geluid: aan' : 'Geluid: uit', 'Terug'], { cancel: true, keep: true, start });
      start = Math.max(0, k0);
      if (k0 === 1) { await this.weaponMenu(); continue; }
      if (k0 === 2) { await clothesMenu(); continue; }
      const k = k0 > 2 ? k0 - 2 : k0;
      const panel = $('#panel');
      if (k === 0) {
        const own = Object.keys(this.P.items).filter((id) => this.P.items[id] > 0 && !ITEMS[id].slot);
        if (!own.length) { panel.innerHTML = '<h3>Spullen</h3>Je zakken zijn leeg.'; panel.hidden = false; await UI.say('', 'Niks.'); panel.hidden = true; continue; }
        panel.innerHTML = '<h3>Spullen</h3><div id="itemlist" class="list"></div><p id="itemdesc" class="lbl"></p>';
        panel.hidden = false;
        const i = await UI.list('#itemlist', own.map((id) => ({ label: ITEMS[id].name, right: ITEMS[id].key && this.P.items[id] < 2 ? '' : '×' + this.P.items[id] })), {
          cancel: true, keep: true, onMove: (s) => { $('#itemdesc').textContent = ITEMS[own[s]].desc; },
        });
        if (i >= 0 && ITEMS[own[i]].use) { const r = ITEMS[own[i]].use(this.P); this.take(own[i]); SFX.heal(); UI.toast(`${ITEMS[own[i]].name}: ${r}`); }
        panel.hidden = true;
      } else if (k === 1) {
        const qs = Object.keys(QUESTS).filter((id) => this.S.quests[id]);
        panel.innerHTML = '<h3>Opdrachten</h3>' + (qs.length ? qs.map((id) => {
          const q = QUESTS[id], s = this.S.quests[id], done = s >= q.done;
          return `<div class="q${done ? ' done' : ''}"><b>${q.name}</b><small>${stepText(q, s)}</small></div>`;
        }).join('') : 'Nog geen opdrachten. Praat eens met iemand.');
        panel.hidden = false; await waitKey(); panel.hidden = true;
      } else if (k === 2) {
        const P = this.P;
        panel.innerHTML = `<h3>Status</h3>
          <div class="row"><span class="lbl">Naam</span><span>??? (begint met een J… of een G…?)</span></div>
          <div class="row"><span class="lbl">Spelernaam</span><span>${this.S.name || '-'}</span></div>
          <div class="row"><span class="lbl">Level</span><span>${P.lvl}</span></div>
          <div class="row"><span class="lbl">HP</span><span>${P.hp} / ${P.maxHp}</span></div>
          <div class="row"><span class="lbl">EP</span><span>${P.ep} / ${P.maxEp}</span></div>
          <div class="row"><span class="lbl">Aanval</span><span>${P.atk}${P.wpn ? ` + ${WEAPONS[P.wpn].atk}` : ''}${clothBonus(P).atk ? ` + ${clothBonus(P).atk}` : ''}</span></div>
          <div class="row"><span class="lbl">Wapen</span><span>${P.wpn ? WEAPONS[P.wpn].name : 'Lege handen'}</span></div>
          <div class="row"><span class="lbl">Verdediging</span><span>${P.def}${clothBonus(P).def ? ` + ${clothBonus(P).def}` : ''}</span></div>
          <div class="row"><span class="lbl">XP</span><span>${P.xp} / ${P.next}</span></div>
          <div class="row"><span class="lbl">Stoerheid</span><span>${stoerNow(P)}</span></div>
          <div class="row"><span class="lbl">Geld</span><span>EUR ${P.money}</span></div>
          <div class="row"><span class="lbl">Toestand</span><span>Brak</span></div>`;
        panel.hidden = false; await waitKey(); panel.hidden = true;
      } else if (k === 3) {
        UI.toast(this.save() ? 'Opgeslagen' : 'Opslaan lukt niet in deze browser');
      } else if (k === 4) {
        SFX.on = !SFX.on;
      } else break;
    }
    UI.show('#menu', false);
    this.busy = false;
  },

  async weaponMenu() {
    const P = this.P, own = P.weapons || [], panel = $('#panel');
    const box = (txt) => { panel.innerHTML = `<h3>Wapens</h3>${txt}`; panel.hidden = false; };
    if (!own.length) { box('Je hebt nog geen wapens. Kijk eens goed rond in het dorp.'); await waitKey(); panel.hidden = true; return; }
    box(`<div id="wlist" class="list"></div><p id="wdesc" class="lbl"></p><p class="lbl">${own.length} van ${Object.keys(WEAPONS).length} gevonden</p>`);
    const opts = own.map((id) => ({ label: (P.wpn === id ? '✓ ' : '') + WEAPONS[id].name, right: '+' + WEAPONS[id].atk })).concat([{ label: (P.wpn ? '' : '✓ ') + 'Lege handen' }]);
    const i = await UI.list('#wlist', opts, {
      cancel: true, keep: true,
      onMove: (s) => { const w = WEAPONS[own[s]]; $('#wdesc').textContent = w ? `Speciaal: ${w.sp.name} (${w.sp.ep} EP). ${w.sp.desc}` : 'Niks vasthouden. Handen in je zakken.'; },
    });
    if (i >= 0) { P.wpn = own[i] || null; UI.toast(P.wpn ? `Je houdt nu vast: ${WEAPONS[P.wpn].name}` : 'Lege handen'); }
    panel.hidden = true;
  },

  snapshot() {
    this.S.pos = { map: this.map.id, x: this.pl.x, y: this.pl.y, dir: this.pl.dir };
    return JSON.parse(JSON.stringify(this.S));
  },
  save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.snapshot())); return true; } catch (e) { return false; } },
  loadSave() { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } },

  begin(state, fresh) {
    this.S = state;
    state.P.weapons = state.P.weapons || [];
    state.P.wear = state.P.wear || {};
    UI.show('#title', false);
    const p = state.pos;
    this.loadMap(p.map, p.x, p.y, p.dir);
    this.mode = 'map';
    if (fresh) { this.busy = true; setTimeout(async () => { await intro(); this.busy = false; }, 300); }
    else UI.toast(this.map.name, 1400);
  },

  async title() {
    this.mode = 'title';
    this.loadMap('dorp', 20, 14, 'down');
    const saved = this.loadSave();
    const k = await UI.list('#titlemenu', ['Nieuw spel', { label: 'Doorgaan', off: !saved }], { keep: true });
    SFX.init();
    $('#titlemenu').hidden = true;
    const st = k === 1 && saved ? saved : freshState();
    if (!st.name) st.name = await askName();
    if (!st.ap) { $('#title').hidden = true; st.ap = await creator(); }
    await UI.fade(true);
    if (k === 1 && saved) this.begin(st, false); else this.begin(st, true);
    await UI.fade(false);
  },
};

function stepText(q, s) { const t = q.steps[Math.min(s, q.steps.length - 1)]; return typeof t === 'function' ? t() : t; }
function m_tile_door(m, x, y) { return m.doors.some((d) => d.x === x && d.y === y); }
function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }
function waitKey() { return new Promise((r) => { const prev = UI.focus; UI.focus = (k) => { if (k === 'ok' || k === 'cancel') { UI.focus = prev; r(); } }; }); }
function drawPerson(look, dir, frame, x, y) {
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x + 3, y + 14, 10, 2);
  if (look.small) ctx.drawImage(getChar(look, dir, frame), Math.round(x) + 3, Math.round(y) + 4, 10, 10);
  else ctx.drawImage(getChar(look, dir, frame), Math.round(x), Math.round(y) - 3);
}

// ---------- invoer ----------
const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  Enter: 'ok', Space: 'ok', KeyZ: 'ok', KeyE: 'ok', Escape: 'cancel', KeyX: 'cancel', Backspace: 'cancel', KeyQ: 'cancel',
};
function press(k) {
  SFX.init();
  if (UI.key(k)) return;
  if (G.mode !== 'map' || G.busy || G.pl.moving) return;
  if (k === 'ok') G.interact();
  else if (k === 'cancel') G.menu();
  else if (DIRS[k]) G.tryMove(k);
}
function holdDir(k, down) {
  const i = G.held.indexOf(k);
  if (down && i < 0) G.held.push(k);
  if (!down && i >= 0) G.held.splice(i, 1);
}
addEventListener('keydown', (e) => {
  if (e.target && e.target.tagName === 'INPUT') return;
  const k = KEYMAP[e.code]; if (!k) return;
  e.preventDefault();
  if (DIRS[k]) holdDir(k, true);
  if (!e.repeat || (DIRS[k] && UI.focus)) press(k);
});
addEventListener('keyup', (e) => { const k = KEYMAP[e.code]; if (k && DIRS[k]) holdDir(k, false); });
addEventListener('blur', () => (G.held.length = 0));
document.querySelectorAll('#pad .pbtn').forEach((b) => {
  const k = b.dataset.k;
  const on = (e) => { e.preventDefault(); b.classList.add('down'); if (DIRS[k]) holdDir(k, true); press(k); };
  const off = (e) => { e.preventDefault(); b.classList.remove('down'); if (DIRS[k]) holdDir(k, false); };
  b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off);
});

// ---------- lus ----------
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (G.mode === 'map') { G.update(dt); Online.tick(); } else G.time += dt;
  G.render();
  Online.sync();
  updateHud();
  requestAnimationFrame(loop);
}

function start(data) {
  requestAnimationFrame(loop);
  Online.init();
  if (data && data.S) { G.begin(data.S, false); return; }
  G.title();
}
window.claude?.hot?.snapshot?.(() => (G.S && G.mode === 'map' ? { S: G.snapshot() } : {}));
// Wacht op het pixel-lettertype voor de uithangborden
const boot = () => (window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {}));
(document.fonts && document.fonts.load ? Promise.race([document.fonts.load('8px Silkscreen'), wait(1500)]) : Promise.resolve()).then(boot, boot);
