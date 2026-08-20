/* Le contenu par défaut du créneau principal, quand le routeur affiche
   le panneau et doit quand même remplir ce qu'il y a derrière : la fiche
   du salon, exactement celle de page.tsx.

   Sans ce fichier, arriver sur l'URL du formulaire par une navigation
   douce venue d'ailleurs que de la fiche laisserait le créneau principal
   sans réponse. */
export { default } from "./page";
