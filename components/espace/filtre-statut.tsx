"use client";

import { useRouter } from "next/navigation";
import { Field, Select } from "@/components/ui/field";
import type { StatutDemande } from "@/lib/espace-data";

/* Le filtre par statut.

   CORRECTION PAR RAPPORT A LA PLANCHE : il n'avait aucun libellé, et
   « Tous les statuts » en première option en tenait lieu. Dès qu'on
   choisit « Nouvelle », plus rien à l'écran ne dit ce que cette liste
   filtre. C'est exactement ce que le système interdit.

   Le libellé est donc au-dessus, comme partout ailleurs. Les
   compteurs entre parenthèses évitent au passage de choisir une
   catégorie vide et de croire à une perte de données. */

const OPTIONS: { value: StatutDemande; label: string }[] = [
  { value: "nouvelle", label: "Nouvelles" },
  { value: "acceptee", label: "Acceptées" },
  { value: "refusee", label: "Refusées" },
  { value: "traitee", label: "Traitées" },
];

export function FiltreStatut({
  actif,
  comptes,
}: {
  actif?: StatutDemande;
  comptes: Record<StatutDemande, number>;
}) {
  const router = useRouter();
  const total = Object.values(comptes).reduce((a, b) => a + b, 0);

  return (
    <Field label="Filtrer par statut">
      {({ id }) => (
        <Select
          id={id}
          name="statut"
          defaultValue={actif ?? ""}
          onChange={(e) => {
            const v = e.currentTarget.value;
            router.push(v ? `/espace/demandes?statut=${v}` : "/espace/demandes");
          }}
          className="w-full sm:w-[210px]"
        >
          <option value="">Toutes les demandes ({total})</option>
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label} ({comptes[o.value]})
            </option>
          ))}
        </Select>
      )}
    </Field>
  );
}
