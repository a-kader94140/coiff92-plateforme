import { dateAParis } from "@/lib/salons";
import type { DemandeValide } from "@/lib/demandes-schema";

/** Réexporté pour que le formulaire, qui est un composant client, n'ait
 *  jamais à nommer le module du schéma. Réexport de type : effacé à la
 *  compilation, il n'entraîne pas zod avec lui. */
export type { DemandeValide };

/* Une demande de rendez-vous, pas une réservation.

   La plateforme ne tient pas l'agenda des salons et ne prétend pas le
   faire : le visiteur envoie une demande, le salon vérifie ses
   disponibilités et le rappelle. Tout le vocabulaire de ce fichier suit
   cette règle, on n'y trouvera jamais le mot « réservé ».

   CE MODULE NE DOIT RIEN IMPORTER DE ZOD. Il est chargé par le formulaire,
   qui est un composant client : tout ce qu'il importe part dans le
   navigateur. Le schéma vit à côté, dans demandes-schema.ts, et n'est lu
   que par le serveur. Quand les deux étaient réunis, cette seule route
   pesait 83 kB de JavaScript de plus que les autres.

   L'import de DemandeValide ci-dessus est un import de type : il
   disparaît à la compilation et n'entraîne rien avec lui. */

export const CRENEAUX = [
  { value: "matin", label: "Matin" },
  { value: "apres_midi", label: "Après-midi" },
  { value: "soir", label: "Soir" },
] as const;

export type Creneau = (typeof CRENEAUX)[number]["value"];

export const LIBELLES_CRENEAU: Record<Creneau, string> = {
  matin: "Matin",
  apres_midi: "Après-midi",
  soir: "Soir",
};

/** Les champs tels qu'ils arrivent du formulaire, avant validation. */
export type Valeurs = {
  nom: string;
  email: string;
  tel: string;
  prestation: string;
  date: string;
  creneau: string;
  message: string;
};

export const VALEURS_VIDES: Valeurs = {
  nom: "",
  email: "",
  tel: "",
  prestation: "",
  date: "",
  creneau: "",
  message: "",
};

/* ─────────────────────────  état du formulaire  ───────────────────────── */

/* Ce type et sa valeur initiale vivent ici plutôt qu'à côté de l'action :
   un module « use server » ne peut exporter que des fonctions
   asynchrones, une constante y serait refusée à la compilation. */
export type EtatEnvoi =
  | { statut: "vierge" }
  | {
      statut: "erreur";
      /** Message par champ, affiché sous le champ concerné. */
      erreurs: Partial<Record<keyof Valeurs, string>>;
      /** Ce que le visiteur avait saisi, pour ne rien lui faire retaper. */
      valeurs: Valeurs;
      /** Panne générale, qui n'appartient à aucun champ. */
      global?: string;
    }
  | { statut: "succes"; demande: DemandeValide };

export const ETAT_INITIAL: EtatEnvoi = { statut: "vierge" };

/* ─────────────────────────  bornes de date  ───────────────────────── */

/** Au-delà de six mois, la demande n'a plus de sens : le salon ne peut
 *  pas s'engager si loin, et une faute de frappe sur l'année passerait
 *  sans être vue. */
const HORIZON_MOIS = 6;

export function dateHorizon(depuis: string): string {
  const [a, m, j] = depuis.split("-").map(Number);
  const d = new Date(Date.UTC(a, m - 1, j));
  d.setUTCMonth(d.getUTCMonth() + HORIZON_MOIS);
  return d.toISOString().slice(0, 10);
}

/** Les bornes du sélecteur de date natif, pour que le calendrier du
 *  navigateur interdise déjà ce que le serveur refuserait. */
export function bornesDate(): { min: string; max: string } {
  const min = dateAParis();
  return { min, max: dateHorizon(min) };
}

/** Vrai depuis le branchement de Supabase : une demande envoyée est
 *  réellement enregistrée. L'écran de confirmation s'en sert pour savoir
 *  s'il peut affirmer que le salon a reçu quelque chose. Repasser à faux
 *  si l'enregistrement redevient un talon, jamais par confort. */
export const DEMANDES_ENREGISTREES = true;

/* ─────────────────────────  mise en forme  ───────────────────────── */

/** « 2026-09-04 » devient « vendredi 4 septembre 2026 ». */
export function formatDateLongue(iso: string): string {
  const [a, m, j] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(a, m - 1, j)));
}
