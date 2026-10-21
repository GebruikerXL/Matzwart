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
- **Onbetaalde frikandellen**: Eka van de EKA vergeeft je als je Puutje aanpakt, die 38 koude frikandellen heeft gejat. Daarna krijg je 20% korting.
- **De wedstrijdbal**: de bal van VV Meedhuizen ligt in de EKA, tussen de meloenen. Daarna volgt een penaltyduel met de keeper.
- **Het motorblok van Thijs**: Thijs is het motorblok van zijn BMW kwijt. Derkje, uit het piepkleine huisje, heeft het in haar broekzak. Je krijgt het alleen terug door met de juiste geluiden te antwoorden.

## Gevechten

Turn-based: Aanvallen, Skills (kosten EP), Praten, Spullen en Vluchten. Sigaretten uit de EKA kosten HP maar geven Stoerheid, waarmee je bij Praten kunt intimideren. Met Praten vul je de Rust-meter van je tegenstander. Bij 100% laat hij je gaan, en dan krijg je extra geld. In het hoge gras kom je willekeurige dorpstypes tegen.

## Wapens

Er zijn 16 wapens te vinden: verstopt in het dorp, als beloning, te koop of als buit van vijanden. Wat je vasthoudt zie je in de hand van je poppetje. Kies je wapen via Menu → Wapens. In een gevecht gebruik je met **Wapen** de speciale aanval, of wissel je van wapen (dat kost een beurt).

Statuseffecten: vijanden kunnen Ongemakkelijk (slaat beurt over), Misselijk (schade per beurt), Verblind (mist vaak) of Verzwakt (minder schade) worden. Jij kunt Misselijk of Duizelig worden; Paracetamol helpt.

## Casino

Het Gokpaleis staat in de A-framestraat, achter de parkeerplaats van de EKA. Er staan een gokkast, een roulettetafel en een hoger-lagertafel. Naast de gokkast staat Aron van der Wal met investeringsadviezen. Volg je zijn tip, dan verlies je gegarandeerd. Doe je precies het omgekeerde, dan win je.

## Bestanden

- `js/sprites.js`: alle pixel-art, in code getekend
- `js/maps.js`: het dorp, de schuur, het café en het dorpshuis
- `js/ui.js`: dialoogvensters, keuzelijsten en geluid
- `js/battle.js`: vechtsysteem, vijanden en voorwerpen
- `js/weapons.js`: wapens, statuseffecten, wapen-icoontjes en Mick
- `js/story.js`: personages en opdrachten
- `js/story2.js`: voorwerpen, deuren, intro en finale
- `js/casino.js`: het Gokpaleis, de spelletjes en Aron van der Wal
- `js/main.js`: engine (lopen, camera, menu, opslaan)
