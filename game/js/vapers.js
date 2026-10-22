// Vapende tieners in het hoge gras, hun dampwolken en de quick time event om hun vape te jatten.
const TEEN = (hair, style, shirt, pants, skin = '#f0c9a0') => ({ skin, hair, style, shirt, pants, extra: ['pimples', 'vape'] });
Object.assign(LOOKS, {
  v_scooter: { ...TEEN('#2a1a10', 'cap', '#2a2a2e', '#5a5a6a'), cap: '#1b1b1b' },
  v_tiktok: TEEN('#e0b040', 'long', '#e86fb0', '#2a2a3a'),
  v_training: TEEN('#3a2a1a', 'short', '#2a4aa0', '#2a4aa0', '#e8b898'),
  v_fatbike: TEEN('#1b1420', 'curly', '#4a7a3a', '#3a3a44', '#d8a880'),
  v_beugel: TEEN('#8a5a2a', 'messy', '#7a4a9a', '#3a3a5a'),
});

Object.assign(ENEMIES, {
  vaper_scooter: {
    name: 'Vaper op scooter', look: 'v_scooter', vaper: true, cloud: '#ffd9a0', smaak: 'mango',
    hp: 30, atk: 7, def: 2, xp: 13, money: 9, drop: 'helm',
    inflict: { st: 'misselijk', ch: 0.3, t: 'De mangowolk maakt je misselijk.' },
    moves: ['blaast een mangowolk in je gezicht', 'laat zijn scooter knallen', 'zegt "bro" op een dreigende toon'],
    talk: [
      { t: 'Bewonder zijn scooter', v: 50, r: '"Opgevoerd tot vijfenveertig, bro." Hij is gevleid.' },
      { t: 'Vraag welke smaak het is', v: 40, r: '"Mango ice. Duh." Hij blaast trots een wolkje.' },
      { t: 'Zeg dat vapen slecht voor je is', v: -1, r: '"Ok boomer." Hij blaast extra hard.' },
    ],
    spare: 'Hij blaast nog één mangowolk en scheurt weg op zijn scooter.',
  },
  vaper_tiktok: {
    name: 'TikTok-vaper', look: 'v_tiktok', vaper: true, cloud: '#ffc0e0', smaak: 'bubblegum',
    hp: 24, atk: 6, def: 1, xp: 10, money: 8, drop: 'selfiestick',
    inflict: { st: 'duizelig', ch: 0.3, t: 'Van al die flitsende filmpjes word je duizelig.' },
    moves: ['filmt je voor TikTok', 'blaast een roze wolk', 'doet een dansje in je gezicht'],
    talk: [
      { t: 'Doe mee met haar dansje', v: 50, r: 'Je doet de dans. Heel slecht. Ze is blij: dit gaat viraal.' },
      { t: 'Vraag hoeveel volgers ze heeft', v: 40, r: '"Twaalf. Maar ze zijn heel loyaal."' },
      { t: 'Zeg dat TikTok cringe is', v: -1, r: '"Wie zegt er nou nog cringe?" Ze wordt woest.' },
    ],
    spare: 'Ze heeft genoeg content en loopt typend weg.',
  },
  vaper_training: {
    name: 'Vaper in trainingspak', look: 'v_training', vaper: true, cloud: '#c0d0ff', smaak: 'blauwe bes',
    hp: 26, atk: 6, def: 2, xp: 11, money: 8, drop: 'springtouw',
    inflict: { st: 'misselijk', ch: 0.25, t: 'De blauwe-bessenlucht komt je neus weer uit.' },
    moves: ['zit gehurkt en blaast een blauwe wolk', 'rochelt op de grond', 'gooit een leeg blikje naar je'],
    talk: [
      { t: 'Ga ook gehurkt zitten', v: 50, r: 'Je hurkt. Je knieën kraken. Hij respecteert de poging.' },
      { t: 'Vraag naar zijn trainingspak', v: 40, r: '"Nep. Maar dat zie je niet, toch?"' },
      { t: 'Vraag of hij niet naar school moet', v: -1, r: '"Bemoei je met je eigen zaken, ouwe."' },
    ],
    spare: 'Hij staat op uit zijn hurkzit, wat hem zichtbaar moeite kost, en sloft weg.',
  },
  vaper_fatbike: {
    name: 'Vaper op fatbike', look: 'v_fatbike', vaper: true, cloud: '#e0d0c0', smaak: 'cola',
    hp: 28, atk: 6, def: 3, xp: 12, money: 8, drop: 'fietspomp',
    inflict: { st: 'duizelig', ch: 0.25, t: 'Hij scheurt zo hard rondjes om je heen dat je duizelig wordt.' },
    moves: ['rijdt over je tenen met zijn fatbike', 'blaast een colawolk', 'belt met een bel die "skibidi" speelt'],
    talk: [
      { t: 'Vraag hoe hard zijn fatbike gaat', v: 55, r: '"Veertig. Officieel vijfentwintig." Hij knipoogt.' },
      { t: 'Zeg "no cap"', v: 35, r: 'Hij kijkt je vreemd aan. "Bro probeert het." Maar hij waardeert het.' },
      { t: 'Zeg dat een fatbike geen echte fiets is', v: -1, r: '"WAT?!" Hij trapt woedend op zijn pedaal. Dat hoeft niet eens.' },
    ],
    spare: 'Hij zoeft weg zonder te trappen.',
  },
  vaper_beugel: {
    name: 'Vaper met beugel', look: 'v_beugel', vaper: true, cloud: '#c8f0e0', smaak: 'munt',
    hp: 22, atk: 5, def: 1, xp: 9, money: 7,
    inflict: { st: 'misselijk', ch: 0.2, t: 'De muntlucht is zo sterk dat je ogen tranen.' },
    moves: ['blaast een muntwolk door zijn beugel', 'fluit door zijn beugel', 'zucht heel puberaal'],
    talk: [
      { t: 'Complimenteer zijn beugel', v: 50, r: '"Echt? Hij gaat er volgend jaar uit." Hij glimlacht. Je ziet elastiekjes.' },
      { t: 'Bied hem een krentenbol aan', v: 40, r: '"Mag niet met mijn beugel." Maar hij is ontroerd.' },
      { t: 'Vraag of zijn moeder weet dat hij vapet', v: -1, r: '"Ga je het zeggen?!" Paniek. En daarna woede.' },
    ],
    spare: 'Hij steekt zijn vape in zijn sok en loopt fluitend weg.',
  },
});
RANDOM_POOL.length = 0;
RANDOM_POOL.push('vaper_scooter', 'vaper_tiktok', 'vaper_training', 'vaper_fatbike', 'vaper_beugel');

ITEMS.vape = { name: 'Vape', desc: 'Plakkerig. Ruikt naar puberteit. Aron van der Wal koopt ze voor EUR 100 per stuk.', key: true, sell: 100 };

// ---------- dampwolk rond de tiener in het gevecht ----------
function drawVapeCloud(c, t, col, cx, cy) {
  c.save();
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + t * 0.4;
    const life = (t * 0.35 + i * 0.27) % 1;
    const r = 8 + life * 12;
    const x = cx + Math.cos(a) * (34 + life * 14);
    const y = cy + Math.sin(a) * 26 - life * 18;
    c.globalAlpha = 0.55 * (1 - life);
    c.fillStyle = col;
    c.beginPath(); c.arc(Math.round(x), Math.round(y), r, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}

// ---------- quick time event: vape jatten ----------
function vapeQTE() {
  const el = $('#qte');
  el.hidden = false;
  el.innerHTML = '<h3>Pak de vape!</h3><div class="qbar"><i class="zone"></i><i class="mark"></i></div><div class="qhint">Druk op Spatie of A als het streepje in het groene vak staat. 3 keer goed.</div><div class="qdots"><b></b><b></b><b></b></div>';
  const zone = el.querySelector('.zone'), mark = el.querySelector('.mark'), dots = el.querySelectorAll('.qdots b');
  return new Promise((resolve) => {
    let round = 0, pos = 0, dir = 1, raf = 0, last = performance.now(), zx = 0, zw = 0, pause = false;
    const setZone = () => { zw = [22, 16, 11][round]; zx = 10 + Math.random() * (80 - zw); zone.style.left = zx + '%'; zone.style.width = zw + '%'; };
    const speed = () => [70, 95, 125][round];
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!pause) {
        pos += dir * speed() * dt;
        if (pos > 100) { pos = 100; dir = -1; } if (pos < 0) { pos = 0; dir = 1; }
        mark.style.left = pos + '%';
      }
      raf = requestAnimationFrame(frame);
    };
    const end = (ok) => { cancelAnimationFrame(raf); UI.focus = null; setTimeout(() => { el.hidden = true; resolve(ok); }, 600); };
    setZone();
    raf = requestAnimationFrame(frame);
    const press = () => {
      if (pause) return;
      const hit = pos >= zx - 1 && pos <= zx + zw + 1;
      if (!hit) { SFX.no(); dots[round].className = 'miss'; pause = true; end(false); return; }
      SFX.ok(); dots[round].className = 'hit'; round += 1;
      if (round >= 3) { pause = true; end(true); return; }
      pause = true;
      setTimeout(() => { setZone(); pause = false; }, 350);
    };
    UI.focus = (k) => { if (k === 'ok') press(); };
    el.onclick = press;
  });
}

async function stealVape(B, f, P) {
  await B.log(`${f.name} zit verslagen in het gras. De vape bungelt tussen zijn vette vingertjes…`);
  const ok = await vapeQTE();
  if (ok) {
    P.money += 18; P.items.vape = (P.items.vape || 0) + 1; SFX.item();
    await B.log(`Je grist de vape uit zijn vette vingertjes! In het hoesje zit nog EUR 18. Smaak: ${f.smaak}.`);
  } else {
    SFX.no();
    await B.log(pick(['Hij klemt zijn vape vast met zijn vette vingertjes. "Bro. Nee."', 'Je grijpt mis. Je hand zit nu wel onder de vette vingerafdrukken.', '"Eigen vape kopen, ouwe." Hij stopt hem in zijn onderbroek. Die laat je maar zitten.']));
  }
}

// ---------- Aron koopt vapes ----------
(function () {
  const aron = NPCS.find((n) => n.id === 'aron');
  const talk = aron.talk;
  aron.talk = async function () {
    const g = G.P.items.gouden_vape || 0;
    if (g > 0) {
      const N = 'Aron van der Wal';
      await say(N, 'Is dat… een GOUDEN vape? Uit Delfzijl? Daar heb ik een koper voor in Hamburg. EUR 400 per stuk.');
      const k = await ask(N, `${g} gouden vape${g > 1 ? 's' : ''}: EUR ${g * 400}. Deal?`, [`Verkopen (EUR ${g * 400})`, 'Nee, hou ik']);
      if (k === 0) { G.P.items.gouden_vape = 0; G.P.money += g * 400; SFX.win(); UI.toast(`+EUR ${g * 400}`); await say(N, 'Dit is de beste dag van mijn carrière. En ik had er al zoveel.'); return; }
    }
    const n = G.P.items.vape || 0;
    if (n > 0) {
      const N = 'Aron van der Wal';
      await say(N, 'Wacht. Is dat een vape? Vapes zijn het nieuwe goud. Ik heb een contact in Delfzijl. Honderd per stuk.');
      const k = await ask(N, n > 1 ? `Ik neem ze alle ${n}. EUR ${n * 100}. Deal?` : 'EUR 100. Deal?', [n > 1 ? `Verkopen (EUR ${n * 100})` : 'Verkopen (EUR 100)', 'Nee, hou ik']);
      if (k === 0) {
        G.P.items.vape = 0; G.P.money += n * 100; SFX.win();
        UI.toast(`+EUR ${n * 100}`);
        await say(N, 'Top. Dit wordt mijn beste investering ooit. Echt waar dit keer.');
        return;
      }
    }
    return talk.call(this);
  };
})();
