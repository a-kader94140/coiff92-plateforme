"use client";

import { useEffect, useState } from "react";
import { cn } from "./cn";

type Theme = "clair" | "sombre";

/* Bascule de thème.

   L'attribut data-theme est déjà posé sur <html> par le script du layout,
   avant le premier rendu. Ce composant se contente de le suivre puis de
   le changer. Tant que le visiteur n'a rien choisi, la page suit la
   préférence du système. */
export function ThemeToggle({ className }: { className?: string }) {
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

  function choisir(next: Theme) {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("coiff92-theme", next);
    } catch {
      /* navigation privée */
    }
    setTheme(next);
  }

  const bouton = (valeur: Theme, libelle: string) => {
    const actif = theme === valeur;
    return (
      <button
        type="button"
        onClick={() => choisir(valeur)}
        aria-pressed={actif}
        className={cn(
          "cursor-pointer border-0 px-4.5 py-2 font-mono text-xs uppercase tracking-[0.04em]",
          "transition-colors duration-150",
          actif
            ? "bg-accent text-on-accent"
            : "bg-transparent text-muted-2 hover:text-text",
        )}
      >
        {libelle}
      </button>
    );
  };

  return (
    <div
      className={cn(
        "inline-flex overflow-hidden rounded-md border border-[var(--divider)]",
        className,
      )}
    >
      {bouton("clair", "Clair")}
      {bouton("sombre", "Sombre")}
    </div>
  );
}
