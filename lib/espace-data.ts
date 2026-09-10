import "server-only";
import { cache } from "react";
import { clientSession } from "@/lib/supabase-session";
import type { Creneau } from "@/lib/demandes";
import type { Horaire, Prestation, Salon, SalonType } from "@/lib/salons";

/* Les lectures de l'espace gérant.

   TOUT passe par clientSession(), jamais par clientSupabase() : c'est
   la session qui porte le gerant_id, et sans elle les politiques de
   la 0005 ne rendent rien. Une seule ligne au mauvais client ferait
   une page vide, ou pire, la fiche de quelqu'un d'autre. */

export type StatutDemande = "nouvelle" | "acceptee" | "refusee" | "traitee";

export const STATUTS: StatutDemande[] = [
  "nouvelle",
  "acceptee",
  "refusee",
  "traitee",
];

export function estStatut(v: string | undefined): v is StatutDemande {
  return STATUTS.includes(v as StatutDemande);
}

export type Demande = {
  id: string;
  nom: string;
  email: string;
  tel: string;
  prestation: string;
  date: string;
  creneau: Creneau;
  message: string | null;
  statut: StatutDemande;
  recueLe: string;
};

function echec(quoi: string, message: string): never {
  throw new Error(`Lecture de ${quoi} impossible : ${message}`);
}

/** La fiche du gérant connecté, ou undefined s'il n'en a réclamé
 *  aucune. Passe par la fonction mon_salon() de la 0004 : gerant_id
 *  n'étant plus lisible, un « where gerant_id = auth.uid() » depuis
 *  l'application serait refusé. */
export const monSalon = cache(async (): Promise<Salon | undefined> => {
  const { data, error } = await (await clientSession()).rpc("mon_salon");

  if (error) echec("votre fiche", error.message);
  const ligne = (data as LigneAnnuaire[] | null)?.[0];
  if (!ligne) return undefined;

  return {
    id: ligne.id,
    slug: ligne.slug,
    name: ligne.nom,
    city: ligne.ville,
    postalCode: ligne.code_postal,
    street: ligne.rue,
    type: ligne.type as SalonType,
    demo: ligne.demo,
    complete: ligne.complete,
    reclamee: ligne.reclamee,
    description: ligne.description ?? undefined,
    phone: ligne.telephone ?? undefined,
  };
});

type LigneAnnuaire = {
  id: string;
  slug: string;
  nom: string;
  ville: string;
  code_postal: string;
  rue: string;
  type: string;
  demo: boolean;
  description: string | null;
  telephone: string | null;
  reclamee: boolean;
  complete: boolean;
};

/** Les demandes reçues par le salon du gérant.
 *
 *  Aucun filtre sur le salon n'est écrit ici, et c'est voulu : la
 *  politique « le gerant lit ses demandes » ne laisse remonter que
 *  les siennes. Ajouter un « eq » de plus donnerait l'illusion que
 *  c'est le code qui protège, alors que c'est la base. Le test 2
 *  vérifie cette promesse à chaque exécution. */
export async function mesDemandes(statut?: StatutDemande): Promise<Demande[]> {
  let requete = (await clientSession())
    .from("demandes")
    .select("id,nom,email,tel,prestation,date_souhaitee,creneau,message,statut,cree_le")
    .order("cree_le", { ascending: false });

  if (statut) requete = requete.eq("statut", statut);

  const { data, error } = await requete;
  if (error) echec("vos demandes", error.message);

  return (data ?? []).map((d) => ({
    id: d.id,
    nom: d.nom,
    email: d.email,
    tel: d.tel,
    prestation: d.prestation,
    date: d.date_souhaitee,
    creneau: d.creneau as Creneau,
    message: d.message,
    statut: d.statut as StatutDemande,
    recueLe: d.cree_le,
  }));
}

/** Le nombre de demandes par statut, pour le filtre. Une requête de
 *  plus, mais elle évite d'afficher un filtre qui mène à une liste
 *  vide sans prévenir. */
export async function comptesParStatut(): Promise<Record<StatutDemande, number>> {
  const { data, error } = await (await clientSession())
    .from("demandes")
    .select("statut");

  if (error) echec("le compte de vos demandes", error.message);

  const comptes: Record<StatutDemande, number> = {
    nouvelle: 0,
    acceptee: 0,
    refusee: 0,
    traitee: 0,
  };
  for (const d of data ?? []) {
    const s = d.statut as StatutDemande;
    if (s in comptes) comptes[s] += 1;
  }
  return comptes;
}

/** Les prestations du salon, dans l'ordre choisi par le gérant. */
export async function mesPrestations(salonId: string): Promise<Prestation[]> {
  const { data, error } = await (await clientSession())
    .from("prestations")
    .select("id,libelle,duree_min,prix_cents")
    .eq("salon_id", salonId)
    .order("position");

  if (error) echec("vos prestations", error.message);

  return (data ?? []).map((p) => ({
    id: p.id,
    label: p.libelle,
    dureeMin: p.duree_min,
    prixCents: p.prix_cents,
  }));
}

/** Les sept jours, toujours les sept, même ceux qui n'ont pas de
 *  ligne en base : l'écran d'édition doit présenter un formulaire
 *  complet, pas des trous. */
export async function mesHoraires(salonId: string): Promise<Horaire[]> {
  const { data, error } = await (await clientSession())
    .from("horaires")
    .select("jour,ouvre,ferme")
    .eq("salon_id", salonId);

  if (error) echec("vos horaires", error.message);

  const parJour = new Map<number, Horaire>();
  for (const h of data ?? []) {
    parJour.set(h.jour, {
      jour: h.jour,
      ouvre: h.ouvre ? String(h.ouvre).slice(0, 5) : null,
      ferme: h.ferme ? String(h.ferme).slice(0, 5) : null,
    });
  }

  return [0, 1, 2, 3, 4, 5, 6].map(
    (jour) => parJour.get(jour) ?? { jour, ouvre: null, ferme: null },
  );
}
