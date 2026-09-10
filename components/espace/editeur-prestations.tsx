"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { enregistrerPrestations } from "@/lib/espace-actions";
import { formatPrix, type Prestation } from "@/lib/salons";
import { Bandeau, useModifie } from "./bandeau";

/* L'édition des prestations.

   DEUX CORRECTIONS PAR RAPPORT A LA PLANCHE.

   1. Elle mettait « Nom de la prestation » en placeholder, et rien du
      tout sur la durée et le tarif. Un intitulé qui ne vit que dans le
      champ disparaît dès la première frappe, et les deux colonnes de
      droite n'avaient aucun nom. Les trois colonnes portent désormais
      un vrai en-tête, posé une fois au-dessus de la liste, et chaque
      champ un aria-label qui le rattache à sa ligne.

   2. Elle proposait des champs texte libres, « 30 min », « 24 € ».
      Ce sont des nombres : l'unité est affichée à côté du champ, elle
      n'entre pas dans la valeur. Un gérant qui tape « une demi-heure »
      casserait tout affichage et tout calcul. */

type Ligne = {
  /* Clé de rendu, locale, sans rapport avec la base. Une ligne neuve
     n'a pas encore d'identifiant, et l'index ne convient pas : il
     décale toutes les lignes suivantes à chaque suppression. */
  cle: string;
  id?: string;
  libelle: string;
  duree: string;
  prix: string;
};

let compteur = 0;
const ligneVide = (): Ligne => ({
  cle: `neuve-${compteur++}`,
  libelle: "",
  duree: "",
  prix: "",
});

const versLigne = (p: Prestation): Ligne => ({
  cle: p.id ?? `neuve-${compteur++}`,
  id: p.id,
  libelle: p.label,
  /* Les euros s'écrivent avec une virgule en français. La virgule est
     reconvertie en point côté serveur. */
  duree: String(p.dureeMin),
  prix: (p.prixCents / 100).toFixed(2).replace(".", ",").replace(",00", ""),
});

export function EditeurPrestations({ prestations }: { prestations: Prestation[] }) {
  const [etat, enregistrer, enCours] = useActionState(enregistrerPrestations, null);
  const [lignes, setLignes] = useState<Ligne[]>(() =>
    prestations.length ? prestations.map(versLigne) : [ligneVide()],
  );
  const { modifie, marquer, reinitialiser } = useModifie(etat);

  const majLigne = (cle: string, champ: keyof Ligne, valeur: string) => {
    setLignes((l) => l.map((x) => (x.cle === cle ? { ...x, [champ]: valeur } : x)));
    marquer();
  };

  const supprimer = (cle: string) => {
    setLignes((l) => (l.length === 1 ? [ligneVide()] : l.filter((x) => x.cle !== cle)));
    marquer();
  };

  return (
    <form
      action={(data) => {
        reinitialiser();
        enregistrer(data);
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display m-0 text-xl">Prestations</h2>
        <p className="m-0 max-w-[46ch] text-[13px] leading-relaxed text-muted-2">
          Une fiche sans prestation n&apos;accepte pas de demande de rendez-vous.
        </p>
      </div>

      <Bandeau etat={etat} modifie={modifie} />

      {/* Les en-têtes de colonne, posés une fois. Sur mobile la ligne
          passe en colonne et ils n'ont plus de sens : ils sont
          masqués, les aria-label de chaque champ prennent le relais. */}
      <div
        aria-hidden="true"
        className="hidden gap-2 px-1 text-[12px] font-medium text-muted-2 sm:flex"
      >
        <span className="flex-1">Libellé</span>
        <span className="w-[104px]">Durée</span>
        <span className="w-[104px]">Tarif</span>
        <span className="w-9" />
      </div>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {lignes.map((l, i) => (
          <li key={l.cle} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              name="p_libelle"
              value={l.libelle}
              onChange={(e) => majLigne(l.cle, "libelle", e.currentTarget.value)}
              aria-label={`Libellé de la prestation ${i + 1}`}
              className="flex-1"
            />
            <input type="hidden" name="p_id" value={l.id ?? ""} />

            <div className="flex gap-2">
              <ChampUnite
                nom="p_duree"
                unite="min"
                valeur={l.duree}
                aria-label={`Durée de la prestation ${i + 1}, en minutes`}
                onChange={(v) => majLigne(l.cle, "duree", v)}
              />
              <ChampUnite
                nom="p_prix"
                unite="€"
                valeur={l.prix}
                aria-label={`Tarif de la prestation ${i + 1}, en euros`}
                onChange={(v) => majLigne(l.cle, "prix", v)}
              />

              <button
                type="button"
                onClick={() => supprimer(l.cle)}
                aria-label={`Supprimer la prestation ${i + 1}${l.libelle ? `, ${l.libelle}` : ""}`}
                className="size-[42px] shrink-0 cursor-pointer rounded-sm border
                           border-[var(--divider)] bg-surface-2 text-muted-1
                           hover:bg-[var(--surface-hover)] hover:text-text
                           active:bg-[var(--surface-active)]"
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  ×
                </span>
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondaire"
          size="sm"
          onClick={() => {
            setLignes((l) => [...l, ligneVide()]);
            marquer();
          }}
        >
          Ajouter une prestation
        </Button>

        <Button type="submit" disabled={enCours}>
          {enCours ? "Enregistrement…" : "Enregistrer les prestations"}
        </Button>
      </div>

      {/* L'aperçu de ce que verra le public, calculé sur la saisie en
          cours et non sur ce qui est en base : c'est bien ce qu'on
          s'apprête à publier qu'il faut pouvoir relire. */}
      <Apercu lignes={lignes} />
    </form>
  );
}

/* Un champ numérique avec son unité posée à côté, jamais dedans. */
function ChampUnite({
  nom,
  unite,
  valeur,
  onChange,
  ...aria
}: {
  nom: string;
  unite: string;
  valeur: string;
  onChange: (v: string) => void;
  "aria-label": string;
}) {
  return (
    <div className="relative w-[104px] shrink-0">
      <Input
        {...aria}
        name={nom}
        value={valeur}
        onChange={(e) => onChange(e.currentTarget.value)}
        inputMode="decimal"
        className="tabular pr-9"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-3 flex items-center
                   text-[13px] text-muted-2"
      >
        {unite}
      </span>
    </div>
  );
}

function Apercu({ lignes }: { lignes: Ligne[] }) {
  const visibles = lignes.filter((l) => l.libelle.trim());
  if (!visibles.length) return null;

  return (
    <div className="mt-2 rounded-md border border-[var(--hairline)] p-5">
      <p className="tabular m-0 mb-3 text-[11px] uppercase tracking-[0.08em] text-muted-2">
        Aperçu public
      </p>
      <ul className="m-0 list-none p-0">
        {visibles.map((l) => {
          const euros = Number(l.prix.replace(",", "."));
          return (
            <li
              key={l.cle}
              className="flex justify-between gap-4 border-b border-[var(--hairline)] py-2 text-sm last:border-b-0"
            >
              <span className="text-text">{l.libelle}</span>
              <span className="tabular shrink-0 text-muted-1">
                {l.duree && `${l.duree} min`}
                {l.duree && l.prix && " · "}
                {l.prix && !Number.isNaN(euros) && formatPrix(Math.round(euros * 100))}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
