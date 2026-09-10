import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { SelecteurStatut } from "@/components/espace/selecteur-statut";
import { FiltreStatut } from "@/components/espace/filtre-statut";
import { LIBELLES_CRENEAU } from "@/lib/demandes";
import { comptesParStatut, estStatut, mesDemandes } from "@/lib/espace-data";
import { formatDateLongue } from "@/lib/demandes";

export const metadata: Metadata = { title: "Mes demandes" };

type Params = Promise<Record<string, string | string[] | undefined>>;

const premier = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function MesDemandes({ searchParams }: { searchParams: Params }) {
  const sp = await searchParams;
  const brut = premier(sp.statut);
  const filtre = estStatut(brut) ? brut : undefined;

  const [demandes, comptes] = await Promise.all([
    mesDemandes(filtre),
    comptesParStatut(),
  ]);

  const total = Object.values(comptes).reduce((a, b) => a + b, 0);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display m-0 text-[clamp(22px,4vw,28px)] leading-tight">
          Mes demandes
        </h1>
        {total > 0 && <FiltreStatut actif={filtre} comptes={comptes} />}
      </div>

      {total === 0 ? (
        <EmptyState
          title="Aucune demande pour l'instant"
          body="Dès que quelqu'un vous contacte depuis votre fiche, sa demande apparaît ici. Une fiche complète, avec ses prestations et ses horaires, en reçoit davantage."
          action={
            <Link
              href="/espace/fiche"
              className={buttonClass({ variant: "secondaire", size: "sm" })}
            >
              Compléter ma fiche
            </Link>
          }
          className="mt-10"
        />
      ) : demandes.length === 0 ? (
        /* Filtré, mais rien dans cette catégorie. Distinct de l'état
           ci-dessus : le gérant a des demandes, il ne voit juste pas
           celles-là, et il faut lui rendre la liste complète. */
        <EmptyState
          title="Aucune demande dans cette catégorie"
          body="Vos autres demandes sont toujours là, sous un autre statut."
          action={
            <Link
              href="/espace/demandes"
              className={buttonClass({ variant: "secondaire", size: "sm" })}
            >
              Voir les {total} demandes
            </Link>
          }
          className="mt-10"
        />
      ) : (
        <ul className="m-0 list-none p-0">
          {demandes.map((d) => (
            <li
              key={d.id}
              className="flex flex-col gap-4 border-b border-[var(--hairline)]
                         py-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-baseline gap-2.5">
                  <span className="text-[15px] font-medium text-text">{d.nom}</span>
                  <Badge tone={d.statut} />
                </div>

                <p className="m-0 text-sm text-muted-1">
                  {d.prestation}, <span className="tabular">{formatDateLongue(d.date)}</span>,{" "}
                  {LIBELLES_CRENEAU[d.creneau].toLowerCase()}
                </p>

                <p className="m-0 mt-1 text-[13px] text-muted-2">
                  <a href={`tel:${d.tel.replace(/\s/g, "")}`} className="tabular underline underline-offset-2">
                    {d.tel}
                  </a>
                  {" · "}
                  <a href={`mailto:${d.email}`} className="underline underline-offset-2">
                    {d.email}
                  </a>
                  {" · reçue "}
                  <span className="tabular">{ilYA(d.recueLe)}</span>
                </p>

                {d.message && (
                  <p className="m-0 mt-2.5 max-w-[60ch] rounded-md bg-surface p-3 text-[13px] leading-relaxed text-muted-1">
                    {d.message}
                  </p>
                )}
              </div>

              <SelecteurStatut id={d.id} statut={d.statut} client={d.nom} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* « il y a 2 h », calculé côté serveur.

   Le rendre côté client donnerait une valeur différente au premier
   affichage et après hydratation, ce que React signale comme une
   erreur. Le décalage entre le rendu et la lecture est de quelques
   secondes, sans importance à cette échelle. */
function ilYA(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 2) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;

  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;

  const jours = Math.floor(heures / 24);
  if (jours === 1) return "hier";
  if (jours < 31) return `il y a ${jours} jours`;

  const mois = Math.floor(jours / 30);
  return mois === 1 ? "il y a un mois" : `il y a ${mois} mois`;
}
