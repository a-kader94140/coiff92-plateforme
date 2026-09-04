import "server-only";
import { createClient } from "@supabase/supabase-js";

/* Le client Supabase, côté serveur.

   La clé est publiable, donc publique par conception : le jour où un
   client navigateur existera, elle partira dans le navigateur. Ce n'est
   pas elle qui protège les données, ce sont les politiques RLS. On ne
   cherche donc pas à la cacher, on s'assure que la base refuse ce qu'elle
   ne doit pas laisser passer. Voir supabase/migrations/0001_demandes.sql.

   Pas de client conservé entre les appels : ce n'est qu'un objet de
   configuration, le recréer ne coûte rien, et un client gardé au niveau
   du module vieillit mal dans un environnement sans état. */

function configuration() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  /* Échouer ici, avec un message qui nomme les deux variables, plutôt
     que de laisser createClient partir avec « undefined » et produire
     une erreur réseau incompréhensible trois appels plus loin. */
  if (!url || !cle) {
    throw new Error(
      "Supabase n'est pas configuré. NEXT_PUBLIC_SUPABASE_URL et " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY doivent être définies dans .env.local, " +
        "voir .env.example.",
    );
  }

  return { url, cle };
}

export function clientSupabase() {
  const { url, cle } = configuration();

  /* Aucune session à conserver : ce client ne sert qu'à des écritures
     anonymes. La connexion des gérants viendra avec son propre client. */
  return createClient(url, cle, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
