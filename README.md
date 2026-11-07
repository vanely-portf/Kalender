# Freundeskalender

Mobile-first PWA, mit der ein Freundeskreis Termine und Ferien gemeinsam plant.
Reines HTML/CSS/JavaScript, kein Build-Tool, kein eigener Server.

## Im Terminal bedienen

```bash
cd ~/freundes-kalender     # in den Projektordner wechseln
./start.sh                 # App starten (öffnet http://localhost:8080)
./start.sh 3000            # auf einem anderen Port starten
# ctrl + C                 # App beenden
```

Alternativ, wenn Node.js installiert ist: `npm start`

Falls `./start.sh` "permission denied" meldet: einmal `chmod +x start.sh` ausführen.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Grundgerüst: Kalender, Liste, beste Tage, Legende, Dialoge |
| `css/style.css` | Gestaltung (mobile-first) |
| `js/app.js` | Oberfläche, Klicks, Formulare, Fehlermeldungen |
| `js/calendar.js` | Datum, Status-Farben, Verfügbarkeit, Monatsraster |
| `js/storage.js` | Speichern: Firebase (gemeinsam) oder lokal |
| `js/config.js` | Firebase-Zugangsdaten |
| `manifest.json`, `service-worker.js` | PWA (installierbar, offline) |
| `start.sh` | Lokaler Start aus dem Terminal |

## Lokaler Modus vs. gemeinsamer Kalender

Ohne Konfiguration speichert die App nur auf dem eigenen Gerät (zum Testen).
Damit alle Freunde dieselben Einträge sehen:

1. Auf https://console.firebase.google.com ein Projekt anlegen (kostenlos).
2. **Firestore Database** → *Datenbank erstellen* → Standort `europe-west6` (Zürich).
3. Unter **Regeln** einfügen und veröffentlichen (jeder mit dem Link darf lesen/schreiben – passend für einen Freundeskreis ohne Login):
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
4. **Projekteinstellungen** → *Meine Apps* → Web-App `</>` hinzufügen → die `firebaseConfig` kopieren.
5. In `js/config.js` `FIREBASE_CONFIG = null` durch die kopierten Werte ersetzen.

## Online stellen (damit die Freunde die App installieren können)

Eine PWA lässt sich nur über HTTPS installieren. Am einfachsten:

- **Netlify Drop:** https://app.netlify.com/drop öffnen und den Ordner `freundes-kalender` hineinziehen.
- **GitHub Pages:** Ordner als Repository hochladen → Settings → Pages → Branch `main`.

Danach den Link teilen. Auf dem iPhone: Safari → Teilen → *Zum Home-Bildschirm*.
Auf Android: Chrome → Menü → *App installieren*.

Nach Änderungen an den Dateien in `service-worker.js` die `VERSION` erhöhen (z. B. `v2`).
