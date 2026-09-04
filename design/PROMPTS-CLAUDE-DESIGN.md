# Prompts Claude Design, Coiff'92 Plateforme

## Mode d'emploi

- **Le projet courant :** https://claude.ai/design/p/6cbb3f9e-cdf5-4a11-b1a3-ce0ab1c0d017
  La série y est rejouée depuis le prompt 1. L'ancien projet,
  `780bd329-ed9b-43c4-aceb-1dd99606c2f4`, reste la source des écrans déjà livrés :
  ne plus y coller de prompt.
- **Un seul projet Claude Design** pour les 6 prompts, dans l'ordre. Le prompt 1 pose le
  système, les suivants s'appuient dessus. Si tu les mets dans des projets séparés,
  chaque écran repartira dans une direction différente.
- **Un prompt par message.** Ne les colle pas à la suite.
- **En cas de contradiction entre une planche et le code déjà livré, le code gagne.**
  Les jetons de `app/globals.css` ont été vérifiés au calcul de contraste, pas à
  l'œil. Une planche qui les contredit se trompe.
- Après le prompt 1, **regarde la planche avant de continuer**. Si la palette ou la
  typographie dérive, corrige à ce moment. Tout le reste en découlera.
- Les noms, adresses et villes des prompts sont de **vraies données du site**. C'est
  volontaire : une maquette remplie de « Salon Exemple » ne permet pas de juger la
  densité réelle d'une liste de 142 lignes.
- Les salons à fiche complète (Le Comptoir des Ciseaux, Atelier Verdi, etc.) sont
  **fictifs**, également volontaire : on n'attribue pas de tarifs inventés à un commerce
  réel.

**Ce que tu me renvoies à la fin :** les exports d'écrans, et si Claude Design te le
propose, l'URL du projet. Je porte ensuite le tout en composants React.

---

## Prompt 1, le système de design

À coller en premier. Ne demande aucun écran, seulement les fondations.

```
Je construis Coiff'92, un annuaire de coiffeurs et barbers des Hauts-de-Seine qui permet
d'envoyer une demande de rendez-vous à un salon. 142 salons, 32 communes. Deux types
d'utilisateurs : le grand public qui cherche un salon, et le gérant de salon qui reçoit
les demandes.

Avant tout écran, établis le système de design. Ne dessine pas encore de page.

DIRECTION
Monochrome acier avec un seul accent vermillon, le rouge de l'enseigne de barbier. Les
neutres sont de vrais gris, sans dominante bleue ni beige. L'accent est la seule couleur
de l'interface. L'ensemble doit évoquer une enseigne de quartier bien faite, pas une
application grand public colorée.

COULEURS, THEME CLAIR
fond #f2f2f0, surface #e7e7e4, surface secondaire #dcdcd8
texte #17181a, gris secondaires #3d3f42 puis #52555a puis #5e6165
accent #b8341a, texte posé sur l'accent #ffffff
filets : le texte à 14% d'opacité, et à 26% pour les séparateurs marqués

COULEURS, THEME SOMBRE
fond #101113, surface #191b1e, surface secondaire #23262a
texte #f0efec, gris secondaires #c3c5c7 puis #9a9da1 puis #8b8e92
Le dernier gris a deja ete corrige une fois : #83868a pose sur la surface
secondaire tombait a 4,15:1. Ne le reprends pas, garde #8b8e92, qui tient 4,62:1.
accent #e9694e, texte posé sur l'accent #101113

Contrainte non négociable : tous les couples texte sur fond passent le contraste WCAG AA
de 4,5:1. Vérifie-le, notamment sur les gris les plus clairs posés sur une surface.

TYPOGRAPHIE
Titres : Clash Display 600. Cette police est dessinée serré et son espace mot est étroit.
Garde un crénage proche de zéro, autour de -0.008em, et élargis l'espace entre les mots
d'environ 0.07em. Sans cette correction, « Barbers et coiffeurs » se lit d'un seul bloc.
Texte courant et noms de salons : Satoshi 400 et 500.
Tous les chiffres, codes postaux, tarifs, durées, compteurs et petites capitales :
JetBrains Mono, avec des chiffres à chasse fixe pour que les colonnes s'alignent.

FORMES
Un seul système de rayons : 3px pour les petits éléments, 6px pour les blocs. Rien n'est
en pilule, aucun bouton entièrement arrondi. Pas d'ombre portée colorée.

A PROSCRIRE
Dégradés violets ou bleutés. Ombres colorées. Cartes imbriquées dans des cartes. Pastilles
de couleur décoratives devant les éléments de liste. Libellés de section numérotés du type
« 01 / Annuaire ». Invites de défilement. Tirets cadratins, utilise la virgule ou le point.

PRODUIS LA PLANCHE DU SYSTEME
1. La palette complète dans les deux thèmes, avec les ratios de contraste affichés
2. L'échelle typographique : titre de page, titre de section, nom de salon, texte
   courant, mention secondaire, petite capitale monospace
3. Les boutons : principal, secondaire, discret, destructeur, chacun dans ses états
   normal, survol, appui, focus clavier, désactivé, et chargement
4. Les champs de formulaire : libellé au-dessus, aide facultative, message d'erreur en
   dessous. Champ texte, liste déroulante, sélecteur de date, groupe de choix, zone de
   texte. Jamais d'indication placée uniquement dans le champ
5. Les badges de statut : nouvelle, acceptée, refusée, traitée, plus un badge « Démo »
6. Un état vide générique et un état de chargement générique
```

---

## Prompt 2, l'annuaire

```
Premier écran : l'annuaire public de Coiff'92, dans le système établi.

STRUCTURE
Une barre supérieure sobre avec le nom Coiff'92, le 92 en vermillon, et le bouton de
bascule clair/sombre. Hauteur maximale 72px, tout sur une ligne.
En dessous, une zone de recherche collante : un champ de recherche large, puis trois
contrôles compacts, ville, type d'établissement, ordre de classement. À droite, le
compteur de résultats en monospace, du type « 142 adresses, 32 communes ».
Puis la liste, groupée par commune, chaque groupe introduit par le nom de la ville en
Clash Display avec le nombre de salons à droite.

UNE LIGNE DE LA LISTE
C'est une liste dense qu'on parcourt à l'oeil, pas une grille de cartes. Un filet fin
entre les lignes, jamais de cadre autour de chaque salon.
Chaque ligne porte : le nom du salon en Satoshi 500, son type en petites capitales
monospace, sa ville, son adresse, son code postal en monospace, et un lien d'action à
droite. Une ligne fait environ 90px de haut, pas 150.

CONTENU REEL A UTILISER
Antony, 10 salons :
  3M Barber Coiffure, 17 rue de l'Église, 92160, Barber
  Brigitte Coiffure, 70 rue Adolphe Pajeaud, 92160, Coiffeur
  Franck Provost Antony, 19-21 rue Auguste Mounié, 92160, Coiffeur
  Frédéric Moreno, 11-13 avenue Aristide Briand, 92160, Coiffeur
  Hair'sPur, 67 avenue Raymond Aron, 92160, Coiffeur
  Jean-Claude Biguine, 23 rue Auguste Mounié, 92160, Coiffeur
Asnières-sur-Seine, 8 salons :
  2n.locks, 2 rue Bourdarie Lefure, 92600, Coiffeur
  Barber Shop By Bou, 10-12 rue des Bourguignons, 92600, Barber
  Barber Town 92, 274 avenue des Grésillons, 92600, Barber
  The Barber 92, 71 avenue d'Argenteuil, 92600, Barber

DISTINCTION IMPORTANTE
La grande majorité des salons n'ont que leur nom et leur adresse. Une minorité ont une
fiche complète, avec prestations et horaires. Ces derniers portent un marqueur discret
qui les distingue, sans que les autres aient l'air incomplets ou cassés. Trouve un
traitement qui valorise les fiches complètes sans dévaloriser les autres, c'est le point
délicat de cet écran.
Dans la maquette, marque « Barber Town 92 » comme fiche complète.

ETATS A MONTRER
Liste normale, aucun résultat après une recherche infructueuse, et chargement.

RESPONSIVE
Montre le rendu à 1440px et à 390px. Sur mobile, la ligne se réorganise mais reste une
ligne de liste, elle ne devient pas une carte.
```

---

## Prompt 3, la fiche salon

```
Deuxième écran : la fiche publique d'un salon. Il m'en faut deux versions, c'est le coeur
de la demande.

VERSION A, FICHE COMPLETE
Salon : Le Comptoir des Ciseaux, 14 rue de Paris, 92100 Boulogne-Billancourt, Mixte.
Description : « Salon de quartier ouvert depuis 2011. Coupe homme et femme, taille de
barbe, coloration. Sans rendez-vous le matin. »
Téléphone affiché.
Prestations, avec durée et tarif, en monospace pour les chiffres :
  Coupe homme, 30 min, 24 €
  Coupe homme et barbe, 45 min, 35 €
  Taille de barbe, 20 min, 16 €
  Coupe femme et brushing, 60 min, 45 €
  Coloration, 90 min, 62 €
Horaires par jour, du lundi au samedi, fermé le dimanche, avec le jour courant mis en
évidence.
Un bouton d'action principal « Demander un rendez-vous », visible sans défiler sur grand
écran comme sur mobile.
Un badge « Démo » discret mais lisible, ce salon est fictif et l'interface doit le dire.

VERSION B, FICHE NON RECLAMEE
Salon : Brigitte Coiffure, 70 rue Adolphe Pajeaud, 92160 Antony, Coiffeur.
On ne dispose que du nom, du type et de l'adresse. Ni description, ni prestations, ni
horaires, ni téléphone.
Cette version doit avoir l'air volontaire, pas cassée. C'est le cas de plus de 95% des
fiches, c'est donc l'écran le plus vu du site. Ne laisse pas de blocs vides ni de
« Non renseigné » répétés.
Elle porte un encart sobre invitant le gérant à réclamer sa fiche, et propose au visiteur
une action utile malgré l'absence d'informations, par exemple l'itinéraire.

COMMUN AUX DEUX
En-tête avec le nom en Clash Display, le type en petites capitales, la ville et l'adresse
complète. Un fil d'Ariane vers la commune.
Montre le rendu à 1440px et à 390px, dans les deux thèmes.
```

---

## Prompt 4, la demande de rendez-vous

```
Troisième écran : le formulaire de demande de rendez-vous, déclenché depuis la fiche
salon. Panneau latéral sur grand écran, page pleine sur mobile.

CHAMPS, dans cet ordre
  Votre nom, texte
  E-mail, texte
  Téléphone, texte
  Prestation souhaitée, liste déroulante alimentée par les prestations du salon
  Date souhaitée, sélecteur de date
  Créneau, groupe de trois choix exclusifs : matin, après-midi, soir
  Message, zone de texte facultative

REGLES
Libellé au-dessus de chaque champ. Message d'erreur en dessous. Aucune indication placée
uniquement dans le champ. Les champs facultatifs sont signalés comme tels, pas les
obligatoires.
Rappelle en tête du panneau à quel salon la demande est adressée.
Précise clairement que ce n'est pas une réservation ferme : le salon reçoit la demande et
recontacte. C'est le point que l'utilisateur doit comprendre sans lire deux fois.

QUATRE ETATS A MONTRER
1. Vide, à l'ouverture
2. Rempli avec deux erreurs de validation, e-mail mal formé et date non renseignée
3. Envoi en cours, bouton en chargement, champs verrouillés
4. Confirmation d'envoi, avec ce qui se passe ensuite et un moyen de revenir à l'annuaire

Montre le rendu à 1440px et à 390px.
```

---

## Prompt 5, connexion et réclamation de fiche

```
Quatrième écran : l'entrée dans l'espace réservé aux gérants de salon.

CONNEXION PAR LIEN
Un seul champ, l'adresse e-mail, et un bouton « Recevoir mon lien de connexion ».
Pas de mot de passe, la connexion se fait par un lien envoyé par e-mail.
Trois états : le formulaire, l'attente après envoi avec une explication claire de ce que
la personne doit faire maintenant, et l'erreur si l'adresse est invalide.
Cet écran doit rassurer un gérant de salon qui n'est pas à l'aise avec l'informatique.
Pas de jargon.

RECLAMER SA FICHE
Écran atteint depuis une fiche non réclamée. Exemple : Brigitte Coiffure, 70 rue Adolphe
Pajeaud, 92160 Antony.
Il rappelle de quel salon il s'agit, explique en une phrase ce que réclamer sa fiche
permet de faire, et demande l'e-mail professionnel.
Prévois l'état d'une fiche déjà réclamée par quelqu'un d'autre, avec une issue proposée
plutôt qu'un cul-de-sac.

Montre le rendu à 1440px et à 390px, dans les deux thèmes.
```

---

## Prompt 6, l'espace salon

```
Cinquième et dernier écran : l'espace du gérant connecté. Deux pages et une navigation.

NAVIGATION
Une navigation latérale sobre sur grand écran, en bas sur mobile. Deux entrées : « Mes
demandes » et « Ma fiche ». Le nom du salon connecté et la déconnexion sont visibles.

PAGE 1, MES DEMANDES
Liste des demandes reçues. Chaque ligne : nom du client, prestation demandée, date et
créneau souhaités, date de réception, coordonnées, et le statut.
Statuts : nouvelle, acceptée, refusée, traitée. Le statut doit se changer directement
depuis la liste, sans ouvrir une page.
Les demandes nouvelles se distinguent immédiatement des autres.
Un filtre par statut en haut.
Exemples à utiliser :
  Malik Benhaddou, coupe homme et barbe, jeudi 21 août, après-midi, reçue il y a 2 h
  Aïcha Traoré, coloration, samedi 23 août, matin, reçue hier
  Sofiane Merzouk, taille de barbe, mardi 19 août, soir, reçue il y a 3 jours
Montre aussi l'état « aucune demande pour l'instant », qui sera le plus fréquent au
démarrage. Cet état doit être soigné, pas expédié.

PAGE 2, MA FICHE
Édition de : nom public, description, téléphone, prestations, horaires.
Les prestations sont une liste éditable, avec libellé, durée et tarif. Ajouter et
supprimer une ligne doit être évident, y compris pour quelqu'un qui n'a jamais rempli de
formulaire complexe.
Les horaires se règlent par jour, avec la possibilité de marquer un jour fermé.
Un aperçu de ce que verra le public, et l'indication que des modifications ne sont pas
encore enregistrées.

Montre le rendu à 1440px et à 390px, dans les deux thèmes.
```

---

## Contrôle avant de me renvoyer les maquettes

Passe cette liste, elle m'évitera de porter en code des défauts qu'on paiera ensuite.

- [ ] Les deux thèmes existent pour chaque écran
- [ ] Aucun texte gris clair illisible sur une surface claire
- [ ] Le rendu 390px ne déborde pas horizontalement
- [ ] Aucun bouton dont le libellé passe à la ligne
- [ ] Les états vides, de chargement et d'erreur sont présents, pas seulement le cas
      passant
- [ ] La fiche non réclamée, version B, n'a pas l'air cassée
- [ ] Aucun tiret cadratin dans les textes des maquettes
- [ ] Les chiffres sont bien en monospace et alignés
- [ ] Un seul accent vermillon, aucune autre couleur n'est apparue en route
