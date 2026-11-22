// ------------------------------------------------------------
// Hält die Supabase-Datenbank wach (Vercel Cron, 1× täglich, gratis)
// ------------------------------------------------------------
// Supabase pausiert Gratis-Projekte nach einer Woche ohne Aktivität.
// Diese kleine Abfrage zählt als Aktivität – so bleibt der Kalender immer erreichbar.
const { SUPABASE_URL, SUPABASE_ANON_KEY } = require("./_supabase.js");

module.exports = async (req, res) => {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/personen?select=id&limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok, zeit: new Date().toISOString() });
  } catch (e) {
    return res.status(502).json({ ok: false, fehler: String(e) });
  }
};
