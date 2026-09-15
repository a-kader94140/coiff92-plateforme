import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Wordmark } from "@/components/ui/wordmark";

/* Un 404 doit rendre la main, pas constater l'échec. Il propose donc la
   seule action qui remet le visiteur sur les rails : revenir à l'annuaire.

   Le bouton annonçait le nombre d'adresses. Ce nombre vit désormais en
   base, et une page d'erreur qui interroge la base peut échouer à son
   tour : le visiteur récolterait un 500 à la place de son 404. Cette page
   ne dépend donc de rien. */
export default function NotFound() {
  return (
    <div className="flex min-h-[100svh] flex-col">
      <header
        className="flex h-18 shrink-0 items-center justify-between border-b
                   border-[var(--hairline)] px-5 md:px-6"
      >
        <Link href="/" className="font-display text-[22px]">
          <Wordmark n92ClassName="text-accent-ink" />
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col justify-center px-5 py-16 md:px-8">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
          Erreur 404
        </p>
        <h1 className="m-0 text-[clamp(30px,5vw,42px)] leading-tight">
          Cette page n&apos;existe pas
        </h1>
        <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-muted-2">
          Le salon a peut-être été retiré de l&apos;annuaire, ou l&apos;adresse
          comporte une erreur.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className={buttonClass({ variant: "principal" })}
          >
            Revenir à l&apos;annuaire
          </Link>
        </div>
      </main>
    </div>
  );
}
