/* Concaténation conditionnelle de classes. Volontairement minuscule :
   clsx et tailwind-merge ne se justifient pas pour l'usage qu'on en a. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
