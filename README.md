# Friendlender

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
| `js/app.js` | Oberfläche, Profil, Einträge, Scroll-Räder, Einladungen, Benachrichtigungen |
| `api/push.js` | Vercel-Funktion: verschickt die Push-Benachrichtigungen |
| `js/calendar.js` | Status, Datum, Verfügbarkeit, Monatsraster, beste Tage |
| `js/storage.js` | Daten: Supabase (gemeinsam, live) oder lokal |
| `js/config.js` | Supabase-Adresse und öffentlicher Schlüssel |
| `supabase/einrichtung.sql` | Tabellen, Rechte und Realtime für Supabase |
| `api/wachhalten.js` | Täglicher Aufruf, damit Supabase nicht pausiert |
| `vercel.json` | Zeitplan für den täglichen Aufruf |
| `js/designs.js` | Liste der Designs (Name, Farben, Schriften) |
| `js/icons.js` | Eigene SVG-Icons (Bedienung, Status, Theme-Symbole) |
| `js/szenen.js` | Header-Animationen + Header-Hintergründe (aus Generator erzeugt) |
| `manifest.json`, `service-worker.js` | PWA: installierbar, offline |
| `icons/` | App-Icons |
| `start.sh`, `package.json` | Lokaler Start |

## Daten (Supabase)

Projekt `friendlender` bei Supabase, kostenloser **Free**-Tarif (kein Abo, keine Zahlungsdaten).

- Tabellen: `personen`, `eintraege`, `push` – einrichten mit **`supabase/einrichtung.sql`**
  (Supabase → *SQL Editor* → Inhalt einfügen → *Run*).
- Live-Updates über Supabase Realtime; der letzte Stand wird auf dem Gerät zwischengespeichert.
- Antworten auf Einladungen setzt die Datenbank-Funktion `antwort_setzen`, damit sich
  gleichzeitige Antworten nicht überschreiben.
- `js/config.js` und `api/_supabase.js`: Project URL und **anon/publishable**-Schlüssel (öffentlich).
  Den *service_role*/*secret*-Schlüssel nie ins Projekt schreiben.
- Supabase pausiert Gratis-Projekte nach 7 Tagen ohne Aktivität. Dagegen ruft ein Vercel-Cron
  (`vercel.json`) einmal täglich `api/wachhalten.js` auf – ebenfalls gratis.

Es gibt kein Login: Wer den Link hat, kann mitlesen und mitschreiben (Row Level Security mit
offener Policy). Teile ihn nur im Freundeskreis.
Ein Profil pro Gerät; jede Person kann ihr eigenes Profil samt Einträgen löschen.

## Benachrichtigungen (Push)

Wer eingeladen wird, bekommt eine Benachrichtigung – und wer einlädt, bekommt eine, sobald jemand zusagt.
Das funktioniert auch bei geschlossener App und kostet nichts:

- Versand über die Vercel-Funktion `api/push.js` (Hobby-Tarif, gratis) mit der Bibliothek `web-push`.
- Die Anmeldung jedes Geräts liegt in der Supabase-Tabelle `push` (eine Zeile pro Gerät).
- Der öffentliche Schlüssel steht in `js/config.js` und `api/push.js`.
- Der **geheime Schlüssel** gehört nur in Vercel: *Settings → Environment Variables →* `VAPID_PRIVATE_KEY`.
  Nie ins GitHub-Repo schreiben.
- Aktivieren: Hinweis-Karte auf der Startseite oder im Profil „Benachrichtigungen aktivieren“.
- **iPhone:** nur möglich, wenn die App über Teilen → *Zum Home-Bildschirm* installiert ist (ab iOS 16.4).

## Auf dem Handy installieren

- **iPhone:** Link in Safari öffnen → Teilen → *Zum Home-Bildschirm*
- **Android:** Link in Chrome öffnen → Menü → *App installieren*
