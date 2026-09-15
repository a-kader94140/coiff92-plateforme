import type { Salon } from "@/lib/salons";

/* Salons de DEMONSTRATION.

   Ces six établissements sont fictifs, et c'est délibéré. La version
   complète de la fiche affiche des prestations, des tarifs, un téléphone
   et des horaires, dont nous ne disposons pour aucun des 136 salons
   réels. Les inventer et les publier reviendrait à leur attribuer des
   prix qu'ils ne pratiquent pas.

   Chacun porte donc `demo: true`, ce qui affiche un badge « Démo » sur la
   fiche comme dans l'annuaire. Aucun nom ci-dessous n'existe dans le
   relevé réel, vérifié à la création.

   Les tarifs sont ceux qu'on observe couramment dans le département en
   2026, ils servent à juger la mise en page, pas à informer. 
   PLUS LU A L EXECUTION depuis la migration 0003. Le site sert les salons
   depuis Supabase, via lib/salons-data.ts. Ce fichier reste la source
   versionnee : il alimente supabase/migrations/0003_donnees_salons.sql,
   que produit `node supabase/outils/generer-0003.js`. Corriger une ligne
   ici ne change RIEN au site tant que la migration na pas ete regeneree
   puis rejouee dans lediteur SQL.
*/

export const SALONS_DEMO: Salon[] = [
  {
    slug: "le-comptoir-des-ciseaux-boulogne-billancourt",
    name: "Le Comptoir des Ciseaux",
    city: "Boulogne-Billancourt",
    postalCode: "92100",
    street: "14 rue de Paris",
    type: "mixte", lat: 48.839395, lng: 2.249189,
    complete: true,
    demo: true,
    phone: "01 46 05 12 34",
    description:
      "Salon de quartier ouvert depuis 2011. Coupe homme et femme, taille de barbe, coloration. Sans rendez-vous le matin.",
    prestations: [
      { label: "Coupe homme", dureeMin: 30, prixCents: 2400 },
      { label: "Coupe homme et barbe", dureeMin: 45, prixCents: 3500 },
      { label: "Taille de barbe", dureeMin: 20, prixCents: 1600 },
      { label: "Coupe femme et brushing", dureeMin: 60, prixCents: 4500 },
      { label: "Coloration", dureeMin: 90, prixCents: 6200 },
    ],
    horaires: [
      { jour: 1, ouvre: "09:30", ferme: "19:00" },
      { jour: 2, ouvre: "09:30", ferme: "19:00" },
      { jour: 3, ouvre: "09:30", ferme: "19:00" },
      { jour: 4, ouvre: "09:30", ferme: "19:00" },
      { jour: 5, ouvre: "09:30", ferme: "19:00" },
      { jour: 6, ouvre: "09:00", ferme: "18:00" },
      { jour: 0, ouvre: null, ferme: null },
    ],
  },
  {
    slug: "atelier-verdi-levallois-perret",
    name: "Atelier Verdi",
    city: "Levallois-Perret",
    postalCode: "92300",
    street: "8 rue Danton",
    type: "coiffeur", lat: 48.887541, lng: 2.286879,
    complete: true,
    demo: true,
    phone: "01 47 58 40 21",
    description:
      "Coupe et couleur végétale. Deux fauteuils, sur rendez-vous uniquement, pour prendre le temps.",
    prestations: [
      { label: "Coupe et brushing", dureeMin: 45, prixCents: 3800 },
      { label: "Couleur végétale", dureeMin: 120, prixCents: 7500 },
      { label: "Balayage", dureeMin: 150, prixCents: 9500 },
      { label: "Soin profond", dureeMin: 30, prixCents: 2200 },
    ],
    horaires: [
      { jour: 1, ouvre: null, ferme: null },
      { jour: 2, ouvre: "10:00", ferme: "19:30" },
      { jour: 3, ouvre: "10:00", ferme: "19:30" },
      { jour: 4, ouvre: "10:00", ferme: "20:00" },
      { jour: 5, ouvre: "10:00", ferme: "20:00" },
      { jour: 6, ouvre: "09:30", ferme: "18:00" },
      { jour: 0, ouvre: null, ferme: null },
    ],
  },
  {
    slug: "maison-kessab-nanterre",
    name: "Maison Kessab",
    city: "Nanterre",
    postalCode: "92000",
    street: "23 avenue Georges Clemenceau",
    type: "barber", lat: 48.886001, lng: 2.212544,
    complete: true,
    demo: true,
    phone: "01 41 20 66 09",
    description:
      "Barbier traditionnel. Rasage au coupe-chou, serviette chaude, dégradé américain.",
    prestations: [
      { label: "Coupe", dureeMin: 30, prixCents: 2200 },
      { label: "Coupe et barbe", dureeMin: 50, prixCents: 3300 },
      { label: "Rasage au coupe-chou", dureeMin: 35, prixCents: 2800 },
      { label: "Coupe enfant, moins de 10 ans", dureeMin: 25, prixCents: 1500 },
    ],
    horaires: [
      { jour: 1, ouvre: "10:00", ferme: "20:00" },
      { jour: 2, ouvre: "10:00", ferme: "20:00" },
      { jour: 3, ouvre: "10:00", ferme: "20:00" },
      { jour: 4, ouvre: "10:00", ferme: "20:00" },
      { jour: 5, ouvre: "10:00", ferme: "20:00" },
      { jour: 6, ouvre: "09:00", ferme: "20:00" },
      { jour: 0, ouvre: "10:00", ferme: "14:00" },
    ],
  },
  {
    slug: "lame-fine-issy-les-moulineaux",
    name: "Lame Fine",
    city: "Issy-les-Moulineaux",
    postalCode: "92130",
    street: "5 rue du Général Leclerc",
    type: "barber", lat: 48.826681, lng: 2.27893,
    complete: true,
    demo: true,
    phone: "01 45 29 83 17",
    description: "Barbier, coupe et entretien de barbe. Un seul fauteuil, sur rendez-vous.",
    prestations: [
      { label: "Coupe", dureeMin: 30, prixCents: 2500 },
      { label: "Barbe", dureeMin: 25, prixCents: 1800 },
      { label: "Coupe et barbe", dureeMin: 55, prixCents: 3900 },
    ],
    horaires: [
      { jour: 1, ouvre: null, ferme: null },
      { jour: 2, ouvre: "11:00", ferme: "19:00" },
      { jour: 3, ouvre: "11:00", ferme: "19:00" },
      { jour: 4, ouvre: "11:00", ferme: "20:00" },
      { jour: 5, ouvre: "11:00", ferme: "20:00" },
      { jour: 6, ouvre: "10:00", ferme: "18:00" },
      { jour: 0, ouvre: null, ferme: null },
    ],
  },
  {
    slug: "coupe-franche-clichy",
    name: "Coupe Franche",
    city: "Clichy",
    postalCode: "92110",
    street: "41 rue Henri Barbusse",
    type: "mixte", lat: 48.900134, lng: 2.306324,
    complete: true,
    demo: true,
    phone: "01 47 37 25 88",
    description: "Salon mixte, coupe sans rendez-vous. Tarif unique quelle que soit la longueur.",
    prestations: [
      { label: "Coupe, tarif unique", dureeMin: 40, prixCents: 2900 },
      { label: "Barbe", dureeMin: 20, prixCents: 1500 },
      { label: "Couleur", dureeMin: 75, prixCents: 5500 },
    ],
    horaires: [
      { jour: 1, ouvre: "09:00", ferme: "19:00" },
      { jour: 2, ouvre: "09:00", ferme: "19:00" },
      { jour: 3, ouvre: "09:00", ferme: "19:00" },
      { jour: 4, ouvre: "09:00", ferme: "19:00" },
      { jour: 5, ouvre: "09:00", ferme: "19:00" },
      { jour: 6, ouvre: "09:00", ferme: "19:00" },
      { jour: 0, ouvre: null, ferme: null },
    ],
  },
  {
    slug: "le-bon-degrade-colombes",
    name: "Le Bon Dégradé",
    city: "Colombes",
    postalCode: "92700",
    street: "112 rue Saint-Denis",
    type: "barber", lat: 48.92424, lng: 2.249103,
    complete: true,
    demo: true,
    phone: "01 42 42 71 04",
    description: "Dégradés, motifs, entretien de barbe. Ouvert tard le jeudi et le vendredi.",
    prestations: [
      { label: "Dégradé", dureeMin: 35, prixCents: 2000 },
      { label: "Dégradé et barbe", dureeMin: 55, prixCents: 3000 },
      { label: "Motif", dureeMin: 15, prixCents: 800 },
      { label: "Coupe enfant", dureeMin: 25, prixCents: 1400 },
    ],
    horaires: [
      { jour: 1, ouvre: "10:00", ferme: "19:30" },
      { jour: 2, ouvre: "10:00", ferme: "19:30" },
      { jour: 3, ouvre: "10:00", ferme: "19:30" },
      { jour: 4, ouvre: "10:00", ferme: "21:00" },
      { jour: 5, ouvre: "10:00", ferme: "21:00" },
      { jour: 6, ouvre: "09:00", ferme: "19:30" },
      { jour: 0, ouvre: null, ferme: null },
    ],
  },
];
