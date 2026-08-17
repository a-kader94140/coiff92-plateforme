/* Les jetons, en TypeScript, pour que le guide de style puisse calculer
   les contrastes réels. Les mêmes valeurs vivent dans app/globals.css,
   qui reste la source pour le rendu. Ce fichier ne sert qu'à la
   documentation et à la vérification. */

export type Palette = {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted1: string;
  muted2: string;
  muted3: string;
  accent: string;
  accentInk: string;
  onAccent: string;
};

export const CLAIR: Palette = {
  bg: "#f2f2f0",
  surface: "#e7e7e4",
  surface2: "#dcdcd8",
  text: "#17181a",
  muted1: "#3d3f42",
  muted2: "#52555a",
  muted3: "#5e6165",
  accent: "#b8341a",
  accentInk: "#a92e17",
  onAccent: "#ffffff",
};

export const SOMBRE: Palette = {
  bg: "#101113",
  surface: "#191b1e",
  surface2: "#23262a",
  text: "#f0efec",
  muted1: "#c3c5c7",
  muted2: "#9a9da1",
  muted3: "#8b8e92",
  accent: "#e9694e",
  accentInk: "#e9694e",
  onAccent: "#101113",
};

export const SURFACES = (p: Palette) => [
  { nom: "fond", hex: p.bg },
  { nom: "surface", hex: p.surface },
  { nom: "surface 2", hex: p.surface2 },
];

export const ENCRES = (p: Palette) => [
  { nom: "Texte", jeton: "--text", hex: p.text },
  { nom: "Gris 1", jeton: "--muted-1", hex: p.muted1 },
  { nom: "Gris 2", jeton: "--muted-2", hex: p.muted2 },
  { nom: "Gris 3", jeton: "--muted-3", hex: p.muted3 },
  { nom: "Accent en texte", jeton: "--accent-ink", hex: p.accentInk },
];
