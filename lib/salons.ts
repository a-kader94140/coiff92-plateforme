import { SALONS as SALONS_REELS, COMMUNES as COMMUNES_REELLES } from "@/data/salons";
import { SALONS_DEMO } from "@/data/demo";

export type SalonType = "barber" | "coiffeur" | "mixte";

export type Prestation = {
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
  slug: string;
  name: string;
  city: string;
  postalCode: string;
  street: string;
  type: SalonType;
  /** Vrai dès que le salon a réclamé sa fiche et l'a complétée. */
  complete?: boolean;
  /** Fiche fictive de démonstration, signalée à l'écran par un badge. */
  demo?: boolean;

  /* Champs de la fiche complète. Absents sur les 136 salons réels, dont
     nous ne connaissons que le nom, l'adresse et le type. */
  phone?: string;
  description?: string;
  prestations?: Prestation[];
  horaires?: Horaire[];
};

/* Les salons de démonstration rejoignent le relevé réel dans une seule
   liste : l'annuaire ne fait pas deux requêtes, et le badge « Démo »
   suffit à les distinguer à l'écran. */
const SALONS: Salon[] = [...SALONS_REELS, ...SALONS_DEMO];

const COMMUNES: string[] = [
  ...new Set([...COMMUNES_REELLES, ...SALONS_DEMO.map((s) => s.city)]),
].sort((a, b) => a.localeCompare(b, "fr"));

/** Nombre total de fiches publiées, démonstration comprise. */
export const NB_SALONS = SALONS.length;
/** Les adresses réellement relevées et vérifiées. */
export const NB_REELS = SALONS_REELS.length;
/** Les fiches fictives ajoutées pour présenter la plateforme. */
export const NB_DEMO = SALONS_DEMO.length;

export const LIBELLES_TYPE: Record<SalonType, string> = {
  barber: "Barber",
  coiffeur: "Coiffeur",
  mixte: "Mixte",
};

export type Tri = "ville" | "nom";

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
  return v === "ville" || v === "nom";
}

export function listeCommunes(): string[] {
  return COMMUNES;
}

/* Le jour où la base arrive, seule cette fonction change : elle devient une
   requête Supabase avec les mêmes filtres et le même retour. Les composants
   n'ont pas à bouger. */
export function chercherSalons({ q, ville, type, tri = "ville" }: Recherche): Resultat {
  const terme = q ? fold(q.trim()) : "";

  const retenus = SALONS.filter((s) => {
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

  const trie = [...retenus].sort((a, b) =>
    tri === "ville"
      ? parAlpha(a.city, b.city) || parAlpha(a.name, b.name)
      : parAlpha(a.name, b.name),
  );

  /* Groupé par commune, ou par initiale quand on classe par nom : dans les
     deux cas l'en-tête de groupe dit où on en est dans la liste. */
  const parCle = new Map<string, Salon[]>();
  for (const s of trie) {
    const cle = tri === "ville" ? s.city : (fold(s.name)[0] ?? "#").toUpperCase();
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

export function trouverSalon(slug: string): Salon | undefined {
  return SALONS.find((s) => s.slug === slug);
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
