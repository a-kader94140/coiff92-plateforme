import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SegmentedRadio } from "@/components/ui/field";
import { EmptyState, SkeletonRows } from "@/components/ui/states";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FormShowcase } from "@/components/systeme/form-showcase";
import { formate, ratiosSur, SEUIL_AA } from "@/lib/contrast";
import { CRENEAUX } from "@/lib/demandes";
import { CLAIR, ENCRES, SOMBRE, SURFACES, type Palette } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Système de design",
  description:
    "Palette, typographie et composants de la plateforme Coiff'92, avec les contrastes calculés.",
};

function Section({
  titre,
  chapeau,
  children,
}: {
  titre: string;
  chapeau?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <h2 className="mb-1 text-2xl">{titre}</h2>
      {chapeau && <p className="mt-0 mb-6 max-w-[65ch] text-sm text-muted-2">{chapeau}</p>}
      {!chapeau && <div className="mb-6" />}
      {children}
    </section>
  );
}

function TablePalette({ palette, nom }: { palette: Palette; nom: string }) {
  const surfaces = SURFACES(palette);
  const encres = ENCRES(palette);

  return (
    <div className="overflow-x-auto rounded-md border border-[var(--divider)]">
      <table className="w-full min-w-[36rem] border-collapse text-left">
        <caption className="px-4 pt-4 pb-3 text-left font-mono text-xs uppercase tracking-[0.06em] text-muted-2">
          {nom}
        </caption>
        <thead>
          <tr className="border-b border-[var(--hairline)]">
            <th className="px-4 py-2 text-[13px] font-medium">Encre</th>
            {surfaces.map((s) => (
              <th key={s.nom} className="px-4 py-2 text-[13px] font-medium">
                sur {s.nom}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {encres.map((e) => {
            const ratios = ratiosSur(e.hex, surfaces);
            return (
              <tr key={e.jeton} className="border-b border-[var(--hairline)] last:border-0">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="size-5 shrink-0 rounded-sm border border-[var(--hairline)]"
                      style={{ background: e.hex }}
                    />
                    <span>
                      <span className="block text-[13px] font-medium">{e.nom}</span>
                      <span className="tabular block text-[11px] text-muted-2">
                        {e.hex}
                      </span>
                    </span>
                  </span>
                </td>
                {ratios.map((r) => (
                  <td key={r.fond} className="px-4 py-3">
                    <span className="tabular text-[13px]">{formate(r.valeur)}</span>
                    {!r.conforme && (
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.04em] text-accent-ink">
                        sous le seuil
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const ECHELLE = [
  {
    label: "Titre de page",
    exemple: "Barbers et coiffeurs des Hauts-de-Seine",
    classe: "font-display text-[42px] leading-[1.1]",
  },
  {
    label: "Titre de section",
    exemple: "Salons à proximité",
    classe: "font-display text-2xl",
  },
  {
    label: "Nom de salon",
    exemple: "Salon Lucien, Boulogne-Billancourt",
    classe: "text-lg font-medium",
  },
  {
    label: "Texte courant",
    exemple:
      "Envoyez une demande de rendez-vous en quelques clics, le salon vous répond directement.",
    classe: "max-w-[480px] text-[15px] leading-relaxed",
  },
  {
    label: "Mention secondaire",
    exemple: "Ouvert jusqu'à 19h00, à 0,8 km",
    classe: "text-[13px] text-muted-2",
  },
  {
    label: "Petite capitale monospace",
    exemple: "Nouvelle demande",
    classe: "font-mono text-xs uppercase tracking-[0.06em] text-muted-2",
  },
];

const VARIANTES = [
  { variant: "principal", nom: "Principal", libelle: "Envoyer la demande" },
  { variant: "secondaire", nom: "Secondaire", libelle: "Annuler" },
  { variant: "discret", nom: "Discret", libelle: "Voir tous les salons" },
  { variant: "destructeur", nom: "Destructeur", libelle: "Refuser la demande" },
] as const;

export default function SystemePage() {
  return (
    <main className="mx-auto max-w-[1240px] px-5 py-12 md:px-16 md:py-14">
      <header className="mb-14 flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="mb-2 text-[40px] leading-none">Système de design, Coiff&apos;92</h1>
          <p className="m-0 max-w-[60ch] text-[15px] text-muted-2">
            Palette, typographie et composants. Les contrastes sont calculés à partir des
            jetons réels, pas recopiés à la main.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Section
        titre="Palette"
        chapeau={`Chaque valeur est le ratio de contraste WCAG entre l'encre et le fond. Le seuil AA pour du texte courant est de ${SEUIL_AA.toString().replace(".", ",")}:1. Toute case marquée « sous le seuil » est une combinaison à ne pas utiliser.`}
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <TablePalette palette={CLAIR} nom="Thème clair" />
          <TablePalette palette={SOMBRE} nom="Thème sombre" />
        </div>
        <p className="mt-4 max-w-[75ch] text-[13px] text-muted-2">
          Deux corrections par rapport à la planche d&apos;origine. En thème sombre, le
          gris 3 est passé de <span className="tabular">#83868a</span> à{" "}
          <span className="tabular">#8b8e92</span>, il tombait à{" "}
          <span className="tabular">4,15:1</span> sur la surface secondaire. En thème
          clair, l&apos;accent en texte utilise <span className="tabular">#a92e17</span>{" "}
          et non <span className="tabular">#b8341a</span>, qui tombait à{" "}
          <span className="tabular">4,31:1</span> sur cette même surface. L&apos;accent
          des aplats, lui, n&apos;a pas bougé.
        </p>
      </Section>

      <Section
        titre="Échelle typographique"
        chapeau="Clash Display est dessiné serré et son espace mot est étroit. Les titres portent donc un crénage de -0,008em et un espace mot élargi de 0,07em, appliqués une fois pour toutes dans la feuille de style."
      >
        <div className="rounded-md bg-surface px-6 py-1 md:px-8">
          {ECHELLE.map((e) => (
            <div
              key={e.label}
              className="flex flex-col gap-2 border-b border-[var(--hairline)] py-5 last:border-0 md:flex-row md:items-baseline md:gap-8"
            >
              <div className="w-[220px] shrink-0 font-mono text-[11px] uppercase tracking-[0.04em] text-muted-2">
                {e.label}
              </div>
              <div className={e.classe}>{e.exemple}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        titre="Boutons"
        chapeau="Survol, appui et focus clavier sont de vrais états CSS : passe la souris dessus, ou navigue à la tabulation. Ils ne sont pas simulés."
      >
        <div className="flex flex-col gap-7">
          {VARIANTES.map((v) => (
            <div key={v.variant}>
              <div className="mb-3 text-[15px] font-medium">{v.nom}</div>
              <div className="flex flex-wrap items-start gap-5">
                {[
                  { cle: "Normal", props: {} },
                  { cle: "Désactivé", props: { disabled: true } },
                  { cle: "Chargement", props: { loading: true } },
                ].map((s) => (
                  <div key={s.cle} className="flex flex-col items-start gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted-2">
                      {s.cle}
                    </span>
                    <Button variant={v.variant} {...s.props}>
                      {v.libelle}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        titre="Champs de formulaire"
        chapeau="Libellé au-dessus, aide ou erreur en dessous. Jamais d'indication placée uniquement dans le champ : elle disparaît dès qu'on saisit."
      >
        <FormShowcase />
      </Section>

      <Section
        titre="Choix segmenté"
        chapeau="Pour deux à quatre options courtes qui se comparent d'un coup d'oeil. Au-delà, ou pour des libellés longs, on revient aux ronds du groupe exclusif. Trois signaux distinguent le segment retenu, l'aplat, le liseré et l'état coché : jamais la couleur seule."
      >
        <div className="flex flex-col gap-6 sm:max-w-[380px]">
          <SegmentedRadio
            legend="Créneau"
            name="demo-creneau"
            options={CRENEAUX}
            defaultValue="apres_midi"
            help="Le salon confirmera l'horaire exact."
          />
          <SegmentedRadio
            legend="Créneau"
            name="demo-creneau-erreur"
            options={CRENEAUX}
            error="Choisissez un créneau."
          />
        </div>
      </Section>

      <Section
        titre="Badges de statut"
        chapeau="Les statuts ne se distinguent pas par la couleur seule. « Nouvelle » est le seul en accent, les autres se différencient par leur trait, plein ou tireté, et par leur aplat."
      >
        <div className="flex flex-wrap gap-3">
          <Badge tone="nouvelle" />
          <Badge tone="acceptee" />
          <Badge tone="refusee" />
          <Badge tone="traitee" />
          <Badge tone="demo" />
        </div>
      </Section>

      <Section
        titre="États génériques"
        chapeau="L'état vide sera très souvent à l'écran : au démarrage, aucun salon n'a reçu de demande. Il porte donc toujours une action, jamais seulement un constat."
      >
        <div className="grid gap-8 md:grid-cols-2">
          <EmptyState
            title="Aucune demande pour l'instant"
            body="Les demandes de rendez-vous envoyées par vos clients apparaîtront ici."
            action={
              <Button variant="secondaire" size="sm">
                Partager la fiche du salon
              </Button>
            }
          />
          <SkeletonRows rows={3} />
        </div>
      </Section>
    </main>
  );
}
