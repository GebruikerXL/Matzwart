# Brak in Meedhuizen

Een klein RPG in RPG Maker-stijl dat in de browser draait. Je wordt na een avond stappen wakker in de schuur van boer Jansen in Meedhuizen en weet je eigen naam niet meer.

## Spelen

Open `index.html` in een browser. Er is geen server of build-stap nodig.

- Lopen: pijltjes of WASD
- Praten / oké: Spatie, Enter of Z
- Menu / terug: Esc of X
- Op een telefoon verschijnt een D-pad met A/B-knoppen.

Opslaan kan via het menu of op het bankje aan de Dorpsstraat (dat vult ook je HP en EP aan).

## Opdrachten

- **Wie ben ik?**: praat met de getuigen (Gerda, mevrouw Bakker, Henk) en confronteer Rick in het dorpshuis.
- **Waar is mijn telefoon?**: Henk de buurman heeft hem.
- **Waar is mijn fiets?**: ligt in de sloot. Boer Jansen heeft een hark, maar wil eerst koffie.
- **Iets goedmaken**: breng tuinkabouter Gerrit terug naar mevrouw Bakker.

## Gevechten

Turn-based: Aanvallen, Skills (kosten EP), Praten, Spullen en Vluchten. Met Praten vul je de Rust-meter van je tegenstander. Bij 100% laat hij je gaan, en dan krijg je extra geld. In het hoge gras kom je willekeurige dorpstypes tegen.

## Bestanden

- `js/sprites.js`: alle pixel-art, in code getekend
- `js/maps.js`: het dorp, de schuur, het café en het dorpshuis
- `js/ui.js`: dialoogvensters, keuzelijsten en geluid
- `js/battle.js`: vechtsysteem, vijanden en voorwerpen
- `js/story.js`: personages, opdrachten en het verhaal
- `js/main.js`: engine (lopen, camera, menu, opslaan)
