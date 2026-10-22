// Hotbar (1-9 / scrollwiel) en de linkermuisknop: elk wapen en elk spul doet iets. Met de vape ga je echt vapen.
const ITEM_ICON = {
  krentenbol(x) { px(x, 1, 4, 10, 6, '#b8783a'); px(x, 2, 3, 8, 1, '#c88a4a'); [[3, 6], [6, 5], [8, 7], [4, 8]].forEach(([a, b]) => px(x, a, b, 1, 1, '#3a1a10')); },
  rookworst(x) { for (let i = 0; i < 9; i++) px(x, 1 + i, 6 - Math.round(Math.sin(i / 3) * 3), 3, 3, '#8a2a1a'); px(x, 2, 5, 1, 1, '#c84a3a'); },
  chocomel(x) { px(x, 3, 2, 6, 9, '#f4f1ea'); px(x, 3, 5, 6, 3, '#6a3a1a'); px(x, 5, 1, 2, 1, '#c8c8c8'); },
  paracetamol(x) { px(x, 1, 3, 10, 6, '#d8d8e0'); for (let i = 0; i < 4; i++) px(x, 2 + i * 2, 5, 1, 2, '#f4f4f8'); px(x, 1, 3, 10, 1, '#a8a8b8'); },
  energiedrank(x) { px(x, 3, 1, 6, 10, '#2a6ac8'); px(x, 3, 1, 6, 1, '#c0c0c8'); px(x, 4, 4, 4, 3, '#f2c22e'); },
  sigaret(x) { for (let i = 0; i < 8; i++) px(x, 2 + i, 9 - i, 2, 2, '#f4f1ea'); px(x, 2, 8, 2, 2, '#d88a3a'); px(x, 9, 1, 2, 2, '#ff5a2a'); },
  vape(x) { for (let i = 0; i < 7; i++) px(x, 3 + i, 9 - i, 3, 3, '#2a2a3a'); px(x, 8, 2, 2, 2, '#5ad0f0'); px(x, 3, 9, 2, 2, '#888'); },
  frikandelbroodje(x) { px(x, 1, 4, 10, 5, '#d8a050'); px(x, 2, 5, 8, 2, '#8a4a2a'); },
  bitterballen(x) { [[2, 5], [6, 4], [5, 7]].forEach(([a, b]) => { px(x, a, b, 4, 4, '#8a5a2a'); px(x, a + 1, b, 1, 1, '#b07a40'); }); },
  koffie(x) { px(x, 2, 4, 7, 6, '#f4f1ea'); px(x, 3, 4, 5, 2, '#4a2a14'); px(x, 9, 5, 2, 3, '#f4f1ea'); px(x, 4, 1, 1, 2, '#ccc'); },
  telefoon(x) { px(x, 3, 1, 6, 10, '#1b1420'); px(x, 4, 2, 4, 7, '#3a5a8a'); px(x, 4, 8, 1, 1, '#e8433a'); },
  sleutel(x) { px(x, 1, 3, 4, 4, '#e0b030'); px(x, 2, 4, 2, 2, '#1b1420'); px(x, 5, 4, 6, 2, '#e0b030'); px(x, 8, 6, 1, 2, '#e0b030'); px(x, 10, 6, 1, 2, '#e0b030'); },
  motorblok(x) { px(x, 1, 3, 10, 7, '#6a6a72'); px(x, 2, 2, 3, 1, '#8a8a92'); px(x, 6, 2, 3, 1, '#8a8a92'); px(x, 3, 5, 6, 2, '#3a3a42'); },
  bal(x) { px(x, 3, 3, 6, 6, '#f4f1ea'); px(x, 5, 5, 2, 2, '#1b1420'); px(x, 3, 4, 1, 1, '#1b1420'); px(x, 8, 7, 1, 1, '#1b1420'); },
  paraplu_open(x) { px(x, 1, 2, 10, 3, '#c23b2e'); px(x, 2, 1, 8, 1, '#c23b2e'); px(x, 6, 5, 1, 6, '#3a2a1a'); px(x, 5, 10, 1, 1, '#3a2a1a'); },
};
const itemIconCache = {};
function heldIcon(id) {
  if (WICON[id]) return wicon(id);
  if (!itemIconCache[id]) {
    const [c, x] = mk(12, 12);
    if (ITEM_ICON[id]) ITEM_ICON[id](x);
    else { px(x, 2, 2, 8, 8, '#a8a8b0'); px(x, 4, 4, 4, 4, '#6a6a72'); }
    itemIconCache[id] = c;
  }
  return itemIconCache[id];
}

const NPC_REACT = ['Hé! Doe normaal.', 'Au! Waar is dat nou voor nodig?', 'Weet je moeder dat je dit doet?', 'Ik doe net of ik dat niet zag.', 'Nog één keer en ik bel Henk.', 'Gaat het wel goed met je?'];

const Hotbar = {
  list: [], sel: 0, lastKey: '',
  build() {
    const P = G.P, out = [];
    for (const id of P.weapons || []) out.push({ k: 'wpn', id });
    for (const id of Object.keys(P.items)) if ((P.items[id] || 0) > 0 && ITEMS[id] && !ITEMS[id].slot && !ITEMS[id].pack) out.push({ k: 'item', id, n: P.items[id] });
    return out.slice(0, 9);
  },
  hand() { return this.list[this.sel] || null; },
  select(i) {
    if (!this.list.length) return;
    this.sel = (i + this.list.length) % this.list.length;
    const h = this.hand();
    if (h && h.k === 'wpn') G.P.wpn = h.id;
    E3.umbrella = false;
    SFX.tick();
    this.paint(true);
  },
  paint(force) {
    const el = $('#hotbar');
    const show = G.S && G.mode === 'map';
    el.hidden = !show; if (!show) return;
    const list = this.build();
    const key = JSON.stringify(list) + this.sel;
    if (!force && key === this.lastKey) return;
    // selectie vasthouden op hetzelfde ding als de lijst verandert
    const cur = this.hand();
    this.list = list;
    if (cur) { const j = list.findIndex((e) => e.k === cur.k && e.id === cur.id); if (j >= 0) this.sel = j; }
    if (this.sel >= list.length) this.sel = Math.max(0, list.length - 1);
    if (!cur && G.P.wpn) { const j = list.findIndex((e) => e.k === 'wpn' && e.id === G.P.wpn); if (j >= 0) this.sel = j; }
    this.lastKey = JSON.stringify(list) + this.sel;
    el.innerHTML = '';
    list.forEach((e, i) => {
      const s = document.createElement('div');
      s.className = 'slot' + (i === this.sel ? ' sel' : '');
      const c = document.createElement('canvas'); c.width = 12; c.height = 12;
      c.getContext('2d').drawImage(heldIcon(e.id), 0, 0);
      s.appendChild(c);
      const num = document.createElement('i'); num.textContent = i + 1; s.appendChild(num);
      if (e.n > 1) { const b = document.createElement('b'); b.textContent = e.n; s.appendChild(b); }
      s.title = e.k === 'wpn' ? WEAPONS[e.id].name : ITEMS[e.id].name;
      s.onclick = () => this.select(i);
      el.appendChild(s);
    });
    const h = this.hand();
    $('#hotname').textContent = h ? (h.k === 'wpn' ? WEAPONS[h.id].name : ITEMS[h.id].name) : 'Lege handen';
  },

  // ---------- linkermuisknop ----------
  async use() {
    if (G.mode !== 'map' || G.busy || UI.focus) return;
    const h = this.hand();
    if (!h || h.k === 'wpn') return this.swing(h && h.id);
    const id = h.id, P = G.P;
    if (id === 'vape') return E3.vape();
    if (id === 'sigaret') {
      const r = ITEMS.sigaret.use(P); G.take('sigaret');
      E3.puff(0xbbbbbb, 6); SFX.no(); UI.toast(`Je rookt een sigaret. ${r}`, 2600); return;
    }
    if (ITEMS[id].use && !ITEMS[id].key) {
      const r = ITEMS[id].use(P); G.take(id); SFX.heal(); E3.swingT = 0.25;
      UI.toast(`${ITEMS[id].name}: ${r}`, 2200); return;
    }
    const lines = {
      telefoon: 'Batterij 1%. Vergrendeld. Je achtergrond is een foto van een frikandel.',
      sleutel: 'Je draait de sleutel om in de lucht. Er gaat niks open.',
      motorblok: 'Je tilt het motorblok een stukje op. Je rug zegt nee.',
    };
    if (id === 'bal') { E3.throwThing('bal', 9, 4); UI.toast('Je trapt de bal weg… en haalt hem daarna gauw weer op.', 2400); return; }
    E3.swingT = 0.2;
    UI.toast(lines[id] || `Je bekijkt ${ITEMS[id].name.toLowerCase()} nog eens goed.`, 2600);
  },

  async swing(id) {
    E3.swingT = 0.35;
    SFX.tone(240, 0.12, 'triangle', 0.05, -120);
    const extra = {
      selfiestick: () => { E3.flash(); UI.toast('Klik! Selfie gemaakt. 0 likes.', 2200); },
      springtouw: () => { E3.jump(); },
      paraplu: () => { E3.umbrella = !E3.umbrella; UI.toast(E3.umbrella ? 'Paraplu open. Het regent niet eens.' : 'Paraplu weer dicht.', 1800); },
      dartpijlen: () => E3.throwThing('dartpijlen', 14, 1),
      kaarten: () => E3.throwThing('kaarten', 10, 1),
      fietspomp: () => { SFX.tone(160, 0.2, 'sawtooth', 0.04, 200); UI.toast('Pfff. Pfff.', 1200); },
      tafelvlag: () => UI.toast('Je zwaait met de tafelvlag. Niemand weet waarom.', 1800),
      cornervlag: () => UI.toast('Je vlagt buitenspel. Er is geen wedstrijd.', 1800),
      mick: () => UI.toast('Je kijkt even naar Mick op de foto. Je kijkt snel weer weg.', 2200),
      dildo: () => { SFX.tone(180, 0.25, 'sine', 0.06, 160); UI.toast('Flubber flubber.', 1400); },
      krant: () => UI.toast('Pets.', 900),
      helm: () => UI.toast('Je geeft een kopstoot in de lucht. Met helm. Veilig.', 1800),
    };
    const t = E3.meleeTarget();
    if (t && t.kind === 'vaper') { G.firstStrike = true; UI.toast('Je verrast de vaper!', 1600); await E3.fightVaper(t.obj); return; }
    if (t && t.kind === 'npc') {
      SFX.hit();
      UI.toast(t.obj.id === 'mick' ? 'Mick vindt het geweldig. Hij wil nog een keer.' : `"${pick(NPC_REACT)}"`, 2200);
      return;
    }
    if (t && t.kind === 'peer') { SFX.hit(); UI.toast(`Je tikt ${String(t.obj.presence.n).slice(0, 16)} aan${id ? ` met je ${WEAPONS[id].name.toLowerCase()}` : ''}.`, 2000); return; }
    if (id && extra[id]) extra[id]();
    else if (!id) UI.toast(pick(['Je slaat in de lucht.', 'Je doet een boksbeweging. Indrukwekkend.']), 1200);
  },
};
