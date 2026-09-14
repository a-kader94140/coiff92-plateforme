import { NextResponse, type NextRequest } from "next/server";
import { clientSupabase } from "@/lib/supabase";

/* Purge RGPD quotidienne, déclenchée par le cron Vercel (vercel.json).

   Vérifie le secret que Vercel joint automatiquement dès que
   CRON_SECRET existe dans les variables d'environnement du projet :
   ça empêche n'importe qui d'appeler cette route depuis l'extérieur
   et de fausser les journaux. Ce n'est qu'une précaution : la
   fonction appelée côté base est sans paramètre et ne supprime que ce
   qui a plus de 12 mois (voir la migration 0008), donc même sans
   secret configuré la route ne donnerait aucune prise à un appel
   malveillant.

   CRON_SECRET n'est pas encore défini dans .env.example : c'est une
   variable à ajouter uniquement sur Vercel (Production), jamais en
   local, une chaîne aléatoire suffit. */

export async function GET(requete: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const entete = requete.headers.get("authorization");
    if (entete !== `Bearer ${secret}`) {
      return NextResponse.json({ erreur: "non autorisé" }, { status: 401 });
    }
  }

  const { data, error } = await clientSupabase().rpc("purger_donnees_expirees");

  if (error) {
    return NextResponse.json({ erreur: error.message }, { status: 500 });
  }

  return NextResponse.json(data?.[0] ?? { demandes_supprimees: 0, litiges_supprimes: 0 });
}
