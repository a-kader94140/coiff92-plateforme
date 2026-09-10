import { NextResponse, type NextRequest } from "next/server";
import { clientSession } from "@/lib/supabase-session";

/* Le retour du lien reçu par e-mail.

   Supabase envoie le gérant sur /auth/v1/verify, qui le renvoie ici
   avec un code à usage unique. C'est ce code qu'on échange contre une
   session, côté serveur : le jeton n'apparaît jamais dans l'URL de la
   page finale, donc ni dans l'historique du navigateur, ni dans les
   journaux d'un serveur intermédiaire.

   Cette route ne réclame aucune fiche et ne modifie rien d'autre que
   la session. Un lien ouvert par un antivirus de messagerie ou un
   aperçu de lien ne doit produire aucun effet visible. */

export async function GET(requete: NextRequest) {
  const url = new URL(requete.url);
  const code = url.searchParams.get("code");

  /* Même précaution que dans l'action qui a fabriqué le lien : on
     n'accepte qu'un chemin interne. Un « suite » recopié tel quel
     ferait de ce lien de connexion une redirection ouverte. */
  const brut = url.searchParams.get("suite") ?? "";
  const suite = brut.startsWith("/") && !brut.startsWith("//") ? brut : "/espace/demandes";

  if (!code) {
    return NextResponse.redirect(new URL("/connexion?echec=lien", url.origin));
  }

  const { error } = await (await clientSession()).auth.exchangeCodeForSession(code);

  if (error) {
    /* Lien expiré, déjà utilisé, ou ouvert dans un autre navigateur
       que celui qui l'a demandé. Le message est le même dans les
       trois cas : redemander un lien. Distinguer les causes
       renseignerait un attaquant sans aider le gérant. */
    return NextResponse.redirect(new URL("/connexion?echec=lien", url.origin));
  }

  return NextResponse.redirect(new URL(suite, url.origin));
}
