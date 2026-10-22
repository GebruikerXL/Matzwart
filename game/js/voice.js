// Stemmen: personages praten echt, in het Nederlands, met de spraak van de browser (Web Speech API).
// We kiezen de best klinkende Nederlandse stem die er is (Edge: "Natural"/"Online", Chrome: Google Nederlands),
// geven mannen en vrouwen een eigen stem, en elk personage een eigen toonhoogte en tempo.
const Voice = {
  voices: [], ready: false, cur: null,
  // vrouwen en meisjes; de rest is een man (dieren en de verteller praten niet)
  FEMALE: new Set(['Eka', 'Derkje', 'Mevrouw Jansen', 'Mevrouw Bakker', 'Mam', 'Zuster Hilda', 'Oma', 'Juf', 'Kantinejuffrouw', 'Buurvrouw', 'Mevrouw achter de balie', 'Strandganger', 'Kind']),
  SILENT: new Set(['', 'Mick', 'Kat van Henk', 'Zeehond Sjors']),
  // bijzondere stemmen: toonhoogte, tempo
  STYLE: {
    'Derkje': [1.9, 1.15], 'Kind': [1.6, 1.1], 'Kleinzoon van mevrouw Bakker': [1.5, 1.1],
    'De bruine meneer': [0.55, 0.82], 'De Kapo': [0.65, 0.95], 'Keeper': [0.85, 1.1], 'De Koning van de Zeedijk': [0.7, 0.92],
    'Hermann': [1.05, 1.18], 'Koen': [0.9, 1.22], 'Kjell': [0.95, 0.85], 'Jornt': [0.8, 0.82], 'Aron van der Wal': [1.0, 1.15],
    'Daniël': [1.0, 0.9], 'Butler': [0.8, 0.88], 'Opa': [0.75, 0.85], 'Oma': [1.05, 0.85], 'Puutje': [1.1, 1.15], 'LinkedIn': [1.0, 1.05],
    'Zuster Hilda': [1.1, 0.95], 'Mam': [1.1, 1.05], 'Yarrin': [0.8, 0.9],
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
  // een stem voor deze persoon: vrouwen een vrouwenstem en mannen een mannenstem als die er zijn
  voiceFor(name) {
    const female = this.FEMALE.has(name);
    const isF = (v) => /fenna|colette|claire|ellen|lotte|dena|hanna|anna|female|vrouw|google nederlands/i.test(v.name);
    const isM = (v) => /maarten|frank|xander|arnaud|male|man\b/i.test(v.name);
    const best = this.voices.find((v) => (female ? isF(v) : isM(v)));
    return best || this.voices[0] || null;
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
    const v = this.voiceFor(name);
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'nl-NL';
    // eigen toonhoogte en tempo per persoon (vast, zodat iemand steeds hetzelfde klinkt)
    const h = [...name].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    const [pitch, rate] = this.STYLE[name] || [(this.FEMALE.has(name) ? 1.08 : 0.92) + ((h % 7) - 3) * 0.035, 1.0 + ((h >> 3) % 5 - 2) * 0.04];
    // geen mannenstem beschikbaar (bijv. alleen Google Nederlands)? dan iets lager zodat het nog als een man klinkt
    const noMale = !this.FEMALE.has(name) && v && /google nederlands|fenna|colette|claire|ellen|dena/i.test(v.name);
    u.pitch = Math.max(0.1, Math.min(2, pitch * (noMale ? 0.82 : 1))); u.rate = Math.max(0.6, Math.min(1.6, rate)); u.volume = 1;
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
