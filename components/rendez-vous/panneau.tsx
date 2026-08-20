"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";

/* Le panneau latéral de la planche, monté sur un <dialog> natif.

   Ce choix évite d'écrire à la main trois mécaniques que le navigateur
   fournit déjà, et mieux : la touche Échap qui referme, le piège à focus
   qui empêche la tabulation de partir derrière, et l'inertie du reste de
   la page pour les lecteurs d'écran.

   Refermer ne « ferme » rien au sens du routeur : on revient en arrière.
   L'URL du formulaire reste donc une vraie URL, partageable, et le
   bouton Précédent du navigateur fait la même chose que la croix. */
export function PanneauModal({ children }: { children: ReactNode }) {
  const dialogue = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    const d = dialogue.current;
    if (d && !d.open) d.showModal();

    /* showModal() rend l'arrière-plan inerte mais ne l'empêche pas de
       défiler sous le panneau. */
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = avant;
    };
  }, []);

  return (
    <dialog
      ref={dialogue}
      aria-label="Demande de rendez-vous"
      onClose={() => router.back()}
      /* Un clic sur le fond a pour cible le <dialog> lui-même, ses
         enfants n'ayant pas remonté l'événement. */
      onClick={(e) => {
        if (e.target === dialogue.current) router.back();
      }}
      className="panneau-rdv m-0 ml-auto h-dvh max-h-dvh w-full max-w-[560px]
                 border-l border-[var(--divider)] bg-bg p-0 text-text
                 shadow-[0_0_60px_rgba(0,0,0,0.35)] backdrop:bg-black/45"
    >
      {children}
    </dialog>
  );
}

/** La croix du panneau. Elle fait exactement ce que fait Échap. */
export function BoutonFermer() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Fermer la demande de rendez-vous"
      className="flex size-9 shrink-0 cursor-pointer items-center justify-center
                 rounded-md border border-[var(--divider)] text-muted-1
                 transition-colors duration-150 hover:bg-surface-2 hover:text-text"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 5l14 14M19 5L5 19"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="square"
        />
      </svg>
    </button>
  );
}
