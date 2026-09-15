import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FormulaireConnexion } from "@/components/connexion/formulaire-connexion";
import { ConfirmerReclamation } from "@/components/reclamer/confirmation";
import { FormulaireLitige } from "@/components/reclamer/formulaire-litige";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LIBELLES_TYPE } from "@/lib/salons";
import { trouverSalon } from "@/lib/salons-data";
import { monSalon } from "@/lib/espace-data";
import { gerantConnecte } from "@/lib/supabase-session";
import { Wordmark } from "@/components/ui/wordmark";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const salon = await trouverSalon(slug);
  return {
    title: salon ? `Réclamer ${salon.name}` : "Réclamer une fiche",
    robots: { index: false, follow: false },
  };
}

export default async function ReclamerFiche({ params }: { params: Params }) {
  const { slug } = await params;
  const salon = await trouverSalon(slug);
  if (!salon) notFound();

  const utilisateur = await gerantConnecte();

  /* Quatre situations, et une seule s'affiche.

     Le cas « c'est déjà ma fiche » est traité en premier parce qu'il
     n'a pas d'écran : on renvoie le gérant chez lui plutôt que de lui
     proposer de réclamer ce qu'il possède, ou de signaler un litige
     contre lui-même. */
  if (utilisateur && salon.reclamee) {
    const mien = await monSalon();
    if (mien?.slug === salon.slug) redirect("/espace/fiche");
  }

  return (
    <div className="flex min-h-[100svh] flex-col">
      <header
        className="flex h-18 shrink-0 items-center justify-between border-b
                   border-[var(--hairline)] px-5 md:px-6"
      >
        <Link href="/" className="font-display text-[22px]">
          <Wordmark n92ClassName="text-accent-ink" />
          <span className="tabular ml-2.5 text-[11px] uppercase tracking-[0.08em] text-muted-2">
            Espace gérant
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-[560px] flex-1 px-5 py-12 md:px-8">
        {/* Le rappel du salon, présent dans les trois cas : on ne
            demande jamais à quelqu'un de s'engager sans lui redire
            sur quoi. */}
        <div className="rounded-md bg-surface p-4">
          <p className="m-0 text-[15px] font-medium text-text">{salon.name}</p>
          <p className="m-0 mt-1 text-[13px] text-muted-2">
            {LIBELLES_TYPE[salon.type]}, {salon.street}, {salon.postalCode} {salon.city}
          </p>
        </div>

        <div className="mt-8">
          {salon.reclamee ? (
            <DejaReclamee slug={salon.slug} nomSalon={salon.name} />
          ) : utilisateur ? (
            <ConfirmerReclamation slug={salon.slug} nomSalon={salon.name} />
          ) : (
            <FormulaireConnexion
              titre="Réclamer cette fiche"
              intro="Réclamer cette fiche vous permet d'ajouter vos horaires et prestations, et de recevoir les demandes de rendez-vous directement. Nous vous envoyons d'abord un lien pour vérifier votre adresse."
              libelleEmail="E-mail professionnel"
              suite={`/reclamer/${salon.slug}`}
            />
          )}
        </div>

        <Link
          href={`/salon/${salon.slug}`}
          className={buttonClass({ variant: "discret", size: "sm", className: "mt-10" })}
        >
          Revenir à la fiche publique
        </Link>
      </main>
    </div>
  );
}

/* ─────────────────────────  fiche déjà prise  ───────────────────────── */

function DejaReclamee({ slug, nomSalon }: { slug: string; nomSalon: string }) {
  return (
    <div className="flex flex-col gap-5">
      <Badge tone="acceptee">Fiche déjà réclamée</Badge>

      <h1 className="font-display m-0 text-[clamp(22px,4vw,24px)] leading-tight">
        Cette fiche a déjà un gérant
      </h1>

      <p className="m-0 max-w-[52ch] text-sm leading-relaxed text-muted-1">
        Un compte gère déjà {nomSalon}. Si vous pensez qu&apos;il s&apos;agit
        d&apos;une erreur, par exemple après un changement de propriétaire,
        décrivez votre situation ci-dessous.
      </p>

      <FormulaireLitige slug={slug} nomSalon={nomSalon} />
    </div>
  );
}
