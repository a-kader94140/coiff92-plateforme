import type { Metadata } from "next";
import { RetourHaut } from "@/components/ui/retour-haut";
import { clashDisplay, satoshi, jetbrainsMono } from "./fonts";
import "./globals.css";

/* Sans metadataBase, Next ne sait pas transformer une vignette de partage en
   URL absolue et le prévient à la compilation. La valeur réelle viendra de
   Vercel à la mise en ligne. */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Coiff'92, annuaire des coiffeurs et barbers des Hauts-de-Seine",
    template: "%s | Coiff'92",
  },
  description:
    "Annuaire indépendant des coiffeurs et barbers des Hauts-de-Seine. Trouvez un salon près de chez vous et envoyez-lui une demande de rendez-vous.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Coiff'92",
    title: "Coiff'92, annuaire des coiffeurs et barbers des Hauts-de-Seine",
    description:
      "Coiffeurs et barbers du 92, par commune ou par nom. Sans classement ni publicité.",
  },
  twitter: { card: "summary_large_image" },
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
      <body>
        {children}
        <RetourHaut />
      </body>
    </html>
  );
}
