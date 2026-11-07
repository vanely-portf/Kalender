// ------------------------------------------------------------
// Kalender-Logik: Datum, Status, Verfügbarkeit, Monatsraster
// ------------------------------------------------------------

export const STATUS = {
  frei:     { label: "Frei",        emoji: "✅", farbe: "#16a34a", blockiert: false },
  besetzt:  { label: "Besetzt",     emoji: "⛔", farbe: "#e11d48", blockiert: true },
  arbeiten: { label: "Am Arbeiten", emoji: "💼", farbe: "#2563eb", blockiert: true },
  arzt:     { label: "Arzttermin",  emoji: "🩺", farbe: "#f59e0b", blockiert: false }, // nur blockierend ohne Uhrzeit
  ferien:   { label: "Ferien",      emoji: "🌴", farbe: "#8b5cf6", blockiert: true },
};

export const MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"];
export const WOCHENTAGE_KURZ = ["M", "D", "M", "D", "F", "S", "S"];
const WOCHENTAGE_LANG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

const pad = (n) => String(n).padStart(2, "0");

export function isoDatum(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function ausIso(s) {
  const [y, m, t] = s.split("-").map(Number);
  return new Date(y, m - 1, t);
}

export function heuteIso() {
  return isoDatum(new Date());
}

export function datumLang(iso) {
  const d = ausIso(iso);
  return `${WOCHENTAGE_LANG[d.getDay()]}, ${d.getDate()}. ${MONATE[d.getMonth()]} ${d.getFullYear()}`;
}

export function datumKurz(iso) {
  const d = ausIso(iso);
  return `${WOCHENTAGE_LANG[d.getDay()].slice(0, 2)} ${d.getDate()}.${d.getMonth() + 1}.`;
}

/** Liegt ein Eintrag auf diesem Tag? (ISO-Strings sind direkt vergleichbar) */
export function betrifftTag(eintrag, iso) {
  return eintrag.start <= iso && iso <= (eintrag.ende || eintrag.start);
}

export function eintraegeAmTag(eintraege, iso) {
  return eintraege
    .filter((e) => betrifftTag(e, iso))
    .sort((a, b) => (a.von || "").localeCompare(b.von || "") || a.name.localeCompare(b.name));
}

function blockiert(eintrag) {
  const s = STATUS[eintrag.status];
  if (!s) return false;
  if (eintrag.status === "arzt") return !eintrag.von; // Arzt ganztags = blockiert
  return s.blockiert;
}

/**
 * Verfügbarkeit eines Tages.
 * Wer keinen blockierenden Eintrag hat, gilt als verfügbar.
 */
export function verfuegbarkeit(personen, eintraege, iso) {
  const amTag = eintraegeAmTag(eintraege, iso);
  const verfuegbar = personen.filter(
    (p) => !amTag.some((e) => e.name === p.name && blockiert(e))
  );
  return { verfuegbar, gesamt: personen.length, eintraege: amTag };
}

/** Monatsraster (Montag als erster Tag), inkl. leerer Felder am Anfang */
export function monatsRaster(jahr, monat) {
  const erster = new Date(jahr, monat, 1);
  const versatz = (erster.getDay() + 6) % 7; // Mo = 0
  const tage = new Date(jahr, monat + 1, 0).getDate();
  const felder = [];
  for (let i = 0; i < versatz; i++) felder.push(null);
  for (let t = 1; t <= tage; t++) felder.push(isoDatum(new Date(jahr, monat, t)));
  while (felder.length % 7) felder.push(null);
  return felder;
}

/** Beste Tage im Monat (ab heute), sortiert nach Anzahl verfügbarer Personen */
export function besteTage(personen, eintraege, jahr, monat, anzahl = 5) {
  if (!personen.length) return [];
  const heute = heuteIso();
  return monatsRaster(jahr, monat)
    .filter((iso) => iso && iso >= heute)
    .map((iso) => ({ iso, ...verfuegbarkeit(personen, eintraege, iso) }))
    .filter((t) => t.verfuegbar.length > 0)
    .sort((a, b) => b.verfuegbar.length - a.verfuegbar.length || a.iso.localeCompare(b.iso))
    .slice(0, anzahl);
}

/** Alle Tage eines Mehrtages-Eintrags */
export function tageZwischen(startIso, endeIso) {
  const out = [];
  const d = ausIso(startIso);
  const e = ausIso(endeIso);
  while (d <= e) { out.push(isoDatum(d)); d.setDate(d.getDate() + 1); }
  return out;
}
