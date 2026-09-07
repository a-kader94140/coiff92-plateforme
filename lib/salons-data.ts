import "server-only";
import { cache } from "react";
import { clientSupabase } from "@/lib/supabase";
import {
  grouper,
  type Horaire,
  type Prestation,
  type Recherche,
  type Resultat,
  type Salon,
  type SalonType,
} from "@/lib/salons";

/* Les salons, lus en base.

   Avant la 0003, cette lecture était un import de tableau TypeScript.
   Elle passe par Supabase, mais la forme rendue aux composants ne change
   pas : ils reçoivent des Salon, comme avant.

   Tout passe par la VUE « annuaire », jamais par la table « salons »
   directement. La vue est la surface publique : elle calcule « complete »
   et « reclamee », et n'expose pas gerant_id. S'appuyer sur elle plutôt
   que sur la table permettra de resserrer les droits de lecture sur
   gerant_id sans toucher une ligne de ce fichier. */

/* Les noms de colonnes sont ceux de la base, en français et en
   souligné. La conversion vers le type Salon se fait une seule fois,
   ci-dessous, et nulle part ailleurs. */
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

const CHAMPS_ANNUAIRE =
  "id,slug,nom,ville,code_postal,rue,type,demo,description,telephone,reclamee,complete";

/* La base garantit déjà que « type » vaut barber, coiffeur ou mixte : la
   contrainte type_valide de la 0002 refuse tout le reste. Ce cast dit
   à TypeScript ce que Postgres sait déjà. */
function versSalon(l: LigneAnnuaire): Salon {
  return {
    id: l.id,
    slug: l.slug,
    name: l.nom,
    city: l.ville,
    postalCode: l.code_postal,
    street: l.rue,
    type: l.type as SalonType,
    demo: l.demo,
    complete: l.complete,
    reclamee: l.reclamee,
    description: l.description ?? undefined,
    phone: l.telephone ?? undefined,
  };
}

/* Postgres rend une heure « 09:30:00 ». formatHeure() attend « 09:30 »,
   sans quoi elle produirait « 09h30:00 ». On coupe ici, au seul endroit
   où la donnée entre. */
const hhmm = (v: string | null): string | null => (v === null ? null : v.slice(0, 5));

function echec(quoi: string, message: string): never {
  throw new Error(`Lecture de ${quoi} impossible : ${message}`);
}

/* cache() de React, pas un cache de données : il déduplique les appels
   à l'intérieur d'UNE requête. Une page de salon appelle trouverSalon
   deux fois, dans generateMetadata puis dans le composant. Sans ça, deux
   allers-retours vers Supabase pour la même ligne. */

/** Les 142 fiches, sous leur forme légère. Une requête, réutilisée par
 *  la recherche, la liste des communes et les compteurs du pied de page. */
export const toutLAnnuaire = cache(async (): Promise<Salon[]> => {
  const { data, error } = await clientSupabase()
    .from("annuaire")
    .select(CHAMPS_ANNUAIRE);

  if (error) echec("l'annuaire", error.message);
  return (data as LigneAnnuaire[]).map(versSalon);
});

export async function chercherSalons(recherche: Recherche): Promise<Resultat> {
  return grouper(await toutLAnnuaire(), recherche);
}

/** Les communes représentées, triées sans tenir compte des accents.
 *  Déduite des fiches et non figée dans une liste : une commune qui
 *  n'a plus de salon disparaît toute seule du filtre. */
export async function listeCommunes(): Promise<string[]> {
  const villes = new Set((await toutLAnnuaire()).map((s) => s.city));
  return [...villes].sort((a, b) => a.localeCompare(b, "fr"));
}

export type Comptes = {
  /** Toutes les fiches publiées, démonstration comprise. */
  total: number;
  /** Les adresses réellement relevées et vérifiées. */
  reels: number;
  /** Les fiches fictives ajoutées pour présenter la plateforme. */
  demo: number;
};

export async function compterSalons(): Promise<Comptes> {
  const tous = await toutLAnnuaire();
  const demo = tous.filter((s) => s.demo).length;
  return { total: tous.length, reels: tous.length - demo, demo };
}

/** Une fiche complète : l'établissement, ses prestations et ses horaires.
 *  Rend undefined si le slug n'existe pas, ce que les pages traduisent
 *  en 404. */
export const trouverSalon = cache(
  async (slug: string): Promise<Salon | undefined> => {
    const sb = clientSupabase();

    const { data: ligne, error } = await sb
      .from("annuaire")
      .select(CHAMPS_ANNUAIRE)
      .eq("slug", slug)
      .maybeSingle();

    if (error) echec(`la fiche « ${slug} »`, error.message);
    if (!ligne) return undefined;

    const salon = versSalon(ligne as LigneAnnuaire);

    /* Une fiche sans prestation n'a ni tarifs ni horaires à montrer :
       c'est un des 136 relevés, on s'épargne deux requêtes. */
    if (!salon.complete) return salon;

    const [{ data: prestations, error: ep }, { data: horaires, error: eh }] =
      await Promise.all([
        sb
          .from("prestations")
          .select("libelle,duree_min,prix_cents")
          .eq("salon_id", salon.id!)
          .order("position"),
        sb
          .from("horaires")
          .select("jour,ouvre,ferme")
          .eq("salon_id", salon.id!)
          .order("jour"),
      ]);

    if (ep) echec(`les prestations de « ${slug} »`, ep.message);
    if (eh) echec(`les horaires de « ${slug} »`, eh.message);

    return {
      ...salon,
      prestations: (prestations ?? []).map(
        (p): Prestation => ({
          label: p.libelle,
          dureeMin: p.duree_min,
          prixCents: p.prix_cents,
        }),
      ),
      horaires: (horaires ?? []).map(
        (h): Horaire => ({
          jour: h.jour,
          ouvre: hhmm(h.ouvre),
          ferme: hhmm(h.ferme),
        }),
      ),
    };
  },
);
