// Stemmen: personages praten echt, in het Nederlands, met de spraak van de browser (Web Speech API).
// We kiezen de best klinkende Nederlandse stem die er is (Edge: "Natural"/"Online", Chrome: Google Nederlands),
// geven mannen en vrouwen een eigen stem, en elk personage een eigen toonhoogte en tempo.
const Voice = {
  voices: [], ready: false, cur: null,
  // vrouwen, meisjes en kinderen (kinderen klinken het best met een hoge vrouwenstem); dieren en de verteller praten niet
  FEMALE: new Set(['Eka', 'Derkje', 'Mevrouw Jansen', 'Mevrouw Bakker', 'Mam', 'Zuster Hilda', 'Oma', 'Juf', 'Kantinejuffrouw', 'Buurvrouw', 'Mevrouw achter de balie', 'Strandganger', 'Kind', 'Kleinzoon van mevrouw Bakker']),
  SILENT: new Set(['', 'Mick', 'Kat van Henk', 'Zeehond Sjors']),
  // iedereen een eigen stem: [toonhoogte, tempo, stem]. "stem" kiest uit de beschikbare Nederlandse stemmen van
  // dat geslacht (in Edge o.a. Maarten, Arnaud (Vlaams) en Frank; Fenna, Colette en Dena (Vlaams)).
  STYLE: {
    // mannen
    'Thijs': [1.0, 1.05, 0], 'Trainer Harm': [0.7, 1.12, 2], 'Boer Jansen': [0.74, 0.86, 2], 'Henk': [0.86, 0.92, 1],
    'Otto': [1.12, 1.0, 1], 'Koen': [0.94, 1.32, 0], 'Keeper': [0.9, 1.16, 2], 'Visser Jaap': [0.66, 0.86, 1],
    'Kringloopmedewerker': [1.26, 0.94, 0], 'Puutje': [1.32, 1.22, 2], 'De bruine meneer': [0.5, 0.76, 2],
    'De Koning van de Zeedijk': [0.6, 0.9, 1], 'Daniël': [1.06, 0.88, 1], 'Butler': [0.8, 0.84, 2], 'Bestuurslid': [1.16, 1.06, 2],
    'Postbode': [1.2, 1.26, 0], 'Yarrin': [0.82, 0.9, 1], 'Man bij de bushalte': [0.96, 0.8, 2], 'Kjell': [1.12, 0.84, 0],
    'Jornt': [0.76, 0.8, 1], 'Dealer': [0.72, 1.02, 2], 'De Kapo': [0.56, 0.96, 0], 'Vaste gast': [0.84, 0.82, 2],
    'Snackbarbaas': [0.92, 1.18, 1], 'Organist': [1.2, 0.84, 2], 'Opa': [0.7, 0.78, 2], 'Molenaar': [0.8, 0.9, 1],
    'Koster': [1.1, 0.86, 1], 'IJszwemmer': [1.16, 1.22, 0], 'Hermann': [1.08, 1.2, 0], 'Croupier': [0.96, 1.0, 1],
    'Aron van der Wal': [1.0, 1.16, 2], 'LinkedIn': [1.0, 1.05, 0], 'Jij': [0.96, 1.0, 0],
    // vrouwen en kinderen
    'Eka': [1.0, 1.08, 0], 'Derkje': [1.95, 1.15, 1], 'Mevrouw Jansen': [0.88, 0.96, 2], 'Mevrouw Bakker': [1.16, 0.84, 1],
    'Mam': [1.05, 1.05, 0], 'Zuster Hilda': [1.2, 0.95, 1], 'Oma': [1.1, 0.78, 2], 'Juf': [1.26, 1.06, 0],
    'Kantinejuffrouw': [0.94, 1.16, 1], 'Buurvrouw': [1.32, 1.1, 2], 'Mevrouw achter de balie': [0.84, 1.0, 0],
    'Strandganger': [1.14, 1.1, 1], 'Kind': [1.7, 1.12, 0], 'Kleinzoon van mevrouw Bakker': [1.55, 1.12, 2],
  },
  init() {
    if (!('speechSynthesis' in window)) return;
    const load = () => {
      const all = speechSynthesis.getVoices().filter((v) => /^nl/i.test(v.lang));
      const score = (v) => (/natural|online|neural/i.test(v.name) ? 6 : 0) + (/google/i.test(v.name) ? 3 : 0) + (/microsoft|apple|siri|xander|claire/i.test(v.name) ? 1 : 0) + (/nl[-_]NL/i.test(v.lang) ? 2 : 0) + (v.localService ? 0 : 1);
      this.voices = all.sort((a, b) => score(b) - score(a));
      this.ready = this.voices.length > 0;
    };
    load();
    speechSynthesis.addEventListener('voiceschanged', load);
  },
  // een stem voor deze persoon: uit de stemmen van het juiste geslacht, steeds dezelfde voor dezelfde persoon
  isF(v) { return /fenna|colette|claire|ellen|lotte|dena|hanna|anna|female|vrouw|google nederlands/i.test(v.name); },
  isM(v) { return /maarten|frank|xander|arnaud|male|man\b/i.test(v.name); },
  voiceFor(name, slot) {
    const female = this.FEMALE.has(name);
    const pool = this.voices.filter((v) => (female ? this.isF(v) : this.isM(v)));
    const list = pool.length ? pool : this.voices;
    return list.length ? list[slot % list.length] : null;
  },
  // stijl van iemand die niet in de lijst staat: vast uit de naam berekend, met flinke verschillen
  styleFor(name) {
    if (this.STYLE[name]) return this.STYLE[name];
    const h = [...name].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    const female = this.FEMALE.has(name);
    const pitch = female ? 0.95 + (h % 9) * 0.055 : 0.68 + (h % 11) * 0.05;
    return [pitch, 0.86 + ((h >> 4) % 8) * 0.045, (h >> 8) % 3];
  },
  clean(text) {
    return String(text)
      .replace(/\*[^*]*\*/g, (m) => (/hik|kuch|snurk|zucht/i.test(m) ? m.replace(/\*/g, '') : ''))
      .replace(/EUR\s?([\d.,]+)/g, '$1 euro')
      .replace(/#(\w+)/g, 'hashtag $1')
      .replace(/…/g, '...')
      .replace(/[“”"]/g, '')
      .replace(/\s+/g, ' ').trim();
  },
  speak(name, text) {
    this.stop();
    if (!this.ready || !SFX.on || this.SILENT.has(name || '')) return;
    const t = this.clean(text);
    if (!t) return;
    const u = new SpeechSynthesisUtterance(t);
    const [pitch, rate, slot] = this.styleFor(name);
    const v = this.voiceFor(name, slot);
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'nl-NL';
    // geen mannenstem beschikbaar (bijv. alleen Google Nederlands)? dan lager zodat het nog als een man klinkt
    const noMale = !this.FEMALE.has(name) && v && this.isF(v);
    u.pitch = Math.max(0.1, Math.min(2, pitch * (noMale ? 0.8 : 1))); u.rate = Math.max(0.6, Math.min(1.6, rate)); u.volume = 1;
    u.onend = u.onerror = () => { if (this.cur === u) this.cur = null; };
    this.cur = u;
    speechSynthesis.speak(u);
  },
  // ondertitels in cutscenes: 'Koen: "..."' wordt door Koen uitgesproken
  line(text, who) {
    const m = /^([A-ZÀ-Ý][^:"]{1,30}?)(?:\s*\([^)]*\))?:\s*"?(.+?)"?$/.exec(String(text));
    if (m) this.speak(m[1].trim(), m[2]);
    else if (who) this.speak(who, text);
  },
  stop() { if (this.cur || (window.speechSynthesis && speechSynthesis.speaking)) { try { speechSynthesis.cancel(); } catch (e) {} } this.cur = null; },
};
Voice.init();
// elke tekstregel van een personage wordt uitgesproken; als de regel weggaat, stopt de stem
(function () {
  const say = UI.say.bind(UI), ask = UI.ask.bind(UI), blip = SFX.blip.bind(SFX);
  UI.say = async function (name, text) { Voice.speak(name || '', text); const r = await say(name, text); Voice.stop(); return r; };
  UI.ask = async function (name, text, items, cancel) { Voice.speak(name || '', text); const r = await ask(name, text, items, cancel); Voice.stop(); return r; };
  // geen typemachinegeluidjes als er iemand praat
  SFX.blip = function () { if (!Voice.cur) blip(); };
})();
