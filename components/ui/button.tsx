import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type ButtonVariant = "principal" | "secondaire" | "discret" | "destructeur";
export type ButtonSize = "md" | "sm";

/* Les six états de la planche sont traités ici, mais quatre le sont par
   des pseudo-classes CSS plutôt que par des props : survol, appui, focus
   clavier et désactivé. Seul « chargement » a besoin d'une prop, parce
   qu'il ajoute un élément dans le bouton. */
/* La couleur de bordure appartient à la variante, jamais à la base.
   Un `border-transparent` posé ici l'emporterait sur le `border-divider`
   des variantes : à spécificité égale, c'est l'ordre dans la feuille
   générée qui tranche, pas l'ordre dans la chaîne de classes. Les boutons
   à contour se retrouvaient sans contour. */
const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md " +
  "font-medium tracking-[0.01em] border " +
  "transition-[background-color,border-color,color,transform] duration-150 " +
  "active:scale-[0.98] disabled:opacity-[0.38] disabled:cursor-not-allowed " +
  "disabled:active:scale-100 cursor-pointer";

const sizes: Record<ButtonSize, string> = {
  md: "text-sm px-[22px] py-3",
  sm: "text-[13px] px-4 py-2",
};

const variants: Record<ButtonVariant, string> = {
  principal:
    "border-transparent bg-accent text-on-accent " +
    "hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)]",
  secondaire:
    "border-[var(--divider)] bg-transparent text-text " +
    "hover:bg-surface-2 active:border-accent",
  discret:
    "border-transparent bg-transparent text-text " +
    "hover:bg-surface-2 active:text-accent-ink",
  destructeur:
    "border-accent bg-transparent text-accent-ink hover:bg-[var(--accent-wash)] " +
    "active:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)]",
};

/* Le bouton discret a une marge intérieure plus courte : sans bordure ni
   aplat, la même marge le ferait paraître flottant. */
const quietPadding = "px-4 py-3";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "principal",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        base,
        size === "md" && variant === "discret" ? quietPadding : sizes[size],
        variants[variant],
        loading && "cursor-progress opacity-75",
        className,
      )}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-3 shrink-0 rounded-full border-2 border-current border-t-transparent"
          style={{ animation: "coiff-spin 0.6s linear infinite" }}
        />
      )}
      {children}
    </button>
  );
}
