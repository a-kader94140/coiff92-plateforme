# Coiff'92, plateforme

Annuaire des coiffeurs et barbers des Hauts-de-Seine, qui permet d'envoyer une
demande de rendez-vous à un salon. MVP en cours.

> Le site statique d'origine, `../annuaire-coiffeurs-92/`, **reste en ligne et
> intact**. Ce projet est sa suite, pas son remplaçant tant qu'il n'est pas fini.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # vérifie que la production compile
```

Aucune variable d'environnement pour l'instant : les données sont locales.

## Ce qui existe

| Route | Contenu |
|---|---|
| `/` | L'annuaire : recherche, filtres commune et type, classement, 142 fiches |
| `/salon/[slug]` | La fiche, en deux versions selon qu'elle est complétée ou non |
| `/salon/[slug]/rendez-vous` | Le formulaire de demande, en page pleine |
| la même, interceptée | Depuis la fiche, cette URL s'ouvre en panneau latéral par-dessus |
| `/reclamer/[slug]` | Route d'attente, la connexion arrive avec sa maquette |
| `/systeme` | Le guide de style, avec les contrastes calculés |

Plus les états de la navigation : `not-found.tsx`, `error.tsx` et le squelette de
chargement de l'annuaire.

## Architecture

```
app/                    routes, toutes en composants serveur par défaut
  globals.css           les jetons du système, thèmes clair et sombre
  fonts.ts              les 3 familles, hébergées dans app/fonts/
  (annuaire)/           groupe absent de l'URL, qui borne le loading.tsx
  not-found.tsx         le 404
  error.tsx             la panne, avec un bouton pour réessayer
  salon/[slug]/
    @panneau/           le créneau parallèle où s'affiche le panneau latéral
components/
  ui/                   les composants du système de design
  annuaire/             ce qui est propre à la liste
  rendez-vous/          l'entête, le formulaire et le panneau de la demande
lib/
  salons.ts             LA couche de données, seul point à changer pour Supabase
  demandes.ts           types, créneaux, bornes de date. N'IMPORTE PAS zod
  demandes-schema.ts    la validation et la persistance, server-only
  demandes-actions.ts   l'action serveur appelée par le formulaire
  contrast.ts           calcul WCAG, utilisé par le guide de style
  tokens.ts             les jetons en TypeScript, pour la documentation
data/
  salons.ts             136 salons réels, GENERE depuis le relevé vérifié
  demo.ts               6 salons fictifs, écrits à la main
```

**Les composants ne connaissent pas la source des données.** Tout passe par
`chercherSalons()` et `trouverSalon()` dans `lib/salons.ts`. Le jour où Supabase
arrive, ces deux fonctions deviennent des requêtes et rien d'autre ne bouge.

**Les filtres vivent dans l'URL**, pas dans l'état React. Une recherche est
partageable par lien, le bouton Retour fonctionne, et la page reste rendue côté
serveur, donc indexable.

## La demande de rendez-vous

Une demande, pas une réservation. La plateforme ne tient pas l'agenda des salons :
le visiteur envoie une demande, le salon vérifie ses disponibilités et rappelle.
Un encart le dit **en tête du formulaire** et non en bas de page, sinon le
visiteur ne le comprend qu'après l'envoi, et se présente devant une porte fermée.

**Elle n'existe que sur les six fiches démo.** Le formulaire exige `complete` et
au moins une prestation ; les 136 salons réels n'ont ni l'un ni l'autre et
répondent `notFound()`. Ce n'est pas une panne, c'est la règle des données
inventées appliquée jusqu'au bout : on ne propose pas de rendez-vous chez un
commerçant qui n'a jamais donné ses prestations.

**Une seule URL, deux présentations.** Depuis la fiche, un clic ouvre le
formulaire en panneau latéral par-dessus, le visiteur garde sous les yeux les
tarifs qu'il est en train de demander. En ouverture directe, au rafraîchissement
ou depuis un lien partagé, l'interception ne joue pas et la page pleine répond.
Les deux montent le même `FormulaireDemande`, aucun contenu n'est dupliqué.

Le panneau est un `<dialog>` natif, pas un `<div>` : la touche Échap, le piège à
focus et l'inertie du fond pour les lecteurs d'écran sont fournis par le
navigateur. Refermer ne ferme rien au sens du routeur, c'est un retour arrière,
donc la croix et le bouton Précédent font la même chose.

### Où en est la persistance

**Rien n'est enregistré aujourd'hui.** La validation est réelle et complète, mais
`enregistrerDemande()` dans `demandes-schema.ts` est un talon qui se contente
d'une trace en console hors production. La base n'existe pas encore.

C'est assumé et le produit ne le cache pas au visiteur. Tant que
`DEMANDES_ENREGISTREES` vaut `false`, l'écran de confirmation porte une mention
« Démonstration, cette demande n'a été transmise à personne », posée juste sous
la phrase qui annonce que le salon l'a reçue. Elle disparaît d'elle-même quand le
drapeau passe à `true`.

Au branchement de Supabase, deux points à changer et deux seulement :

1. `enregistrerDemande()` devient un insert anonyme sur `booking_requests` sous RLS
2. `DEMANDES_ENREGISTREES` passe à `true`

Les composants ne bougent pas, exactement comme pour `chercherSalons()`.

## Les règles qu'on ne casse pas

**Données réelles contre données inventées.** Les 136 salons sont des commerces
réels et nommés. Ils ne portent que leurs champs vérifiés : nom, commune, code
postal, rue, type. Aucun tarif, horaire, téléphone ou description n'est inventé
pour eux. Les six fiches complètes sont **fictives**, portent `demo: true`, et un
badge « Démo » visible partout où elles apparaissent. Le pied de l'annuaire
distingue explicitement les deux.

**Contraste AA partout.** Tout couple texte sur fond passe 4,5:1 dans les deux
thèmes. `/systeme` calcule les ratios depuis les jetons réels et marque « sous le
seuil » toute combinaison fautive : c'est un garde-fou, pas une capture d'écran.

Deux jetons d'accent, à ne pas confondre :

- `--accent` pour les **aplats et les bordures**, le blanc posé dessus tient 5,93
- `--accent-ink` pour le **texte en couleur d'accent**, qui doit rester lisible
  jusque sur `--surface-2`

**Un seul système de rayons**, 3px et 6px. Rien n'est en pilule.

**La couleur de bordure appartient à la variante**, jamais aux classes de base
d'un composant. À spécificité égale, Tailwind tranche par l'ordre dans la feuille
générée, pas par l'ordre dans la chaîne de classes : un `border-transparent` posé
en base efface silencieusement le `border-divider` d'une variante.

**zod ne descend jamais dans le navigateur.** `demandes-schema.ts` est marqué
`server-only`, et `demandes.ts`, lu par le formulaire qui est un composant
client, ne l'importe pas. Quand les deux étaient réunis, la seule route du
rendez-vous emportait 83 kB de JavaScript de plus que les autres. La séparation
est un choix de poids, pas de rangement.

**Un `loading.tsx` ne remonte pas à la racine de `app/`.** Il ouvre une frontière
Suspense sur son segment et tous ses enfants : la réponse part en flux, l'entête
HTTP est émis avant le rendu du corps, et un `notFound()` appelé ensuite ne peut
plus changer le statut. Les slugs inconnus de `/salon` et `/reclamer` répondaient
200 au lieu de 404. D'où le groupe `(annuaire)`, invisible dans l'URL, qui borne
la frontière à la seule page qui en a besoin.

## Écarts assumés par rapport aux maquettes

Les maquettes viennent de Claude Design, projet « Coiff'92 ».

| Maquette | Ce qui a été fait à la place | Pourquoi |
|---|---|---|
| Polices chargées par CDN | Hébergées dans `app/fonts/` | Un `@import` distant bloque le premier rendu et casse l'usage hors ligne |
| Ratios de contraste écrits en dur | Calculés depuis les jetons | Un chiffre à la main ne suit pas un changement de jeton, et s'était déjà trompé |
| Six copies figées d'un bouton par état | Vrais états CSS | Survol, appui et focus se testent, ils ne se dessinent pas |
| « Demander un rendez-vous » en `<div>` cliquable | La ligne entière est un `<Link>` | Un div ne se tabule pas et n'annonce rien |
| Commune répétée à chaque ligne | Retirée quand on classe par ville | Elle est déjà l'en-tête juste au-dessus |
| Tri « Pertinence, Alphabétique, Distance » | « Par ville » et « par nom » | Sans coordonnées ni signal de classement, les deux autres seraient décoratifs |
| Jour courant en `--accent` sur `--surface-2` | `--accent-ink` | 4,31:1 contre 4,77:1, le premier est sous le seuil |

## Régénérer les données réelles

`data/salons.ts` est généré depuis `../annuaire-coiffeurs-92/salons.js`, le relevé
vérifié ligne à ligne d'août 2026. Ne pas l'éditer à la main : corriger la source,
puis régénérer.

## Ce qui reste à faire

- Enregistrer les demandes pour de bon : aujourd'hui elles sont validées puis
  perdues, voir « Où en est la persistance »
- Connexion par lien et espace du gérant, en attente de leur maquette
- Bascule sur Supabase : schéma, politiques RLS, et le test de sécurité qui
  prouve qu'un compte ne peut pas lire les demandes d'un autre
- Ouvrir la demande de rendez-vous au-delà des six fiches démo, ce qui suppose
  que de vrais salons aient réclamé leur fiche et saisi leurs prestations
- Mise en ligne sur Vercel
