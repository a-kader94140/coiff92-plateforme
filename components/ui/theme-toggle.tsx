"use client";

import { useEffect, useState } from "react";
import { cn } from "./cn";

type Theme = "clair" | "sombre";

/* Bascule de thème.

   L'attribut data-theme est déjà posé sur <html> par le script du layout,
   avant le premier rendu. Ce composant se contente de le suivre puis de
   le changer. Tant que le visiteur n'a rien choisi, la page suit la
   préférence du système.

   Un seul interrupteur (role="switch"), pas deux boutons Clair/Sombre :
   le curseur glisse d'un côté à l'autre en CSS pur (transition sur
   transform), sans dépendance d'animation. Coins à 3px comme le reste
   du système de formes, jamais en pilule. */
type Props = {
  className?: string;
  /* "hero" : posé en surimpression sur la photo du héro de l'accueil.
     --divider y serait illisible, la photo est sombre quel que soit
     le thème actif. Seul l'habillage inactif change, pour du blanc
     translucide ; le curseur reste en accent, déjà lisible sur
     n'importe quel fond. */
  variant?: "defaut" | "hero";
};

function IconeSoleil({ className }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="square"
      />
    </svg>
  );
}

function IconeLune({ className }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle({ className, variant = "defaut" }: Props) {
  const surHero = variant === "hero";
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const explicite = document.documentElement.getAttribute("data-theme");
    if (explicite === "clair" || explicite === "sombre") {
      setTheme(explicite);
      return;
    }
    setTheme(
      window.matchMedia("(prefers-color-scheme: dark)").matches ? "sombre" : "clair",
    );
  }, []);

  function basculer() {
    /* theme vaut encore null le temps du premier rendu client (avant
       l'effet ci-dessus) : un clic à ce moment-là bascule vers sombre
       par défaut, cohérent avec un curseur qui parait à gauche tant
       qu'on ne sait pas mieux. */
    const suivant: Theme = theme === "sombre" ? "clair" : "sombre";
    document.documentElement.setAttribute("data-theme", suivant);
    try {
      localStorage.setItem("coiff92-theme", suivant);
    } catch {
      /* navigation privée */
    }
    setTheme(suivant);
  }

  const sombre = theme === "sombre";

  return (
    <button
      type="button"
      onClick={basculer}
      role="switch"
      aria-checked={sombre}
      aria-label={`Passer au thème ${sombre ? "clair" : "sombre"}`}
      className={cn(
        "relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-md border p-0.5",
        "transition-colors duration-150",
        surHero ? "border-white/30 bg-black/15" : "border-[var(--divider)] bg-surface",
        className,
      )}
    >
      {/* Icônes fixes, sous le curseur : elles ne bougent pas, seul le
          curseur glisse par-dessus. */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
        <IconeSoleil className={surHero ? "text-white/70" : "text-muted-2"} />
        <IconeLune className={surHero ? "text-white/70" : "text-muted-2"} />
      </span>

      {/* Curseur */}
      <span
        aria-hidden="true"
        className={cn(
          "relative z-10 grid size-[26px] place-items-center rounded-sm bg-accent text-on-accent",
          "transition-transform duration-200 ease-out",
          sombre ? "translate-x-[24px]" : "translate-x-0",
        )}
      >
        {sombre ? <IconeLune /> : <IconeSoleil />}
      </span>
    </button>
  );
}
