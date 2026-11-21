# Freundeskalender

Mobile-first PWA, mit der ein Freundeskreis Termine und Ferien gemeinsam plant
und sieht, an welchen Tagen möglichst viele Zeit haben.
Reines HTML/CSS/JavaScript, kein Build-Tool, kein eigener Server.

## Lokal starten (Terminal)

```bash
cd ~/Documents/GitHub/Kalender
./start.sh            # öffnet http://localhost:8080
./start.sh 3000       # anderer Port
# ctrl + C            # beenden
```

Falls `./start.sh` „permission denied“ meldet: einmal `chmod +x start.sh`.
Alternativ in VS Code mit der Erweiterung *Live Server*.

## Online stellen

GitHub Desktop → **Commit to main** → **Push origin**.
Vercel ist mit dem Repository verbunden und veröffentlicht automatisch in etwa einer Minute.

Nach jeder Änderung in `service-worker.js` die `VERSION` erhöhen, damit Handys die neue Version laden.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Grundgerüst: Header, Kalender, Listen, Legende, alle Dialoge, Pinsel-Filter |
| `css/style.css` | Gestaltung, 8 Designs als CSS-Variablen, Animationen |
| `js/app.js` | Oberfläche, Profil, Einträge, Scroll-Räder, Einladungen |
| `js/calendar.js` | Status, Datum, Verfügbarkeit, Monatsraster, beste Tage |
| `js/storage.js` | Daten: Firebase Firestore (gemeinsam, live) oder lokal |
| `js/config.js` | Firebase-Konfiguration + Gruppenname |
| `js/designs.js` | Liste der Designs (Name, Farben, Schriften) |
| `js/icons.js` | Eigene SVG-Icons (Bedienung, Status, Theme-Symbole) |
| `js/szenen.js` | Header-Animationen + Header-Hintergründe (aus Generator erzeugt) |
| `manifest.json`, `service-worker.js` | PWA: installierbar, offline |
| `icons/` | App-Icons |
| `start.sh`, `package.json` | Lokaler Start |

## Daten (Firebase)

Projekt `friendlender`, Firestore in `europe-west6` (Zürich), kostenloser Spark-Tarif.
Pfad: `gruppen/freundeskreis/personen` und `gruppen/freundeskreis/eintraege`.

Regeln (in der Firebase-Konsole):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gruppen/{gruppe}/{sammlung}/{id} {
      allow read, write: if true;
    }
  }
}
```

Es gibt kein Login: Wer den Link hat, kann mitlesen und mitschreiben. Teile ihn nur im Freundeskreis.
Ein Profil pro Gerät; jede Person kann ihr eigenes Profil samt Einträgen löschen.

## Auf dem Handy installieren

- **iPhone:** Link in Safari öffnen → Teilen → *Zum Home-Bildschirm*
- **Android:** Link in Chrome öffnen → Menü → *App installieren*
