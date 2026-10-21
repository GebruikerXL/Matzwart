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

- **Wie ben ik?**: verzamel vier herinneringen aan gisteravond (Lanting, de EKA, het voetbalveld, de A-framestraat) en probeer dan je sleutel nog eens bij het gele huis.
- **De rekening bij Lanting**: betaal je openstaande €47 met geld uit gevechten.
- **Onbetaalde frikandellen**: Ineke van de EKA vergeeft je als je de dropdief achter de winkel aanpakt. Daarna krijg je 20% korting.
- **De wedstrijdbal**: de bal van VV Meedhuizen ligt in de EKA, tussen de meloenen. Daarna volgt een penaltyduel met keeper Kevin.
- **Het motorblok van Thijs**: Thijs is het motorblok van zijn BMW kwijt. Derkje, uit het piepkleine huisje, heeft het in haar broekzak. Je krijgt het alleen terug door met de juiste geluiden te antwoorden.

## Gevechten

Turn-based: Aanvallen, Skills (kosten EP), Praten, Spullen en Vluchten. Sigaretten uit de EKA kosten HP maar geven Stoerheid, waarmee je bij Praten kunt intimideren. Met Praten vul je de Rust-meter van je tegenstander. Bij 100% laat hij je gaan, en dan krijg je extra geld. In het hoge gras kom je willekeurige dorpstypes tegen.

## Bestanden

- `js/sprites.js`: alle pixel-art, in code getekend
- `js/maps.js`: het dorp, de schuur, het café en het dorpshuis
- `js/ui.js`: dialoogvensters, keuzelijsten en geluid
- `js/battle.js`: vechtsysteem, vijanden en voorwerpen
- `js/story.js`: personages en opdrachten
- `js/story2.js`: voorwerpen, deuren, intro en finale
- `js/main.js`: engine (lopen, camera, menu, opslaan)
