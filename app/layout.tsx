import type { Metadata } from "next";
import { clashDisplay, satoshi, jetbrainsMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coiff'92, annuaire des coiffeurs et barbers des Hauts-de-Seine",
  description:
    "Annuaire indépendant des coiffeurs et barbers des Hauts-de-Seine. Trouvez un salon près de chez vous et envoyez-lui une demande de rendez-vous.",
};

/* Posé avant le premier rendu : le thème est déjà bon quand la page
   s'affiche, il n'y a pas de bascule visible au chargement. */
const themeScript = `
(function () {
  try {
    var t = localStorage.getItem("coiff92-theme");
    if (t === "clair" || t === "sombre") {
      document.documentElement.setAttribute("data-theme", t);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${clashDisplay.variable} ${satoshi.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
