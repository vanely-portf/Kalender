// ------------------------------------------------------------
// Datenspeicher: Firebase Firestore (gemeinsam) oder localStorage (lokal)
// ------------------------------------------------------------
// Datenmodell
//   Person:  { id (= Geräte-ID), name, farbe, geraet: true }
//   Eintrag: { id, name, start: "YYYY-MM-DD", ende: "YYYY-MM-DD",
//              status, von: "HH:MM" | "", bis: "HH:MM" | "", notiz, erstellt }

import { FIREBASE_CONFIG, GRUPPE } from "./config.js";

const FB_VERSION = "10.12.2";
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
  return backend?.art === "firebase";
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

// ---------- Firebase-Modus ----------
function firebaseBackend() {
  let fs, db;
  const pfad = (sammlung) => ["gruppen", GRUPPE, sammlung];
  return {
    art: "firebase",
    async start() {
      const appMod = await import(`https://www.gstatic.com/firebasejs/${FB_VERSION}/firebase-app.js`);
      fs = await import(`https://www.gstatic.com/firebasejs/${FB_VERSION}/firebase-firestore.js`);
      const app = appMod.initializeApp(FIREBASE_CONFIG);
      db = fs.initializeFirestore(app, {
        // Offline nutzbar – auch wenn die App in mehreren Tabs/Fenstern gleichzeitig offen ist
        localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }),
      });
      fs.onSnapshot(fs.collection(db, ...pfad("personen")), { includeMetadataChanges: true }, (snap) => {
        zustand.personen = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        zustand.personenVomServer = !snap.metadata.fromCache;
        melden();
      });
      fs.onSnapshot(fs.collection(db, ...pfad("eintraege")), (snap) => {
        zustand.eintraege = snap.docs.map((d) => d.data());
        melden();
      });
    },
    async personSpeichern(p) {
      await fs.setDoc(fs.doc(db, ...pfad("personen"), p.id), p);
    },
    async eintragSpeichern(e) {
      await fs.setDoc(fs.doc(db, ...pfad("eintraege"), e.id), e);
    },
    async eintragLoeschen(id) {
      await fs.deleteDoc(fs.doc(db, ...pfad("eintraege"), id));
    },
    async antwortSpeichern(id, name, antwort) {
      // Nur das eine Feld ändern, damit gleichzeitige Antworten sich nicht überschreiben
      await fs.updateDoc(fs.doc(db, ...pfad("eintraege"), id), new fs.FieldPath("antworten", name), antwort);
    },
    async personLoeschen(id) {
      await fs.deleteDoc(fs.doc(db, ...pfad("personen"), id));
    },
    // Push-Anmeldung pro Gerät (eigene Sammlung, damit das Profil-Dokument schlank bleibt)
    async pushSpeichern(id, abo) {
      await fs.setDoc(fs.doc(db, ...pfad("push"), id), { abo, aktualisiert: Date.now() });
    },
    async pushLoeschen(id) {
      await fs.deleteDoc(fs.doc(db, ...pfad("push"), id));
    },
  };
}

// ---------- Öffentliche Funktionen ----------
export async function starten() {
  if (FIREBASE_CONFIG) {
    try {
      backend = firebaseBackend();
      await backend.start();
      return;
    } catch (e) {
      console.error("Firebase nicht erreichbar – wechsle in lokalen Modus.", e);
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
