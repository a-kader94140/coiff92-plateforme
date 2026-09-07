"use server";

import { enregistrerDemande, schemaDemande } from "@/lib/demandes-schema";
import type { EtatEnvoi, Valeurs } from "@/lib/demandes";
import { trouverSalon } from "@/lib/salons-data";

/* L'action vit dans lib/ et non dans le dossier de la route : deux routes
   l'utilisent, la page pleine et le panneau qui l'intercepte.

   Ce module ne contient qu'une fonction asynchrone, et c'est une
   contrainte du cadre, pas un choix de rangement : « use server » expose
   chaque export comme un point d'entrée appelable depuis le réseau. */

const lire = (form: FormData, nom: string) => String(form.get(nom) ?? "");

function valeursDe(form: FormData): Valeurs {
  return {
    nom: lire(form, "nom"),
    email: lire(form, "email"),
    tel: lire(form, "tel"),
    prestation: lire(form, "prestation"),
    date: lire(form, "date"),
    creneau: lire(form, "creneau"),
    message: lire(form, "message"),
  };
}

export async function envoyerDemande(
  _precedent: EtatEnvoi,
  form: FormData,
): Promise<EtatEnvoi> {
  const valeurs = valeursDe(form);

  /* Le slug arrive d'un champ caché, donc du navigateur, donc d'une
     source à qui on ne fait pas confiance. On le revérifie ici : c'est le
     serveur qui décide quel salon existe et lequel accepte des demandes. */
  const salon = await trouverSalon(lire(form, "salon"));
  if (!salon || !salon.complete) {
    return {
      statut: "erreur",
      erreurs: {},
      valeurs,
      global: "Ce salon ne reçoit pas de demandes en ligne.",
    };
  }

  const analyse = schemaDemande(salon).safeParse(valeurs);

  if (!analyse.success) {
    const erreurs: Partial<Record<keyof Valeurs, string>> = {};
    /* Le premier message par champ suffit : en empiler trois sous un même
       champ n'aide personne à le corriger. */
    for (const probleme of analyse.error.issues) {
      const champ = probleme.path[0] as keyof Valeurs | undefined;
      if (champ && !erreurs[champ]) erreurs[champ] = probleme.message;
    }
    return { statut: "erreur", erreurs, valeurs };
  }

  /* Le piège à robots. Le champ « site_web » est posé hors de l'écran et
     masqué aux lecteurs d'écran : un visiteur ne peut ni le voir, ni
     l'atteindre au clavier, ni l'entendre. S'il arrive rempli, c'est un
     automate, qui remplit tout ce qu'il trouve.

     On lui répond alors comme si tout allait bien, sans rien enregistrer.
     Lui dire qu'il est repéré ne ferait que l'aider à s'adapter.

     Le test vient après la validation, et non avant : un automate n'a pas
     à apprendre plus vite qu'un visiteur ce que le serveur accepte. */
  if (lire(form, "site_web").trim() !== "") {
    return { statut: "succes", demande: analyse.data };
  }

  try {
    await enregistrerDemande(salon, analyse.data);
  } catch {
    /* Une panne d'enregistrement ne doit pas ressembler à une erreur de
       saisie : le visiteur n'a rien à corriger, il a à réessayer. */
    return {
      statut: "erreur",
      erreurs: {},
      valeurs,
      global:
        "L'envoi n'a pas abouti. Réessayez dans un instant, votre saisie est conservée.",
    };
  }

  return { statut: "succes", demande: analyse.data };
}
