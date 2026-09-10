import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FormulaireConnexion } from "@/components/connexion/formulaire-connexion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { gerantConnecte } from "@/lib/supabase-session";

export const metadata: Metadata = {
  title: "Connexion gérant",
  /* Rien à indexer ici, et un moteur qui suivrait ce lien n'aurait
     qu'un formulaire vide à se mettre sous la dent. */
  robots: { index: false, follow: false },
};

type Params = Promise<Record<string, string | string[] | undefined>>;

const premier = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function Connexion({ searchParams }: { searchParams: Params }) {
  const sp = await searchParams;

  /* Déjà connecté : cette page n'a plus rien à proposer. */
  if (await gerantConnecte()) redirect("/espace/demandes");

  const suiteBrute = premier(sp.suite) ?? "";
  const suite =
    suiteBrute.startsWith("/") && !suiteBrute.startsWith("//")
      ? suiteBrute
      : "/espace/demandes";

  /* Posé par /auth/confirmer quand l'échange du code a échoué : lien
     expiré, déjà utilisé, ou ouvert dans un autre navigateur. */
  const lienMort = premier(sp.echec) === "lien";

  return (
    <div className="flex min-h-[100svh] flex-col">
      <header
        className="flex h-18 shrink-0 items-center justify-between border-b
                   border-[var(--hairline)] px-5 md:px-6"
      >
        <Link href="/" className="font-display text-[22px]">
          Coiff&apos;<span className="text-accent-ink">92</span>
          <span className="tabular ml-2.5 text-[11px] uppercase tracking-[0.08em] text-muted-2">
            Espace gérant
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12 md:px-6">
        <div className="w-full max-w-[420px]">
          {lienMort && (
            <p
              role="alert"
              className="m-0 mb-6 rounded-md border border-accent bg-[var(--accent-wash)]
                         p-4 text-[13px] leading-relaxed text-text"
            >
              Ce lien de connexion n&apos;est plus valable. Cela arrive quand il a
              déjà servi, ou qu&apos;il est ouvert dans un autre navigateur que
              celui d&apos;où il a été demandé. Redemandez-en un ci-dessous.
            </p>
          )}

          <FormulaireConnexion
            titre="Connexion gérant"
            intro="Recevez un lien par e-mail pour accéder à votre espace, sans mot de passe à retenir."
            libelleEmail="Adresse e-mail"
            suite={suite}
          />
        </div>
      </main>
    </div>
  );
}
