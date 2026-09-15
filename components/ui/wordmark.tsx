import "./wordmark.css";

/* Le mot-symbole du produit : « Coiff'92 », partagé par les dix
   endroits qui l'affichent (en-têtes de page, héro de l'accueil). Un
   seul endroit à corriger le jour où le dessin change encore.

   « 92 » porte sa propre classe plutôt qu'un simple <span> : le héro
   colore ses deux chiffres via un sélecteur CSS (.hero-brand span,
   .hero-title span dans hero.css), qui aurait aussi attrapé
   l'apostrophe si elle restait un span nu. Une classe dédiée sur le
   seul élément qu'on veut viser est plus sûre qu'un sélecteur
   générique en espérant qu'aucun autre span ne s'invite dans le mot. */
export function Wordmark({ n92ClassName }: { n92ClassName?: string }) {
  return (
    <>
      Coiff
      <span aria-hidden="true" className="wordmark-apostrophe" />
      <span className={n92ClassName ? `wordmark-n92 ${n92ClassName}` : "wordmark-n92"}>92</span>
    </>
  );
}
