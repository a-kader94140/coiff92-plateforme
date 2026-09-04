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

Deux variables d'environnement sont nécessaires depuis le branchement de
Supabase. Copier `.env.example` en `.env.local` et renseigner l'URL du projet
et la clé publiable. Les salons, eux, restent des données locales.

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
supabase/
  migrations/           le schéma et les politiques RLS, à rejouer dans l'ordre
lib/
  salons.ts             LA couche de données, seul point à changer pour Supabase
  demandes.ts           types, créneaux, bornes de date. N'IMPORTE PAS zod
  demandes-schema.ts    la validation et la persistance, server-only
  supabase.ts           le client Supabase, server-only lui aussi
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

**Les demandes sont enregistrées depuis le 04/09/2026.** `enregistrerDemande()`
insère dans la table `demandes` de Supabase, et `DEMANDES_ENREGISTREES` vaut
`true` : l'écran de confirmation ne porte plus la mention « Démonstration », et
la phrase qui annonce que le salon a reçu la demande est devenue vraie.

Le nom de la table est `demandes` et non `booking_requests` annoncé ici avant le
branchement : tout le code du projet est en français, une seule table en anglais
au milieu se paierait à chaque relecture.

**La sécurité tient à RLS, pas au secret de la clé.** La clé publiable est
publique par conception. La table porte donc exactement deux règles :

- une politique d'**insertion** ouverte au public, avec `with check (statut =
  'nouvelle')` : personne ne s'accepte un rendez-vous tout seul
- **aucune politique de lecture**, de modification ni de suppression. RLS refuse
  par défaut : sans politique, la clé publiable ne voit rien, même en connaissant
  un identifiant. Ces lignes portent des noms, e-mails et téléphones de vraies
  personnes

L'insert ne fait volontairement **pas** de `.select()` en retour : ce serait une
lecture, et il n'y a pas de politique pour ça.

La lecture s'ouvrira avec l'espace gérant, restreinte au salon dont la personne
connectée est gérante. Ne pas l'ouvrir « en attendant ».

**Vérifié le 04/09/2026, sept contrôles sur l'API réelle :** insertion valide
acceptée (201), table illisible alors qu'une ligne existe (`[]`), insertion au
statut « acceptée » refusée par la politique, créneau inventé et nom trop court
refusés par les contraintes de la base, modification et suppression de masse sans
effet. Puis le formulaire soumis de bout en bout **sans JavaScript**.

**Ce qui n'est pas encore protégé :** rien ne limite le nombre de demandes qu'un
automate peut envoyer. Ce n'est pas une faille, c'est du spam, et c'est à traiter
avant la mise en ligne.

Le schéma et les politiques vivent dans `supabase/migrations/`. Ils sont la trace
écrite de ce que la base contient : les rejouer suffit à la recréer ailleurs.

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

**La sécurité de la base ne repose pas sur le secret d'une clé.** La clé
publiable est publique par conception. Une table sans politique RLS adaptée est
une table publiée. N'ouvrir la lecture de `demandes` qu'avec l'espace gérant, et
restreinte au salon de la personne connectée. Ne pas créer de clé secrète sans
nécessité démontrée : elle ignore toutes les politiques.

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

Les maquettes viennent de Claude Design. Trois projets existent, à ne pas
confondre :

| Projet | Ce qu'il sert |
|---|---|
| `6cbb3f9e-cdf5-4a11-b1a3-ce0ab1c0d017` | **Le courant.** Série rejouée depuis le prompt 1, portera les écrans restants |
| `780bd329-ed9b-43c4-aceb-1dd99606c2f4` | L'ancien. Source des écrans déjà livrés |
| `a7eeb472-396a-40fe-b3e9-9a9607025a24` | « Annuaire coiffeurs Hauts-de-Seine », le site statique. Rien à voir avec la plateforme |

Adresse : `https://claude.ai/design/p/<uuid>`

Un prompt collé dans le mauvais projet repart sur un autre système visuel, et il
faut ensuite retraduire chaque jeton à la main. C'est ce qui est arrivé au
prompt 4, revenu sur un système nommé Nocturne avec des données lyonnaises.

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

- Limiter les envois : l'insertion est ouverte au public, rien n'empêche un
  automate d'envoyer mille demandes. À traiter avant la mise en ligne
- RGPD : durée de conservation des demandes, information des personnes et
  suppression. La question s'est ouverte le jour où de vraies coordonnées ont
  commencé à être stockées
- Connexion par lien et espace du gérant, en attente de leur maquette. C'est là
  que s'ajoutera la politique de lecture, restreinte au salon dont la personne
  connectée est gérante
- Passer les salons en base à leur tour, pour que `salons.ts` cesse d'être un
  fichier et que les gérants puissent éditer leur fiche
- Ouvrir la demande de rendez-vous au-delà des six fiches démo, ce qui suppose
  que de vrais salons aient réclamé leur fiche et saisi leurs prestations
- Mise en ligne sur Vercel, avec les deux variables d'environnement
