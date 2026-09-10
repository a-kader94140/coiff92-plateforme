import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/* Le seul travail de ce fichier : rafraîchir le jeton de session.

   Un jeton Supabase expire vite, et seul un endroit du framework peut
   en écrire un neuf dans un cookie : celui qui tient une réponse HTTP.
   Un Server Component n'en tient pas. Sans ce middleware, un gérant
   serait déconnecté à la première expiration.

   Il ne protège AUCUNE route. La protection est faite dans
   app/espace/layout.tsx, en Server Component, où l'on peut appeler
   getUser() et rediriger proprement. Un middleware qui décide de
   l'accès sur la seule présence d'un cookie protège mal : le cookie
   n'est pas vérifié à ce stade. */

export async function middleware(requete: NextRequest) {
  let reponse = NextResponse.next({ request: requete });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  /* Sans configuration, on laisse passer sans rien tenter. Une
     variable manquante doit se voir sur la page qui en a besoin, avec
     le message de lib/supabase.ts, et non sous la forme d'un
     middleware qui casse tout le site. */
  if (!url || !cle) return reponse;

  const supabase = createServerClient(url, cle, {
    cookies: {
      getAll() {
        return requete.cookies.getAll();
      },
      setAll(cookiesAEcrire) {
        for (const { name, value } of cookiesAEcrire) {
          requete.cookies.set(name, value);
        }
        reponse = NextResponse.next({ request: requete });
        for (const { name, value, options } of cookiesAEcrire) {
          reponse.cookies.set(name, value, options);
        }
      },
    },
  });

  /* Cet appel a l'air inutile puisqu'on jette le résultat. Il ne
     l'est pas : c'est lui qui déclenche le rafraîchissement et donc
     l'écriture des cookies ci-dessus. */
  await supabase.auth.getUser();

  return reponse;
}

export const config = {
  matcher: [
    /* Tout, sauf les fichiers statiques et les images. Inutile de
       réveiller Supabase pour servir une police ou une icône. */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|opengraph-image.jpg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
