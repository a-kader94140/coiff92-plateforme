"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
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

  function naviguer(champs: Record<string, string>) {
    const params = new URLSearchParams();
    const valeurs = { q: saisie, ville, type, tri, ...champs };
    if (valeurs.q) params.set("q", valeurs.q);
    if (valeurs.ville) params.set("ville", valeurs.ville);
    if (valeurs.type) params.set("type", valeurs.type);
    if (valeurs.tri && valeurs.tri !== "ville") params.set("tri", valeurs.tri);
    const qs = params.toString();
    demarrer(() => router.replace(qs ? `/?${qs}` : "/", { scroll: false }));
  }

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

      <label className="sr-only" htmlFor="ville">
        Filtrer par commune
      </label>
      {/* Assez large pour « Toutes les communes », son libellé le plus long :
          en dessous, le sélecteur tronquait sa propre valeur par défaut. */}
      <select
        id="ville"
        value={ville}
        onChange={(e) => naviguer({ ville: e.target.value })}
        className={`${champ} min-w-52 flex-[0_1_210px] cursor-pointer`}
      >
        <option value="">Toutes les communes</option>
        {communes.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="type">
        Filtrer par type d&apos;établissement
      </label>
      <select
        id="type"
        value={type}
        onChange={(e) => naviguer({ type: e.target.value })}
        className={`${champ} min-w-32 flex-[0_1_150px] cursor-pointer`}
      >
        <option value="">Tous les types</option>
        {(Object.keys(LIBELLES_TYPE) as SalonType[]).map((t) => (
          <option key={t} value={t}>
            {LIBELLES_TYPE[t]}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="tri">
        Classer par
      </label>
      <select
        id="tri"
        value={tri}
        onChange={(e) => naviguer({ tri: e.target.value })}
        className={`${champ} min-w-32 flex-[0_1_150px] cursor-pointer`}
      >
        <option value="ville">Classer par ville</option>
        <option value="nom">Classer par nom</option>
        <option value="complete">Fiches complètes d&apos;abord</option>
      </select>

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
