import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NavEspace } from "@/components/espace/nav";
import { buttonClass } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { monSalon } from "@/lib/espace-data";
import { gerantConnecte } from "@/lib/supabase-session";
import { Wordmark } from "@/components/ui/wordmark";

export const metadata: Metadata = {
  title: { default: "Espace gérant", template: "%s | Espace gérant" },
  robots: { index: false, follow: false },
};

/* La protection de l'espace est ICI, dans un Server Component, et non
   dans le middleware.

   Un middleware ne voit qu'un cookie, il ne le vérifie pas : il
   protégerait donc contre un visiteur distrait, pas contre quelqu'un
   qui fabrique un cookie. gerantConnecte() appelle getUser(), qui fait
   valider le jeton par Supabase.

   Deuxième raison, moins visible : même si ce contrôle sautait, les
   politiques RLS de la 0005 ne rendraient rien. Cette page n'est pas
   la seule barrière, elle est celle qui produit une redirection
   propre plutôt qu'une page vide. */

export default async function EspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const utilisateur = await gerantConnecte();
  if (!utilisateur) redirect("/connexion");

  const salon = await monSalon();

  /* Connecté, mais sans fiche. Cas réel : quelqu'un demande un lien
     de connexion depuis /connexion sans être passé par une
     réclamation. On ne le laisse pas devant un espace vide dont il ne
     comprendrait pas la cause. */
  if (!salon) return <SansFiche email={utilisateur.email ?? ""} />;

  return (
    <div className="flex min-h-[100svh] flex-col md:flex-row">
      <NavEspace nomSalon={salon.name} />

      <main className="flex-1 px-5 py-6 pb-24 md:px-10 md:py-8 md:pb-8">
        {children}
      </main>
    </div>
  );
}

/* ─────────────────────────  connecté sans fiche  ───────────────────────── */

function SansFiche({ email }: { email: string }) {
  return (
    <div className="flex min-h-[100svh] flex-col">
      <header
        className="flex h-18 shrink-0 items-center justify-between border-b
                   border-[var(--hairline)] px-5 md:px-6"
      >
        <Link href="/" className="font-display text-[22px]">
          <Wordmark n92ClassName="text-accent-ink" />
          <span className="tabular ml-2.5 text-[11px] uppercase tracking-[0.08em] text-muted-2">
            Espace gérant
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-[520px] flex-1 px-5 py-16 md:px-8">
        <h1 className="font-display m-0 text-[clamp(24px,4vw,30px)] leading-tight">
          Aucune fiche rattachée à ce compte
        </h1>
        <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted-1">
          Vous êtes bien connecté avec{" "}
          <span className="tabular text-text">{email}</span>, mais aucun salon
          n&apos;est encore rattaché à cette adresse.
        </p>
        <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-muted-1">
          Trouvez votre salon dans l&apos;annuaire, puis réclamez sa fiche depuis
          le bouton en bas de celle-ci. Vous reviendrez ici automatiquement.
        </p>
        <Link href="/" className={buttonClass({ size: "lg", className: "mt-8" })}>
          Chercher mon salon dans l&apos;annuaire
        </Link>
      </main>
    </div>
  );
}
