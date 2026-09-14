"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { MenuSelect } from "@/components/ui/menu-select";
import { LIBELLES_TYPE, type SalonType, type Tri } from "@/lib/salons";

type Props = {
  q: string;
  ville: string;
  type: string;
  tri: Tri;
  communes: string[];
  total: number;
  nbCommunes: number;
};

/* Les filtres vivent dans l'URL, pas dans l'état du composant : une
   recherche est partageable par lien, le bouton Retour fonctionne, et le
   rendu reste côté serveur. */
export function Filtres({ q, ville, type, tri, communes, total, nbCommunes }: Props) {
  const router = useRouter();
  const [enCours, demarrer] = useTransition();
  const [saisie, setSaisie] = useState(q);
  const premierRendu = useRef(true);
  const scrollAvant = useRef<number | null>(null);

  function naviguer(champs: Record<string, string>) {
    const params = new URLSearchParams();
    const valeurs = { q: saisie, ville, type, tri, ...champs };
    if (valeurs.q) params.set("q", valeurs.q);
    if (valeurs.ville) params.set("ville", valeurs.ville);
    if (valeurs.type) params.set("type", valeurs.type);
    if (valeurs.tri && valeurs.tri !== "ville") params.set("tri", valeurs.tri);
    const qs = params.toString();
    /* { scroll: false } ne suffit pas : router.replace() fait quand
       même remonter la page en haut, y compris pour une simple frappe
       dans la recherche. On note la position avant de lancer la
       transition, et on la réimpose nous-mêmes une fois le nouveau
       rendu arrivé (voir l'effet sur enCours plus bas), plutôt que de
       compter sur une option qui ne tient pas sa promesse ici. */
    scrollAvant.current = window.scrollY;
    demarrer(() => router.replace(qs ? `/?${qs}` : "/", { scroll: false }));
  }

  useEffect(() => {
    if (!enCours && scrollAvant.current !== null) {
      /* behavior: "auto" est nécessaire, pas juste l'omettre : sinon
         scroll-behavior: smooth (globals.css) anime ce retour, ce qui
         se verrait comme un aller-retour au lieu de ne rien voir du
         tout. */
      window.scrollTo({ top: scrollAvant.current, behavior: "auto" });
      scrollAvant.current = null;
    }
  }, [enCours]);

  /* La saisie ne déclenche pas une navigation par frappe : on attend une
     pause de 250 ms, sinon chaque lettre relance un rendu serveur. */
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    const t = setTimeout(() => naviguer({ q: saisie }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saisie]);

  const champ =
    "rounded-sm border border-[var(--divider)] bg-surface px-3 py-2.5 text-sm " +
    "text-text placeholder:text-muted-3 transition-colors duration-150 " +
    "hover:border-[var(--muted-3)]";

  return (
    <div
      id="filtres"
      className="sticky top-0 z-20 flex flex-wrap items-center gap-2.5 border-b
                 border-[var(--hairline)] bg-bg/95 px-5 py-4 backdrop-blur-md md:px-6"
    >
      <label className="sr-only" htmlFor="recherche">
        Rechercher un salon, une adresse
      </label>
      <input
        id="recherche"
        type="search"
        value={saisie}
        onChange={(e) => setSaisie(e.target.value)}
        placeholder="Rechercher un salon, une adresse"
        className={`${champ} min-w-50 flex-[1_1_240px]`}
      />

      {/* Assez large pour « Toutes les communes », son libellé le plus long :
          en dessous, le bouton tronquait sa propre valeur par défaut. */}
      <MenuSelect
        label="Filtrer par commune"
        value={ville}
        placeholder="Toutes les communes"
        options={communes.map((c) => ({ value: c, label: c }))}
        onChange={(v) => naviguer({ ville: v })}
        className="min-w-52 flex-[0_1_210px]"
      />

      <MenuSelect
        label="Filtrer par type d'établissement"
        value={type}
        placeholder="Tous les types"
        options={(Object.keys(LIBELLES_TYPE) as SalonType[]).map((t) => ({
          value: t,
          label: LIBELLES_TYPE[t],
        }))}
        onChange={(v) => naviguer({ type: v })}
        className="min-w-32 flex-[0_1_150px]"
      />

      <MenuSelect
        label="Classer par"
        value={tri}
        options={[
          { value: "ville", label: "Classer par ville" },
          { value: "nom", label: "Classer par nom" },
          { value: "complete", label: "Fiches complètes d'abord" },
        ]}
        onChange={(v) => naviguer({ tri: v })}
        className="min-w-32 flex-[0_1_150px]"
      />

      <p
        aria-live="polite"
        className="tabular ml-auto shrink-0 text-xs text-muted-2"
        data-pending={enCours || undefined}
      >
        {enCours
          ? "Mise à jour"
          : `${total} adresse${total > 1 ? "s" : ""}, ${nbCommunes} commune${nbCommunes > 1 ? "s" : ""}`}
      </p>
    </div>
  );
}
