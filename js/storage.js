// ------------------------------------------------------------
// Datenspeicher: Supabase (gemeinsam) oder localStorage (lokal)
// ------------------------------------------------------------
// Datenmodell
//   Person:  { id (= Geräte-ID), name, farbe, geraet: true }
//   Eintrag: { id, name, start: "YYYY-MM-DD", ende: "YYYY-MM-DD",
//              status, von: "HH:MM" | "", bis: "HH:MM" | "", notiz, erstellt }

import { SUPABASE_URL, SUPABASE_ANON_KEY, GRUPPE } from "./config.js";
const LS_KEY = "fk-daten-" + GRUPPE;

let backend = null;
const zustand = { personen: [], eintraege: [], personenVomServer: false };
const zuhoerer = new Set();

function momentaufnahme() {
  return { personen: [...zustand.personen], eintraege: [...zustand.eintraege], vomServer: zustand.personenVomServer };
}

function melden() {
  zuhoerer.forEach((fn) => fn(momentaufnahme()));
}

export function abonnieren(fn) {
  zuhoerer.add(fn);
  fn(momentaufnahme());
  return () => zuhoerer.delete(fn);
}

export function istGemeinsam() {
  return backend?.art === "supabase";
}

function neueId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---------- Lokaler Modus ----------
function lokalLaden() {
  try {
    const d = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    zustand.personen = d.personen || [];
    zustand.eintraege = d.eintraege || [];
  } catch {
    zustand.personen = [];
    zustand.eintraege = [];
  }
}
function lokalSichern() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(zustand));
  } catch (e) {
    console.error(e);
  }
}

const lokal = {
  art: "lokal",
  async start() {
    lokalLaden();
    zustand.personenVomServer = true;
    window.addEventListener("storage", (e) => {
      if (e.key === LS_KEY) { lokalLaden(); melden(); }
    });
    melden();
  },
  async personSpeichern(p) {
    const i = zustand.personen.findIndex((x) => x.id === p.id);
    if (i >= 0) zustand.personen[i] = p; else zustand.personen.push(p);
    lokalSichern(); melden();
  },
  async eintragSpeichern(e) {
    const i = zustand.eintraege.findIndex((x) => x.id === e.id);
    if (i >= 0) zustand.eintraege[i] = e; else zustand.eintraege.push(e);
    lokalSichern(); melden();
  },
  async eintragLoeschen(id) {
    zustand.eintraege = zustand.eintraege.filter((x) => x.id !== id);
    lokalSichern(); melden();
  },
  async antwortSpeichern(id, name, antwort) {
    const e = zustand.eintraege.find((x) => x.id === id);
    if (!e) return;
    e.antworten = { ...(e.antworten || {}), [name]: antwort };
    lokalSichern(); melden();
  },
  async personLoeschen(id) {
    zustand.personen = zustand.personen.filter((x) => x.id !== id);
    lokalSichern(); melden();
  },
  async pushSpeichern() {},
  async pushLoeschen() {},
};

// ---------- Supabase-Modus ----------
// Tabellen: personen, eintraege, push (Einrichtung: supabase/einrichtung.sql)
// Live-Updates über Supabase Realtime; der letzte Stand wird zusätzlich lokal
// zwischengespeichert, damit der Kalender auch ohne Internet sichtbar bleibt.
const CACHE_KEY = "fk-cache-" + GRUPPE;

function zeileZuEintrag(z) {
  return {
    id: z.id, name: z.name, start: z.start, ende: z.ende, status: z.status,
    von: z.von || "", bis: z.bis || "", notiz: z.notiz || "",
    eingeladen: z.eingeladen || [], antworten: z.antworten || {}, erstellt: Number(z.erstellt) || 0,
  };
}
function eintragZuZeile(e) {
  return {
    id: e.id, name: e.name, start: e.start, ende: e.ende || e.start, status: e.status,
    von: e.von || "", bis: e.bis || "", notiz: e.notiz || "",
    eingeladen: e.eingeladen || [], antworten: e.antworten || {}, erstellt: e.erstellt || Date.now(),
  };
}

function supabaseBackend() {
  let sb;
  const pruefen = ({ error }) => { if (error) throw new Error(error.message); };

  function cacheSichern() {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ personen: zustand.personen, eintraege: zustand.eintraege })); } catch {}
  }
  function cacheLaden() {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
      zustand.personen = c.personen || [];
      zustand.eintraege = c.eintraege || [];
    } catch {}
  }

  async function personenLaden() {
    const { data, error } = await sb.from("personen").select("id, name, farbe, geraet");
    if (error) throw new Error(error.message);
    zustand.personen = data;
    zustand.personenVomServer = true;
  }
  async function eintraegeLaden() {
    const { data, error } = await sb.from("eintraege").select("*");
    if (error) throw new Error(error.message);
    zustand.eintraege = data.map(zeileZuEintrag);
  }

  // Mehrere Änderungen kurz hintereinander → nur einmal neu laden
  let timer = null;
  function neuLadenBald(was) {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        if (was !== "eintraege") await personenLaden();
        if (was !== "personen") await eintraegeLaden();
        cacheSichern(); melden();
      } catch (e) { console.warn("Supabase:", e); }
    }, 120);
  }

  return {
    art: "supabase",
    async start() {
      const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
      sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
      cacheLaden();
      melden();
      try {
        await Promise.all([personenLaden(), eintraegeLaden()]);
        cacheSichern();
      } catch (e) {
        // Offline: mit dem zwischengespeicherten Stand weiterarbeiten, sofern vorhanden
        if (!zustand.personen.length && !zustand.eintraege.length) throw e;
        console.warn("Supabase offline – zeige gespeicherten Stand.", e);
      }
      melden();
      sb.channel("friendlender")
        .on("postgres_changes", { event: "*", schema: "public", table: "personen" }, () => neuLadenBald("personen"))
        .on("postgres_changes", { event: "*", schema: "public", table: "eintraege" }, () => neuLadenBald("eintraege"))
        .subscribe((status) => { if (status === "SUBSCRIBED") neuLadenBald("alles"); });
      // Nach dem Aufwachen (Handy entsperrt, App wieder im Vordergrund) frisch laden
      document.addEventListener("visibilitychange", () => { if (!document.hidden) neuLadenBald("alles"); });
      window.addEventListener("online", () => neuLadenBald("alles"));
    },
    async personSpeichern(p) {
      pruefen(await sb.from("personen").upsert({ id: p.id, name: p.name, farbe: p.farbe, geraet: true }));
      neuLadenBald("personen");
    },
    async eintragSpeichern(e) {
      pruefen(await sb.from("eintraege").upsert(eintragZuZeile(e)));
      neuLadenBald("eintraege");
    },
    async eintragLoeschen(id) {
      pruefen(await sb.from("eintraege").delete().eq("id", id));
      neuLadenBald("eintraege");
    },
    async antwortSpeichern(id, name, antwort) {
      // Datenbank-Funktion ändert nur diese eine Antwort → gleichzeitige Antworten überschreiben sich nicht
      pruefen(await sb.rpc("antwort_setzen", { p_id: id, p_name: name, p_antwort: antwort }));
      neuLadenBald("eintraege");
    },
    async personLoeschen(id) {
      pruefen(await sb.from("personen").delete().eq("id", id));
      neuLadenBald("personen");
    },
    async pushSpeichern(id, abo) {
      pruefen(await sb.from("push").upsert({ id, abo, aktualisiert: new Date().toISOString() }));
    },
    async pushLoeschen(id) {
      pruefen(await sb.from("push").delete().eq("id", id));
    },
  };
}

// ---------- Öffentliche Funktionen ----------
export async function starten() {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      backend = supabaseBackend();
      await backend.start();
      return;
    } catch (e) {
      console.error("Supabase nicht erreichbar – wechsle in lokalen Modus.", e);
      zustand.personen = []; zustand.eintraege = [];
    }
  }
  backend = lokal;
  await backend.start();
}

/** Profil speichern. id = Geräte-ID, damit pro Gerät genau ein Profil existiert. */
export async function personSpeichern({ id, name, farbe }) {
  await backend.personSpeichern({ id, name: name.trim(), farbe, geraet: true });
}

export async function personLoeschen(id) {
  await backend.personLoeschen(id);
}

export async function eintragSpeichern(eintrag) {
  const e = { ...eintrag, id: eintrag.id || neueId(), erstellt: eintrag.erstellt || Date.now() };
  await backend.eintragSpeichern(e);
  return e;
}

export async function eintragLoeschen(id) {
  await backend.eintragLoeschen(id);
}

/** Antwort auf eine Einladung: "ja" oder "nein" */
export async function antwortSpeichern(id, name, antwort) {
  await backend.antwortSpeichern(id, name, antwort);
}

/** Push-Anmeldung dieses Geräts speichern bzw. entfernen */
export async function pushSpeichern(id, abo) {
  await backend.pushSpeichern(id, abo);
}
export async function pushLoeschen(id) {
  await backend.pushLoeschen(id);
}
