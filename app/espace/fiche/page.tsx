import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EditeurHoraires } from "@/components/espace/editeur-horaires";
import { EditeurIdentite } from "@/components/espace/editeur-identite";
import { EditeurPrestations } from "@/components/espace/editeur-prestations";
import { Badge } from "@/components/ui/badge";
import { mesHoraires, mesPrestations, monSalon } from "@/lib/espace-data";

export const metadata: Metadata = { title: "Ma fiche" };

export default async function MaFiche() {
  const salon = await monSalon();
  /* Le layout a déjà écarté ce cas. Le refaire ici évite un « ! » sur
     salon.id trois lignes plus bas, et couvre le jour où cette page
     serait atteinte autrement. */
  if (!salon?.id) redirect("/espace/demandes");

  const [prestations, horaires] = await Promise.all([
    mesPrestations(salon.id),
    mesHoraires(salon.id),
  ]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display m-0 text-[clamp(22px,4vw,28px)] leading-tight">
          Ma fiche
        </h1>
        <Link
          href={`/salon/${salon.slug}`}
          className="text-[13px] text-accent-ink underline underline-offset-2"
        >
          Voir ma fiche publique
        </Link>
      </div>

      {/* L'avertissement le plus utile de la page, et il n'était pas
          dans la maquette : tant qu'il n'y a aucune prestation, la
          fiche n'accepte pas de demande. C'est la seule chose qui
          sépare un gérant de sa première demande de rendez-vous. */}
      {prestations.length === 0 && (
        <p className="m-0 mb-8 flex flex-wrap items-center gap-2.5 rounded-md
                      border border-accent bg-[var(--accent-wash)] p-4 text-[13px]
                      leading-relaxed text-text">
          <Badge tone="nouvelle">Fiche incomplète</Badge>
          Ajoutez au moins une prestation pour que votre fiche accepte les demandes
          de rendez-vous.
        </p>
      )}

      {/* Une colonne. La maquette en proposait deux, avec l'aperçu
          collé à droite, mais elle ne montrait que trois champs. Avec
          les prestations et les sept jours d'horaires, la colonne de
          droite se retrouvait vide sur les deux tiers de la hauteur.
          L'aperçu est donc rapproché de ce qu'il montre, sous les
          prestations. */}
      <div className="flex max-w-[720px] flex-col gap-12">
        <EditeurIdentite salon={salon} />
        <EditeurPrestations prestations={prestations} />
        <EditeurHoraires horaires={horaires} />
      </div>
    </>
  );
}
