"use client";

import { useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import type { Salon } from "@/lib/salons";

/* Menu « Voir l'itinéraire » : un bouton qui ouvre un choix de service
   (Google Maps, Waze, Citymapper) plutôt qu'un lien unique vers Google
   Maps. Chaque service a ses propres exigences :

   - Google Maps se contente d'une adresse texte.
   - Waze accepte une adresse, mais des coordonnées (ll=) évitent toute
     ambiguïté quand plusieurs rues portent un nom proche.
   - Citymapper exige des coordonnées (endcoord) : sans elles, pas de
     lien fiable, c'est pour ça que les 142 fiches ont été géocodées
     (voir la migration 0010).

   Ce menu n'est jamais posé dans la barre sticky des filtres, donc pas
   besoin du contournement du MenuSelect (focus qui ne quitte jamais le
   bouton) : ce sont ici de vrais liens, focusables normalement. */

type Props = {
  salon: Salon;
  /** « bouton » reprend le CTA principal de la fiche non réclamée,
   *  « lien » le lien texte souligné de la fiche complète. */
  variant?: "bouton" | "lien";
  className?: string;
};

function adresseComplete(salon: Salon) {
  return `${salon.name} ${salon.street} ${salon.postalCode} ${salon.city}`;
}

function liensCarte(salon: Salon) {
  const adresse = adresseComplete(salon);
  const aCoordonnees = salon.lat !== undefined && salon.lng !== undefined;

  return [
    {
      label: "Google Maps",
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresse)}`,
    },
    {
      label: "Waze",
      href: aCoordonnees
        ? `https://waze.com/ul?ll=${salon.lat}%2C${salon.lng}&navigate=yes`
        : `https://waze.com/ul?q=${encodeURIComponent(adresse)}&navigate=yes`,
    },
    ...(aCoordonnees
      ? [
          {
            label: "Citymapper",
            href:
              `https://citymapper.com/directions?endcoord=${salon.lat}%2C${salon.lng}` +
              `&endname=${encodeURIComponent(salon.name)}` +
              `&endaddress=${encodeURIComponent(`${salon.street}, ${salon.postalCode} ${salon.city}`)}`,
          },
        ]
      : []),
  ];
}

function ChevronBas({ ouvert }: { ouvert: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0 transition-transform duration-150", ouvert && "-scale-y-100")}
    >
      <path d="M5 9l7 7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  );
}

export function ItineraireMenu({ salon, variant = "lien", className }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const racine = useRef<HTMLDivElement>(null);
  const liens = liensCarte(salon);

  useEffect(() => {
    if (!ouvert) return;
    function surClicExterieur(e: MouseEvent) {
      if (!racine.current?.contains(e.target as Node)) setOuvert(false);
    }
    function surEchap(e: KeyboardEvent) {
      if (e.key === "Escape") setOuvert(false);
    }
    document.addEventListener("mousedown", surClicExterieur);
    document.addEventListener("keydown", surEchap);
    return () => {
      document.removeEventListener("mousedown", surClicExterieur);
      document.removeEventListener("keydown", surEchap);
    };
  }, [ouvert]);

  const classeDeclencheur =
    variant === "bouton"
      ? buttonClass({ variant: "principal", size: "lg" })
      : "inline-flex items-center gap-1.5 text-sm font-medium text-accent-ink underline underline-offset-4";

  return (
    <div ref={racine} className={cn("relative inline-block", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={ouvert}
        onClick={() => setOuvert((v) => !v)}
        className={classeDeclencheur}
      >
        Voir l&apos;itinéraire
        <ChevronBas ouvert={ouvert} />
      </button>

      <div
        role="menu"
        aria-label="Choisir un service d'itinéraire"
        data-state={ouvert ? "open" : "closed"}
        className="absolute top-[calc(100%+6px)] left-0 z-30 w-max min-w-44 origin-top -translate-y-1
                   overflow-hidden rounded-md border border-[var(--divider)] bg-surface py-1
                   opacity-0 shadow-lg transition-[opacity,transform] duration-150 pointer-events-none
                   scale-95 data-[state=open]:pointer-events-auto data-[state=open]:translate-y-0
                   data-[state=open]:scale-100 data-[state=open]:opacity-100"
      >
        {liens.map((l) => (
          <a
            key={l.label}
            role="menuitem"
            href={l.href}
            target="_blank"
            rel="noopener"
            onClick={() => setOuvert(false)}
            className="block px-3.5 py-2 text-sm text-text no-underline transition-colors
                       duration-100 hover:bg-[var(--surface-hover)]"
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}
