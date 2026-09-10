"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { RECLAMATION_VIERGE } from "@/lib/connexion";
import { reclamerFiche } from "@/lib/connexion-actions";

/* Le clic délibéré qui prend possession de la fiche.

   Il est séparé de la connexion, et ce n'est pas une étape de trop :
   un lien reçu par e-mail est régulièrement ouvert sans intention, par
   un antivirus de messagerie ou un aperçu de lien. Si le seul fait
   d'ouvrir le lien réclamait la fiche, elle pourrait être prise sans
   que personne ne l'ait voulu, et la seule sortie serait un litige. */

export function ConfirmerReclamation({
  slug,
  nomSalon,
}: {
  slug: string;
  nomSalon: string;
}) {
  const [etat, reclamer, enCours] = useActionState(reclamerFiche, RECLAMATION_VIERGE);

  return (
    <form action={reclamer} className="flex flex-col gap-5">
      <input type="hidden" name="slug" value={slug} />

      {etat.statut === "erreur" && (
        <p
          role="alert"
          className="m-0 rounded-md border border-accent bg-[var(--accent-wash)]
                     p-4 text-[13px] leading-relaxed text-text"
        >
          {etat.message}
        </p>
      )}

      <p className="m-0 max-w-[52ch] text-sm leading-relaxed text-muted-1">
        Vous êtes connecté. En confirmant, vous devenez le gérant de{" "}
        <span className="font-medium text-text">{nomSalon}</span> : vous pourrez
        compléter la fiche et recevoir les demandes de rendez-vous. Une fiche ne
        peut avoir qu&apos;un seul gérant.
      </p>

      <Button type="submit" size="lg" disabled={enCours} className="self-start">
        {enCours ? "Réclamation en cours…" : "Confirmer, cette fiche est la mienne"}
      </Button>
    </form>
  );
}
