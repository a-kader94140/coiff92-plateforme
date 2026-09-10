import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { configuration } from "@/lib/supabase";

/* Le client Supabase QUI PORTE UNE SESSION.

   Deux clients coexistent dans ce projet, et les confondre est la
   meilleure façon de se retrouver avec un espace gérant qui affiche
   la fiche du voisin :

   - clientSupabase(), dans lib/supabase.ts, ne porte aucune session.
     Il parle en tant qu'« anon ». Il sert l'annuaire public et le
     dépôt des demandes.

   - clientSession(), ici, lit le cookie de session et parle donc en
     tant qu'« authenticated », avec le gerant_id du visiteur dans
     son jeton. C'est lui, et lui seul, qui doit servir tout ce qui
     se trouve derrière /espace.

   La différence est invisible dans le code appelant : les deux
   exposent la même interface. Elle est en revanche décisive côté
   base, où auth.uid() vaut null pour le premier et l'identifiant du
   gérant pour le second. Toutes les politiques de la 0005 en
   dépendent. */

export async function clientSession() {
  const { url, cle } = configuration();
  const bocal = await cookies();

  return createServerClient(url, cle, {
    cookies: {
      getAll() {
        return bocal.getAll();
      },
      setAll(cookiesAEcrire) {
        /* Un Server Component ne peut pas écrire de cookie : Next
           lève ici. Ce n'est pas une erreur à corriger, c'est le
           fonctionnement normal. Le rafraîchissement du jeton est
           fait par le middleware, qui, lui, tient une réponse HTTP
           et peut écrire. On avale donc l'exception plutôt que de
           faire tomber une page pour un jeton déjà rafraîchi
           ailleurs. */
        try {
          for (const { name, value, options } of cookiesAEcrire) {
            bocal.set(name, value, options);
          }
        } catch {
          /* voir ci-dessus */
        }
      },
    },
  });
}

/* Le gérant connecté, ou null.

   getUser() et non getSession() : getSession() se contente de lire le
   cookie, qu'un visiteur peut fabriquer. getUser() fait valider le
   jeton par Supabase. La différence coûte un aller-retour et vaut la
   peine partout où l'identité décide de ce qu'on affiche. */
export async function gerantConnecte() {
  const { data, error } = await (await clientSession()).auth.getUser();
  if (error) return null;
  return data.user ?? null;
}
