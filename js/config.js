// ------------------------------------------------------------
// Konfiguration
// ------------------------------------------------------------
// Solange FIREBASE_CONFIG = null ist, läuft die App im LOKALEN MODUS:
// Alle Einträge werden nur auf diesem Gerät gespeichert (zum Testen).
//
// Damit alle Freunde dieselben Daten sehen, trage hier deine
// Firebase-Daten ein (Anleitung: README.md, Abschnitt "Firebase").
//
// Beispiel:
// export const FIREBASE_CONFIG = {
//   apiKey: "AIza...",
//   authDomain: "mein-projekt.firebaseapp.com",
//   projectId: "mein-projekt",
//   storageBucket: "mein-projekt.appspot.com",
//   messagingSenderId: "123456789",
//   appId: "1:123456789:web:abc123"
// };

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCS3EoViYn5o33IJJfqIivEcqcQCTcBTqA",
  authDomain: "friendlender.firebaseapp.com",
  projectId: "friendlender",
  storageBucket: "friendlender.firebasestorage.app",
  messagingSenderId: "826902313364",
  appId: "1:826902313364:web:7957921314c709448a3781"
};

// Name der "Gruppe" – erlaubt mehrere Freundeskreise im selben Firebase-Projekt.
export const GRUPPE = "freundeskreis";

// Öffentlicher Schlüssel für Push-Benachrichtigungen (der geheime Teil liegt nur in Vercel).
export const VAPID_PUBLIC_KEY = "BHRRWUAYkhJbP2XiGkMV46f4Qg3pvfQ-8LopmDQP9QA7HRlLYs9NDkrw4qJcy8-oryYSd608q8EhCOw7RkUAtVI";
