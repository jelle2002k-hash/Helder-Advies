# Helder Advies

Een responsive Nederlandstalige website voor Helder Advies met de nadruk op persoonlijk vermogensbeheer. De volledige website bestaat uit HTML, CSS, JavaScript en lokaal opgeslagen afbeeldingen en lettertypen.

## Publiceren met GitHub Pages

De websitebestanden staan direct in de hoofdmap van deze repository. Er is geen installatie, framework of buildstap nodig.

Stel onder **Settings → Pages** de bron in op **Deploy from a branch**, branch **main**, map **/ (root)**. Het bestand `.nojekyll` zorgt ervoor dat GitHub Pages de bestanden rechtstreeks publiceert.

## Lokaal bekijken

Start vanuit deze map een eenvoudige webserver, bijvoorbeeld:

```sh
python3 -m http.server 8000
```

Open daarna `http://localhost:8000`.

## Bestanden

- `index.html`: alle pagina-inhoud en toegankelijke navigatie.
- `styles.css`: responsive vormgeving.
- `app.js`: mobiel menu, expertise-tabs, tarieven- en privacyvensters en het e-mailformulier.
- `assets/`: afbeeldingen, favicon en lokaal gehoste lettertypen.

## Functionaliteit

- Mobiele navigatie met toetsenbordbediening.
- Expertise-tabs, veelgestelde vragen en native dialogs.
- Tarievenvenster met de tarieven van de aangeleverde website.
- Het contactformulier maakt een `mailto:`-concept in het eigen e-mailprogramma van de bezoeker. Het verstuurt niets automatisch en slaat geen persoonsgegevens op. De bezoeker moet het concept zelf verzenden.
- Geen trackingcookies of externe analyseprogramma’s; afbeeldingen en lettertypen worden lokaal geladen.

## Contentbronnen

De inhoud is gecontroleerd op [helderadvies.eu](https://www.helderadvies.eu/) en de pagina’s `/vermogensbeheer`, `/onze-werkwijze`, `/over-ons`, `/duurzaam-beleggen`, `/kosten-en-voorwaarden`, `/nazorg-en-contact` en `/privacy-en-klachten`.

Contactgegevens op de bronwebsite spreken elkaar tegen. Daarom is alleen het herhaald aangetroffen e-mailadres `info@helderadvies.nl` overgenomen. De algemene tarieven worden getoond zonder berekening bij grensbedragen; het persoonlijke voorstel bepaalt de exacte kosten.

## Visuele bronnen

Foto’s: Unsplash, lokaal opgeslagen. Hero: `photo-1473448912268-2022ce9509d8` (bosmeer). Tweede beeld: `photo-1441974231531-c6227db76b6e` (bospad). Lettertypen: Manrope en Cormorant Garamond via Google Fonts, lokaal gehost. De bijbehorende SIL Open Font License-bestanden staan in `licenses/`.

## Validatie

JavaScript-syntaxis, lokale assets, interne ankers, unieke IDs en ARIA-verwijzingen zijn statisch gecontroleerd. Visuele browsercontrole is niet uitgevoerd in de oorspronkelijke werkomgeving.

## Opdracht Beleggen in Box 3

De pagina [`box3.html`](box3.html) bevat een interactieve jaarvergelijking voor 2026, uitleg over sparen en beleggen, de vrijstelling, de tegenbewijsregeling, controleerbare bronlinks en de uitgewerkte oefencasus van Frank en Jennifer. De pagina is bereikbaar vanuit de hoofd- en mobiele navigatie, een blok op de homepage en de footer.

- [`box3-engine.mjs`](box3-engine.mjs): zuivere rekenfuncties met 2026-parameters en aparte verwerking van interne fondskosten en externe kosten.
- [`box3.js`](box3.js): invoer, uitkomst, uitsplitsing, scenariokeuze en afdrukken.
- [`box3.css`](box3.css): responsive vormgeving en afdrukweergave.
- [`downloads/conclusie-frank-en-jennifer.docx`](downloads/conclusie-frank-en-jennifer.docx): de individuele conclusie, visueel gecontroleerd als één A4.
- [`tests/box3-engine.test.mjs`](tests/box3-engine.test.mjs): onafhankelijke controles van belastingen, vrijstelling, kindreserve, partners, kosten, verlies en omslagpunt.

Tests uitvoeren zonder installatie:

```sh
node --test tests/box3-engine.test.mjs
```

De rekentool gebruikt uitsluitend banktegoeden en gewone beleggingen zonder box 3-schulden of andere bezittingen. Het vermogen is een heel jaar gelijk en aanwezig op 1 januari. De forfaitaire heffing is de standaard; de optie tegenbewijs is een indicatie op basis van gesimuleerde opbrengst, geen aangetoonde fiscale uitkomst. Persoonlijke heffingskortingen en de verdeling tussen fiscale partners worden niet geoptimaliseerd.

De casus telt de voor kinderen gereserveerde €100.000 mee in het gezamenlijke vermogen van €450.000. Bestaand buffervermogen is niet gekwantificeerd in de casus en is daarom geen verzonnen klantgegeven: de bezoeker kan het aanvullen. De casus vermeldt ook geen datum van overlijden/verkrijging, kinderleeftijden of vastgesteld risicoprofiel. De één-A4-conclusie en de website benoemen deze aannamen.

Broncontrole: 25 november 2026. De voorlopige 2026-spaarforfaits, actuele marktrentes en kosten moeten bij een latere actualisering opnieuw worden gecontroleerd. Rente 2,29% is een ongewogen steekproef van 42 aangeboden rentes bij een referentiesaldo van €20.000 (RevoSave), geen gegarandeerd jaargemiddelde voor de klant. De profielrendementen zijn externe Rabobank-scenario’s vóór kosten; ze stellen geen persoonlijk passend profiel vast. Kosten 1,10% zijn een voorbeeld van 0,85% externe vergoeding over het gehele bedrag en 0,25% interne fondskosten; de exacte offerte kan afwijken.

De oorspronkelijke opdracht en klantcasus worden niet als bestanden gepubliceerd. Het Moodle-peerfeedbackformulier, twee echte beoordelingen door studenten en inlevering in FeedbackFruits horen bij de uitvoering door de student; deze repository bevat geen verzonnen feedback of indieningsbewijs.

Voor deze toevoeging zijn 19 financiële tests en 15 headless-browsercontroles geslaagd. Browsercontroles omvatten de casus, scenario- en invoerwijzigingen, verlies en tegenbewijs, kostenvalidatie, printen, de Word-download, mobiele navigatie en breedtes van 375, 768 en 1440 pixels. De conclusie is als één A4 gerenderd en visueel gecontroleerd.
