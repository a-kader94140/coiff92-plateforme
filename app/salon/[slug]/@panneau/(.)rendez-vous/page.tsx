import { notFound } from "next/navigation";
import { EnteteDemande } from "@/components/rendez-vous/entete";
import { FormulaireDemande } from "@/components/rendez-vous/formulaire";
import { BoutonFermer, PanneauModal } from "@/components/rendez-vous/panneau";
import { trouverSalon } from "@/lib/salons-data";

/* La route interceptrice.

   Depuis la fiche du salon, un clic sur « Demander un rendez-vous »
   affiche ce panneau par-dessus la fiche, sans la quitter : le visiteur
   garde sous les yeux les horaires et les tarifs qu'il est en train de
   demander. L'URL change quand même.

   À l'ouverture directe de cette même URL, au rafraîchissement, ou à
   l'arrivée depuis un lien partagé, l'interception ne joue pas et c'est
   la page pleine de ../../rendez-vous qui répond. Une seule adresse, deux
   présentations, aucun contenu dupliqué : les deux montent le même
   FormulaireDemande. */

type Params = Promise<{ slug: string }>;

export default async function PanneauRendezVous({ params }: { params: Params }) {
  const { slug } = await params;
  const salon = await trouverSalon(slug);
  if (!salon || !salon.complete || !salon.prestations?.length) notFound();

  return (
    <PanneauModal>
      <div className="flex h-dvh flex-col">
        <div
          className="flex shrink-0 items-start justify-between gap-4 border-b
                     border-[var(--hairline)] px-5 py-4 md:px-6"
        >
          <EnteteDemande salon={salon} />
          <BoutonFermer />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 pb-10 md:px-6">
          <FormulaireDemande salon={salon} />
        </div>
      </div>
    </PanneauModal>
  );
}
