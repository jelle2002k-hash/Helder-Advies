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
