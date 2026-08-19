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
| `/salon/[slug]/rendez-vous` | Route d'attente, le formulaire arrive avec sa maquette |
| `/reclamer/[slug]` | Route d'attente, la connexion arrive avec sa maquette |
| `/systeme` | Le guide de style, avec les contrastes calculés |

## Architecture

```
app/                    routes, toutes en composants serveur par défaut
  globals.css           les jetons du système, thèmes clair et sombre
  fonts.ts              les 3 familles, hébergées dans app/fonts/
components/
  ui/                   les composants du système de design
  annuaire/             ce qui est propre à la liste
lib/
  salons.ts             LA couche de données, seul point à changer pour Supabase
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

- Formulaire de demande de rendez-vous, en attente de sa maquette
- Connexion par lien et espace du gérant, en attente de leur maquette
- Bascule sur Supabase : schéma, politiques RLS, et le test de sécurité qui
  prouve qu'un compte ne peut pas lire les demandes d'un autre
- Mise en ligne sur Vercel
