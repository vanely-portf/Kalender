// ------------------------------------------------------------
// Kalender-Designs (pro Gerät wählbar im Profil)
// Die Farben selbst stehen in css/style.css unter [data-design="…"].
// ------------------------------------------------------------

export const DESIGNS = [
  {
    id: "pastell", name: "Pretty Pastell", emoji: "🕊️",
    text: "Ruhig, hell und modern",
    farben: ["#799DAC", "#B3C3D0", "#D9CCBA", "#EBD9AD", "#CCDBBB"],
    themeColor: "#799DAC",
    fonts: "family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700",
  },
  {
    id: "cottagecore", name: "Cottagecore", emoji: "🌸",
    text: "Blumenwiese & Landhaus",
    farben: ["#7D9471", "#E8B4B8", "#F3E9D2", "#B5835A", "#5E6B4E"],
    themeColor: "#7D9471",
    fonts: "family=Lora:wght@600;700&family=Nunito:wght@400;600;700",
  },
  {
    id: "cyberpunk", name: "Cyberpunk", emoji: "⚡",
    text: "Neon bei Nacht",
    farben: ["#0D0B1F", "#FF2A6D", "#05D9E8", "#F9F871", "#7B2CBF"],
    themeColor: "#0D0B1F",
    fonts: "family=Orbitron:wght@600;800&family=Space+Grotesk:wght@400;500;700",
  },
  {
    id: "japandi", name: "Japandi", emoji: "🍵",
    text: "Minimal, Holz & Stein",
    farben: ["#EFEBE4", "#A68A6D", "#8A9A8B", "#3B3833", "#D8CFC2"],
    themeColor: "#3B3833",
    fonts: "family=Shippori+Mincho:wght@600;700&family=Inter:wght@400;500;600",
  },
  {
    id: "boho", name: "Boho", emoji: "🌾",
    text: "Terrakotta & Wüstensand",
    farben: ["#C8775A", "#D9A441", "#EFE2D0", "#6B7A4F", "#4A3426"],
    themeColor: "#C8775A",
    fonts: "family=DM+Serif+Display&family=Josefin+Sans:wght@400;600;700",
  },
  {
    id: "academia", name: "Light Academia", emoji: "📜",
    text: "Bibliothek & Pergament",
    farben: ["#F4EEE2", "#B8975A", "#6B4F3A", "#A3A38B", "#2E2A24"],
    themeColor: "#6B4F3A",
    fonts: "family=Cormorant+Garamond:wght@600;700&family=EB+Garamond:wght@400;500;600",
  },
  {
    id: "y2k", name: "Y2K", emoji: "🦋",
    text: "Glitzer, Chrom & Pink",
    farben: ["#FF5FCF", "#7AD3FF", "#C9A7FF", "#FFF06A", "#F3F0FF"],
    themeColor: "#C9A7FF",
    fonts: "family=Righteous&family=Comfortaa:wght@500;700",
  },
  {
    id: "retro", name: "Retro 70s", emoji: "🪩",
    text: "Groovy Streifen",
    farben: ["#E76F30", "#F2B134", "#2A9D8F", "#6B3E26", "#FBEEDB"],
    themeColor: "#E76F30",
    fonts: "family=Shrikhand&family=Work+Sans:wght@400;500;700",
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
