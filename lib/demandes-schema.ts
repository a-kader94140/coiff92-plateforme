import "server-only";
import { z } from "zod";
import { dateAParis, type Salon } from "@/lib/salons";
import { dateHorizon, formatDateLongue } from "@/lib/demandes";
import { clientSupabase } from "@/lib/supabase";

/* La validation, côté serveur uniquement.

   « server-only » est une garde de compilation : si un composant client
   importe ce module un jour par mégarde, la construction échoue avec un
   message clair au lieu d'expédier zod dans le navigateur. */

/* Numéro français, fixe ou mobile, saisi avec ou sans séparateurs.
   Volontairement permissif : refuser un numéro correct parce qu'il porte
   des points coûte un rendez-vous, accepter un numéro douteux ne coûte
   rien puisque c'est le salon qui rappelle. */
const TELEPHONE = /^(?:\+33[\s.-]?|0)[1-9](?:[\s.-]?\d{2}){4}$/;

/* Le schéma dépend du salon : les prestations proposées sont les siennes,
   pas une liste générique. C'est aussi la garde côté serveur, un champ
   caché trafiqué ne fait pas passer une prestation qui n'existe pas. */
export function schemaDemande(salon: Salon) {
  const prestations = (salon.prestations ?? []).map((p) => p.label);
  const aujourdhui = dateAParis();
  const limite = dateHorizon(aujourdhui);

  return z.object({
    nom: z
      .string()
      .trim()
      .min(2, { error: "Indiquez votre nom, deux caractères au minimum." })
      .max(80, { error: "Ce nom dépasse 80 caractères." }),

    email: z
      .string()
      .trim()
      .pipe(
        z.email({
          error: "Format d'e-mail incomplet. Exemple : marie.dupont@gmail.com",
        }),
      ),

    tel: z
      .string()
      .trim()
      .regex(TELEPHONE, {
        error: "Numéro français attendu. Exemple : 06 12 34 56 78",
      }),

    prestation: z.string().refine((v) => prestations.includes(v), {
      error: "Choisissez une prestation dans la liste.",
    }),

    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Indiquez la date que vous souhaitez." })
      .refine((d) => d >= aujourdhui, { error: "Cette date est déjà passée." })
      .refine((d) => d <= limite, {
        error: `Choisissez une date d'ici le ${formatDateLongue(limite)}.`,
      }),

    creneau: z.enum(["matin", "apres_midi", "soir"], {
      error: "Choisissez un créneau.",
    }),

    message: z
      .string()
      .trim()
      .max(1000, { error: "Ce message dépasse 1000 caractères." }),
  });
}

export type DemandeValide = z.infer<ReturnType<typeof schemaDemande>>;

/* ─────────────────────────  persistance  ───────────────────────── */

/* L'enregistrement, branché sur Supabase.

   La demande part au statut « nouvelle », qui est le défaut de la
   colonne : la politique RLS l'exige et refuse tout autre statut à
   l'insertion. Personne ne s'accepte un rendez-vous tout seul.

   Pas de .select() après l'insert. Ce serait une lecture, et aucune
   politique de lecture n'existe sur cette table tant que l'espace
   gérant n'est pas là. L'insert seul n'en a pas besoin.

   Les erreurs remontent telles quelles : envoyerDemande les rattrape et
   dit au visiteur de réessayer, sans lui laisser croire qu'il a mal
   saisi quelque chose. */
export async function enregistrerDemande(
  salon: Salon,
  demande: DemandeValide,
): Promise<void> {
  const { error } = await clientSupabase().from("demandes").insert({
    salon_slug: salon.slug,
    nom: demande.nom,
    email: demande.email,
    tel: demande.tel,
    prestation: demande.prestation,
    date_souhaitee: demande.date,
    creneau: demande.creneau,
    message: demande.message,
  });

  if (error) {
    throw new Error(`Demande non enregistrée : ${error.message}`);
  }
}
