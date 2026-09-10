/* L'entrée dans l'espace gérant, côté types.

   Comme lib/demandes.ts, ce module est lu par des composants client :
   IL NE DOIT RIEN IMPORTER DE ZOD ni de Supabase. Tout ce qu'il
   importe part dans le navigateur. Les schémas et les actions vivent
   dans connexion-actions.ts, que seul le serveur lit. */

/* ─────────────────────────  connexion  ───────────────────────── */

export type EtatConnexion =
  | { statut: "vierge" }
  /* L'adresse est conservée pour l'afficher sur l'écran d'attente :
     « nous avons envoyé un lien à … ». Sans elle, le gérant ne peut
     pas vérifier qu'il n'a pas fait de faute de frappe. */
  | { statut: "envoye"; email: string }
  | { statut: "erreur"; email: string; message: string };

export const CONNEXION_VIERGE: EtatConnexion = { statut: "vierge" };

/* ─────────────────────────  réclamation  ───────────────────────── */

export type EtatReclamation =
  | { statut: "vierge" }
  | { statut: "erreur"; message: string };

export const RECLAMATION_VIERGE: EtatReclamation = { statut: "vierge" };

/* ─────────────────────────  litige  ───────────────────────── */

export type ValeursLitige = {
  email: string;
  situation: string;
};

export const LITIGE_VIDE: ValeursLitige = { email: "", situation: "" };

export type EtatLitige =
  | { statut: "vierge" }
  | { statut: "envoye" }
  | {
      statut: "erreur";
      valeurs: ValeursLitige;
      erreurs: Partial<Record<keyof ValeursLitige, string>>;
      global?: string;
    };

export const LITIGE_VIERGE: EtatLitige = { statut: "vierge" };

/* Les bornes viennent des contraintes de la table litiges, en 0004.
   Les répéter ici sert à afficher un compteur et à refuser la saisie
   avant l'aller-retour ; la base reste seule juge. */
export const SITUATION_MIN = 20;
export const SITUATION_MAX = 2000;
