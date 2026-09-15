"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* Retour vers l'annuaire. Un simple <Link href="/"> perdrait les filtres
   choisis (ville, type, recherche) puisqu'ils vivent dans l'URL : on
   préfère router.back() pour retomber sur la liste telle qu'elle était.

   Mais back() n'a de sens que si on vient bien de l'annuaire : arrivé sur
   la fiche par un lien externe ou direct, il renverrait hors du site. On
   ne le sait qu'au montage (document.referrer n'existe pas côté serveur),
   d'où l'état local et le repli sur un lien classique en attendant. */
export function RetourListe() {
  const router = useRouter();
  const [depuisAnnuaire, setDepuisAnnuaire] = useState(false);

  useEffect(() => {
    setDepuisAnnuaire(document.referrer.startsWith(window.location.origin));
  }, []);

  const classe =
    "inline-flex items-center gap-1.5 text-[13px] text-muted-2 hover:text-text " +
    "hover:underline underline-offset-2";

  const contenu = (
    <>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="square"
        />
      </svg>
      Retour à la liste
    </>
  );

  if (depuisAnnuaire) {
    return (
      <button type="button" onClick={() => router.back()} className={classe}>
        {contenu}
      </button>
    );
  }

  return (
    <Link href="/" className={classe}>
      {contenu}
    </Link>
  );
}
