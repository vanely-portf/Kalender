// ------------------------------------------------------------
// Push-Benachrichtigungen (Vercel-Funktion, gratis im Hobby-Tarif)
// ------------------------------------------------------------
// POST /api/push
//   { art: "einladung", eintrag: "<id>", an: ["Name", ...] }  → an neu Eingeladene
//   { art: "antwort",   eintrag: "<id>", von: "Name" }        → an die Person, die eingeladen hat
//
// Der Text wird hier aus den Daten in Firestore gebaut – nicht aus der Anfrage –,
// damit niemand über diese Adresse beliebige Nachrichten verschicken kann.
// Benötigt die Umgebungsvariable VAPID_PRIVATE_KEY (in Vercel → Settings → Environment Variables).

const webpush = require("web-push");

const VAPID_PUBLIC_KEY = "BHRRWUAYkhJbP2XiGkMV46f4Qg3pvfQ-8LopmDQP9QA7HRlLYs9NDkrw4qJcy8-oryYSd608q8EhCOw7RkUAtVI";
const PROJEKT = "friendlender";
const API_KEY = "AIzaSyCS3EoViYn5o33IJJfqIivEcqcQCTcBTqA"; // öffentlicher Web-Schlüssel (steht auch in js/config.js)
const GRUPPE = "freundeskreis";
const BASIS = `https://firestore.googleapis.com/v1/projects/${PROJEKT}/databases/(default)/documents/gruppen/${GRUPPE}`;

const STATUS = { frei: "Frei", besetzt: "Besetzt", arbeiten: "Arbeiten", arzt: "Arzt", ferien: "Ferien", treffen: "Treffen" };

// Firestore-REST-Werte in normale Werte umwandeln
function wert(v) {
  if (!v) return undefined;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("nullValue" in v) return null;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(wert);
  if ("mapValue" in v) return felder(v.mapValue.fields || {});
  return undefined;
}
function felder(f) {
  return Object.fromEntries(Object.entries(f || {}).map(([k, v]) => [k, wert(v)]));
}

async function holen(pfad) {
  const r = await fetch(`${BASIS}/${pfad}?key=${API_KEY}`);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Firestore ${r.status}`);
  return r.json();
}
async function sammlung(name) {
  const j = await holen(`${name}?pageSize=300`);
  return (j?.documents || []).map((d) => ({ id: d.name.split("/").pop(), ...felder(d.fields) }));
}

function datumText(start, ende, von, bis) {
  const f = (s) => new Date(s + "T12:00:00Z").toLocaleDateString("de-CH", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  let t = f(start);
  if (ende && ende !== start) t += ` – ${f(ende)}`;
  if (von) t += `, ${von}${bis ? `–${bis}` : ""} Uhr`;
  return t;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ fehler: "Nur POST" });
  const privat = process.env.VAPID_PRIVATE_KEY;
  if (!privat) return res.status(500).json({ fehler: "VAPID_PRIVATE_KEY fehlt in Vercel" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { art, eintrag: eintragId } = body;
    if (!["einladung", "antwort"].includes(art) || typeof eintragId !== "string" || !/^[\w-]{1,64}$/.test(eintragId)) {
      return res.status(400).json({ fehler: "Ungültige Anfrage" });
    }

    const doc = await holen(`eintraege/${eintragId}`);
    if (!doc) return res.status(404).json({ fehler: "Eintrag nicht gefunden" });
    const e = felder(doc.fields);
    const eingeladen = e.eingeladen || [];
    const antworten = e.antworten || {};
    const was = e.notiz || STATUS[e.status] || "Termin";
    const wann = datumText(e.start, e.ende, e.von, e.bis);

    let empfaenger = [];
    let nachricht;
    if (art === "einladung") {
      const an = Array.isArray(body.an) ? body.an : eingeladen;
      empfaenger = an.filter((n) => eingeladen.includes(n) && !antworten[n] && n !== e.name);
      nachricht = { titel: `${e.name} lädt dich ein`, text: `${was} · ${wann}`, tag: `einladung-${eintragId}` };
    } else {
      const von = body.von;
      if (typeof von !== "string" || antworten[von] !== "ja") return res.status(400).json({ fehler: "Keine Zusage gefunden" });
      empfaenger = [e.name];
      nachricht = { titel: "Einladung angenommen", text: `${von} kommt zu „${was}“ · ${wann}`, tag: `antwort-${eintragId}-${von}` };
    }
    if (!empfaenger.length) return res.status(200).json({ gesendet: 0 });

    const [personen, abos] = await Promise.all([sammlung("personen"), sammlung("push")]);
    const ids = new Set(personen.filter((p) => empfaenger.includes(p.name)).map((p) => p.id));
    const ziele = abos.filter((a) => ids.has(a.id) && a.abo && a.abo.endpoint);

    const host = req.headers["x-forwarded-host"] || req.headers.host || "friendlender.vercel.app";
    webpush.setVapidDetails(`https://${host}`, VAPID_PUBLIC_KEY, privat);
    const payload = JSON.stringify({ ...nachricht, url: "./" });

    let gesendet = 0;
    await Promise.all(ziele.map(async (z) => {
      try {
        await webpush.sendNotification(z.abo, payload, { TTL: 60 * 60 * 24 * 3, urgency: "high" });
        gesendet++;
      } catch (err) {
        // Abgelaufene Anmeldung entfernen
        if (err.statusCode === 404 || err.statusCode === 410) {
          await fetch(`${BASIS}/push/${z.id}?key=${API_KEY}`, { method: "DELETE" }).catch(() => {});
        } else {
          console.error("Push fehlgeschlagen", err.statusCode, err.body);
        }
      }
    }));
    return res.status(200).json({ gesendet });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ fehler: "Serverfehler" });
  }
};
