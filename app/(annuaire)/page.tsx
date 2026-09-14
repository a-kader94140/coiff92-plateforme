import Link from "next/link";
import { Filtres } from "@/components/annuaire/filtres";
import { Hero } from "@/components/annuaire/hero";
import { SalonRow } from "@/components/annuaire/salon-row";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { estTri, estType } from "@/lib/salons";
import { chercherSalons, compterSalons, listeCommunes } from "@/lib/salons-data";

type Params = Promise<Record<string, string | string[] | undefined>>;

const premier = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function Annuaire({ searchParams }: { searchParams: Params }) {
  const sp = await searchParams;

  const q = premier(sp.q) ?? "";
  const villeBrute = premier(sp.ville) ?? "";
  const typeBrut = premier(sp.type);
  const triBrut = premier(sp.tri);

  const communes = await listeCommunes();
  /* Un paramètre d'URL vient du visiteur : on ne fait confiance qu'aux
     valeurs qu'on reconnaît. */
  const ville = communes.includes(villeBrute) ? villeBrute : "";
  const type = estType(typeBrut) ? typeBrut : undefined;
  const tri = estTri(triBrut) ? triBrut : "ville";

  /* Trois lectures, une seule requête : toutLAnnuaire() est mise en cache
     pour la durée de la requête HTTP. */
  const { groupes, total, communes: nbCommunes } = await chercherSalons({
    q,
    ville,
    type,
    tri,
  });
  const comptes = await compterSalons();
  const filtre = Boolean(q || ville || type);

  return (
    <div className="flex min-h-[100svh] flex-col">
      <Hero adressesReleves={comptes.reels} nbCommunes={communes.length} />

      <Filtres
        q={q}
        ville={ville}
        type={type ?? ""}
        tri={tri}
        communes={communes}
        total={total}
        nbCommunes={nbCommunes}
      />

      <main className="flex-1">
        {/* Cible du lien « Annuaire » du héro. scroll-mt compense la
            hauteur de la barre de filtres, restée collée en haut :
            sans lui, la première ligne de résultats arriverait cachée
            dessous. */}
        <div id="annuaire" className="scroll-mt-18" />

        {total === 0 ? (
          <div className="px-5 py-20 md:px-6">
            <EmptyState
              title="Aucun salon ne correspond à votre recherche"
              body="Essayez une autre commune, un autre type d'établissement, ou repartez de la liste complète."
              action={
                <Link
                  href="/"
                  className={buttonClass({ variant: "secondaire", size: "sm" })}
                >
                  Réinitialiser les filtres
                </Link>
              }
            />
          </div>
        ) : (
          groupes.map((g) => (
            <section key={g.cle}>
              <div className="flex items-baseline justify-between px-5 pt-6 pb-2.5 md:px-6">
                <h2 className="text-xl">{g.cle}</h2>
                <span className="tabular text-xs text-muted-2">
                  {g.salons.length} salon{g.salons.length > 1 ? "s" : ""}
                </span>
              </div>
              <ul className="m-0 list-none p-0">
                {g.salons.map((s) => (
                  <SalonRow key={s.slug} salon={s} tri={tri} />
                ))}
              </ul>
            </section>
          ))
        )}
      </main>

      <footer className="border-t border-[var(--hairline)] px-5 py-8 md:px-6">
        <p className="m-0 max-w-[70ch] text-[13px] leading-relaxed text-muted-2">
          {comptes.reels} adresses relevées en août 2026 à partir d&apos;annuaires
          publics. La liste n&apos;est pas exhaustive, les Hauts-de-Seine comptent
          plusieurs milliers de salons. Vérifiez les horaires auprès du salon avant
          de vous déplacer. Les {comptes.demo} fiches marquées « Démo » sont fictives
          et servent à présenter la plateforme.
          {filtre && (
            <>
              {" "}
              <Link href="/" className="text-accent-ink underline underline-offset-2">
                Voir les {comptes.total} adresses
              </Link>
            </>
          )}
        </p>
        <p className="m-0 mt-3 text-[13px] leading-relaxed text-muted-2">
          <Link href="/confidentialite" className="underline underline-offset-2">
            Confidentialité et mentions légales
          </Link>
        </p>
      </footer>
    </div>
  );
}
