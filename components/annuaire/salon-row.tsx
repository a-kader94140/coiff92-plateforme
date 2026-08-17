import Link from "next/link";
import { LIBELLES_TYPE, type Salon, type Tri } from "@/lib/salons";

/* La ligne entière est le lien vers la fiche.

   La maquette faisait de « Demander un rendez-vous » un <div> cliquable
   posé à droite. Un div ne se tabule pas, ne s'ouvre pas dans un nouvel
   onglet et n'annonce rien à un lecteur d'écran. Ici la ligne est un
   <Link> unique : une seule tabulation par salon, pas de lien imbriqué,
   et la mention à droite redevient ce qu'elle est, une affordance. */
export function SalonRow({ salon, tri }: { salon: Salon; tri: Tri }) {
  return (
    <li>
      <Link
        href={`/salon/${salon.slug}`}
        className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b
                   border-[var(--hairline)] px-5 py-5 transition-colors
                   duration-150 hover:bg-surface md:px-6"
      >
        <span className="flex flex-[1_1_280px] flex-col gap-1.5">
          <span className="flex flex-wrap items-center gap-2.5">
            <span className="text-base font-medium text-text">{salon.name}</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-2">
              {LIBELLES_TYPE[salon.type]}
            </span>
            {salon.complete && (
              <span
                className="rounded-sm border border-accent px-1.5 py-0.5 font-mono
                           text-[10px] uppercase tracking-[0.05em] text-accent-ink"
              >
                Fiche complète
              </span>
            )}
            {salon.demo && (
              <span
                className="rounded-sm border border-dashed border-[var(--muted-3)] px-1.5
                           py-0.5 font-mono text-[10px] uppercase tracking-[0.05em] text-muted-2"
              >
                Démo
              </span>
            )}
          </span>

          {/* Classé par ville, la commune est déjà l'en-tête juste au-dessus :
              la répéter à chaque ligne ajoutait deux séparateurs et aucune
              information. Classé par nom, elle redevient nécessaire. */}
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-1">
            {tri === "nom" && <span>{salon.city},</span>}
            <span>{salon.street || "Adresse non relevée"}</span>
            <span className="tabular text-[13px] text-muted-2">{salon.postalCode}</span>
          </span>
        </span>

        {/* Masquée sous 768px : la ligne entière est déjà le lien, et cette
            mention y tombait seule sur une deuxième ligne, allongeant chaque
            fiche d'un quart sans rien apporter. */}
        <span className="ml-auto hidden shrink-0 text-sm font-medium text-accent-ink md:inline">
          Voir la fiche
        </span>
      </Link>
    </li>
  );
}
