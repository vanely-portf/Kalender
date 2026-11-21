// ------------------------------------------------------------
// Kalender-Designs (pro Gerät wählbar im Profil)
// Die Farben selbst stehen in css/style.css unter [data-design="…"].
// ------------------------------------------------------------

export const DESIGNS = [
  {
    id: "pastell", name: "Pretty Pastell", text: "Standard · ruhig & hell",
    farben: ["#799DAC", "#B3C3D0", "#D9CCBA", "#EBD9AD", "#CCDBBB"],
    themeColor: "#799DAC",
    fonts: "family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700",
  },
  {
    id: "melonsoda", name: "Melon Soda", text: "Sommer, Ramune & Quallen",
    farben: ["#8EE0C4", "#9FDDEB", "#FFF8EC", "#F25C6E", "#2E8F82"],
    themeColor: "#A6E6D2",
    fonts: "family=Fredoka:wght@500;600&family=Nunito:wght@400;600;700",
  },
  {
    id: "feenglanz", name: "Feenglanz", text: "Schillernde Schmetterlinge",
    farben: ["#F9C6E8", "#C9B6FF", "#A8E6F0", "#F6F7C8", "#8A5BD6"],
    themeColor: "#D9C6FF",
    fonts: "family=Playfair+Display:ital,wght@1,600&family=Quicksand:wght@500;600;700",
  },
  {
    id: "brombeere", name: "Brombeernacht", text: "Dunkel, Kerzen & Klavier",
    farben: ["#121016", "#4A2459", "#8E5A9E", "#EFE6D8", "#6E8F5E"],
    themeColor: "#121016",
    fonts: "family=Cinzel:wght@600;700&family=Lora:wght@400;500;600",
  },
  {
    id: "neon", name: "Neon Tokyo", text: "Neonlichter bei Nacht",
    farben: ["#0A0716", "#FF2E9F", "#29E2FF", "#8B2CF5", "#F9F871"],
    themeColor: "#0A0716",
    fonts: "family=Orbitron:wght@600;800&family=Space+Grotesk:wght@400;500;700",
  },
  {
    id: "kerze", name: "Kerzenschein", text: "Spitze, Rosen & Sepia",
    farben: ["#241913", "#5A3A26", "#8E2B2B", "#C9A15B", "#F1E6D2"],
    themeColor: "#2E1F16",
    fonts: "family=IM+Fell+English:ital@0;1&family=EB+Garamond:wght@400;500;600",
  },
  {
    id: "tee", name: "Teestunde", text: "Blümchen, Tee & Landhaus",
    farben: ["#F7F1E6", "#F4D9DC", "#D9A0A8", "#A8B89A", "#B26E7A"],
    themeColor: "#F4D9DC",
    fonts: "family=Lora:ital,wght@1,600&family=Nunito:wght@400;600;700",
  },
  {
    id: "pudding", name: "Kirschpudding", text: "Schleifen, Kirschen & Kätzchen",
    farben: ["#F8EDE6", "#E7B9B4", "#F2C27A", "#B3263A", "#4A2328"],
    themeColor: "#E7B9B4",
    fonts: "family=DM+Serif+Display&family=Karla:wght@400;500;700",
  },
];

export const STANDARD_DESIGN = "pastell";
const KEY = "fk-design";

export function aktuellesDesign() {
  let id = STANDARD_DESIGN;
  try { id = localStorage.getItem(KEY) || STANDARD_DESIGN; } catch {}
  return DESIGNS.some((d) => d.id === id) ? id : STANDARD_DESIGN;
}

/** Design anwenden: Farben (CSS), Schriften (Google Fonts) und Browser-Farbe */
export function designAnwenden(id, merken = true) {
  const d = DESIGNS.find((x) => x.id === id) || DESIGNS[0];
  document.documentElement.dataset.design = d.id;
  let link = document.getElementById("design-fonts");
  if (!link) {
    link = document.createElement("link");
    link.id = "design-fonts";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  const href = `https://fonts.googleapis.com/css2?${d.fonts}&display=swap`;
  if (link.href !== href) link.href = href;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", d.themeColor);
  if (merken) { try { localStorage.setItem(KEY, d.id); } catch {} }
  return d;
}
