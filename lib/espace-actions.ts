"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { estStatut, monSalon, mesPrestations } from "@/lib/espace-data";
import { clientSession } from "@/lib/supabase-session";

/* Chaque export est un point d'entrée réseau. Aucune de ces fonctions
   ne fait confiance à ce qu'elle reçoit, et surtout aucune ne fait
   confiance à un identifiant de salon venu du formulaire : elles
   relisent monSalon() côté serveur.

   Même si l'une d'elles se trompait, les politiques de la 0005
   refuseraient l'écriture chez un autre gérant. La vérification ici
   sert à rendre une erreur lisible, pas à assurer la sécurité. */

const lire = (form: FormData, nom: string) => String(form.get(nom) ?? "");

export type Retour = { ok: true } | { ok: false; message: string };

const RIEN_A_MOI: Retour = {
  ok: false,
  message: "Aucune fiche n'est rattachée à votre compte.",
};

/* ─────────────────────────  statut d'une demande  ───────────────────────── */

export async function changerStatut(form: FormData): Promise<void> {
  const id = lire(form, "id");
  const statut = lire(form, "statut");

  /* Le statut vient d'une liste déroulante, donc du navigateur. La
     contrainte statut_valide de la 0001 le refuserait de toute façon,
     mais autant ne pas envoyer une requête qu'on sait mauvaise. */
  if (!estStatut(statut)) return;

  /* Pas de filtre sur le salon : la politique « le gerant change le
     statut » ne laisse passer que ses demandes. Une demande qui n'est
     pas la sienne donne zéro ligne modifiée, sans erreur. */
  await (await clientSession()).from("demandes").update({ statut }).eq("id", id);

  revalidatePath("/espace/demandes");
}

/* ─────────────────────────  identité de la fiche  ───────────────────────── */

const schemaFiche = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Le nom doit faire au moins 2 caractères.")
    .max(120, "Le nom est trop long."),
  description: z
    .string()
    .trim()
    .max(600, "La description est trop longue, 600 caractères au maximum.")
    /* Vide est une réponse valable : un salon a le droit de retirer sa
       description. On l'écrit alors en null plutôt qu'en chaîne vide,
       pour que la fiche publique n'affiche pas un bloc vide. */
    .transform((v) => (v === "" ? null : v)),
  telephone: z
    .string()
    .trim()
    .max(24, "Ce numéro est trop long.")
    /* Aucune validation de forme. Les salons écrivent « 01 46 05 12 34 »,
       « 0146051234 », « +33 1 46 05 12 34 », et tous sont corrects.
       Refuser une de ces formes ferait perdre un numéro juste. */
    .transform((v) => (v === "" ? null : v)),
});

export async function enregistrerIdentite(
  _precedent: Retour | null,
  form: FormData,
): Promise<Retour> {
  const salon = await monSalon();
  if (!salon) return RIEN_A_MOI;

  const analyse = schemaFiche.safeParse({
    nom: lire(form, "nom"),
    description: lire(form, "description"),
    telephone: lire(form, "telephone"),
  });

  if (!analyse.success) {
    return { ok: false, message: analyse.error.issues[0].message };
  }

  const { error } = await (await clientSession())
    .from("salons")
    .update(analyse.data)
    .eq("slug", salon.slug);

  if (error) {
    return {
      ok: false,
      message: "L'enregistrement n'a pas abouti. Réessayez dans un instant.",
    };
  }

  revalidatePath("/espace/fiche");
  revalidatePath(`/salon/${salon.slug}`);
  return { ok: true };
}

/* ─────────────────────────  prestations  ───────────────────────── */

const schemaPrestation = z.object({
  id: z.string().optional(),
  libelle: z
    .string()
    .trim()
    .min(2, "Chaque prestation doit avoir un libellé d'au moins 2 caractères.")
    .max(80, "Un libellé de prestation est trop long."),
  /* Des nombres, pas « 30 min » ni « 24 € ». L'unité est affichée à
     côté du champ, elle n'entre pas dans la valeur : un gérant qui
     taperait « une demi-heure » casserait tout calcul. */
  dureeMin: z.coerce
    .number()
    .int("La durée doit être un nombre entier de minutes.")
    .min(5, "Une prestation dure au moins 5 minutes.")
    .max(480, "Une prestation dure au plus 8 heures."),
  prixEuros: z.coerce
    .number()
    .min(0, "Un tarif ne peut pas être négatif.")
    .max(1000, "Ce tarif dépasse ce que la fiche accepte."),
});

export async function enregistrerPrestations(
  _precedent: Retour | null,
  form: FormData,
): Promise<Retour> {
  const salon = await monSalon();
  if (!salon?.id) return RIEN_A_MOI;

  const libelles = form.getAll("p_libelle").map(String);
  const durees = form.getAll("p_duree").map(String);
  const prix = form.getAll("p_prix").map(String);
  const ids = form.getAll("p_id").map(String);

  const lignes: {
    id?: string;
    libelle: string;
    duree_min: number;
    prix_cents: number;
    position: number;
  }[] = [];

  for (let i = 0; i < libelles.length; i++) {
    /* Une ligne entièrement vide est une ligne que le gérant a ajoutée
       puis laissée de côté. On la saute plutôt que de lui reprocher. */
    if (!libelles[i].trim() && !durees[i].trim() && !prix[i].trim()) continue;

    const analyse = schemaPrestation.safeParse({
      id: ids[i] || undefined,
      libelle: libelles[i],
      dureeMin: durees[i],
      prixEuros: (prix[i] || "").replace(",", "."),
    });

    if (!analyse.success) {
      return {
        ok: false,
        message: `Ligne ${i + 1} : ${analyse.error.issues[0].message}`,
      };
    }

    lignes.push({
      id: analyse.data.id,
      libelle: analyse.data.libelle,
      duree_min: analyse.data.dureeMin,
      /* Math.round et non un cast : 24,99 € donne 2499 centimes, pas
         2498,999999 arrondi vers le bas par troncature. */
      prix_cents: Math.round(analyse.data.prixEuros * 100),
      position: lignes.length,
    });
  }

  const supabase = await clientSession();
  const existantes = await mesPrestations(salon.id);
  const gardes = new Set(lignes.map((l) => l.id).filter(Boolean));

  /* On réconcilie plutôt que d'effacer puis réinsérer.
     Un « delete all » suivi d'un « insert » n'est pas atomique ici,
     ce sont deux requêtes : si la seconde échouait, la fiche se
     retrouverait sans aucune prestation, donc marquée incomplète, et
     son formulaire de rendez-vous disparaîtrait du site public. */
  const aSupprimer = existantes
    .map((p) => p.id!)
    .filter((id) => !gardes.has(id));

  if (aSupprimer.length) {
    const { error } = await supabase
      .from("prestations")
      .delete()
      .in("id", aSupprimer);
    if (error) return echecPrestations();
  }

  for (const ligne of lignes) {
    const valeurs = {
      libelle: ligne.libelle,
      duree_min: ligne.duree_min,
      prix_cents: ligne.prix_cents,
      position: ligne.position,
    };

    const { error } = ligne.id
      ? await supabase.from("prestations").update(valeurs).eq("id", ligne.id)
      : await supabase
          .from("prestations")
          .insert({ ...valeurs, salon_id: salon.id });

    if (error) return echecPrestations();
  }

  revalidatePath("/espace/fiche");
  revalidatePath(`/salon/${salon.slug}`);
  return { ok: true };
}

const echecPrestations = (): Retour => ({
  ok: false,
  message:
    "Les prestations n'ont pas toutes pu être enregistrées. Rechargez la page pour voir où en est la liste.",
});

/* ─────────────────────────  horaires  ───────────────────────── */

const HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function enregistrerHoraires(
  _precedent: Retour | null,
  form: FormData,
): Promise<Retour> {
  const salon = await monSalon();
  if (!salon?.id) return RIEN_A_MOI;

  const lignes: { salon_id: string; jour: number; ouvre: string | null; ferme: string | null }[] =
    [];

  for (const jour of [0, 1, 2, 3, 4, 5, 6]) {
    const ferme = form.get(`h_ferme_${jour}`) !== null;
    const ouvre = String(form.get(`h_ouvre_${jour}`) ?? "").trim();
    const fin = String(form.get(`h_ferme_heure_${jour}`) ?? "").trim();

    if (ferme || (!ouvre && !fin)) {
      lignes.push({ salon_id: salon.id, jour, ouvre: null, ferme: null });
      continue;
    }

    if (!HEURE.test(ouvre) || !HEURE.test(fin)) {
      return {
        ok: false,
        message: `${NOMS_JOURS[jour]} : indiquez une heure d'ouverture et une heure de fermeture, ou cochez « fermé ».`,
      };
    }
    /* La contrainte plage_coherente de la 0002 refuserait la ligne,
       mais avec un message que personne ne devrait avoir à lire. */
    if (fin <= ouvre) {
      return {
        ok: false,
        message: `${NOMS_JOURS[jour]} : l'heure de fermeture doit être après l'heure d'ouverture.`,
      };
    }

    lignes.push({ salon_id: salon.id, jour, ouvre, ferme: fin });
  }

  /* La clé primaire est (salon_id, jour), l'upsert remplace donc la
     ligne du jour sans avoir à savoir si elle existait. */
  const { error } = await (await clientSession())
    .from("horaires")
    .upsert(lignes, { onConflict: "salon_id,jour" });

  if (error) {
    return {
      ok: false,
      message: "Les horaires n'ont pas pu être enregistrés. Réessayez dans un instant.",
    };
  }

  revalidatePath("/espace/fiche");
  revalidatePath(`/salon/${salon.slug}`);
  return { ok: true };
}

const NOMS_JOURS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];
