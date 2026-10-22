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

Turn-based: Aanvallen, Skills (kosten EP), Praten, Spullen en Vluchten. Sigaretten uit de EKA kosten HP maar geven Stoerheid, waarmee je bij Praten kunt intimideren. Met Praten vul je de Rust-meter van je tegenstander. Bij 100% laat hij je gaan, en dan krijg je extra geld. In het hoge gras zitten vapende tieners (je wordt gewaarschuwd voordat je erin stapt). Versla je er een, dan volgt een quick time event: druk 3 keer op het goede moment en je jat zijn vape plus EUR 18. Aron van der Wal koopt vapes voor EUR 100.

## Wapens

Er zijn 16 wapens te vinden: verstopt in het dorp, als beloning, te koop of als buit van vijanden. Wat je vasthoudt zie je in de hand van je poppetje. Kies je wapen via Menu → Wapens. In een gevecht gebruik je met **Wapen** de speciale aanval, of wissel je van wapen (dat kost een beurt).

Statuseffecten: vijanden kunnen Ongemakkelijk (slaat beurt over), Misselijk (schade per beurt), Verblind (mist vaak) of Verzwakt (minder schade) worden. Jij kunt Misselijk of Duizelig worden; Paracetamol helpt.

## Casino

Het Gokpaleis staat in de A-framestraat, achter de parkeerplaats van de EKA. Er staan een gokkast, een roulettetafel en een hoger-lagertafel. Naast de gokkast staat Aron van der Wal met investeringsadviezen. Volg je zijn tip, dan verlies je gegarandeerd. Doe je precies het omgekeerde, dan win je.

## Online

Bij het starten kies je een spelersnaam. Iedereen die het spel op hetzelfde moment open heeft (op claude.ai), ziet elkaar rondlopen met de naam boven het hoofd. Sta je naast iemand, dan zie je hoeveel geld die speler heeft. Met Spatie kun je zwaaien of ruilen: spullen, wapens, vapes of geld. Linksboven staat altijd hoeveel geld en schuld je hebt.

Voortgang wordt per browser opgeslagen; online zie je elkaar alleen zolang het spel openstaat. Lokaal (als bestand geopend) speel je offline.

## Kleding en uiterlijk

Bij het starten kies je een spelersnaam en je uiterlijk: huidskleur, haarstijl, haarkleur, gezichtsbeharing, gezicht en het formaat van de censuurbalk. Je begint naakt. Kleding heeft 4 vakken (hoofd, bovenlijf, broek, schoenen) en geeft stats (verdediging, aanval, Stoerheid). Je koopt lelijke of nep-designerkleding in de kringloopwinkel, vindt spullen in het dorp (jutezak, vuilniszak, verkeerskegel) en vapers laten heel soms (3%) zeldzame kleding vallen. Aan- en uittrekken via Menu → Kleding.

## Ruilen

Ruilen werkt zoals in Old School RuneScape: ruilverzoek, ruilscherm waarin allebei spullen, wapens, kleding en geld zetten, allebei accepteren, dan een bevestigscherm waar je nog een keer allebei accepteert. Verandert iemand iets, dan vervalt het akkoord.

## 3D-versie

`3d.html` is dezelfde game in 3D, in blokstijl zoals Minecraft, in eerste persoon. Klik in beeld om rond te kijken (muis), WASD om te lopen, Shift om te rennen, E of rechtermuisknop om te praten en M voor het menu. Onderin staat een hotbar (1-9 of scrollwiel): met de linkermuisknop gebruik je wat je vasthoudt. Wapens zwaaien (een vaper eerst raken verrast hem), de vape geeft echte dampwolken, eten eet je op, de selfiestick flitst, het springtouw laat je springen en dartpijlen gooi je weg. De lucht heeft een dag-en-nachtritme met wolken, zonsondergang, sterren en noorderlicht; binnenruimtes hebben muren, een plafond, lampen en een deur. Vapers staan zichtbaar in het hoge gras: loop je ertegenaan, dan start het turn-based gevecht (in de bekende 2D-gevechtsweergave). Het verhaal, de gevechten, kleding, het casino, ruilen en online delen dezelfde code als de 2D-versie (`js/`); alleen de wereld, poppetjes en besturing zitten in `js3d/`. Three.js komt van cdnjs.

## Bestanden

- `js/sprites.js`: alle pixel-art, in code getekend
- `js/maps.js`: het dorp, de schuur, het café en het dorpshuis
- `js/ui.js`: dialoogvensters, keuzelijsten en geluid
- `js/battle.js`: vechtsysteem, vijanden en voorwerpen
- `js/weapons.js`: wapens, statuseffecten, wapen-icoontjes en Mick
- `js/story.js`: personages en opdrachten
- `js/story2.js`: voorwerpen, deuren, intro en finale
- `js/vapers.js`: vapende tieners, hun dampwolken, de vape-QTE
- `js/casino.js`: het Gokpaleis, de spelletjes en Aron van der Wal
- `js/clothes.js`: kleding, censuurbalk, kringloopwinkel, personage maken
- `js/trade.js`: het ruilscherm
- `js/online.js`: andere spelers, ruilen, geld-en-schuldbalk, spelersnaam
- `js/main.js`: engine (lopen, camera, menu, opslaan)
