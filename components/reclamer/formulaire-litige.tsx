"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { LITIGE_VIERGE, SITUATION_MIN } from "@/lib/connexion";
import { signalerLitige } from "@/lib/connexion-actions";

/* Ce qui remplace le bouton « Contacter l'équipe » de la maquette.

   La planche le faisait pointer nulle part, faute d'adresse de
   contact. Plutôt que d'inventer un e-mail, le signalement est
   enregistré dans la table litiges de la 0004. Il n'y a pas
   d'interface pour les lire, et le texte ci-dessous ne prétend donc
   pas qu'une réponse arrivera dans un délai donné. */

export function FormulaireLitige({
  slug,
  nomSalon,
}: {
  slug: string;
  nomSalon: string;
}) {
  const [etat, envoyer, enCours] = useActionState(signalerLitige, LITIGE_VIERGE);

  if (etat.statut === "envoye") {
    return (
      <div className="rounded-md border border-accent bg-[var(--accent-wash)] p-5">
        <p className="m-0 text-[15px] font-medium text-text">
          Votre signalement est enregistré
        </p>
        <p className="m-0 mt-2 max-w-[52ch] text-[13px] leading-relaxed text-muted-1">
          Nous le lisons et vous répondons par e-mail à l&apos;adresse indiquée.
          En attendant, la fiche reste gérée par son compte actuel.
        </p>
      </div>
    );
  }

  const valeurs = etat.statut === "erreur" ? etat.valeurs : { email: "", situation: "" };
  const erreurs = etat.statut === "erreur" ? etat.erreurs : {};

  return (
    <form action={envoyer} className="flex flex-col gap-5">
      <input type="hidden" name="slug" value={slug} />

      {etat.statut === "erreur" && etat.global && (
        <p
          role="alert"
          className="m-0 rounded-md border border-accent bg-[var(--accent-wash)]
                     p-4 text-[13px] leading-relaxed text-text"
        >
          {etat.global}
        </p>
      )}

      <Field label="Votre e-mail" error={erreurs.email}>
        {({ id, describedBy }) => (
          <Input
            id={id}
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={valeurs.email}
            invalid={Boolean(erreurs.email)}
            aria-describedby={describedBy}
          />
        )}
      </Field>

      <Field
        label="Votre situation"
        help={`Expliquez pourquoi ${nomSalon} devrait vous revenir : reprise du fonds de commerce, changement de gérance, erreur de rattachement. ${SITUATION_MIN} caractères au moins.`}
        error={erreurs.situation}
      >
        {({ id, describedBy }) => (
          <Textarea
            id={id}
            name="situation"
            rows={4}
            required
            minLength={SITUATION_MIN}
            defaultValue={valeurs.situation}
            invalid={Boolean(erreurs.situation)}
            aria-describedby={describedBy}
          />
        )}
      </Field>

      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="site_web_litige">Ne remplissez pas ce champ</label>
        <input
          id="site_web_litige"
          name="site_web"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <Button type="submit" disabled={enCours} className="self-start">
        {enCours ? "Envoi en cours…" : "Envoyer ma demande"}
      </Button>
    </form>
  );
}
