import "server-only";
import { z } from "zod";
import { dateAParis, type Salon } from "@/lib/salons";
import { dateHorizon, formatDateLongue } from "@/lib/demandes";

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

/* LA COUTURE. Aujourd'hui la demande n'est enregistrée nulle part : la
   base n'existe pas encore. Cette fonction est le seul endroit à changer
   au branchement de Supabase, elle deviendra un insert anonyme sur
   booking_requests sous RLS. Les composants n'auront pas à bouger, comme
   pour chercherSalons(). Penser à passer DEMANDES_ENREGISTREES à vrai.

   Pas de latence simulée ici. L'état « envoi en cours » du formulaire est
   réel, piloté par useActionState : il ne se voit presque pas en local et
   se verra dès qu'il y aura un aller-retour réseau. C'est le comportement
   voulu, pas un oubli. */
export async function enregistrerDemande(
  salon: Salon,
  demande: DemandeValide,
): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[demande] ${salon.slug} · ${demande.prestation} · ${demande.date} ${demande.creneau} · ${demande.email}`,
    );
  }
}
