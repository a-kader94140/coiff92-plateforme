/* Les types et la mise en forme, et RIEN d'autre.

   Ce fichier est importé par des composants client (les filtres, la ligne
   d'annuaire, le formulaire). Il ne doit donc contenir aucun accès à la
   base : une seule ligne de Supabase ici, et tout part dans le navigateur
   avec elle. Les requêtes vivent dans lib/salons-data.ts, marqué
   « server-only ».

   Le tri et le regroupement restent ici bien qu'ils servent côté serveur :
   ce sont des fonctions pures sur un tableau, elles se lisent et se
   vérifient mieux à côté des types qu'elles manipulent. */

export type SalonType = "barber" | "coiffeur" | "mixte";

export type Prestation = {
  /** L'identifiant en base. Absent sur la fiche publique, qui n'en a
   *  pas l'usage ; présent dans l'espace gérant, où il désigne la
   *  ligne à modifier ou à supprimer. */
  id?: string;
  label: string;
  dureeMin: number;
  prixCents: number;
};

/** `jour` suit getDay() : 0 vaut dimanche. `ouvre` null signifie fermé. */
export type Horaire = {
  jour: number;
  ouvre: string | null;
  ferme: string | null;
};

export type Salon = {
  /** L'identifiant en base. Absent tant qu'un salon n'en vient pas. */
  id?: string;
  slug: string;
  name: string;
  city: string;
  postalCode: string;
  street: string;
  type: SalonType;
  /** Coordonnées géocodées depuis l'adresse (API Adresse de l'IGN),
   *  utilisées pour le menu d'itinéraire (Google Maps, Waze, Citymapper). */
  lat?: number;
  lng?: number;
  /** Vrai dès que le salon a réclamé sa fiche et l'a complétée. */
  complete?: boolean;
  /** Fiche fictive de démonstration, signalée à l'écran par un badge. */
  demo?: boolean;
  /** Vrai si un gérant a pris la fiche. On ne dit jamais lequel. */
  reclamee?: boolean;

  /* Champs de la fiche complète. Absents sur les 136 salons réels, dont
     nous ne connaissons que le nom, l'adresse et le type. */
  phone?: string;
  description?: string;
  prestations?: Prestation[];
  horaires?: Horaire[];
};

export const LIBELLES_TYPE: Record<SalonType, string> = {
  barber: "Barber",
  coiffeur: "Coiffeur",
  mixte: "Mixte",
};

/* Le troisième tri remonte les six fiches qui acceptent une demande de
   rendez-vous. Sans lui, un visiteur venu pour ça doit les chercher à
   l'oeil parmi 142 lignes. Porté de la planche du 04/09. */
export type Tri = "ville" | "nom" | "complete";

/* Les deux en-têtes du tri par complétude. « Autres adresses » et non
   « fiches incomplètes » : les 136 salons réels ne sont pas des fiches
   ratées, ce sont des commerces qui n'ont pas encore réclamé la leur. */
const GROUPE_COMPLETES = "Fiches complètes";
const GROUPE_AUTRES = "Autres adresses";

export type Recherche = {
  q?: string;
  ville?: string;
  type?: SalonType;
  tri?: Tri;
};

export type Groupe = {
  cle: string;
  salons: Salon[];
};

export type Resultat = {
  groupes: Groupe[];
  total: number;
  communes: number;
};

/* Marques combinantes laissées par la décomposition NFD. Écrites en
   échappements Unicode et non en caractères littéraux : ces signes sont
   invisibles dans un éditeur et disparaissent au premier copier-coller. */
const DIACRITIQUES = new RegExp("[\\u0300-\\u036f]", "g");

/** Retire les accents et passe en minuscules : « asnieres » trouve
 *  « Asnières », au tri comme à la recherche. */
export function fold(s: string): string {
  return s.normalize("NFD").replace(DIACRITIQUES, "").toLowerCase();
}

const parAlpha = (a: string, b: string) => fold(a).localeCompare(fold(b), "fr");

export function estType(v: string | undefined): v is SalonType {
  return v === "barber" || v === "coiffeur" || v === "mixte";
}

export function estTri(v: string | undefined): v is Tri {
  return v === "ville" || v === "nom" || v === "complete";
}

/* Filtre, trie et regroupe une liste déjà en mémoire.

   Le commentaire qui était ici annonçait que « le jour où la base arrive,
   seule cette fonction change ». À moitié vrai : les filtres et le tri
   n'ont pas bougé d'une ligne, mais la fonction a dû quitter le fichier,
   parce que trois composants client importent ce module pour ses types.

   Le filtrage reste en TypeScript et non en SQL, pour une raison précise :
   fold() ignore les accents, « asnieres » doit trouver « Asnières ». Un
   ilike Postgres ne le fait pas sans l'extension unaccent. À 142 fiches,
   tout charger coûte moins qu'un index de recherche mal posé. Le jour où
   l'annuaire dépasse quelques milliers de lignes, c'est ici qu'il faudra
   basculer, avec une colonne dénormalisée déjà repliée côté base. */
export function grouper(
  salons: Salon[],
  { q, ville, type, tri = "ville" }: Recherche,
): Resultat {
  const terme = q ? fold(q.trim()) : "";

  const retenus = salons.filter((s) => {
    if (ville && s.city !== ville) return false;
    if (type && s.type !== type) return false;
    if (!terme) return true;
    return (
      fold(s.name).includes(terme) ||
      fold(s.city).includes(terme) ||
      fold(s.street).includes(terme) ||
      s.postalCode.includes(terme)
    );
  });

  const trie = [...retenus].sort((a, b) => {
    if (tri === "ville") return parAlpha(a.city, b.city) || parAlpha(a.name, b.name);
    /* Les complètes d'abord, puis l'ordre alphabétique dans chaque bloc.
       Number() plutôt qu'une soustraction de booléens : `complete` est
       optionnel, et undefined - undefined donne NaN, ce qui rendrait le
       tri instable sans rien signaler. */
    if (tri === "complete") {
      return Number(!!b.complete) - Number(!!a.complete) || parAlpha(a.name, b.name);
    }
    return parAlpha(a.name, b.name);
  });

  /* L'en-tête de groupe dit toujours où on en est dans la liste : la
     commune, l'initiale, ou le bloc de complétude selon le tri choisi. */
  const parCle = new Map<string, Salon[]>();
  for (const s of trie) {
    const cle =
      tri === "ville"
        ? s.city
        : tri === "complete"
          ? s.complete
            ? GROUPE_COMPLETES
            : GROUPE_AUTRES
          : (fold(s.name)[0] ?? "#").toUpperCase();
    const groupe = parCle.get(cle);
    if (groupe) groupe.push(s);
    else parCle.set(cle, [s]);
  }

  return {
    groupes: [...parCle].map(([cle, salons]) => ({ cle, salons })),
    total: trie.length,
    communes: new Set(trie.map((s) => s.city)).size,
  };
}

/* ─────────────────────────  mise en forme  ───────────────────────── */

export const JOURS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

/** Ordre d'affichage : la semaine commence le lundi, pas le dimanche. */
export const ORDRE_SEMAINE = [1, 2, 3, 4, 5, 6, 0];

export function formatPrix(cents: number): string {
  const euros = cents / 100;
  return `${Number.isInteger(euros) ? euros : euros.toFixed(2).replace(".", ",")} €`;
}

export function formatDuree(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m}`;
}

export function formatHeure(h: string): string {
  return h.replace(":", "h");
}

/* Le jour courant est calculé sur le fuseau de Paris, pas sur celui du
   serveur : un annuaire des Hauts-de-Seine mettrait en évidence le mauvais
   jour si Vercel rendait la page depuis un autre continent. */
export function jourAParis(maintenant: Date = new Date()): number {
  const nom = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    weekday: "short",
  }).format(maintenant);
  const index = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(nom);
  return index === -1 ? maintenant.getDay() : index;
}

/** La date du jour à Paris, au format AAAA-MM-JJ. Même raison que
 *  ci-dessus : un serveur à Washington refuserait comme « passée » une
 *  date que le visiteur voit encore comme aujourd'hui. Le format canadien
 *  est le seul que l'Intl produise déjà dans cet ordre. */
export function dateAParis(maintenant: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(
    maintenant,
  );
}
