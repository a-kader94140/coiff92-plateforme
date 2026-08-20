import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnteteDemande } from "@/components/rendez-vous/entete";
import { FormulaireDemande } from "@/components/rendez-vous/formulaire";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { trouverSalon } from "@/lib/salons";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const salon = trouverSalon(slug);
  /* Le suffixe « | Coiff'92 » est ajouté par le gabarit de titre du layout,
     ne pas l'écrire ici sous peine de le voir deux fois. */
  if (!salon) return { title: "Demande de rendez-vous" };
  return {
    title: `Demander un rendez-vous, ${salon.name}`,
    description: `Envoyez une demande de rendez-vous à ${salon.name}, ${salon.city}. Le salon vérifie ses disponibilités et vous recontacte.`,
    /* Un formulaire n'a rien à faire dans un index de moteur de
       recherche : la page utile, celle qu'on partage, c'est la fiche. */
    robots: { index: false, follow: true },
  };
}

export default async function DemandeRendezVous({ params }: { params: Params }) {
  const { slug } = await params;
  const salon = trouverSalon(slug);
  /* Un salon qui n'a pas complété sa fiche n'a ni prestations ni moyen de
     répondre : le formulaire n'existe pas pour lui. */
  if (!salon || !salon.complete || !salon.prestations?.length) notFound();

  return (
    <div className="flex min-h-[100svh] flex-col">
      <header
        className="flex h-18 shrink-0 items-center justify-between border-b
                   border-[var(--hairline)] px-5 md:px-6"
      >
        <Link href="/" className="font-display text-[22px]">
          Coiff&apos;<span className="text-accent-ink">92</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-[560px] flex-1 px-5 py-6 pb-16 md:px-8">
        <nav aria-label="Fil d'Ariane" className="mb-6 text-[13px] text-muted-2">
          <Link href="/" className="hover:text-text hover:underline underline-offset-2">
            Annuaire
          </Link>
          <span className="px-2 text-muted-3">/</span>
          <Link
            href={`/salon/${salon.slug}`}
            className="hover:text-text hover:underline underline-offset-2"
          >
            {salon.name}
          </Link>
        </nav>

        <div className="mb-7">
          <EnteteDemande salon={salon} />
        </div>

        <FormulaireDemande salon={salon} />
      </main>
    </div>
  );
}
