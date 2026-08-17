/* Calcul du contraste WCAG 2.1.

   La planche Claude Design listait les ratios en dur dans le HTML. Un
   chiffre écrit à la main ne se met pas à jour quand on change un jeton,
   et il s'était déjà trompé une fois. Ici on les calcule à partir des
   valeurs réelles : le guide de style devient un garde-fou, pas une
   capture d'écran. */

export type Ratio = {
  fond: string;
  valeur: number;
  conforme: boolean;
};

function luminance(hex: string): number {
  const canaux = hex
    .replace("#", "")
    .match(/../g)!
    .map((h) => parseInt(h, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * canaux[0] + 0.7152 * canaux[1] + 0.0722 * canaux[2];
}

export function contraste(encre: string, fond: string): number {
  const a = luminance(encre);
  const b = luminance(fond);
  const [haut, bas] = a > b ? [a, b] : [b, a];
  return (haut + 0.05) / (bas + 0.05);
}

/** Seuil AA pour du texte courant. */
export const SEUIL_AA = 4.5;

export function ratiosSur(
  encre: string,
  fonds: Array<{ nom: string; hex: string }>,
): Ratio[] {
  return fonds.map(({ nom, hex }) => {
    const valeur = contraste(encre, hex);
    return { fond: nom, valeur, conforme: valeur >= SEUIL_AA };
  });
}

export function formate(valeur: number): string {
  return valeur.toFixed(2).replace(".", ",") + ":1";
}
