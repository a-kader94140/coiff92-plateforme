import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type ButtonVariant = "principal" | "secondaire" | "discret" | "destructeur";
export type ButtonSize = "lg" | "md" | "sm";

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

/* `lg` nomme la taille du CTA de la fiche salon, qui existait déjà mais
   en classes recopiées. La surcharger par className serait un piège : cn
   concatène sans arbitrer, et deux `px-` concurrents se départagent sur
   l'ordre de la feuille générée, pas sur celui de la chaîne. */
const sizes: Record<ButtonSize, string> = {
  lg: "text-[15px] px-6 py-3.5",
  md: "text-sm px-[22px] py-3",
  sm: "text-[13px] px-4 py-2",
};

const variants: Record<ButtonVariant, string> = {
  principal:
    "border-transparent bg-accent text-on-accent " +
    "hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)]",
  secondaire:
    "border-[var(--divider)] bg-transparent text-text " +
    "hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] " +
    "active:border-accent",
  discret:
    "border-transparent bg-transparent text-text " +
    "hover:bg-[var(--surface-hover)] active:bg-[var(--surface-active)] " +
    "active:text-accent-ink",
  /* L'appui ne renforce pas le voile, il bascule en aplat plein.
     La planche proposait un voile à 16%, mesuré à 4,33:1 sur une
     surface : sous le seuil AA. L'aplat tient 5,93:1 quel que soit le
     fond, et distingue mieux l'appui du survol. */
  destructeur:
    "border-accent bg-transparent text-accent-ink hover:bg-[var(--accent-wash)] " +
    "active:bg-accent active:text-on-accent",
};

/* Le bouton discret a une marge intérieure plus courte : sans bordure ni
   aplat, la même marge le ferait paraître flottant. */
const quietPadding = "px-4 py-3";

/* Le style seul, sans le <button>.

   Huit liens de navigation recopiaient ces classes à la main. Aucun n'avait
   l'état d'appui, et le survol de quatre d'entre eux avait déjà divergé du
   composant. Un <a> ne peut pas devenir un <button> sans casser la
   navigation, donc c'est le style qui se partage, pas l'élément. */
export function buttonClass({
  variant = "principal",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    base,
    size === "md" && variant === "discret" ? quietPadding : sizes[size],
    variants[variant],
    className,
  );
}

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
        buttonClass({ variant, size }),
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
