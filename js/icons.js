// ------------------------------------------------------------
// Eigene SVG-Icons (statt Emojis)
//  - ICON: schlichte Linien-Icons für die Bedienung (übernehmen die Textfarbe)
//  - THEME_ICON: farbige Symbole für die Designs
// ------------------------------------------------------------

const linie = (inhalt, extra = "") =>
  `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${inhalt}</svg>`;

export const ICON = {
  // Status
  frei: linie('<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/>'),
  besetzt: linie('<circle cx="12" cy="12" r="9"/><path d="M7.5 12h9"/>'),
  arbeiten: linie('<rect x="3" y="7.5" width="18" height="12.5" rx="2.5"/><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3 13h18"/>'),
  arzt: linie('<path d="M12 20.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.9c0 5.4-7.5 10-7.5 10z"/><path d="M12 10.5v5M9.5 13h5"/>'),
  ferien: linie('<path d="M3.5 12a8.5 8.5 0 0 1 17 0c-1.4-1.2-2.8-1.2-4.2 0-1.4-1.2-2.9-1.2-4.3 0-1.4-1.2-2.9-1.2-4.3 0-1.4-1.2-2.8-1.2-4.2 0z"/><path d="M12 12v6.5a2 2 0 0 1-4 0"/><path d="M12 3.5V2.5"/>'),
  treffen: linie('<path d="M12 3.5l1.6 4.4L18 9.5l-4.4 1.6L12 15.5l-1.6-4.4L6 9.5l4.4-1.6z"/><path d="M18.5 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7zM5.5 15.5l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z"/>'),
  // Bedienung
  bearbeiten: linie('<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="m14.5 7.5 3 3"/>'),
  loeschen: linie('<path d="M4 7h16M9.5 7V4.5h5V7M6 7l1 12.5a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5L18 7"/><path d="M10 11v6M14 11v6"/>'),
  schliessen: linie('<path d="M6 6l12 12M18 6 6 18"/>'),
  links: linie('<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>'),
  rechts: linie('<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>'),
  uhr: linie('<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>'),
  kalender: linie('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  leute: linie('<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14.3a6.5 6.5 0 0 1 3.5 5.7"/>'),
  brief: linie('<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.5 7 8.5 6.5L20.5 7"/>'),
  plus: linie('<path d="M12 5v14M5 12h14"/>'),
  haken: linie('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  kreuz: linie('<path d="M7 7l10 10M17 7 7 17"/>'),
  pokal: linie('<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20.5h7M10 17h4l.5 3.5h-5z"/>'),
  palette: linie('<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 2-.8 2-1.8 0-1.4-1.2-1.7-1.2-3 0-1.1.9-1.7 2-1.7h2.2a3.5 3.5 0 0 0 3.5-3.5c0-3.9-3.8-7-8.5-7z"/><circle cx="7.8" cy="11" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15" cy="7.8" r="1"/>'),
  sonne: linie('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>'),
  suche: linie('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.3-4.3"/>'),
  leer: linie('<path d="M4 13.5 6.5 6a2 2 0 0 1 1.9-1.5h7.2A2 2 0 0 1 17.5 6l2.5 7.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M4 13.5h4.5l1 2h5l1-2H20"/>'),
  herz: linie('<path d="M12 20s-8-4.8-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.2 12 20 12 20z"/>'),
};

export function statusIcon(status) {
  return ICON[status] || ICON.frei;
}

// ---------- Farbige Theme-Symbole (32×32) ----------
const bunt = (inhalt) =>
  `<svg class="ti" viewBox="0 0 32 32" aria-hidden="true">${inhalt}</svg>`;

export const THEME_ICON = {
  // Bögen aus der Farbpalette
  pastell: bunt(`
    <path d="M4.5 25.5v-8a3.6 3.6 0 0 1 7.2 0v8z" fill="#EBD9AD"/>
    <path d="M12.4 25.5V9.2a3.6 3.6 0 0 1 7.2 0v16.3z" fill="#B3C3D0"/>
    <path d="M20.3 25.5V13.4a3.6 3.6 0 0 1 7.2 0v12.1z" fill="#CCDBBB"/>
    <rect x="3.5" y="26.3" width="25" height="2.2" rx="1.1" fill="#1F2E45"/>`),

  // Melonen-Soda mit Glace und Kirsche
  melonsoda: bunt(`
    <path d="M21.5 1.8 18.6 10" stroke="#F25C6E" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M9 13h14l-1.8 13.4a2 2 0 0 1-2 1.8h-6.4a2 2 0 0 1-2-1.8z" fill="#8EE0C4"/>
    <path d="M9.4 16h13.2" stroke="#BFF0DF" stroke-width="1.2"/>
    <circle cx="13.5" cy="21" r="1.1" fill="#fff" opacity=".9"/><circle cx="17.8" cy="24" r=".8" fill="#fff" opacity=".9"/><circle cx="18.6" cy="19" r=".7" fill="#fff" opacity=".9"/>
    <path d="M9.6 13.3a6.4 6.4 0 0 1 12.8 0z" fill="#FFF8EC"/>
    <circle cx="16.8" cy="6.4" r="2.5" fill="#F25C6E"/><circle cx="16" cy="5.6" r=".7" fill="#fff" opacity=".8"/>
    <path d="M17.2 4c.4-1.6 1.6-2.4 3-2.6" stroke="#3E8E5A" stroke-width="1.1" fill="none" stroke-linecap="round"/>`),

  // Schmetterling mit Schimmer
  feenglanz: bunt(`
    <defs><linearGradient id="fg-g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F9A8D4"/><stop offset=".5" stop-color="#C4B5FD"/><stop offset="1" stop-color="#7DD3FC"/></linearGradient></defs>
    <path d="M15.6 15.5C13 7.5 5.4 5.2 4.5 9.8c-.8 4.3 4.6 6.8 11.1 5.7z" fill="url(#fg-g)"/>
    <path d="M16.4 15.5c2.6-8 10.2-10.3 11.1-5.7.8 4.3-4.6 6.8-11.1 5.7z" fill="url(#fg-g)"/>
    <path d="M15.6 16.6c-4.8.8-8.4 3.8-7 6.6 1.4 2.6 5.2 1 7-6.6z" fill="url(#fg-g)" opacity=".85"/>
    <path d="M16.4 16.6c4.8.8 8.4 3.8 7 6.6-1.4 2.6-5.2 1-7-6.6z" fill="url(#fg-g)" opacity=".85"/>
    <path d="M16 11v12" stroke="#6B4FA0" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M16 11c-.6-2.5-2-4-3.5-4.5M16 11c.6-2.5 2-4 3.5-4.5" stroke="#6B4FA0" stroke-width=".9" fill="none" stroke-linecap="round"/>
    <path d="M26 2.5l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6z" fill="#F9A8D4"/>
    <path d="M5 21l.4 1.2 1.2.4-1.2.4L5 24.2l-.4-1.2-1.2-.4 1.2-.4z" fill="#7DD3FC"/>`),

  // Brombeere mit Blättern
  brombeere: bunt(`
    <path d="M16 9.5c-2.2-4-6.3-5-8.6-3.8 1.3 3.2 4.5 4.8 8.6 3.8z" fill="#6E8F5E"/>
    <path d="M16 9.5c2.2-4 6.3-5 8.6-3.8-1.3 3.2-4.5 4.8-8.6 3.8z" fill="#5A7A4C"/>
    <g fill="#4A2459" stroke="#2A1230" stroke-width=".6">
      <circle cx="16" cy="12.6" r="3.1"/><circle cx="12.4" cy="15.4" r="3.1"/><circle cx="19.6" cy="15.4" r="3.1"/>
      <circle cx="16" cy="17.6" r="3.1"/><circle cx="11.8" cy="19.8" r="3.1"/><circle cx="20.2" cy="19.8" r="3.1"/>
      <circle cx="14" cy="23.2" r="3.1"/><circle cx="18" cy="23.2" r="3.1"/><circle cx="16" cy="26.4" r="2.6"/></g>
    <g fill="#C79BD6" opacity=".75"><circle cx="15.1" cy="11.7" r=".8"/><circle cx="11.5" cy="14.5" r=".8"/><circle cx="18.7" cy="14.5" r=".8"/><circle cx="15.1" cy="16.7" r=".8"/><circle cx="13.1" cy="22.3" r=".8"/></g>`),

  // Neon-Herz mit Blitz
  neon: bunt(`
    <path d="M17.3 26S5.3 18.5 5.3 10.6a6 6 0 0 1 12-.9 6 6 0 0 1 12 .9C29.3 18.5 17.3 26 17.3 26z" fill="none" stroke="#29E2FF" stroke-width="1.6" opacity=".8"/>
    <path d="M15.5 27.5S3.5 20 3.5 12a6 6 0 0 1 12-.9 6 6 0 0 1 12 .9C27.5 20 15.5 27.5 15.5 27.5z" fill="rgba(255,46,159,.15)" stroke="#FF2E9F" stroke-width="2"/>
    <path d="M17 10.5 12.2 17.5h3.6l-1.3 5.8 5.2-7.6h-3.7z" fill="#F9F871"/>`),

  // Kerze mit Flamme
  kerze: bunt(`
    <path d="M16 3c2.6 3.1 3.1 5.4 0 8.4-3.1-3-2.6-5.3 0-8.4z" fill="#F5B942"/>
    <path d="M16 6.2c1.2 1.6 1.4 2.8 0 4.3-1.4-1.5-1.2-2.7 0-4.3z" fill="#FFF1B0"/>
    <path d="M16 11.4v2" stroke="#3B2A1F" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M11.5 14.5a1.5 1.5 0 0 1 1.5-1.5h6a1.5 1.5 0 0 1 1.5 1.5v12h-9z" fill="#F1E6D2"/>
    <path d="M11.5 15.5c1 0 1 3 2 3s.6-2.5 1.6-2.5 1 4 2 4 .6-3 1.6-3 1 2 1.8 2v-4.5h-9z" fill="#E3D2B4"/>
    <path d="M7.5 26.5h17a2.5 2.5 0 0 1-2.5 2.5H10a2.5 2.5 0 0 1-2.5-2.5z" fill="#C9A15B"/>`),

  // Teetasse mit Blümchen
  tee: bunt(`
    <path d="M11 9.5c-1.2-1.4 1.2-2.4 0-4M15 9.5c-1.2-1.4 1.2-2.4 0-4" stroke="#A8B89A" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <path d="M5.5 12.5h17v4.5a8.5 8.5 0 0 1-17 0z" fill="#FFFCF5" stroke="#B26E7A" stroke-width="1.4"/>
    <path d="M22.5 13.8h1.8a3.2 3.2 0 0 1 0 6.4h-2.6" fill="none" stroke="#B26E7A" stroke-width="1.4"/>
    <g fill="#E8A9B3"><circle cx="14" cy="16.2" r="1.3"/><circle cx="15.9" cy="17.2" r="1.3"/><circle cx="15.3" cy="19.2" r="1.3"/><circle cx="12.9" cy="19.2" r="1.3"/><circle cx="12.3" cy="17.2" r="1.3"/></g>
    <circle cx="14.1" cy="17.9" r=".9" fill="#F2C94C"/>
    <path d="M18.5 16.5c1.3-.3 2-.1 2.4.6" stroke="#A8B89A" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <path d="M3.5 27h22" stroke="#B26E7A" stroke-width="2" stroke-linecap="round"/>`),

  // Pudding mit Kirsche
  pudding: bunt(`
    <ellipse cx="16" cy="27.3" rx="11.5" ry="2" fill="#F0DAD2"/>
    <path d="M8.6 26.5 10.4 15h11.2l1.8 11.5z" fill="#F2C27A"/>
    <path d="M10.4 15h11.2l-.5 3.1c-1.3.9-2.3-.4-3.2.4s-1.9-.6-2.8 0-2.1.6-3.3-.3z" fill="#9A522D"/>
    <ellipse cx="16" cy="14.2" rx="5.4" ry="2.6" fill="#FFF8F3"/>
    <circle cx="16" cy="9.6" r="2.7" fill="#B3263A"/><circle cx="15.1" cy="8.8" r=".8" fill="#fff" opacity=".75"/>
    <path d="M16.2 7c.5-2 1.9-3 3.6-3.3" stroke="#4A2328" stroke-width="1.1" fill="none" stroke-linecap="round"/>`),
};

/** Kleines Deko-Symbol für Kalendertage, an denen alle Zeit haben */
export const MINI_DEKO = {
  pastell: '<svg viewBox="0 0 10 10"><path d="M2 9V5a3 3 0 0 1 6 0v4z" fill="currentColor"/></svg>',
  melonsoda: '<svg viewBox="0 0 10 10"><circle cx="5" cy="5.5" r="3.5" fill="currentColor"/><path d="M5 2c.3-1 .9-1.5 1.8-1.6" stroke="currentColor" fill="none"/></svg>',
  feenglanz: '<svg viewBox="0 0 10 10"><path d="M5 0l1.2 3.8L10 5 6.2 6.2 5 10 3.8 6.2 0 5l3.8-1.2z" fill="currentColor"/></svg>',
  brombeere: '<svg viewBox="0 0 10 10"><path d="M5 9.5C3 7.5 2.5 5.8 3.2 4a2 2 0 0 1 1.8-1.2A2 2 0 0 1 6.8 4c.7 1.8.2 3.5-1.8 5.5zM5 2.8C4.5 1.5 3.5 1 2.5 1.2M5 2.8c.5-1.3 1.5-1.8 2.5-1.6" fill="currentColor" stroke="currentColor" stroke-width=".6"/></svg>',
  neon: '<svg viewBox="0 0 10 10"><path d="M6 0 2 6h2.5L3.5 10 8 4H5.5z" fill="currentColor"/></svg>',
  kerze: '<svg viewBox="0 0 10 10"><path d="M5 0c1.5 1.8 1.8 3.2 0 5C3.2 3.2 3.5 1.8 5 0z" fill="currentColor"/><rect x="3.8" y="5.8" width="2.4" height="4" rx=".5" fill="currentColor" opacity=".6"/></svg>',
  tee: '<svg viewBox="0 0 10 10"><g fill="currentColor"><circle cx="5" cy="2.6" r="2"/><circle cx="7.4" cy="4.4" r="2"/><circle cx="6.5" cy="7.3" r="2"/><circle cx="3.5" cy="7.3" r="2"/><circle cx="2.6" cy="4.4" r="2"/></g><circle cx="5" cy="5" r="1.3" fill="#fff"/></svg>',
  pudding: '<svg viewBox="0 0 10 10"><path d="M5 5.2C3.8 3.6 1.2 3 .8 4.6c-.3 1.6 2.3 1.9 4.2.6zM5 5.2c1.2-1.6 3.8-2.2 4.2-.6.3 1.6-2.3 1.9-4.2.6z" fill="currentColor"/><path d="M5 5.2 3.4 9.5M5 5.2l1.6 4.3" stroke="currentColor" stroke-width="1"/><circle cx="5" cy="5.2" r="1.1" fill="currentColor"/></svg>',
};
