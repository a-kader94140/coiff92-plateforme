"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { enregistrerIdentite } from "@/lib/espace-actions";
import type { Salon } from "@/lib/salons";
import { Bandeau, useModifie } from "./bandeau";

/* Le nom public, la description et le téléphone.

   Ce sont EXACTEMENT les trois colonnes que « grant update (nom,
   description, telephone) » de la 0002 autorise. Ajouter un champ ici
   sans toucher au GRANT donnerait un formulaire qui échoue en
   silence, la base refusant la colonne sans que rien ne le dise.

   L'adresse et la commune ne sont pas modifiables, et c'est voulu :
   elles viennent du relevé vérifié. Elles sont rappelées en lecture
   seule pour que le gérant sache ce que le public voit. */

const MAX_DESCRIPTION = 600;

export function EditeurIdentite({ salon }: { salon: Salon }) {
  const [etat, enregistrer, enCours] = useActionState(enregistrerIdentite, null);
  const { modifie, marquer, reinitialiser } = useModifie(etat);
  const [description, setDescription] = useState(salon.description ?? "");

  return (
    <form
      action={(data) => {
        reinitialiser();
        enregistrer(data);
      }}
      className="flex flex-col gap-5"
    >
      <h2 className="font-display m-0 text-xl">Votre salon</h2>

      <Bandeau etat={etat} modifie={modifie} />

      <Field label="Nom public">
        {({ id }) => (
          <Input
            id={id}
            name="nom"
            defaultValue={salon.name}
            onChange={marquer}
            required
            maxLength={120}
          />
        )}
      </Field>

      <Field
        label="Description"
        optional
        help={`${description.length} sur ${MAX_DESCRIPTION} caractères. Ce que vous faites, votre façon de travailler, ce qui vous distingue.`}
      >
        {({ id, describedBy }) => (
          <Textarea
            id={id}
            name="description"
            rows={4}
            maxLength={MAX_DESCRIPTION}
            value={description}
            aria-describedby={describedBy}
            onChange={(e) => {
              setDescription(e.currentTarget.value);
              marquer();
            }}
          />
        )}
      </Field>

      <Field
        label="Téléphone"
        optional
        help="Le numéro affiché sur votre fiche, pour être rappelé directement."
      >
        {({ id, describedBy }) => (
          <Input
            id={id}
            name="telephone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={24}
            defaultValue={salon.phone ?? ""}
            aria-describedby={describedBy}
            onChange={marquer}
            className="tabular w-full sm:w-[240px]"
          />
        )}
      </Field>

      {/* Non modifiable, et dit comme tel plutôt que présenté en champ
          grisé : un champ désactivé laisse croire qu'il pourrait
          s'activer. */}
      <div className="rounded-md bg-surface p-4">
        <p className="m-0 text-[13px] font-medium text-text">Adresse</p>
        <p className="m-0 mt-1 text-[13px] text-muted-1">
          {salon.street}, {salon.postalCode} {salon.city}
        </p>
        <p className="m-0 mt-2 max-w-[52ch] text-[13px] leading-relaxed text-muted-2">
          L&apos;adresse vient du relevé de l&apos;annuaire et ne se modifie pas
          ici. Si elle est fausse, signalez-le et nous la corrigerons.
        </p>
      </div>

      <Button type="submit" disabled={enCours} className="self-start">
        {enCours ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
