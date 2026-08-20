import type { ReactNode } from "react";

/* Ce gabarit n'existe que pour ouvrir un second créneau à côté du
   contenu : `panneau`. C'est lui qui permet à la demande de rendez-vous
   de s'afficher par-dessus la fiche sans la démonter.

   Il n'ajoute aucun balisage autour de la fiche, et c'est voulu : un
   gabarit qui envelopperait tout dans un <div> changerait la mise en
   page de toutes les fiches pour le seul besoin du panneau. */
export default function GabaritFiche({
  children,
  panneau,
}: {
  children: ReactNode;
  panneau: ReactNode;
}) {
  return (
    <>
      {children}
      {panneau}
    </>
  );
}
