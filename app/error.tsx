"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/* Frontière d'erreur.

   Le système de design prévoit l'état d'erreur, il n'existait nulle part
   dans l'application. Sans ce fichier, une exception affiche l'écran
   générique de Next, sans nos couleurs ni nos polices, et sans moyen de
   réessayer autrement qu'en rechargeant.

   Doit être un composant client : c'est ce que Next exige d'une frontière
   d'erreur, et le bouton « Réessayer » appelle reset(). */
export default function Erreur({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // en production, c'est ici que partirait le rapport vers un collecteur
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[100svh] flex-col">
      <header className="flex h-18 shrink-0 items-center border-b border-[var(--hairline)] px-5 md:px-6">
        <Link href="/" className="font-display text-[22px]">
          Coiff&apos;<span className="text-accent-ink">92</span>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col justify-center px-5 py-16 md:px-8">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
          Erreur
        </p>
        <h1 className="m-0 text-[clamp(28px,5vw,38px)] leading-tight">
          Quelque chose s&apos;est mal passé
        </h1>
        <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-muted-2">
          L&apos;annuaire n&apos;a pas pu se charger. Réessayez, et si le problème
          persiste, revenez dans un moment.
        </p>

        {error.digest && (
          <p className="tabular mt-4 text-[13px] text-muted-3">
            Référence : {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="principal" onClick={reset}>
            Réessayer
          </Button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border
                       border-[var(--divider)] px-[22px] py-3 text-sm font-medium
                       text-text transition-colors duration-150 hover:bg-surface-2"
          >
            Revenir à l&apos;annuaire
          </Link>
        </div>
      </main>
    </div>
  );
}
