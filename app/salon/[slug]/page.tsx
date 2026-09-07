import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  formatDuree,
  formatHeure,
  formatPrix,
  jourAParis,
  JOURS,
  LIBELLES_TYPE,
  ORDRE_SEMAINE,
  trouverSalon,
  type Salon,
} from "@/lib/salons";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const salon = trouverSalon(slug);
  /* Le suffixe « | Coiff'92 » est ajouté par le gabarit de titre du layout,
     ne pas l'écrire ici sous peine de le voir deux fois. */
  if (!salon) return { title: "Salon introuvable" };

  const type = LIBELLES_TYPE[salon.type].toLowerCase();
  const titre = `${salon.name}, ${type} à ${salon.city}`;
  return {
    title: titre,
    description: salon.description
      ? `${salon.description} ${salon.street}, ${salon.postalCode} ${salon.city}.`
      : `${salon.name}, ${salon.street}, ${salon.postalCode} ${salon.city}. Fiche de l'annuaire Coiff'92.`,
    openGraph: { title: titre, type: "website" },
  };
}

function lienCarte(salon: Salon) {
  const adresse = `${salon.name} ${salon.street} ${salon.postalCode} ${salon.city}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresse)}`;
}

/* Le CTA de la fiche est volontairement plus grand que la taille md.
   Cette taille porte désormais un nom dans le système, et ses états
   viennent du composant au lieu d'être recopiés. */
const btnPrincipal = buttonClass({ variant: "principal", size: "lg" });

const etiquette =
  "m-0 mt-7 mb-3 text-[13px] font-medium uppercase tracking-[0.02em] text-muted-2";

/* ─────────────────────────  version A  ───────────────────────── */

function FicheComplete({ salon }: { salon: Salon }) {
  const aujourdhui = jourAParis();
  const horaires = salon.horaires ?? [];

  return (
    <>
      <div className="flex flex-wrap gap-x-12 gap-y-8">
        <div className="min-w-0 flex-[2_1_420px]">
          {salon.description && (
            <p className="m-0 text-[15px] leading-relaxed text-text">{salon.description}</p>
          )}

          <h2 className={etiquette}>Prestations</h2>
          {/* Un tableau, parce que c'en est un : trois colonnes alignées,
              annoncées comme telles à un lecteur d'écran. */}
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Prestations proposées, avec leur durée et leur tarif
            </caption>
            <thead className="sr-only">
              <tr>
                <th>Prestation</th>
                <th>Durée</th>
                <th>Tarif</th>
              </tr>
            </thead>
            <tbody>
              {salon.prestations?.map((p) => (
                <tr key={p.label} className="border-b border-[var(--hairline)]">
                  <td className="py-3.5 pr-4 text-[15px] text-text">{p.label}</td>
                  <td className="tabular w-20 py-3.5 text-right text-[13px] text-muted-2">
                    {formatDuree(p.dureeMin)}
                  </td>
                  <td className="tabular w-20 py-3.5 text-right text-[15px] font-medium text-text">
                    {formatPrix(p.prixCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="min-w-60 flex-[1_1_260px]">
          {salon.phone && (
            <>
              <h2 className={`${etiquette} mt-0`}>Téléphone</h2>
              <a
                href={`tel:${salon.phone.replace(/\s/g, "")}`}
                className="tabular text-base text-text underline underline-offset-4
                           decoration-[var(--divider)] hover:decoration-[var(--accent)]"
              >
                {salon.phone}
              </a>
            </>
          )}

          {horaires.length > 0 && (
            <>
              <h2 className={etiquette}>Horaires</h2>
              <ul className="m-0 list-none p-0">
                {ORDRE_SEMAINE.map((jour) => {
                  const h = horaires.find((x) => x.jour === jour);
                  const cejour = jour === aujourdhui;
                  return (
                    <li
                      key={jour}
                      className={`flex justify-between rounded-sm px-2.5 py-2.5 ${
                        cejour ? "bg-surface-2" : ""
                      }`}
                    >
                      <span
                        className={`text-sm ${
                          cejour ? "font-semibold text-accent-ink" : "text-text"
                        }`}
                      >
                        {JOURS[jour]}
                        {/* Visible, et pas seulement pour les lecteurs d'écran : le
                            gras et l'aplat disent « ce jour est particulier »,
                            ils ne disent pas lequel. */}
                        {cejour && (
                          <span className="font-normal text-muted-2">
                            , aujourd&apos;hui
                          </span>
                        )}
                      </span>
                      <span
                        className={`tabular text-[13px] ${
                          cejour ? "text-text" : "text-muted-2"
                        }`}
                      >
                        {h?.ouvre && h.ferme
                          ? `${formatHeure(h.ouvre)} à ${formatHeure(h.ferme)}`
                          : "Fermé"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <a
            href={lienCarte(salon)}
            target="_blank"
            rel="noopener"
            className="mt-6 inline-flex text-sm font-medium text-accent-ink underline
                       underline-offset-4"
          >
            Voir l&apos;itinéraire
          </a>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────  version B  ───────────────────────── */

/* Le cas majoritaire : plus de 95% des fiches. Elle ne doit pas avoir
   l'air cassée, donc aucun bloc vide, aucun « Non renseigné » en série.
   On donne au visiteur la seule action utile dont on dispose,
   l'itinéraire, et au gérant une porte d'entrée. */
function FicheNonReclamee({ salon }: { salon: Salon }) {
  return (
    <div className="flex flex-col items-start">
      <a href={lienCarte(salon)} target="_blank" rel="noopener" className={btnPrincipal}>
        Voir l&apos;itinéraire
      </a>

      <div className="mt-8 w-full rounded-md border border-[var(--divider)] bg-surface p-6">
        <p className="m-0 mb-2 text-[15px] font-medium text-text">
          Vous gérez ce salon ?
        </p>
        <p className="m-0 mb-4 max-w-[55ch] text-sm leading-relaxed text-muted-2">
          Réclamez cette fiche pour ajouter vos prestations, vos horaires, et recevoir
          des demandes de rendez-vous en ligne.
        </p>
        <Link
          href={`/reclamer/${salon.slug}`}
          /* Contour accent sans être une action destructrice : le système n'a
             pas de variante pour ce cas, d'où les classes en clair. Son appui
             suit la même règle que le destructeur, un aplat plein. */
          className="inline-flex items-center justify-center rounded-md border border-accent
                     px-5 py-2.5 text-sm font-medium text-accent-ink transition-colors
                     duration-150 hover:bg-[var(--accent-wash)] active:bg-accent
                     active:text-on-accent active:scale-[0.98]"
        >
          Réclamer cette fiche
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────  la page  ───────────────────────── */

export default async function FicheSalon({ params }: { params: Params }) {
  const { slug } = await params;
  const salon = trouverSalon(slug);
  if (!salon) notFound();

  const complete = Boolean(salon.complete && salon.prestations?.length);

  return (
    <div className="flex min-h-[100svh] flex-col">
      <header
        className="flex h-18 shrink-0 items-center justify-between border-b
                   border-[var(--hairline)] px-5 md:px-6"
      >
        <Link href="/" className="font-display text-[22px]">
          Coiff&apos;<span className="text-accent-ink">92</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-[1000px] flex-1 px-5 py-6 pb-12 md:px-8">
        <nav aria-label="Fil d'Ariane" className="mb-5 text-[13px] text-muted-2">
          <Link href="/" className="hover:text-text hover:underline underline-offset-2">
            Annuaire
          </Link>
          <span className="px-2 text-muted-3">/</span>
          <Link
            href={`/?ville=${encodeURIComponent(salon.city)}`}
            className="hover:text-text hover:underline underline-offset-2"
          >
            {salon.city}
          </Link>
        </nav>

        <div className="mb-7 border-b border-[var(--hairline)] pb-6">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h1 className="m-0 text-[clamp(28px,4vw,38px)] leading-tight">{salon.name}</h1>
            {/* Libellé long ici seulement. Sur la fiche, le visiteur découvre le
                salon et doit comprendre du premier coup que les tarifs affichés
                sont inventés. Dans la liste, « Démo » suffit et la place manque. */}
            {salon.demo && <Badge tone="demo">Démo, salon fictif</Badge>}
          </div>
          <p className="m-0 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted-1">
            <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-2">
              {LIBELLES_TYPE[salon.type]}
            </span>
            <span className="text-muted-3" aria-hidden="true">
              ·
            </span>
            <span>
              {salon.street || "Adresse non relevée"},{" "}
              <span className="tabular">{salon.postalCode}</span> {salon.city}
            </span>
          </p>
        </div>

        {complete ? <FicheComplete salon={salon} /> : <FicheNonReclamee salon={salon} />}
      </main>

      {/* La barre d'action reste au bas de l'écran : sur une fiche longue,
          l'action principale ne doit pas exiger de remonter. */}
      {complete && (
        <div
          className="sticky bottom-0 border-t border-[var(--hairline)] bg-bg/95 px-5
                     py-4 backdrop-blur-md md:px-8"
        >
          <div className="mx-auto flex max-w-[1000px]">
            <Link href={`/salon/${salon.slug}/rendez-vous`} className={btnPrincipal}>
              Demander un rendez-vous
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
