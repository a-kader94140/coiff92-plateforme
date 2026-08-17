import { cn } from "./cn";

/* Les quatre statuts d'une demande, plus le marqueur « Démo ».

   Les statuts ne sont pas différenciés par la couleur seule : « nouvelle »
   est la seule en accent, les autres se distinguent par leur trait, plein
   ou tireté, et par leur aplat. Une différence lisible sans percevoir les
   couleurs. */

export type BadgeTone = "nouvelle" | "acceptee" | "refusee" | "traitee" | "demo";

const base =
  "inline-flex items-center rounded-sm px-2.5 py-1 font-mono text-[11px] " +
  "font-medium uppercase tracking-[0.04em] tabular-nums";

const tones: Record<BadgeTone, string> = {
  nouvelle: "border border-accent text-accent-ink bg-[var(--accent-wash)]",
  acceptee: "border border-[var(--divider)] text-text bg-surface-2",
  refusee: "border border-dashed border-[var(--divider)] text-muted-2 bg-transparent",
  traitee: "border border-[var(--divider)] text-muted-2 bg-transparent",
  demo: "border border-dashed border-[var(--muted-3)] text-muted-2 bg-transparent",
};

const labels: Record<BadgeTone, string> = {
  nouvelle: "Nouvelle",
  acceptee: "Acceptée",
  refusee: "Refusée",
  traitee: "Traitée",
  demo: "Démo",
};

export function Badge({
  tone,
  children,
  className,
}: {
  tone: BadgeTone;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn(base, tones[tone], className)}>{children ?? labels[tone]}</span>
  );
}
