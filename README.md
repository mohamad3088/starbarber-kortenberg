# Starbarber Kortenberg

Premium one-page website voor Starbarber, Leuvensesteenweg 264, 3070 Kortenberg.

## Gegevens van de zaak (verzameld 8 okt 2026)
- Telefoon/WhatsApp: 0485 95 60 21 (gsm, dus WhatsApp-boeking werkt)
- Google: 4,6★ uit 243 reviews. Als website staat alleen een oude Instagram-post.
- Instagram: [@starbarber.kortenberg](https://www.instagram.com/starbarber.kortenberg/) (±1.500 volgers, 373 posts). Bio: "Enkel op afspraak".
- TikTok: @starbarberkortenberg (watermerk op hun video's)
- Uren (Google en het raam): ma + di gesloten, wo–zo 10:30–19:00. Een oud visitekaartje zegt zondag 12:00–19:00. **Navragen.**
- Oud adres op Instagram (2022): Karterstraat 49. Huidig adres volgens Google en de Instagram-bio: Leuvensesteenweg 264.

## Nog te bevestigen voor oplevering
- [ ] **Prijzen**: er is geen prijslijst gevonden, dus overal staat "Op aanvraag". Invullen in `script.js` (bovenaan, `SERVICES`).
- [ ] Diensten kloppen? (knippen, fade/taper, knippen + baard, baard, kinderen)
- [ ] Openingsuren (`HOURS` in `script.js`)
- [ ] Toestemming voor de foto's (Instagram + Google Maps), liefst in hogere resolutie
- [ ] Logo: in de menubalk staat nu "Star ★★★ Barber" in tekst. Hun echte logo staat op de gevel/het visitekaartje: vraag het bestand.

## Bestanden
- `index.html`, `styles.css`, `script.js`: statische site, geen build nodig
- `img/`: webfoto's + `logo-gold.svg` (favicon)
- Stijl: wit thema zoals Classic Barbershop (`theme.css`), met drie zwevende foto's in de hero
- `img/raw/`: originele downloads + `urls.txt` (niet in git)

Lokaal bekijken: `python -m http.server 5181` in deze map, daarna http://localhost:5181.
