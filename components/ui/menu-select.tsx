"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "./cn";

/* Menu déroulant animé, à la place d'un <select> natif.

   Reprend le geste d'un composant qu'on m'a montré (bouton + panneau
   qui glisse et s'estompe), mais reconstruit avec les tokens du
   système (--surface, --divider, --accent) et sans dépendance
   nouvelle : pas de framer-motion, pas de clsx/tailwind-merge, juste
   des transitions CSS pilotées par un attribut data-state.

   Le focus ne quitte JAMAIS le bouton, ni à l'ouverture ni après un
   choix : le clavier reste géré sur le bouton lui-même (aria-activedescendant
   pointe l'option survolée), et les options ne sont pas focusables
   (onMouseDown les empêche de voler le focus à la souris). Première
   version, qui déplaçait le focus dans le panneau puis le ramenait sur
   le bouton avec .focus(), faisait remonter la page au clic : un
   élément qui reçoit le focus alors qu'il est dans une barre en
   position: sticky se fait « rattraper » par le scroll dans certains
   moteurs, même avec preventScroll. Ne plus jamais bouger le focus
   supprime le problème à la racine plutôt que de le contourner.

   Le panneau reste toujours monté, seule son opacité/échelle change :
   ça donne une animation de sortie « gratuite », sans avoir à
   retarder le démontage comme il faudrait avec un simple rendu
   conditionnel.

   Un <select> natif fait tout ça très bien nativement (clavier, lecteur
   d'écran, sélecteur mobile), donc ce composant réimplémente à la main
   le motif ARIA « Listbox Popup avec bouton » (aria-activedescendant,
   pas de focus déplacé dans la liste). */

type Option = { value: string; label: string };

type Props = {
  /** Décrit le champ pour aria-label, jamais affiché. */
  label: string;
  value: string;
  /** Libellé du choix « rien de sélectionné ». Omis : value doit
   *  toujours correspondre à une des options (cas de « Classer par »,
   *  qui n'a pas d'état vide). */
  placeholder?: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
};

function ChevronBas({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 9l7 7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  );
}

export function MenuSelect({ label, value, placeholder, options, onChange, className }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(0);
  const bouton = useRef<HTMLButtonElement>(null);
  const panneau = useRef<HTMLDivElement>(null);
  const id = useId();

  const toutes = placeholder ? [{ value: "", label: placeholder }, ...options] : options;
  const selectionne = Math.max(
    0,
    toutes.findIndex((o) => o.value === value),
  );

  useEffect(() => {
    if (!ouvert) return;
    function surClicExterieur(e: MouseEvent) {
      if (bouton.current?.contains(e.target as Node) || panneau.current?.contains(e.target as Node)) {
        return;
      }
      setOuvert(false);
    }
    document.addEventListener("mousedown", surClicExterieur);
    return () => document.removeEventListener("mousedown", surClicExterieur);
  }, [ouvert]);

  function ouvrir() {
    setActif(selectionne);
    setOuvert(true);
  }

  function choisir(index: number) {
    onChange(toutes[index].value);
    setOuvert(false);
  }

  function surClavier(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (!ouvert) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        ouvrir();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOuvert(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActif((i) => Math.min(i + 1, toutes.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActif((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActif(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActif(toutes.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choisir(actif);
    } else if (e.key === "Tab") {
      setOuvert(false);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <button
        ref={bouton}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={ouvert}
        aria-label={label}
        aria-controls={id}
        aria-activedescendant={ouvert ? `${id}-${actif}` : undefined}
        onClick={() => (ouvert ? setOuvert(false) : ouvrir())}
        onKeyDown={surClavier}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm border
                   border-[var(--divider)] bg-surface px-3 py-2.5 text-left text-sm
                   transition-colors duration-150 hover:border-[var(--muted-3)]"
      >
        <span className={cn("truncate", value ? "text-text" : "text-muted-2")}>
          {toutes[selectionne].label}
        </span>
        <ChevronBas
          className={cn("shrink-0 text-muted-2 transition-transform duration-150", ouvert && "-scale-y-100")}
        />
      </button>

      <div
        ref={panneau}
        id={id}
        role="listbox"
        aria-label={label}
        data-state={ouvert ? "open" : "closed"}
        className="absolute top-[calc(100%+6px)] left-0 z-30 max-h-72 w-max min-w-full origin-top
                   -translate-y-1 overflow-auto rounded-md border border-[var(--divider)]
                   bg-surface py-1 opacity-0 shadow-lg transition-[opacity,transform]
                   duration-150 pointer-events-none scale-95
                   data-[state=open]:pointer-events-auto data-[state=open]:translate-y-0
                   data-[state=open]:scale-100 data-[state=open]:opacity-100"
      >
        {toutes.map((o, i) => (
          <div
            key={o.value || "·vide·"}
            id={`${id}-${i}`}
            role="option"
            aria-selected={i === selectionne}
            /* Empêche le mousedown de voler le focus au bouton : sans
               ça, le focus quitterait le bouton pour cette div (même
               sans tabIndex, un mousedown sur un élément à l'intérieur
               d'un conteneur focusable peut déplacer le focus), ce qui
               rouvrait le risque de saut décrit plus haut. */
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choisir(i)}
            onMouseEnter={() => setActif(i)}
            className={cn(
              "cursor-pointer px-3 py-2 text-sm whitespace-nowrap transition-colors duration-100",
              i === actif ? "bg-[var(--surface-hover)] text-text" : "text-muted-1",
              i === selectionne && "font-medium text-accent-ink",
            )}
          >
            {o.label}
          </div>
        ))}
      </div>
    </div>
  );
}
