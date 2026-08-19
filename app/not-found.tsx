import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NB_SALONS } from "@/lib/salons";

/* Un 404 doit rendre la main, pas constater l'échec. Il propose donc la
   seule action qui remet le visiteur sur les rails : revenir à l'annuaire. */
export default function NotFound() {
  return (
    <div className="flex min-h-[100svh] flex-col">
      <header
        className="flex h-18 shrink-0 items-center justify-between border-b
                   border-[var(--hairline)] px-5 md:px-6"
      >
        <Link href="/" className="font-display text-[22px]">
          Coiff&apos;<span className="text-accent-ink">92</span>
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
            className="inline-flex items-center justify-center rounded-md bg-accent
                       px-[22px] py-3 text-sm font-medium text-on-accent
                       transition-colors duration-150 hover:bg-[var(--accent-hover)]
                       active:scale-[0.98]"
          >
            Voir les {NB_SALONS} adresses
          </Link>
        </div>
      </main>
    </div>
  );
}
