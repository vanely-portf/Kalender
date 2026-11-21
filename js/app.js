// ------------------------------------------------------------
// App: Oberfläche, Ereignisse, Formulare, Prüfungen
// ------------------------------------------------------------
import * as daten from "./storage.js";
import {
  STATUS, MONATE, WOCHENTAGE_KURZ, monatsRaster, verfuegbarkeit,
  besteTage, datumLang, datumKurz, heuteIso, ausIso, betrifftTag,
} from "./calendar.js";

const FARBEN = ["#e5484d", "#f97316", "#eab308", "#22a55b", "#14b8a6",
  "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#78716c"];

const $ = (id) => document.getElementById(id);
const PROFIL_KEY = "fk-ich";
const GERAET_KEY = "fk-geraet";
const ADMIN_KEY = "fk-admin";

// Jede Installation/jeder Browser bekommt eine feste Geräte-ID → genau ein Profil pro Gerät
const GERAET_ID = (() => {
  try {
    let id = localStorage.getItem(GERAET_KEY);
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
      localStorage.setItem(GERAET_KEY, id);
    }
    return id;
  } catch { return "geraet-" + Math.random().toString(36).slice(2); }
})();

const app = {
  jahr: new Date().getFullYear(),
  monat: new Date().getMonth(),
  gewaehlt: null,            // ISO-Datum des angeklickten Tags
  personen: [],
  eintraege: [],
  ich: ladeProfil(),         // { name, farbe }
  bearbeiteId: null,
  gewaehlterStatus: "frei",
  eingeladen: new Set(),     // im Formular ausgewählte Freunde
  spaeter: new Set(),        // Einladungen, die "später" entschieden werden
  offeneEinladung: null,     // ID der Einladung im Popup
};

// ---------- Hilfen ----------
function ladeProfil() {
  try {
    const p = JSON.parse(localStorage.getItem(PROFIL_KEY));
    // Profile aus der Version vor "ein Profil pro Gerät" gelten nicht mehr → neu anmelden
    if (p && !p.id) { localStorage.removeItem(PROFIL_KEY); return null; }
    return p;
  } catch { return null; }
}
function profilMerken() {
  try {
    if (app.ich) localStorage.setItem(PROFIL_KEY, JSON.stringify(app.ich));
    else localStorage.removeItem(PROFIL_KEY);
  } catch {}
}
function istAdmin() {
  try { return sessionStorage.getItem(ADMIN_KEY) === "1"; } catch { return false; }
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
  renderTag();
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
  const admin = istAdmin();
  const eingeladen = e.eingeladen || [];
  const antworten = e.antworten || {};
  const ichEingeladen = app.ich && eingeladen.includes(app.ich.name);
  const gaeste = eingeladen.length
    ? `<div class="gaeste">👥 ${eingeladen.map((n) => {
        const a = antworten[n];
        const zeichen = a === "ja" ? "✓" : a === "nein" ? "✗" : "?";
        return `<span class="gast ${a || "offen"}" title="${esc(n)}">${avatar(n, farbeVon(n), "mini-av")}<b>${zeichen}</b></span>`;
      }).join("")}</div>` : "";
  const antwortKnoepfe = ichEingeladen && !antworten[app.ich.name]
    ? `<div class="antwort-zeile">
        <span>📩 Du bist eingeladen!</span>
        <button type="button" class="mini-btn nein" data-antwort="nein" data-id="${e.id}">✗ Absagen</button>
        <button type="button" class="mini-btn ja" data-antwort="ja" data-id="${e.id}">✓ Zusagen</button>
      </div>` : "";
  return `<li class="eintrag ${app.gewaehlt && betrifftTag(e, app.gewaehlt) && mitDatum ? "markiert" : ""}" style="--i:${i}">
    ${avatar(e.name, farbeVon(e.name))}
    <div class="eintrag-text">
      <div class="eintrag-zeile1">
        <strong>${esc(e.name)}</strong>
        <span class="badge" style="--c:${s.farbe}">${s.emoji || ""} ${s.label}</span>
      </div>
      ${e.notiz ? `<div class="eintrag-titel">${esc(e.notiz)}</div>` : ""}
      <div class="eintrag-zeile2">
        ${mitDatum ? `${datumKurz(e.start)} · ` : ""}${zeit}${mehrtaegig}
      </div>
      ${gaeste}${antwortKnoepfe}
    </div>
    ${meins || admin ? `<div class="eintrag-aktionen">
      ${meins ? `<button type="button" class="icon-btn" data-bearbeiten="${e.id}" aria-label="Bearbeiten">✎</button>` : ""}
      <button type="button" class="icon-btn ${meins ? "" : "admin-loeschen"}" data-loeschen="${e.id}" aria-label="Löschen">🗑</button>
    </div>` : ""}
  </li>`;
}

function renderTag() {
  const karte = $("tag-karte");
  if (!app.gewaehlt) { karte.hidden = true; return; }
  karte.hidden = false;
  const v = verfuegbarkeit(app.personen, app.eintraege, app.gewaehlt);
  $("tag-titel").textContent = datumLang(app.gewaehlt);
  const info = $("tages-info");
  info.hidden = v.gesamt === 0;
  const alle = v.gesamt > 0 && v.verfuegbar.length === v.gesamt;
  info.className = "tages-info" + (alle ? " alle" : v.verfuegbar.length / v.gesamt < 0.5 ? " wenige" : "");
  info.innerHTML = `<div class="info-zeile"><strong>${alle ? "🎉 Alle haben Zeit!" : `${v.verfuegbar.length} von ${v.gesamt} verfügbar`}</strong>
    <span class="avatar-reihe">${v.verfuegbar.map((p) => avatar(p.name, p.farbe, "klein")).join("")}</span></div>`;
  $("tag-liste").innerHTML = v.eintraege.length
    ? v.eintraege.map((e, i) => eintragHtml(e, false, i)).join("")
    : `<li class="leer-hinweis"><span class="leer-emoji">🌤️</span>Noch keine Einträge an diesem Tag.<br>Sei die erste Person!</li>`;
}

function renderListe() {
  $("liste-titel").textContent = `Termine im ${MONATE[app.monat]}`;
  const von = `${app.jahr}-${String(app.monat + 1).padStart(2, "0")}-01`;
  const bis = `${app.jahr}-${String(app.monat + 1).padStart(2, "0")}-31`;
  const imMonat = app.eintraege
    .filter((e) => e.start <= bis && (e.ende || e.start) >= von)
    .sort((a, b) => a.start.localeCompare(b.start) || (a.von || "").localeCompare(b.von || ""));
  $("liste").innerHTML = imMonat.length
    ? imMonat.map((e, i) => eintragHtml(e, true, i)).join("")
    : `<li class="leer-hinweis"><span class="leer-emoji">📭</span>Noch keine Einträge in diesem Monat.<br>Tippe auf einen Tag, um etwas einzutragen.</li>`;
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
  const vorhanden = !!app.ich;
  const input = $("profil-input");
  input.value = app.ich?.name || "";
  // Ein Gerät = ein Profil: Name ist fest, nur die Farbe lässt sich ändern
  input.readOnly = vorhanden;
  $("profil-titel").textContent = vorhanden ? "Dein Profil 🎨" : "Wer bist du? 👋";
  $("profil-hinweis").textContent = vorhanden
    ? "Dein Name ist mit diesem Gerät verbunden. Ändern oder löschen kann ihn nur der Admin."
    : "Pro Gerät gibt es ein Profil. Wähle deinen richtigen Namen.";
  const vergebenFarben = new Set(app.personen.filter((p) => p.id !== GERAET_ID).map((p) => p.farbe));
  const aktiv = app.ich?.farbe || FARBEN.find((f) => !vergebenFarben.has(f)) || FARBEN[0];
  $("farb-auswahl").innerHTML = FARBEN.map((f) =>
    `<button type="button" class="farbe ${f === aktiv ? "aktiv" : ""} ${vergebenFarben.has(f) ? "vergeben" : ""}" data-farbe="${f}" style="background:${f}" aria-label="Farbe ${f}"></button>`
  ).join("");
  $("profil-fehler").textContent = "";
  $("profil-abbrechen").hidden = !vorhanden;
  $("profil-dialog").showModal();
}

async function profilSpeichern(ev) {
  ev.preventDefault();
  const neu = !app.ich;
  const name = neu ? $("profil-input").value.trim() : app.ich.name;
  const farbe = $("farb-auswahl").querySelector(".aktiv")?.dataset.farbe;
  const fehler = $("profil-fehler");
  if (!name) return (fehler.textContent = "Bitte gib deinen Namen ein.");
  if (!farbe) return (fehler.textContent = "Bitte wähle eine Farbe.");

  const andere = app.personen.filter((p) => p.id !== GERAET_ID);
  // Alte Profile (vor der Geräte-Version) mit gleichem Namen dürfen übernommen werden
  const gleicherName = andere.find((p) => p.geraet && p.name.toLowerCase() === name.toLowerCase());
  if (neu && gleicherName) {
    return (fehler.textContent = `«${gleicherName.name}» gibt es schon auf einem anderen Gerät. Wähle einen anderen Namen oder bitte den Admin, das alte Profil zu löschen.`);
  }
  const farbeVergeben = andere.find((p) => p.farbe === farbe && p.name.toLowerCase() !== name.toLowerCase());
  if (farbeVergeben) return (fehler.textContent = `Diese Farbe hat schon ${farbeVergeben.name}. Bitte wähle eine andere.`);

  try {
    await daten.personSpeichern({ id: GERAET_ID, name, farbe });
    app.ich = { id: GERAET_ID, name, farbe, bestaetigt: app.ich?.bestaetigt || false };
    profilMerken();
    $("profil-dialog").close();
    toast(neu ? `Willkommen, ${name}! 🎉` : "Farbe gespeichert ✓");
    if (neu) konfetti();
    render();
  } catch (e) {
    console.error(e);
    fehler.textContent = "Speichern fehlgeschlagen. Bitte erneut versuchen.";
  }
}

/** Abgleich des eigenen Profils mit der gemeinsamen Liste */
function profilAbgleichen(personen, vomServer) {
  if (!app.ich || !vomServer) return;
  const meins = personen.find((p) => p.id === app.ich.id);
  if (meins) {
    app.ich.farbe = meins.farbe;
    if (!app.ich.bestaetigt) { app.ich.bestaetigt = true; profilMerken(); }
    // Eigene alte Profil-Einträge (aus der Zeit vor der Geräte-Version) aufräumen
    personen.filter((p) => !p.geraet && p.id !== app.ich.id && p.name === app.ich.name)
      .forEach((p) => daten.personLoeschen(p.id).catch(() => {}));
    return;
  }
  if (app.ich.bestaetigt) {
    // Profil war schon in der Liste und ist jetzt weg → vom Admin gelöscht
    app.ich = null;
    profilMerken();
    toast("Dein Profil wurde vom Admin entfernt.", true);
    if (!$("profil-dialog").open) profilOeffnen();
  } else {
    // Profil aus älterer Version: einmalig in die gemeinsame Liste übernehmen
    daten.personSpeichern(app.ich).catch((e) => console.warn("Profil:", e));
  }
}

// ---------- Admin ----------
async function pinHash(pin) {
  const daten_ = new TextEncoder().encode("freundeskalender:" + pin);
  const h = await crypto.subtle.digest("SHA-256", daten_);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function adminOeffnen() {
  $("admin-fehler").textContent = "";
  $("admin-pin").value = "";
  $("admin-pin2").value = "";
  if (istAdmin()) {
    adminRendern();
    $("admin-gesperrt").hidden = true;
    $("admin-offen").hidden = false;
  } else {
    $("admin-gesperrt").hidden = false;
    $("admin-offen").hidden = true;
    $("admin-text").textContent = "PIN wird geladen…";
    $("admin-dialog").showModal();
    try {
      app.adminPinHash = await daten.einstellungLesen("adminPin");
    } catch (e) {
      console.error(e);
      app.adminPinHash = undefined;
    }
    const ersteMal = !app.adminPinHash;
    $("admin-pin2-feld").hidden = !ersteMal;
    $("admin-text").textContent = ersteMal
      ? "Noch keine Admin-PIN festgelegt. Lege jetzt eine fest (mind. 4 Zeichen) und merke sie dir gut."
      : "Gib die Admin-PIN ein.";
    $("admin-los").textContent = ersteMal ? "PIN festlegen" : "Entsperren";
    setTimeout(() => $("admin-pin").focus(), 50);
    return;
  }
  $("admin-dialog").showModal();
}

async function adminEntsperren(ev) {
  ev.preventDefault();
  const pin = $("admin-pin").value.trim();
  const fehler = $("admin-fehler");
  if (pin.length < 4) return (fehler.textContent = "Die PIN braucht mindestens 4 Zeichen.");
  try {
    const hash = await pinHash(pin);
    if (!app.adminPinHash) {
      if (pin !== $("admin-pin2").value.trim()) return (fehler.textContent = "Die beiden PINs stimmen nicht überein.");
      await daten.einstellungSpeichern("adminPin", hash);
      app.adminPinHash = hash;
      toast("Admin-PIN festgelegt ✓");
    } else if (hash !== app.adminPinHash) {
      $("admin-pin").value = "";
      return (fehler.textContent = "Falsche PIN.");
    }
    sessionStorage.setItem(ADMIN_KEY, "1");
    fehler.textContent = "";
    $("admin-gesperrt").hidden = true;
    $("admin-offen").hidden = false;
    adminRendern();
    render();
  } catch (e) {
    console.error(e);
    fehler.textContent = "Das hat nicht geklappt. Bitte erneut versuchen.";
  }
}

function adminRendern() {
  const heute = heuteIso();
  const personen = [...app.personen].sort((a, b) => a.name.localeCompare(b.name));
  $("admin-personen").innerHTML = personen.length ? personen.map((p) => {
    const anzahl = app.eintraege.filter((e) => e.name === p.name).length;
    const zusatz = [
      p.id === GERAET_ID ? "Du" : "",
      !p.geraet ? "altes Profil" : "",
      personen.filter((x) => x.name === p.name).length > 1 ? "doppelt" : "",
    ].filter(Boolean).join(" · ");
    return `<li class="admin-zeile">
      ${avatar(p.name, p.farbe, "klein")}
      <div class="admin-text"><strong>${esc(p.name)}</strong>
        <span>${anzahl} ${anzahl === 1 ? "Eintrag" : "Einträge"}${zusatz ? " · " + zusatz : ""}</span></div>
      <button type="button" class="mini-btn nein" data-person-loeschen="${esc(p.id)}">Löschen</button>
    </li>`;
  }).join("") : `<li class="leer-hinweis">Keine Profile vorhanden.</li>`;
  const alt = app.eintraege.filter((e) => (e.ende || e.start) < heute).length;
  $("admin-alt").textContent = `🧹 Vergangene Einträge löschen (${alt})`;
  $("admin-alt").disabled = alt === 0;
  $("admin-anzahl").textContent = `${app.personen.length} Profile · ${app.eintraege.length} Einträge`;
}

/** Zweimal tippen zum Bestätigen */
function zweiterKlick(knopf, text = "Sicher?") {
  if (knopf.classList.contains("sicher")) return true;
  const alt = knopf.textContent;
  knopf.classList.add("sicher");
  knopf.textContent = text;
  setTimeout(() => { if (knopf.isConnected) { knopf.classList.remove("sicher"); knopf.textContent = alt; } }, 3000);
  return false;
}

async function personEntfernen(id, knopf) {
  const p = app.personen.find((x) => x.id === id);
  if (!p) return;
  // Einträge nur löschen, wenn es kein weiteres Profil mit gleichem Namen gibt
  const nochEinerMitNamen = app.personen.some((x) => x.id !== id && x.name === p.name);
  const seine = nochEinerMitNamen ? [] : app.eintraege.filter((e) => e.name === p.name);
  if (!zweiterKlick(knopf, seine.length ? `Inkl. ${seine.length} ${seine.length === 1 ? "Eintrag" : "Einträge"}?` : "Sicher?")) return;
  knopf.disabled = true;
  try {
    await daten.personLoeschen(id);
    for (const e of seine) await daten.eintragLoeschen(e.id);
    if (!nochEinerMitNamen) {
      // Aus Einladungen anderer Einträge entfernen
      for (const e of app.eintraege.filter((x) => x.name !== p.name && (x.eingeladen || []).includes(p.name))) {
        const antworten = { ...(e.antworten || {}) };
        delete antworten[p.name];
        await daten.eintragSpeichern({ ...e, eingeladen: e.eingeladen.filter((n) => n !== p.name), antworten });
      }
    }
    toast(`${p.name} gelöscht ✓`);
  } catch (e) {
    console.error(e);
    toast("Löschen fehlgeschlagen.", true);
  }
}

async function vergangeneLoeschen(knopf) {
  const heute = heuteIso();
  const alt = app.eintraege.filter((e) => (e.ende || e.start) < heute);
  if (!alt.length || !zweiterKlick(knopf, `Wirklich ${alt.length} löschen?`)) return;
  knopf.disabled = true;
  try {
    for (const e of alt) await daten.eintragLoeschen(e.id);
    toast(`${alt.length} alte Einträge gelöscht ✓`);
  } catch (e) {
    console.error(e);
    toast("Löschen fehlgeschlagen.", true);
  }
}

function adminBeenden() {
  try { sessionStorage.removeItem(ADMIN_KEY); } catch {}
  $("admin-dialog").close();
  toast("Admin-Modus beendet");
  render();
}

// ---------- Eintrag ----------
function statusChipsRendern() {
  $("status-auswahl").innerHTML = Object.entries(STATUS).map(([key, s]) =>
    `<button type="button" class="status-chip ${key === app.gewaehlterStatus ? "aktiv" : ""}"
      data-status="${key}" style="--c:${s.farbe}"><span>${s.emoji}</span> ${s.label}</button>`
  ).join("");
}

function freundeChipsRendern() {
  const andere = app.personen.filter((p) => p.name !== app.ich?.name)
    .sort((a, b) => a.name.localeCompare(b.name));
  $("einladen-feld").hidden = false;
  if (!andere.length) {
    $("freunde-auswahl").innerHTML = `<p class="klein-hinweis">Noch keine Freunde in der App. Lade sie unten bei der Legende ein.</p>`;
    return;
  }
  const alleGewaehlt = andere.every((p) => app.eingeladen.has(p.name));
  $("freunde-auswahl").innerHTML =
    `<button type="button" class="freund-chip alle-chip ${alleGewaehlt ? "aktiv" : ""}" data-alle="1">Alle</button>` +
    andere.map((p) => `<button type="button" class="freund-chip ${app.eingeladen.has(p.name) ? "aktiv" : ""}"
      data-freund="${esc(p.name)}" style="--p:${p.farbe}">${avatar(p.name, p.farbe, "mini-av")} ${esc(p.name)}</button>`).join("");
}

function eintragOeffnen(iso, eintrag = null) {
  if (!app.ich) return profilOeffnen();
  app.bearbeiteId = eintrag?.id || null;
  app.gewaehlterStatus = eintrag?.status || "frei";
  const start = eintrag?.start || iso;
  $("eintrag-dialog").dataset.start = start;
  $("titel").value = eintrag?.notiz || "";
  $("titel").placeholder = eintrag ? "Eintrag bearbeiten" : "Neuer Eintrag";
  $("eintrag-datum").textContent = datumLang(start);
  app.eingeladen = new Set(eintrag?.eingeladen || []);
  freundeChipsRendern();
  $("von").value = eintrag?.von || "";
  $("bis").value = eintrag?.bis || "";
  $("ende").value = eintrag?.ende && eintrag.ende !== eintrag.start ? eintrag.ende : "";
  $("ende").min = start;
  $("eintrag-fehler").textContent = "";
  statusChipsRendern();
  $("eintrag-dialog").showModal();
  if (!eintrag) setTimeout(() => $("titel").focus(), 50);
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
  const eingeladen = [...app.eingeladen];
  // Bisherige Antworten behalten, aber nur von Personen, die noch eingeladen sind
  const antworten = Object.fromEntries(
    Object.entries(alt?.antworten || {}).filter(([n]) => eingeladen.includes(n))
  );
  try {
    await daten.eintragSpeichern({
      id: app.bearbeiteId || undefined,
      erstellt: alt?.erstellt,
      name: app.ich.name,
      start, ende,
      status: app.gewaehlterStatus,
      von, bis,
      notiz: $("titel").value.trim(),
      eingeladen,
      antworten,
    });
    $("eintrag-dialog").close();
    toast(eingeladen.length ? `Gespeichert ✓ ${eingeladen.length} eingeladen` : "Gespeichert ✓");
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

// ---------- Einladungen ----------
function offeneEinladungen() {
  if (!app.ich) return [];
  const heute = heuteIso();
  return app.eintraege
    .filter((e) => (e.eingeladen || []).includes(app.ich.name))
    .filter((e) => !(e.antworten || {})[app.ich.name])
    .filter((e) => (e.ende || e.start) >= heute)
    .sort((a, b) => a.start.localeCompare(b.start));
}

function einladungPruefen() {
  const dlg = $("einladung-dialog");
  if (dlg.open || $("eintrag-dialog").open || $("profil-dialog").open || $("admin-dialog").open) return;
  const e = offeneEinladungen().find((x) => !app.spaeter.has(x.id));
  if (!e) return;
  app.offeneEinladung = e.id;
  const s = STATUS[e.status] || { emoji: "", label: "" };
  const zeit = e.von ? `${e.von}${e.bis ? "–" + e.bis : ""} Uhr` : "ganztags";
  const andere = (e.eingeladen || []).filter((n) => n !== app.ich.name);
  $("einladung-titel").textContent = `${e.name} lädt dich ein!`;
  $("einladung-text").innerHTML = `
    <div class="einladung-karte">
      ${avatar(e.name, farbeVon(e.name))}
      <div>
        <strong>${esc(e.notiz || s.label || "Treffen")}</strong>
        <div>${s.emoji} ${datumLang(e.start)}</div>
        <div>🕒 ${zeit}</div>
      </div>
    </div>
    ${andere.length ? `<p class="klein-hinweis">Auch eingeladen: ${andere.map(esc).join(", ")}</p>` : ""}`;
  dlg.showModal();
}

async function antworten(id, antwort) {
  try {
    await daten.antwortSpeichern(id, app.ich.name, antwort);
    if (antwort === "ja") { toast("Zugesagt 🎉"); konfetti(); }
    else toast("Abgesagt");
  } catch (e) {
    console.error(e);
    toast("Antwort konnte nicht gespeichert werden.", true);
  }
}

async function appTeilen() {
  const url = location.href.split("#")[0];
  const text = "Plan mit uns im Freundeskalender! Trag ein, wann du Zeit hast 📅";
  if (navigator.share) {
    try { await navigator.share({ title: "Freundeskalender", text, url }); return; }
    catch (e) { if (e.name === "AbortError") return; }
  }
  $("link-feld").value = url;
  $("link-dialog").showModal();
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
  if (app.gewaehlt) $("tag-karte").scrollIntoView({ behavior: "smooth", block: "start" });
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
  $("tag-schliessen").onclick = () => { app.gewaehlt = null; render(); };
  $("neu-btn").onclick = () => eintragOeffnen(app.gewaehlt);
  const listenKlick = (e) => {
    const bearb = e.target.closest("[data-bearbeiten]");
    const loe = e.target.closest("[data-loeschen]");
    const antw = e.target.closest("[data-antwort]");
    if (bearb) eintragOeffnen(null, app.eintraege.find((x) => x.id === bearb.dataset.bearbeiten));
    if (loe) eintragLoeschen(loe.dataset.loeschen, loe);
    if (antw) antworten(antw.dataset.id, antw.dataset.antwort);
  };
  $("liste").onclick = listenKlick;
  $("tag-liste").onclick = listenKlick;

  // Einladungen
  $("freunde-auswahl").onclick = (e) => {
    const b = e.target.closest("[data-freund], [data-alle]");
    if (!b) return;
    const andere = app.personen.filter((p) => p.name !== app.ich?.name).map((p) => p.name);
    if (b.dataset.alle) {
      const alle = andere.every((n) => app.eingeladen.has(n));
      app.eingeladen = new Set(alle ? [] : andere);
    } else {
      const n = b.dataset.freund;
      app.eingeladen.has(n) ? app.eingeladen.delete(n) : app.eingeladen.add(n);
    }
    // Wer Freunde einlädt, plant meist ein Treffen
    if (app.eingeladen.size && app.gewaehlterStatus === "frei") {
      app.gewaehlterStatus = "treffen";
      statusChipsRendern();
    }
    freundeChipsRendern();
  };
  $("einladung-ja").onclick = () => { $("einladung-dialog").close(); antworten(app.offeneEinladung, "ja"); };
  $("einladung-nein").onclick = () => { $("einladung-dialog").close(); antworten(app.offeneEinladung, "nein"); };
  $("einladung-spaeter").onclick = () => {
    app.spaeter.add(app.offeneEinladung);
    $("einladung-dialog").close();
    setTimeout(einladungPruefen, 300);
  };
  $("einladung-dialog").addEventListener("cancel", () => app.spaeter.add(app.offeneEinladung));
  $("einladen-btn").onclick = appTeilen;
  $("link-zu").onclick = () => $("link-dialog").close();
  $("link-kopieren").onclick = async () => {
    const f = $("link-feld");
    try { await navigator.clipboard.writeText(f.value); toast("Link kopiert ✓"); $("link-dialog").close(); }
    catch { f.select(); toast("Bitte Link markieren und kopieren"); }
  };

  // Profil
  $("profil-btn").onclick = profilOeffnen;
  $("admin-btn").onclick = adminOeffnen;
  $("admin-gesperrt").onsubmit = adminEntsperren;
  $("admin-zu").onclick = () => $("admin-dialog").close();
  $("admin-zu2").onclick = () => $("admin-dialog").close();
  $("admin-beenden").onclick = adminBeenden;
  $("admin-alt").onclick = (e) => vergangeneLoeschen(e.currentTarget);
  $("admin-personen").onclick = (e) => {
    const b = e.target.closest("[data-person-loeschen]");
    if (b) personEntfernen(b.dataset.personLoeschen, b);
  };
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

  daten.abonnieren(({ personen, eintraege, vomServer }) => {
    app.personen = personen;
    app.eintraege = eintraege;
    profilAbgleichen(personen, vomServer);
    render();
    if ($("admin-dialog").open && istAdmin()) adminRendern();
    einladungPruefen();
  });
  ["eintrag-dialog", "profil-dialog"].forEach((id) =>
    $(id).addEventListener("close", () => setTimeout(einladungPruefen, 400)));

  if (!app.ich) profilOeffnen();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch((e) => console.warn("SW:", e));
  }
}

start();
