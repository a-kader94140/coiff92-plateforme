import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LIBELLES_TYPE, trouverSalon } from "@/lib/salons";

/* Étape suivante : la réclamation de fiche et la connexion par lien,
   dont la maquette n'est pas encore portée. Cette page existe pour que le
   bouton de la fiche non réclamée mène quelque part. */

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const salon = trouverSalon(slug);
  return { title: salon ? `Réclamer ${salon.name}` : "Réclamer une fiche" };
}

export default async function ReclamerFiche({ params }: { params: Params }) {
  const { slug } = await params;
  const salon = trouverSalon(slug);
  if (!salon) notFound();

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

      <main className="mx-auto w-full max-w-[560px] flex-1 px-5 py-12 md:px-8">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
          Réclamer une fiche
        </p>
        <h1 className="m-0 text-[clamp(26px,4vw,34px)] leading-tight">{salon.name}</h1>
        <p className="mt-3 text-sm text-muted-1">
          {LIBELLES_TYPE[salon.type]}, {salon.street}, {salon.postalCode} {salon.city}
        </p>
        <p className="mt-6 text-sm leading-relaxed text-muted-2">
          La connexion par lien arrive avec la prochaine maquette. Elle permettra au
          gérant de compléter ses prestations, ses horaires, et de recevoir les demandes
          de rendez-vous.
        </p>
        <Link
          href={`/salon/${salon.slug}`}
          className="mt-8 inline-flex items-center justify-center rounded-md border
                     border-[var(--divider)] px-5 py-2.5 text-sm font-medium text-text
                     transition-colors duration-150 hover:bg-surface-2"
        >
          Revenir à la fiche
        </Link>
      </main>
    </div>
  );
}
