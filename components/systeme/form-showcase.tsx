"use client";

import { useState } from "react";
import { Field, Input, RadioGroup, Select, Textarea } from "@/components/ui/field";

/* Îlot client du guide de style : seuls les champs ont besoin d'état.
   Le reste de la page reste un composant serveur. */
export function FormShowcase() {
  const [creneau, setCreneau] = useState("apres_midi");

  return (
    <div className="grid gap-7 md:grid-cols-2">
      <Field label="Nom du salon" help="Tel qu'il apparaît dans l'annuaire public.">
        {({ id, describedBy }) => (
          <Input id={id} aria-describedby={describedBy} defaultValue="Salon Lucien" />
        )}
      </Field>

      <Field label="Adresse e-mail" error="Format d'e-mail invalide.">
        {({ id, describedBy }) => (
          <Input
            id={id}
            type="email"
            invalid
            aria-describedby={describedBy}
            defaultValue="contact@salon"
          />
        )}
      </Field>

      <Field label="Commune">
        {({ id, describedBy }) => (
          <Select id={id} aria-describedby={describedBy} defaultValue="Boulogne-Billancourt">
            <option>Boulogne-Billancourt</option>
            <option>Nanterre</option>
            <option>Courbevoie</option>
          </Select>
        )}
      </Field>

      <Field
        label="Date du rendez-vous souhaité"
        help="Le salon confirme le créneau exact par retour."
      >
        {({ id, describedBy }) => (
          <Input id={id} type="date" aria-describedby={describedBy} />
        )}
      </Field>

      <RadioGroup
        legend="Créneau préféré"
        name="creneau"
        value={creneau}
        onChange={setCreneau}
        options={[
          { value: "matin", label: "Matin" },
          { value: "apres_midi", label: "Après-midi" },
          { value: "soir", label: "Soir" },
        ]}
      />

      <Field label="Message au salon" optional help="200 caractères maximum.">
        {({ id, describedBy }) => (
          <Textarea
            id={id}
            maxLength={200}
            aria-describedby={describedBy}
            defaultValue="Je souhaite une coupe courte, merci."
          />
        )}
      </Field>
    </div>
  );
}
