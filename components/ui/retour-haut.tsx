"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "./cn";
import "./retour-haut.css";

/* Bouton flottant qui remonte en haut de la page. N'apparait qu'une
   fois qu'on a vraiment defile, pas des les premiers pixels.

   Pas d'ecouteur de scroll : une IntersectionObserver sur une
   sentinelle posee au tout debut de la page, avec un rootMargin qui
   retrecit la zone d'observation de 400px en haut. Des que la
   sentinelle sort de cette zone reduite, on sait qu'on a depasse ce
   seuil, sans recalculer quoi que ce soit a chaque frame.

   L'anneau qui l'entoure suit la meme philosophie : aucun ecouteur de
   scroll non plus, juste une frise de defilement native
   (animation-timeline: scroll(), voir retour-haut.css) qui remplit le
   cercle en accent a mesure qu'on avance dans le document. */
export function RetourHaut() {
  const sentinelle = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const cible = sentinelle.current;
    if (!cible) return;
    const observateur = new IntersectionObserver(
      ([entree]) => setVisible(!entree.isIntersecting),
      { rootMargin: "-400px 0px 0px 0px" },
    );
    observateur.observe(cible);
    return () => observateur.disconnect();
  }, []);

  function remonter() {
    /* Pas de behavior explicite : scroll-behavior sur <html> (globals.css)
       pilote le smooth, et retombe deja sur auto en mouvement reduit. */
    window.scrollTo({ top: 0 });
  }

  return (
    <>
      <div ref={sentinelle} aria-hidden="true" className="absolute top-0 h-px w-px" />
      <div
        className={cn(
          "fixed right-5 bottom-5 z-30 grid size-12 place-items-center",
          "transition-[opacity,transform] duration-200",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-90 opacity-0",
        )}
      >
        {/* Anneau d'avancement : combien du document a été parcouru.
            Purement décoratif, le bouton reste utilisable sans lui
            (navigateur ancien, mouvement réduit). */}
        <svg
          aria-hidden="true"
          viewBox="0 0 48 48"
          className="pointer-events-none absolute inset-0 -rotate-90"
        >
          <circle cx="24" cy="24" r="22" fill="none" stroke="var(--divider)" strokeWidth="1.5" />
          <circle
            className="retour-haut-anneau"
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        <button
          type="button"
          onClick={remonter}
          aria-label="Retourner en haut de la page"
          tabIndex={visible ? 0 : -1}
          className={cn(
            "relative grid size-11 cursor-pointer place-items-center rounded-full",
            "border border-[var(--divider)] bg-surface text-muted-1",
            "transition-colors duration-150",
            "hover:bg-[var(--surface-hover)] hover:text-text active:bg-[var(--surface-active)]",
          )}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12l7-7 7 7M12 19V6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
