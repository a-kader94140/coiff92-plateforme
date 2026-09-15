"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { seDeconnecter } from "@/lib/connexion-actions";
import { Wordmark } from "@/components/ui/wordmark";

/* La navigation de l'espace : latérale sur grand écran, en bas sur
   mobile.

   CORRECTION PAR RAPPORT A LA PLANCHE. Sur mobile, elle posait
   « display:none » sur le bloc qui porte le nom du salon et le bouton
   de déconnexion. Un gérant sur téléphone n'avait donc aucun moyen de
   se déconnecter, et rien ne lui rappelait quel compte il utilisait.

   Ils sont ici remontés dans un bandeau en HAUT sur mobile, pendant
   que les deux onglets restent en bas, sous le pouce. Les deux
   informations restent visibles, sans encombrer la barre d'onglets. */

const ONGLETS = [
  { href: "/espace/demandes", label: "Mes demandes" },
  { href: "/espace/fiche", label: "Ma fiche" },
] as const;

export function NavEspace({ nomSalon }: { nomSalon: string }) {
  const chemin = usePathname();

  return (
    <>
      {/* ── bandeau du haut, mobile uniquement ── */}
      <header
        className="flex h-16 shrink-0 items-center justify-between gap-3 border-b
                   border-[var(--hairline)] px-5 md:hidden"
      >
        <div className="min-w-0">
          <p className="m-0 truncate text-[15px] font-medium text-text">{nomSalon}</p>
          <Deconnexion />
        </div>
        <ThemeToggle />
      </header>

      {/* ── colonne latérale, grand écran ── */}
      <div
        className="hidden w-[220px] shrink-0 flex-col gap-7 border-r
                   border-[var(--hairline)] px-4 py-6 md:flex"
      >
        <Link href="/" className="font-display px-3 text-[20px]">
          <Wordmark n92ClassName="text-accent-ink" />
        </Link>

        <div className="px-3">
          <p className="m-0 text-[15px] font-medium text-text">{nomSalon}</p>
          <Deconnexion />
        </div>

        <nav aria-label="Espace gérant" className="flex flex-col gap-1.5">
          {ONGLETS.map((o) => (
            <Onglet key={o.href} {...o} actif={chemin === o.href} />
          ))}
        </nav>

        <div className="mt-auto px-3">
          <ThemeToggle />
        </div>
      </div>

      {/* ── barre d'onglets du bas, mobile uniquement ──
          « fixed » et non « sticky » : la liste des demandes peut être
          longue, et l'accès à l'autre page ne doit pas dépendre d'un
          retour en haut. Le padding-bas du <main> lui réserve sa
          place. */}
      <nav
        aria-label="Espace gérant"
        className="fixed inset-x-0 bottom-0 z-20 flex gap-1.5 border-t
                   border-[var(--hairline)] bg-bg px-3 py-2.5 md:hidden"
      >
        {ONGLETS.map((o) => (
          <Onglet key={o.href} {...o} actif={chemin === o.href} pleineLargeur />
        ))}
      </nav>
    </>
  );
}

function Onglet({
  href,
  label,
  actif,
  pleineLargeur,
}: {
  href: string;
  label: string;
  actif: boolean;
  pleineLargeur?: boolean;
}) {
  return (
    <Link
      href={href}
      /* aria-current dit au lecteur d'écran quelle page est ouverte.
         L'aplat seul ne le dirait pas, et il est peu contrasté par
         construction. */
      aria-current={actif ? "page" : undefined}
      className={cn(
        "rounded-md px-3 py-2.5 text-sm font-medium text-text transition-colors",
        pleineLargeur ? "flex-1 text-center" : "text-left",
        actif
          ? "bg-surface-2"
          : "hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)]",
      )}
    >
      {label}
    </Link>
  );
}

function Deconnexion() {
  return (
    <form action={seDeconnecter} className="contents">
      <button
        type="submit"
        className="mt-0.5 cursor-pointer border-none bg-transparent p-0 text-xs
                   text-muted-2 underline underline-offset-2 hover:text-text"
      >
        Se déconnecter
      </button>
    </form>
  );
}
