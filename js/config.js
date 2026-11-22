// ------------------------------------------------------------
// Konfiguration
// ------------------------------------------------------------
// Gemeinsame Datenbank: Supabase (Gratis-Tarif).
// Solange SUPABASE_URL leer ist, läuft die App im LOKALEN MODUS:
// Alle Einträge werden nur auf diesem Gerät gespeichert (zum Testen).
//
// Werte findest du in Supabase unter Project Settings → API (bzw. „Connect“):
//   Project URL         → SUPABASE_URL
//   Publishable key     → SUPABASE_ANON_KEY   (öffentlich, darf im Code stehen)
// Den „service_role“- bzw. „secret“-Schlüssel NIE hier eintragen!

export const SUPABASE_URL = "https://hoqnrfnwgyaqmuebqvuc.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_p2tXzmrFIEGvHkJWdEWCWw_f9_C5tUl";

// Name des Freundeskreises (für den lokalen Zwischenspeicher)
export const GRUPPE = "freundeskreis";

// Öffentlicher Schlüssel für Push-Benachrichtigungen (der geheime Teil liegt nur in Vercel).
export const VAPID_PUBLIC_KEY = "BHRRWUAYkhJbP2XiGkMV46f4Qg3pvfQ-8LopmDQP9QA7HRlLYs9NDkrw4qJcy8-oryYSd608q8EhCOw7RkUAtVI";
