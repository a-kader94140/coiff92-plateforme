"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { Retour } from "@/lib/espace-actions";

/* « Vos modifications ne sont pas encore enregistrées ».

   La planche affichait ce bandeau en permanence, ce qui le vide de
   son sens : un avertissement toujours présent n'avertit de rien. Il
   n'apparaît ici qu'après une modification réelle, et disparaît à
   l'enregistrement.

   Le badge est encadré et porte son texte en toutes lettres, comme
   tous les statuts du système : la couleur ne porte jamais seule
   l'information. */

export function useModifie(etat: Retour | null) {
  const [modifie, setModifie] = useState(false);

  /* Un enregistrement réussi remet le compteur à zéro. En effet et
     non pendant le rendu : l'état vient de l'action, il change après
     coup. */
  useEffect(() => {
    if (etat?.ok) setModifie(false);
  }, [etat]);

  return {
    modifie,
    marquer: () => setModifie(true),
    /* Appelé au moment de l'envoi : si l'action échoue, le bandeau
       « non enregistré » reviendra par le message d'erreur, qui est
       plus précis. */
    reinitialiser: () => setModifie(false),
  };
}

export function Bandeau({ etat, modifie }: { etat: Retour | null; modifie: boolean }) {
  if (etat && !etat.ok) {
    return (
      <p
        role="alert"
        className="m-0 flex flex-wrap items-center gap-2.5 rounded-md border
                   border-accent bg-[var(--accent-wash)] p-3.5 text-[13px]
                   leading-relaxed text-text"
      >
        <Badge tone="refusee">Non enregistré</Badge>
        {etat.message}
      </p>
    );
  }

  if (modifie) {
    return (
      <p className="m-0 flex flex-wrap items-center gap-2.5 rounded-md bg-surface
                    p-3.5 text-[13px] leading-relaxed text-muted-1">
        <Badge tone="nouvelle">Non enregistré</Badge>
        Vos modifications ne sont pas encore visibles par le public.
      </p>
    );
  }

  if (etat?.ok) {
    return (
      <p
        /* « polite » et non « assertive » : la confirmation ne doit pas
           couper la lecture en cours, seulement s'y glisser. */
        role="status"
        aria-live="polite"
        className="m-0 flex flex-wrap items-center gap-2.5 rounded-md bg-surface
                   p-3.5 text-[13px] leading-relaxed text-muted-1"
      >
        <Badge tone="acceptee">Enregistré</Badge>
        Vos modifications sont en ligne sur votre fiche publique.
      </p>
    );
  }

  return null;
}
