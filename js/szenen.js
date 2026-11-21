// ------------------------------------------------------------
// Kleine Header-Animationen pro Design.
// Jede Szene läuft einmal ab (ca. 6–10 s) und startet alle 20 s neu.
// Das Aussehen und der Ablauf stehen in css/style.css unter "Header-Szenen".
// ------------------------------------------------------------

const zufall = (min, max) => (min + Math.random() * (max - min)).toFixed(2);

// ---------- Bausteine ----------
const vogel = (farbe) => `
  <svg viewBox="0 0 40 24" aria-hidden="true">
    <path class="fluegel" d="M20 12C14 3 7 2 2 6c6 0 12 3 18 6z" fill="${farbe}"/>
    <path class="fluegel" d="M20 12C26 3 33 2 38 6c-6 0-12 3-18 6z" fill="${farbe}"/>
    <ellipse cx="20" cy="13" rx="4.2" ry="2.6" fill="${farbe}"/>
    <path d="M23.8 12.4l3 .6-3 .9z" fill="#EBD9AD"/>
  </svg>`;

const fledermaus = `
  <svg viewBox="0 0 40 24" aria-hidden="true">
    <path class="fluegel" d="M18.5 12C14 5 8 4.5 2 8c3 1 4.2 4 4 6.5 2-2 4.3-2 6 0 1.2-2 3.6-2.6 6.5-1.5z" fill="#0A070D"/>
    <path class="fluegel" d="M21.5 12C26 5 32 4.5 38 8c-3 1-4.2 4-4 6.5-2-2-4.3-2-6 0-1.2-2-3.6-2.6-6.5-1.5z" fill="#0A070D"/>
    <ellipse cx="20" cy="13" rx="2.8" ry="3.8" fill="#0A070D"/>
    <path d="M18.3 9.8l.6-2.8 1.3 2.2zM21.7 9.8l-.6-2.8-1.3 2.2z" fill="#0A070D"/>
    <circle cx="19.1" cy="11.6" r=".45" fill="#C79BD6"/><circle cx="20.9" cy="11.6" r=".45" fill="#C79BD6"/>
  </svg>`;

const schmetterling = `
  <svg viewBox="0 0 40 30" aria-hidden="true">
    <defs><linearGradient id="sz-fg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FBCFE8"/><stop offset=".5" stop-color="#C4B5FD"/><stop offset="1" stop-color="#A5F3FC"/></linearGradient></defs>
    <g class="fluegel">
      <path d="M19.5 15C16 5 6 3 4.5 9c-1 5 6 7.5 15 6z" fill="url(#sz-fg)" stroke="#fff" stroke-width=".6"/>
      <path d="M19.5 16c-6 1-10 5-8 8 2 2.5 6.5 0 8-8z" fill="url(#sz-fg)" opacity=".85"/>
    </g>
    <g class="fluegel">
      <path d="M20.5 15C24 5 34 3 35.5 9c1 5-6 7.5-15 6z" fill="url(#sz-fg)" stroke="#fff" stroke-width=".6"/>
      <path d="M20.5 16c6 1 10 5 8 8-2 2.5-6.5 0-8-8z" fill="url(#sz-fg)" opacity=".85"/>
    </g>
    <path d="M20 10v13" stroke="#6B4FA0" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`;

const funkeln = (farbe) => `<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5 0l1.1 3.9L10 5 6.1 6.1 5 10 3.9 6.1 0 5l3.9-1.1z" fill="${farbe}"/></svg>`;

const blatt = (farbe) => `<svg viewBox="0 0 12 14" aria-hidden="true"><path d="M6 .5C10 4 11 8.5 6 13.5 1 8.5 2 4 6 .5z" fill="${farbe}"/><path d="M6 2.5v9" stroke="rgba(0,0,0,.15)" stroke-width=".7"/></svg>`;

const hase = `
  <svg viewBox="0 0 48 40" aria-hidden="true">
    <ellipse cx="22" cy="28" rx="13" ry="9" fill="#FFFCF6" stroke="#E8D8CC" stroke-width=".8"/>
    <circle cx="35.5" cy="25.5" r="3.2" fill="#FFFCF6" stroke="#E8D8CC" stroke-width=".8"/>
    <g class="kopf">
      <ellipse cx="12" cy="10" rx="2.6" ry="8" fill="#FFFCF6" stroke="#E8D8CC" stroke-width=".8" transform="rotate(-12 12 10)"/>
      <ellipse cx="12" cy="10" rx="1.2" ry="6" fill="#F6CDD2" transform="rotate(-12 12 10)"/>
      <ellipse cx="17" cy="9.5" rx="2.6" ry="8" fill="#FFFCF6" stroke="#E8D8CC" stroke-width=".8" transform="rotate(8 17 9.5)"/>
      <circle cx="13" cy="21" r="7.5" fill="#FFFCF6" stroke="#E8D8CC" stroke-width=".8"/>
      <circle cx="10" cy="20" r="1.1" fill="#4B4038"/>
      <ellipse cx="6.2" cy="22.5" rx="1.1" ry=".8" fill="#E8A9B3"/>
      <ellipse cx="11" cy="23.8" rx="1.8" ry="1" fill="#F6CDD2" opacity=".7"/>
      <path d="M18 18.5l2.5 1.6-2.4 1.2" fill="#D9A0A8"/>
    </g>
    <ellipse cx="14" cy="36" rx="4" ry="2" fill="#FFFCF6" stroke="#E8D8CC" stroke-width=".8"/>
    <ellipse cx="29" cy="36" rx="5" ry="2.2" fill="#FFFCF6" stroke="#E8D8CC" stroke-width=".8"/>
  </svg>`;

// Birma-Katze von der Seite (schaut nach links)
const katze = `
  <svg viewBox="0 0 70 48" aria-hidden="true">
    <path class="schwanz" d="M52 26c8-2 12-10 9-17-1-2.5-3.5-1.5-3 .8 1.5 5-1.5 10-7.5 11.5z" fill="#6B4A3A"/>
    <ellipse cx="37" cy="29" rx="17" ry="10.5" fill="#F6EBDD"/>
    <ellipse cx="44" cy="26" rx="10" ry="7" fill="#EADBC8"/>
    <g class="beine">
      <rect x="24" y="34" width="5" height="11" rx="2.5" fill="#F6EBDD"/>
      <rect x="31" y="34" width="5" height="11" rx="2.5" fill="#EADBC8"/>
      <rect x="43" y="34" width="5" height="11" rx="2.5" fill="#F6EBDD"/>
      <rect x="49" y="34" width="5" height="11" rx="2.5" fill="#EADBC8"/>
      <ellipse cx="26.5" cy="45" rx="3" ry="1.5" fill="#fff"/><ellipse cx="45.5" cy="45" rx="3" ry="1.5" fill="#fff"/>
    </g>
    <g class="kopf">
      <path d="M9 9l3 9 6-4zM25 7l-2 10-6-4z" fill="#6B4A3A"/>
      <path d="M11 11.5l1.6 4.5 3-2zM23.3 10l-1 5-3-2z" fill="#E8B4A8"/>
      <circle cx="17" cy="21" r="10.5" fill="#F6EBDD"/>
      <ellipse cx="15" cy="23.5" rx="7" ry="6" fill="#8A6550" opacity=".75"/>
      <ellipse cx="12" cy="20.5" rx="1.9" ry="2.3" fill="#5BA7E0"/><ellipse cx="19" cy="20.5" rx="1.9" ry="2.3" fill="#5BA7E0"/>
      <ellipse cx="12" cy="20.8" rx=".7" ry="1.6" fill="#1F1A17"/><ellipse cx="19" cy="20.8" rx=".7" ry="1.6" fill="#1F1A17"/>
      <path d="M14.6 25l1 1 1-1z" fill="#3B2A22"/>
      <path class="mund" d="M15.6 26.2c-.6 1.2-1.8 1.4-2.6.8M15.6 26.2c.6 1.2 1.8 1.4 2.6.8" stroke="#3B2A22" stroke-width=".7" fill="none" stroke-linecap="round"/>
      <path d="M8 24h-5M8 25.5l-4.5 1.5M23 24h5M23 25.5l4.5 1.5" stroke="#fff" stroke-width=".5" opacity=".8"/>
    </g>
  </svg>`;

const pudding = `
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <ellipse cx="16" cy="28" rx="13" ry="2.6" fill="#FFF8F3" stroke="#E7B9B4" stroke-width=".8"/>
    <g class="pudding-koerper">
      <path d="M7.5 27 9.6 14h12.8l2.1 13z" fill="#F2C27A"/>
      <path d="M9.6 14h12.8l-.6 3.4c-1.5 1-2.6-.4-3.6.4s-2.2-.7-3.2 0-2.4.7-3.8-.3z" fill="#9A522D"/>
      <ellipse cx="16" cy="13" rx="6" ry="2.8" fill="#FFF8F3"/>
      <circle cx="16" cy="8.4" r="2.8" fill="#B3263A"/><circle cx="15.1" cy="7.6" r=".8" fill="#fff" opacity=".75"/>
      <path d="M16.2 5.7c.5-2 1.9-3 3.6-3.3" stroke="#4A2328" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    </g>
  </svg>`;

// ---------- Szenen ----------
export const SZENEN = {
  // Zwei kleine Vögel fliegen über die Bögen
  pastell: () => `
    <div class="sz-vogel" style="--y:74px;--d:0s;--s:1">${vogel("#1F2E45")}</div>
    <div class="sz-vogel" style="--y:112px;--d:.8s;--s:.7">${vogel("#4F7383")}</div>`,

  // Ramune-Blasen steigen auf, eine Qualle schwebt durch
  melonsoda: () => {
    let html = "";
    for (let i = 0; i < 14; i++) {
      html += `<span class="sz-blase" style="--x:${zufall(48, 96)}%;--d:${zufall(0, 3.2)}s;--g:${zufall(6, 16)}px;--w:${zufall(-14, 14)}px"></span>`;
    }
    html += `<div class="sz-qualle"><svg viewBox="0 0 40 52" aria-hidden="true">
      <path d="M4 20C4 9 11 3 20 3s16 6 16 17c-3 2-6-1-8 1-2-2-5 1-8-1-3 2-6-1-8 1-2-2-5 1-8-1z" fill="rgba(255,255,255,.75)" stroke="#5CC8B8" stroke-width="1"/>
      <path d="M10 14c2-5 6-7 10-7" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <g class="tentakel" stroke="#7FD4C8" stroke-width="1.3" fill="none" stroke-linecap="round">
        <path d="M11 22c-2 6 2 10 0 16s1 9 0 12"/><path d="M17 22c-2 7 2 12 0 18"/><path d="M23 22c2 7-2 12 0 18"/><path d="M29 22c2 6-2 10 0 16s-1 9 0 12"/></g>
      <circle cx="15" cy="15" r="1" fill="#22534A"/><circle cx="25" cy="15" r="1" fill="#22534A"/>
      <ellipse cx="13" cy="17.5" rx="1.6" ry=".9" fill="#F6A6B2" opacity=".7"/><ellipse cx="27" cy="17.5" rx="1.6" ry=".9" fill="#F6A6B2" opacity=".7"/>
    </svg></div>`;
    return html;
  },

  // Ein Schmetterling flattert durch und hinterlässt Glitzer
  feenglanz: () => {
    let html = `<div class="sz-schmetterling">${schmetterling}</div>`;
    const farben = ["#F9A8D4", "#C4B5FD", "#7DD3FC", "#FDE68A", "#fff"];
    for (let i = 0; i < 9; i++) {
      const x = 90 - i * 11;
      // Funken erscheinen ungefähr dort, wo der Schmetterling gerade vorbeifliegt
      html += `<span class="sz-funke" style="--x:${x}%;--y:${zufall(80, 118)}px;--d:${(0.3 + ((105 - x) / 123) * 5.5).toFixed(2)}s">${funkeln(farben[i % farben.length])}</span>`;
    }
    return html;
  },

  // Fledermäuse fliegen am Mond vorbei
  brombeere: () => `
    <div class="sz-fledermaus" style="--y:112px;--d:0s;--s:1">${fledermaus}</div>
    <div class="sz-fledermaus" style="--y:146px;--d:.9s;--s:.7">${fledermaus}</div>
    <div class="sz-fledermaus" style="--y:86px;--d:1.6s;--s:.55">${fledermaus}</div>`,

  // Lichtstreifen von Schwebeautos + flackerndes Neon-Herz
  neon: () => `
    <span class="sz-streifen" style="--y:96px;--d:0s;--f:#FF2E9F"></span>
    <span class="sz-streifen" style="--y:128px;--d:.9s;--f:#29E2FF"></span>
    <span class="sz-streifen" style="--y:112px;--d:1.8s;--f:#F9F871"></span>
    <div class="sz-neonherz"><svg viewBox="0 0 40 36" aria-hidden="true">
      <path d="M20 33S3 23 3 12.5A8 8 0 0 1 20 9a8 8 0 0 1 17 3.5C37 23 20 33 20 33z" fill="none" stroke="#FF2E9F" stroke-width="2.4"/>
      <path d="M21.5 11 15 20h5l-1.8 7.5L25 17.5h-5.2z" fill="#29E2FF"/></svg></div>`,

  // Rosenblätter fallen sanft
  kerze: () => {
    let html = "";
    const farben = ["#8E2B2B", "#A83A3A", "#C9A15B", "#7A1E2A", "#B04545", "#E2BE78", "#8E2B2B"];
    for (let i = 0; i < 7; i++) {
      html += `<span class="sz-blatt" style="--x:${zufall(46, 94)}%;--d:${(i * 0.7).toFixed(1)}s;--r:${zufall(-200, 200)}deg;--w:${zufall(-30, 30)}px">${blatt(farben[i])}</span>`;
    }
    return html;
  },

  // Ein Häschen hoppelt vorbei, Blümchen wachsen
  tee: () => `
    <div class="sz-hase">${hase}</div>
    <span class="sz-bluete" style="--x:62%;--d:2.2s">${funkeln("#E8A9B3")}</span>
    <span class="sz-bluete" style="--x:74%;--d:2.6s">${funkeln("#A8B89A")}</span>
    <span class="sz-bluete" style="--x:86%;--d:3s">${funkeln("#F2C94C")}</span>`,

  // Eine Katze kommt von rechts, isst den Pudding und geht wieder
  pudding: () => `
    <div class="sz-pudding">${pudding}</div>
    <div class="sz-katze">${katze}</div>
    <span class="sz-herz">${funkeln("#B3263A")}</span>`,
};
