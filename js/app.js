// ------------------------------------------------------------
// App: Oberfläche, Ereignisse, Formulare, Prüfungen
// ------------------------------------------------------------
import * as daten from "./storage.js";
import {
  STATUS, MONATE, WOCHENTAGE_KURZ, monatsRaster, verfuegbarkeit,
  besteTage, datumLang, datumKurz, heuteIso, ausIso,
} from "./calendar.js";

const FARBEN = ["#e5484d", "#f97316", "#eab308", "#22a55b", "#14b8a6",
  "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#78716c"];

const $ = (id) => document.getElementById(id);
const PROFIL_KEY = "fk-ich";

const app = {
  jahr: new Date().getFullYear(),
  monat: new Date().getMonth(),
  gewaehlt: null,            // ISO-Datum des angeklickten Tags
  personen: [],
  eintraege: [],
  ich: ladeProfil(),         // { name, farbe }
  bearbeiteId: null,
  gewaehlterStatus: "frei",
};

// ---------- Hilfen ----------
function ladeProfil() {
  try { return JSON.parse(localStorage.getItem(PROFIL_KEY)); } catch { return null; }
}
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function farbeVon(name) {
  return app.personen.find((p) => p.name === name)?.farbe || "#999";
}
function initialen(name) {
  return String(name || "?").trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
function avatar(name, farbe, klasse = "") {
  return `<span class="avatar ${klasse}" style="--p:${farbe}">${esc(initialen(name))}</span>`;
}
function konfetti() {
  const box = $("konfetti");
  const teile = ["🎉", "✨", "🎈", "💚", "⭐"];
  box.innerHTML = Array.from({ length: 14 }, (_, i) => {
    const w = (i / 14) * Math.PI * 2;
    const r = 90 + Math.random() * 70;
    return `<span style="--x:${Math.cos(w) * r}px;--y:${Math.sin(w) * r - 60}px;--d:${Math.random() * 120}ms">${teile[i % teile.length]}</span>`;
  }).join("");
  box.classList.remove("los"); void box.offsetWidth; box.classList.add("los");
}
let toastTimer;
function toast(text, fehler = false) {
  const t = $("toast");
  t.textContent = text;
  t.className = "toast sichtbar" + (fehler ? " fehler-toast" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = "toast"), 2200);
}

// ---------- Rendering ----------
function render() {
  renderKopf();
  renderRaster();
  renderListe();
  renderBeste();
  renderLegende();
}

function renderKopf() {
  $("jahr").textContent = app.jahr;
  $("monat").textContent = MONATE[app.monat];
  const p = $("profil-punkt");
  const stunde = new Date().getHours();
  const tageszeit = stunde < 11 ? "Guten Morgen" : stunde < 18 ? "Hallo" : "Guten Abend";
  if (app.ich) {
    $("profil-name").textContent = app.ich.name;
    p.style.setProperty("--p", app.ich.farbe);
    p.textContent = initialen(app.ich.name);
    p.hidden = false;
    $("gruss").textContent = `${tageszeit}, ${app.ich.name}! 👋`;
  } else {
    $("profil-name").textContent = "Name eingeben";
    p.hidden = true;
    $("gruss").textContent = `${tageszeit}! 👋`;
  }
  const n = app.personen.length;
  $("gruss-unter").textContent = n
    ? `${n} ${n === 1 ? "Person plant" : "Personen planen"} mit – findet euren Tag!`
    : "Wann habt ihr alle Zeit?";
}

function renderRaster() {
  const heute = heuteIso();
  const html = monatsRaster(app.jahr, app.monat).map((iso) => {
    if (!iso) return `<div class="tag leer"></div>`;
    const v = verfuegbarkeit(app.personen, app.eintraege, iso);
    let stufe = "";
    if (v.gesamt > 0 && v.eintraege.length > 0) {
      const anteil = v.verfuegbar.length / v.gesamt;
      stufe = anteil === 1 ? "alle" : anteil >= 0.5 ? "viele" : "wenige";
    }
    const namen = [...new Set(v.eintraege.map((e) => e.name))];
    const punkte = namen.slice(0, 4)
      .map((n) => `<i style="background:${farbeVon(n)}"></i>`).join("")
      + (namen.length > 4 ? `<b>+</b>` : "");
    const klassen = ["tag", stufe,
      iso === heute ? "heute" : "",
      iso === app.gewaehlt ? "gewaehlt" : "",
      iso < heute ? "vergangen" : ""].join(" ");
    return `<button type="button" class="${klassen}" data-iso="${iso}" aria-label="${datumLang(iso)}">
      <span class="nr">${ausIso(iso).getDate()}</span>
      <span class="punkte">${punkte}</span>
    </button>`;
  }).join("");
  $("raster").innerHTML = html;
}

function eintragHtml(e, mitDatum, i = 0) {
  const s = STATUS[e.status] || { label: e.status, farbe: "#999" };
  const zeit = e.von ? `${e.von}${e.bis ? "–" + e.bis : ""}` : "ganztags";
  const mehrtaegig = e.ende && e.ende !== e.start
    ? ` · ${datumKurz(e.start)} – ${datumKurz(e.ende)}` : "";
  const meins = app.ich && e.name === app.ich.name;
  return `<li class="eintrag" style="--i:${i}">
    ${avatar(e.name, farbeVon(e.name))}
    <div class="eintrag-text">
      <div class="eintrag-zeile1">
        <strong>${esc(e.name)}</strong>
        <span class="badge" style="--c:${s.farbe}">${s.emoji || ""} ${s.label}</span>
      </div>
      <div class="eintrag-zeile2">
        ${mitDatum ? `${datumKurz(e.start)} · ` : ""}${zeit}${mehrtaegig}
        ${e.notiz ? `<br><em>${esc(e.notiz)}</em>` : ""}
      </div>
    </div>
    ${meins ? `<div class="eintrag-aktionen">
      <button type="button" class="icon-btn" data-bearbeiten="${e.id}" aria-label="Bearbeiten">✎</button>
      <button type="button" class="icon-btn" data-loeschen="${e.id}" aria-label="Löschen">🗑</button>
    </div>` : ""}
  </li>`;
}

function renderListe() {
  const liste = $("liste");
  if (app.gewaehlt) {
    const v = verfuegbarkeit(app.personen, app.eintraege, app.gewaehlt);
    $("liste-titel").textContent = datumLang(app.gewaehlt);
    $("alle-btn").hidden = false;
    $("neu-btn").hidden = false;
    const info = $("tages-info");
    info.hidden = v.gesamt === 0;
    const alle = v.gesamt > 0 && v.verfuegbar.length === v.gesamt;
    info.className = "tages-info" + (alle ? " alle" : v.verfuegbar.length / v.gesamt < 0.5 ? " wenige" : "");
    info.innerHTML = `<div class="info-zeile"><strong>${alle ? "🎉 Alle haben Zeit!" : `${v.verfuegbar.length} von ${v.gesamt} verfügbar`}</strong>
      <span class="avatar-reihe">${v.verfuegbar.map((p) => avatar(p.name, p.farbe, "klein")).join("")}</span></div>`;
    liste.innerHTML = v.eintraege.length
      ? v.eintraege.map((e, i) => eintragHtml(e, false, i)).join("")
      : `<li class="leer-hinweis"><span class="leer-emoji">🌤️</span>Noch keine Einträge an diesem Tag.<br>Sei die erste Person!</li>`;
  } else {
    $("liste-titel").textContent = `Termine im ${MONATE[app.monat]}`;
    $("alle-btn").hidden = true;
    $("neu-btn").hidden = true;
    $("tages-info").hidden = true;
    const von = `${app.jahr}-${String(app.monat + 1).padStart(2, "0")}-01`;
    const bis = `${app.jahr}-${String(app.monat + 1).padStart(2, "0")}-31`;
    const imMonat = app.eintraege
      .filter((e) => e.start <= bis && (e.ende || e.start) >= von)
      .sort((a, b) => a.start.localeCompare(b.start) || (a.von || "").localeCompare(b.von || ""));
    liste.innerHTML = imMonat.length
      ? imMonat.map((e, i) => eintragHtml(e, true, i)).join("")
      : `<li class="leer-hinweis"><span class="leer-emoji">📭</span>Noch keine Einträge in diesem Monat.<br>Tippe auf einen Tag, um etwas einzutragen.</li>`;
  }
}

function renderBeste() {
  const tage = besteTage(app.personen, app.eintraege, app.jahr, app.monat);
  $("beste").innerHTML = tage.length
    ? tage.map((t, i) => {
        const anteil = Math.round((t.verfuegbar.length / t.gesamt) * 100);
        const medaille = ["🥇", "🥈", "🥉"][i] || "📌";
        return `<li style="--i:${i}"><button type="button" class="beste-tag" data-iso="${t.iso}">
          <span class="medaille">${medaille}</span>
          <span class="beste-text">
            <span class="beste-datum">${datumLang(t.iso)}</span>
            <span class="balken"><i style="width:${anteil}%"></i></span>
          </span>
          <span class="zahl ${anteil === 100 ? "voll" : ""}">${t.verfuegbar.length}/${t.gesamt}</span>
        </button></li>`;
      }).join("")
    : `<li class="leer-hinweis"><span class="leer-emoji">🔍</span>Sobald Personen eingetragen sind, erscheinen hier die besten Tage.</li>`;
}

function renderLegende() {
  $("legende-personen").innerHTML = app.personen.length
    ? [...app.personen].sort((a, b) => a.name.localeCompare(b.name))
        .map((p) => `<li class="person-pill" style="--p:${p.farbe}">${avatar(p.name, p.farbe, "klein")}${esc(p.name)}</li>`).join("")
    : `<li class="leer-hinweis">Noch niemand eingetragen.</li>`;
  $("legende-status").innerHTML = Object.values(STATUS)
    .map((s) => `<li><span class="badge" style="--c:${s.farbe}">${s.emoji} ${s.label}</span></li>`).join("");
}

// ---------- Profil ----------
function profilOeffnen() {
  $("profil-input").value = app.ich?.name || "";
  const aktiv = app.ich?.farbe || FARBEN[app.personen.length % FARBEN.length];
  $("farb-auswahl").innerHTML = FARBEN.map((f) =>
    `<button type="button" class="farbe ${f === aktiv ? "aktiv" : ""}" data-farbe="${f}" style="background:${f}" aria-label="Farbe ${f}"></button>`
  ).join("");
  $("profil-fehler").textContent = "";
  $("profil-abbrechen").hidden = !app.ich;
  $("profil-dialog").showModal();
}

async function profilSpeichern(ev) {
  ev.preventDefault();
  const name = $("profil-input").value.trim();
  const farbe = $("farb-auswahl").querySelector(".aktiv")?.dataset.farbe;
  if (!name) return ($("profil-fehler").textContent = "Bitte gib deinen Namen ein.");
  if (!farbe) return ($("profil-fehler").textContent = "Bitte wähle eine Farbe.");
  const vergeben = app.personen.find((p) => p.farbe === farbe && p.name !== name);
  if (vergeben) return ($("profil-fehler").textContent = `Diese Farbe hat schon ${vergeben.name}. Bitte wähle eine andere.`);
  try {
    await daten.personSpeichern({ name, farbe });
    app.ich = { name, farbe };
    localStorage.setItem(PROFIL_KEY, JSON.stringify(app.ich));
    $("profil-dialog").close();
    toast(`Willkommen, ${name}! 🎉`);
    konfetti();
    render();
  } catch (e) {
    console.error(e);
    $("profil-fehler").textContent = "Speichern fehlgeschlagen. Bitte erneut versuchen.";
  }
}

// ---------- Eintrag ----------
function statusChipsRendern() {
  $("status-auswahl").innerHTML = Object.entries(STATUS).map(([key, s]) =>
    `<button type="button" class="status-chip ${key === app.gewaehlterStatus ? "aktiv" : ""}"
      data-status="${key}" style="--c:${s.farbe}"><span>${s.emoji}</span> ${s.label}</button>`
  ).join("");
}

function eintragOeffnen(iso, eintrag = null) {
  if (!app.ich) return profilOeffnen();
  app.bearbeiteId = eintrag?.id || null;
  app.gewaehlterStatus = eintrag?.status || "frei";
  const start = eintrag?.start || iso;
  $("eintrag-dialog").dataset.start = start;
  $("eintrag-titel").textContent = eintrag ? "Eintrag bearbeiten" : "Neuer Eintrag";
  $("eintrag-datum").textContent = datumLang(start);
  $("von").value = eintrag?.von || "";
  $("bis").value = eintrag?.bis || "";
  $("ende").value = eintrag?.ende && eintrag.ende !== eintrag.start ? eintrag.ende : "";
  $("ende").min = start;
  $("notiz").value = eintrag?.notiz || "";
  $("eintrag-fehler").textContent = "";
  statusChipsRendern();
  $("eintrag-dialog").showModal();
}

async function eintragSpeichern(ev) {
  ev.preventDefault();
  const start = $("eintrag-dialog").dataset.start;
  const von = $("von").value;
  const bis = $("bis").value;
  const ende = $("ende").value || start;
  const fehler = $("eintrag-fehler");

  if (!STATUS[app.gewaehlterStatus]) return (fehler.textContent = "Bitte wähle einen Status.");
  if (bis && !von) return (fehler.textContent = "Bitte gib auch eine Von-Zeit ein.");
  if (von && bis && von >= bis) return (fehler.textContent = "Die Von-Zeit muss vor der Bis-Zeit liegen.");
  if (ende < start) return (fehler.textContent = "Das Bis-Datum darf nicht vor dem Starttag liegen.");

  const alt = app.eintraege.find((e) => e.id === app.bearbeiteId);
  try {
    await daten.eintragSpeichern({
      id: app.bearbeiteId || undefined,
      erstellt: alt?.erstellt,
      name: app.ich.name,
      start, ende,
      status: app.gewaehlterStatus,
      von, bis,
      notiz: $("notiz").value.trim(),
    });
    $("eintrag-dialog").close();
    toast("Gespeichert ✓");
    konfetti();
  } catch (e) {
    console.error(e);
    fehler.textContent = "Speichern fehlgeschlagen. Bitte erneut versuchen.";
  }
}

async function eintragLoeschen(id, knopf) {
  // Zweimal tippen statt Browser-Popup: erst "Sicher?", dann löschen
  if (!knopf.classList.contains("sicher")) {
    knopf.classList.add("sicher");
    knopf.textContent = "Sicher?";
    setTimeout(() => { knopf.classList.remove("sicher"); knopf.textContent = "🗑"; }, 3000);
    return;
  }
  try {
    await daten.eintragLoeschen(id);
    toast("Gelöscht ✓");
  } catch (e) {
    console.error(e);
    toast("Löschen fehlgeschlagen.", true);
  }
}

// ---------- Ereignisse ----------
function monatWechseln(delta) {
  const d = new Date(app.jahr, app.monat + delta, 1);
  app.jahr = d.getFullYear();
  app.monat = d.getMonth();
  app.gewaehlt = null;
  render();
  const r = $("raster");
  r.classList.remove("rein-links", "rein-rechts"); void r.offsetWidth;
  r.classList.add(delta > 0 ? "rein-rechts" : "rein-links");
}

function tagWaehlen(iso) {
  const d = ausIso(iso);
  app.jahr = d.getFullYear();
  app.monat = d.getMonth();
  app.gewaehlt = app.gewaehlt === iso ? null : iso;
  render();
  if (app.gewaehlt) $("liste-titel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function ereignisse() {
  $("wochentage").innerHTML = WOCHENTAGE_KURZ.map((w) => `<span>${w}</span>`).join("");
  $("zurueck").onclick = () => monatWechseln(-1);
  $("vor").onclick = () => monatWechseln(1);
  // Wischen auf dem Kalender wechselt den Monat
  let startX = null, startY = null;
  const karte = $("kalender-karte");
  karte.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }, { passive: true });
  karte.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) monatWechseln(dx < 0 ? 1 : -1);
    startX = null;
  });
  $("raster").onclick = (e) => {
    const b = e.target.closest("[data-iso]");
    if (b) tagWaehlen(b.dataset.iso);
  };
  $("beste").onclick = (e) => {
    const b = e.target.closest("[data-iso]");
    if (b) tagWaehlen(b.dataset.iso);
  };
  $("alle-btn").onclick = () => { app.gewaehlt = null; render(); };
  $("neu-btn").onclick = () => eintragOeffnen(app.gewaehlt);
  $("liste").onclick = (e) => {
    const bearb = e.target.closest("[data-bearbeiten]");
    const loe = e.target.closest("[data-loeschen]");
    if (bearb) eintragOeffnen(null, app.eintraege.find((x) => x.id === bearb.dataset.bearbeiten));
    if (loe) eintragLoeschen(loe.dataset.loeschen, loe);
  };

  // Profil
  $("profil-btn").onclick = profilOeffnen;
  $("profil-form").onsubmit = profilSpeichern;
  $("profil-abbrechen").onclick = () => $("profil-dialog").close();
  $("profil-dialog").addEventListener("cancel", (e) => { if (!app.ich) e.preventDefault(); });
  $("farb-auswahl").onclick = (e) => {
    const b = e.target.closest("[data-farbe]");
    if (!b) return;
    $("farb-auswahl").querySelectorAll(".farbe").forEach((x) => x.classList.remove("aktiv"));
    b.classList.add("aktiv");
  };

  // Eintrag
  $("eintrag-form").onsubmit = eintragSpeichern;
  $("eintrag-abbrechen").onclick = () => $("eintrag-dialog").close();
  $("status-auswahl").onclick = (e) => {
    const b = e.target.closest("[data-status]");
    if (!b) return;
    app.gewaehlterStatus = b.dataset.status;
    statusChipsRendern();
  };
  ["von", "bis", "ende"].forEach((id) => $(id).addEventListener("input", () => ($("eintrag-fehler").textContent = "")));
}

// ---------- Start ----------
async function start() {
  ereignisse();
  render();
  await daten.starten();

  const h = $("modus-hinweis");
  if (!daten.istGemeinsam()) {
    h.hidden = false;
    h.textContent = "Lokaler Testmodus: Einträge werden nur auf diesem Gerät gespeichert. Für den gemeinsamen Kalender Firebase in js/config.js eintragen.";
  }

  daten.abonnieren(({ personen, eintraege }) => {
    app.personen = personen;
    app.eintraege = eintraege;
    // Eigene Farbe aus der gemeinsamen Liste übernehmen
    if (app.ich) {
      const p = personen.find((x) => x.name === app.ich.name);
      if (p) app.ich.farbe = p.farbe;
    }
    render();
  });

  if (!app.ich) profilOeffnen();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch((e) => console.warn("SW:", e));
  }
}

start();
