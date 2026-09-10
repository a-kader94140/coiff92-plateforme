"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  SITUATION_MAX,
  SITUATION_MIN,
  type EtatConnexion,
  type EtatLitige,
  type EtatReclamation,
  type ValeursLitige,
} from "@/lib/connexion";
import { clientSupabase } from "@/lib/supabase";
import { clientSession } from "@/lib/supabase-session";
import { trouverSalon } from "@/lib/salons-data";

/* « use server » expose chaque export comme un point d'entrée
   appelable depuis le réseau. Tout ce qui est ici est donc, par
   construction, atteignable par n'importe qui : chaque fonction
   revalide ses entrées et ne fait confiance à aucun champ caché. */

const lire = (form: FormData, nom: string) => String(form.get(nom) ?? "");

const schemaEmail = z
  .string()
  .trim()
  .min(1, "Indiquez votre adresse e-mail.")
  .max(200, "Cette adresse est trop longue.")
  /* Volontairement permissif. Une expression régulière stricte
     rejette des adresses valides, et de toute façon la seule preuve
     qu'une adresse existe est qu'un message y arrive. */
  .regex(/^[^@\s]+@[^@\s.]+\.[^@\s]+$/, "Cette adresse ne semble pas valide.");

/* L'origine réelle de la requête, et non une valeur en dur.
   Le lien de connexion doit ramener sur le site d'où il est parti :
   localhost en développement, le domaine en production. Une valeur
   figée obligerait à jongler avec une variable d'environnement de
   plus, et enverrait les gérants sur le mauvais site le jour où on
   oublierait de la changer. */
async function origine() {
  const entetes = await headers();
  const hote = entetes.get("x-forwarded-host") ?? entetes.get("host");
  const protocole = entetes.get("x-forwarded-proto") ?? "http";
  return `${protocole}://${hote}`;
}

/* ─────────────────────────  connexion  ───────────────────────── */

export async function envoyerLienConnexion(
  _precedent: EtatConnexion,
  form: FormData,
): Promise<EtatConnexion> {
  const brut = lire(form, "email");
  const analyse = schemaEmail.safeParse(brut);

  if (!analyse.success) {
    return {
      statut: "erreur",
      email: brut,
      message: analyse.error.issues[0].message,
    };
  }
  const email = analyse.data;

  /* Même piège à robots que le formulaire de rendez-vous, et pour la
     même raison : un automate remplit tout ce qu'il trouve. On lui
     répond « c'est envoyé » sans rien envoyer. Le test vient après la
     validation, pour qu'il n'apprenne pas plus vite qu'un humain ce
     que le serveur accepte. */
  if (lire(form, "site_web").trim() !== "") {
    return { statut: "envoye", email };
  }

  /* « suite » dit où revenir après le clic sur le lien. Il vient du
     navigateur : on n'accepte qu'un chemin interne, jamais une URL
     complète, sans quoi le lien de connexion deviendrait un tremplin
     vers un site tiers. */
  const suite = cheminInterne(lire(form, "suite"));

  const { error } = await (await clientSession()).auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${await origine()}/auth/confirmer?suite=${encodeURIComponent(suite)}`,
      /* Aucun compte n'est créé au vol : réclamer une fiche est ce
         qui fait d'un visiteur un gérant, et cela se passe sur un
         écran qui le dit. Mettre « false » ici ferait échouer la
         toute première connexion d'un gérant légitime. */
      shouldCreateUser: true,
    },
  });

  if (error) {
    return {
      statut: "erreur",
      email,
      message:
        "L'envoi n'a pas abouti. Réessayez dans un instant, ou vérifiez l'adresse saisie.",
    };
  }

  return { statut: "envoye", email };
}

/** N'accepte qu'un chemin relatif du site. Tout le reste ramène à
 *  l'espace gérant. « //ailleurs.example » est une URL absolue pour un
 *  navigateur, d'où le refus du double slash. */
function cheminInterne(valeur: string): string {
  const v = valeur.trim();
  if (!v.startsWith("/") || v.startsWith("//")) return "/espace/demandes";
  return v;
}

export async function seDeconnecter() {
  await (await clientSession()).auth.signOut();
  redirect("/");
}

/* ─────────────────────────  réclamation  ───────────────────────── */

/* Réclamer n'est PAS fait automatiquement au clic sur le lien reçu
   par e-mail. Un lien ouvert depuis une messagerie peut l'être par un
   antivirus, un aperçu, un robot d'indexation. Prendre possession
   d'une fiche est un acte qui engage : il demande un clic délibéré,
   sur une page qui rappelle de quel salon il s'agit. */
export async function reclamerFiche(
  _precedent: EtatReclamation,
  form: FormData,
): Promise<EtatReclamation> {
  const slug = lire(form, "slug");

  const supabase = await clientSession();
  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) {
    return {
      statut: "erreur",
      message: "Votre session a expiré. Redemandez un lien de connexion.",
    };
  }

  /* La fonction de la 0002 pose elle-même la condition « et
     gerant_id is null », dans le WHERE et non dans un IF : deux
     personnes qui réclament la même fiche à la même seconde ne
     peuvent pas passer toutes les deux. Le contrôle est donc en base,
     pas ici. */
  const { error } = await supabase.rpc("reclamer_salon", { p_slug: slug });

  if (error) {
    return {
      statut: "erreur",
      message:
        "Cette fiche n'a pas pu être réclamée. Elle vient peut-être d'être prise par un autre compte.",
    };
  }

  redirect("/espace/fiche");
}

/* ─────────────────────────  litige  ───────────────────────── */

const schemaLitige = z.object({
  email: schemaEmail,
  situation: z
    .string()
    .trim()
    .min(
      SITUATION_MIN,
      `Décrivez votre situation en ${SITUATION_MIN} caractères au moins.`,
    )
    .max(SITUATION_MAX, "Cette description est trop longue."),
});

export async function signalerLitige(
  _precedent: EtatLitige,
  form: FormData,
): Promise<EtatLitige> {
  const valeurs: ValeursLitige = {
    email: lire(form, "email"),
    situation: lire(form, "situation"),
  };

  const analyse = schemaLitige.safeParse(valeurs);
  if (!analyse.success) {
    const erreurs: Partial<Record<keyof ValeursLitige, string>> = {};
    for (const probleme of analyse.error.issues) {
      const champ = probleme.path[0] as keyof ValeursLitige | undefined;
      if (champ && !erreurs[champ]) erreurs[champ] = probleme.message;
    }
    return { statut: "erreur", valeurs, erreurs };
  }

  /* Le slug vient d'un champ caché : c'est le serveur qui décide
     quelle fiche existe, et qu'elle est bien réclamée. Signaler un
     litige sur une fiche libre n'a aucun sens, on n'ouvre pas cette
     porte. */
  const salon = await trouverSalon(lire(form, "slug"));
  if (!salon?.reclamee) {
    return {
      statut: "erreur",
      valeurs,
      erreurs: {},
      global: "Cette fiche n'a pas de gérant, il n'y a rien à signaler.",
    };
  }

  if (lire(form, "site_web").trim() !== "") {
    return { statut: "envoye" };
  }

  /* Le client anonyme, et non celui de session : signaler un litige
     n'exige pas de compte. C'est justement quelqu'un qui n'arrive pas
     à entrer qui écrit. */
  const { error } = await clientSupabase().from("litiges").insert({
    salon_slug: salon.slug,
    email: analyse.data.email,
    situation: analyse.data.situation,
  });

  if (error) {
    return {
      statut: "erreur",
      valeurs,
      erreurs: {},
      global:
        "L'envoi n'a pas abouti. Réessayez dans un instant, votre saisie est conservée.",
    };
  }

  return { statut: "envoye" };
}
