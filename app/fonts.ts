import localFont from "next/font/local";

/* Les trois familles sont hébergées dans app/fonts/. Aucune requête vers
   Google Fonts ou Fontshare : la planche Claude Design les chargeait par
   CDN, ce qui bloque le premier rendu et casse l'application hors ligne. */

export const clashDisplay = localFont({
  src: [
    { path: "./fonts/ClashDisplay-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ClashDisplay-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const satoshi = localFont({
  src: [
    { path: "./fonts/Satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Satoshi-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

/* Fichier variable : une seule ressource couvre 400 à 600. */
export const jetbrainsMono = localFont({
  src: [{ path: "./fonts/JetBrainsMono-400.woff2", weight: "400 600", style: "normal" }],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
});
