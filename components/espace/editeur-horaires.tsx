"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { enregistrerHoraires } from "@/lib/espace-actions";
import { JOURS, ORDRE_SEMAINE, type Horaire } from "@/lib/salons";
import { Bandeau, useModifie } from "./bandeau";

/* Les horaires, un jour par ligne.

   CORRECTION PAR RAPPORT A LA PLANCHE : les deux champs d'heure n'y
   portaient aucun nom, seulement un « à » entre eux. Un lecteur
   d'écran annonçait quatorze champs anonymes à la suite.

   Le nom du jour est déjà à l'écran, répéter « Lundi, ouverture » en
   toutes lettres alourdirait la ligne pour tout le monde. Chaque
   champ porte donc un aria-label complet, invisible mais lu.

   La semaine commence le lundi, ORDRE_SEMAINE s'en charge : la base
   numérote les jours comme JavaScript, où 0 vaut dimanche. */

type Ligne = { jour: number; ferme: boolean; ouvre: string; fin: string };

export function EditeurHoraires({ horaires }: { horaires: Horaire[] }) {
  const [etat, enregistrer, enCours] = useActionState(enregistrerHoraires, null);
  const { modifie, marquer, reinitialiser } = useModifie(etat);

  const [lignes, setLignes] = useState<Ligne[]>(() =>
    ORDRE_SEMAINE.map((jour) => {
      const h = horaires.find((x) => x.jour === jour);
      return {
        jour,
        ferme: !h?.ouvre,
        ouvre: h?.ouvre ?? "",
        fin: h?.ferme ?? "",
      };
    }),
  );

  const maj = (jour: number, champ: keyof Ligne, valeur: string | boolean) => {
    setLignes((l) => l.map((x) => (x.jour === jour ? { ...x, [champ]: valeur } : x)));
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
      <h2 className="font-display m-0 text-xl">Horaires</h2>

      <Bandeau etat={etat} modifie={modifie} />

      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {lignes.map((l) => (
          <li key={l.jour} className="flex flex-wrap items-center gap-3">
            <span className="w-[88px] shrink-0 text-sm text-text">{JOURS[l.jour]}</span>

            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted-1">
              <input
                type="checkbox"
                name={`h_ferme_${l.jour}`}
                checked={l.ferme}
                onChange={(e) => maj(l.jour, "ferme", e.currentTarget.checked)}
                className="size-[15px] accent-[var(--accent)]"
              />
              Fermé
            </label>

            {/* Les champs restent MONTÉS quand le jour est fermé, mais
                désactivés. Un champ démonté ne serait pas envoyé, et
                un champ désactivé non plus : le serveur traite les
                deux cas pareil. En revanche, garder la place évite que
                toute la liste se réorganise à chaque case cochée. */}
            <div className="flex items-center gap-2">
              <Input
                type="time"
                name={`h_ouvre_${l.jour}`}
                value={l.ouvre}
                disabled={l.ferme}
                onChange={(e) => maj(l.jour, "ouvre", e.currentTarget.value)}
                aria-label={`${JOURS[l.jour]}, heure d'ouverture`}
                className="tabular w-[118px]"
              />
              <span aria-hidden="true" className="text-[13px] text-muted-2">
                à
              </span>
              <Input
                type="time"
                name={`h_ferme_heure_${l.jour}`}
                value={l.fin}
                disabled={l.ferme}
                onChange={(e) => maj(l.jour, "fin", e.currentTarget.value)}
                aria-label={`${JOURS[l.jour]}, heure de fermeture`}
                className="tabular w-[118px]"
              />
            </div>
          </li>
        ))}
      </ul>

      <Button type="submit" disabled={enCours} className="self-start">
        {enCours ? "Enregistrement…" : "Enregistrer les horaires"}
      </Button>
    </form>
  );
}
