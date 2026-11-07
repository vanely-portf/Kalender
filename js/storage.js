// ------------------------------------------------------------
// Datenspeicher: Firebase Firestore (gemeinsam) oder localStorage (lokal)
// ------------------------------------------------------------
// Datenmodell
//   Person:  { id, name, farbe }
//   Eintrag: { id, name, start: "YYYY-MM-DD", ende: "YYYY-MM-DD",
//              status, von: "HH:MM" | "", bis: "HH:MM" | "", notiz, erstellt }

import { FIREBASE_CONFIG, GRUPPE } from "./config.js";

const FB_VERSION = "10.12.2";
const LS_KEY = "fk-daten-" + GRUPPE;

let backend = null;
const zustand = { personen: [], eintraege: [] };
const zuhoerer = new Set();

function melden() {
  zuhoerer.forEach((fn) => fn({ personen: [...zustand.personen], eintraege: [...zustand.eintraege] }));
}

export function abonnieren(fn) {
  zuhoerer.add(fn);
  fn({ personen: [...zustand.personen], eintraege: [...zustand.eintraege] });
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
        localCache: fs.persistentLocalCache(), // offline nutzbar
      });
      fs.onSnapshot(fs.collection(db, ...pfad("personen")), (snap) => {
        zustand.personen = snap.docs.map((d) => d.data());
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

export async function personSpeichern({ name, farbe }) {
  const id = name.trim().toLowerCase();
  await backend.personSpeichern({ id, name: name.trim(), farbe });
}

export async function eintragSpeichern(eintrag) {
  const e = { ...eintrag, id: eintrag.id || neueId(), erstellt: eintrag.erstellt || Date.now() };
  await backend.eintragSpeichern(e);
  return e;
}

export async function eintragLoeschen(id) {
  await backend.eintragLoeschen(id);
}
