"use client";

import { useRef } from "react";
import { Select } from "@/components/ui/field";
import { changerStatut } from "@/lib/espace-actions";
import type { StatutDemande } from "@/lib/espace-data";

/* Le statut se change depuis la liste, sans ouvrir de page.

   CORRECTION PAR RAPPORT A LA PLANCHE : ce sélecteur n'y portait
   aucun libellé. Sur une liste de dix demandes, un lecteur d'écran
   annonçait dix fois « liste déroulante, Nouvelle », sans jamais dire
   à quel client elle se rapportait.

   Le libellé n'a pas sa place à l'écran, la ligne dit déjà de quoi il
   s'agit. Il est donc porté par aria-label, qui nomme le client :
   « Statut de la demande de Malik Benhaddou ». */

const OPTIONS: { value: StatutDemande; label: string }[] = [
  { value: "nouvelle", label: "Nouvelle" },
  { value: "acceptee", label: "Acceptée" },
  { value: "refusee", label: "Refusée" },
  { value: "traitee", label: "Traitée" },
];

export function SelecteurStatut({
  id,
  statut,
  client,
}: {
  id: string;
  statut: StatutDemande;
  client: string;
}) {
  const form = useRef<HTMLFormElement>(null);

  return (
    <form ref={form} action={changerStatut} className="shrink-0">
      <input type="hidden" name="id" value={id} />

      {/* Pas de bouton « Enregistrer » : le changement part au
          relâchement de la liste. Le <noscript> plus bas rétablit un
          bouton quand le script n'a pas chargé, sans quoi le statut
          deviendrait immodifiable. */}
      <Select
        name="statut"
        defaultValue={statut}
        aria-label={`Statut de la demande de ${client}`}
        onChange={() => form.current?.requestSubmit()}
        className="sm:w-[150px]"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>

      <noscript>
        <button
          type="submit"
          className="mt-2 w-full cursor-pointer rounded-md border
                     border-[var(--divider)] bg-surface-2 px-3 py-2
                     text-[13px] font-medium text-text"
        >
          Changer le statut
        </button>
      </noscript>
    </form>
  );
}
