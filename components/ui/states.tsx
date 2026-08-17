import type { ReactNode } from "react";
import { cn } from "./cn";

/* État vide.

   Sur cette plateforme il sera très souvent à l'écran : au démarrage,
   aucun salon n'a de demande. Il porte donc toujours une action, jamais
   seulement un constat. */
export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-md bg-surface-2 px-8 py-10 text-center",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-md border border-[var(--divider)]"
      >
        <span className="block size-5 rounded-full border border-[var(--muted-3)]" />
      </span>
      <p className="font-display text-xl text-text">{title}</p>
      <p className="m-0 max-w-70 text-sm leading-relaxed text-muted-2">{body}</p>
      {action}
    </div>
  );
}

/* Squelette de chargement.

   Il reprend la forme de ce qui va arriver, une pastille et deux lignes,
   plutôt qu'un rond qui tourne au milieu du vide : la page ne se
   réorganise pas quand les données arrivent. */
export function SkeletonRows({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  const pulse = { animation: "coiff-pulse 1.4s ease-in-out infinite" };

  return (
    <div
      aria-hidden="true"
      className={cn("flex flex-col gap-4 rounded-md bg-surface-2 p-6", className)}
    >
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="size-10 shrink-0 rounded-sm bg-surface" style={pulse} />
          <span className="flex-1">
            <span
              className="block h-2.5 w-[70%] rounded-sm bg-surface"
              style={pulse}
            />
            <span
              className="mt-1.5 block h-2 w-[40%] rounded-sm bg-surface"
              style={pulse}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

/* Annonce le chargement aux lecteurs d'écran, que le squelette seul ne
   transmet pas puisqu'il est masqué. */
export function LoadingAnnounce({ label = "Chargement en cours" }: { label?: string }) {
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {label}
    </span>
  );
}
