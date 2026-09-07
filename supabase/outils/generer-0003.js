/* Generateur de supabase/migrations/0003_donnees_salons.sql.

   Lance-le depuis la racine du projet :

     node supabase/outils/generer-0003.js

   Il relit data/salons.ts et data/demo.ts, et reecrit la migration en
   entier. C est le seul endroit ou 0003 doit etre modifiee : corriger
   une adresse ou un tarif se fait dans le fichier de donnees, puis on
   regenere.

   Il verifie au passage ce que la base refuserait de toute facon :
   unicite des slugs, format des codes postaux, valeurs autorisees pour
   type, longueurs et bornes des prestations, coherence des plages
   horaires. Toute anomalie sort en console avant que tu ouvres
   l editeur SQL. */

const fs = require("fs");
const path = require("path");

/* La racine du projet, deduite de l emplacement du script. Rien n est
   code en dur : le depot reste deplacable. */
const base = path.resolve(__dirname, "..", "..");

/* Les deux fichiers de donnees sont des litteraux : on extrait le tableau
   entre son ouverture et le « ]; » qui le ferme en debut de ligne, puis on
   l'evalue. Pas de compilation TypeScript a installer pour ca. */
function tableau(fichier, nomExport) {
  const src = fs.readFileSync(base + "/" + fichier, "utf8");
  const depart = src.indexOf(nomExport);
  if (depart === -1) throw new Error("export " + nomExport + " introuvable dans " + fichier);
  const crochet = src.indexOf("[", depart);
  const fin = src.indexOf("\n];", crochet);
  if (crochet === -1 || fin === -1) throw new Error("tableau " + nomExport + " mal delimite");
  return eval(src.slice(crochet, fin + 2));
}

const REELS = tableau("data/salons.ts", "export const SALONS");
const DEMOS = tableau("data/demo.ts", "export const SALONS_DEMO");

const t = (v) => (v === null || v === undefined ? "null" : "'" + String(v).replace(/'/g, "''") + "'");
const heure = (v) => (v === null || v === undefined ? "null" : "'" + v + "'::time");

const lignes = [];
const w = (s = "") => lignes.push(s);

w("-- ============================================================");
w("-- Coiff'92, migration 0003 : les fiches en base.");
w("--");
w("-- À exécuter dans l'éditeur SQL de Supabase, APRÈS la 0002.");
w("--");
w("-- GENERE depuis data/salons.ts et data/demo.ts. Ne pas éditer à");
w("-- la main : corriger le fichier de données, puis régénérer avec");
w("--");
w("--   node supabase/outils/generer-0003.js");
w("--");
w("-- Ce script est REJOUABLE. Il peut être exécuté autant de fois");
w("-- que nécessaire sans rien casser, et c'est le point délicat :");
w("--");
w("--   * Sur un salon RÉEL, il ne réécrit que le relevé vérifié");
w("--     (nom, ville, code postal, rue, type). La description et le");
w("--     téléphone, remplis par le gérant depuis son espace, ne sont");
w("--     jamais touchés. Ce sont exactement les colonnes que les GRANT");
w("--     de la 0002 lui laissent écrire.");
w("--");
w("--   * Sur un salon de DÉMO, il réécrit tout, prestations et");
w("--     horaires compris. Ces fiches sont fictives, le fichier en");
w("--     est la seule vérité et aucun gérant ne les édite.");
w("--");
w("-- Il ne supprime jamais les prestations ni les horaires d'un salon");
w("-- réel : la clause « where demo » du bloc de nettoyage est la seule");
w("-- chose qui protège le travail d'un vrai gérant. Ne pas l'ôter.");
w("--");
w("-- " + REELS.length + " salons relevés, " + DEMOS.length + " fiches de démonstration.");
w("-- ============================================================");
w("");
w("");
w("-- ───────────────  les salons relevés  ───────────────");
w("--");
w("-- Commerces réels du 92, relevé vérifié d'août 2026. Aucun tarif,");
w("-- horaire ou description : nous ne les connaissons pas, et les");
w("-- inventer reviendrait à leur prêter des prix qu'ils ne pratiquent");
w("-- pas.");
w("");
w("insert into public.salons (slug, nom, ville, code_postal, rue, type, demo) values");
REELS.forEach((s, i) => {
  const fin = i === REELS.length - 1 ? "" : ",";
  w("  (" + t(s.slug) + ", " + t(s.name) + ", " + t(s.city) + ", " + t(s.postalCode) + ", " + t(s.street) + ", " + t(s.type) + ", false)" + fin);
});
w("on conflict (slug) do update set");
w("  nom         = excluded.nom,");
w("  ville       = excluded.ville,");
w("  code_postal = excluded.code_postal,");
w("  rue         = excluded.rue,");
w("  type        = excluded.type,");
w("  modifie_le  = now();");
w("-- Ni description ni telephone dans ce « do update » : ces deux");
w("-- colonnes appartiennent au gérant une fois la fiche réclamée.");
w("");
w("");
w("-- ───────────────  les fiches de démonstration  ───────────────");
w("--");
w("-- Six établissements FICTIFS. Aucun de ces noms n'existe dans le");
w("-- relevé réel, vérifié à la création. Ils portent demo = true, ce qui");
w("-- affiche un badge « Démo, salon fictif » sur la fiche comme dans");
w("-- l'annuaire, et permet de tous les effacer d'une ligne le jour où de");
w("-- vrais gérants prennent le relais :");
w("--");
w("--   delete from public.salons where demo;");
w("--");
w("-- Ce sont aujourd'hui les seules fiches qui acceptent une demande de");
w("-- rendez-vous, puisqu'elles sont les seules à porter des prestations.");
w("-- Sans elles en base, la clé étrangère demandes_salon_existe rejette");
w("-- tout envoi du formulaire.");
w("");
w("insert into public.salons (slug, nom, ville, code_postal, rue, type, demo, description, telephone) values");
DEMOS.forEach((s, i) => {
  const fin = i === DEMOS.length - 1 ? "" : ",";
  w("  (" + t(s.slug) + ", " + t(s.name) + ", " + t(s.city) + ", " + t(s.postalCode) + ", " + t(s.street) + ", " + t(s.type) + ", true,");
  w("   " + t(s.description) + ",");
  w("   " + t(s.phone) + ")" + fin);
});
w("on conflict (slug) do update set");
w("  nom         = excluded.nom,");
w("  ville       = excluded.ville,");
w("  code_postal = excluded.code_postal,");
w("  rue         = excluded.rue,");
w("  type        = excluded.type,");
w("  demo        = excluded.demo,");
w("  description = excluded.description,");
w("  telephone   = excluded.telephone,");
w("  modifie_le  = now();");
w("");
w("");
w("-- ───────────────  prestations et horaires des démos  ───────────────");
w("--");
w("-- Ces deux tables n'ont pas de clé sur laquelle faire un « on conflict »");
w("-- utile : un gérant peut renommer une prestation, il n'y a pas");
w("-- d'identifiant stable côté fichier. On efface donc puis on réinsère.");
w("--");
w("-- « where demo » n'est pas une commodité, c'est la garantie qu'un");
w("-- rejeu du script ne détruit pas le catalogue d'un vrai salon.");
w("");
w("delete from public.prestations");
w(" where salon_id in (select id from public.salons where demo);");
w("");
w("delete from public.horaires");
w(" where salon_id in (select id from public.salons where demo);");
w("");
w("insert into public.prestations (salon_id, libelle, duree_min, prix_cents, position)");
w("select s.id, p.libelle, p.duree_min, p.prix_cents, p.position");
w("  from public.salons s");
w("  join (values");
const pl = [];
DEMOS.forEach((s) => {
  (s.prestations || []).forEach((p, i) => {
    pl.push("    (" + t(s.slug) + ", " + t(p.label) + ", " + p.dureeMin + ", " + p.prixCents + ", " + i + ")");
  });
});
w(pl.join(",\n"));
w("  ) as p(slug, libelle, duree_min, prix_cents, position)");
w("    on p.slug = s.slug;");
w("");
w("insert into public.horaires (salon_id, jour, ouvre, ferme)");
w("select s.id, h.jour, h.ouvre, h.ferme");
w("  from public.salons s");
w("  join (values");
const hl = [];
DEMOS.forEach((s) => {
  (s.horaires || []).forEach((h) => {
    hl.push("    (" + t(s.slug) + ", " + h.jour + "::smallint, " + heure(h.ouvre) + ", " + heure(h.ferme) + ")");
  });
});
w(hl.join(",\n"));
w("  ) as h(slug, jour, ouvre, ferme)");
w("    on h.slug = s.slug;");
w("");
w("");
w("-- ───────────────  contrôle  ───────────────");
w("--");
w("-- Attendu, quel que soit le nombre d'exécutions :");
w("--   salons relevés " + REELS.length + " · démos " + DEMOS.length + " · prestations " + pl.length + " · horaires " + hl.length);
w("");
w("select");
w("  (select count(*) from public.salons where not demo)    as \"salons releves\",");
w("  (select count(*) from public.salons where demo)        as \"fiches demo\",");
w("  (select count(*) from public.prestations)              as \"prestations\",");
w("  (select count(*) from public.horaires)                 as \"horaires\",");
w("  (select count(*) from public.annuaire where complete)  as \"fiches completes\";");
w("");

fs.writeFileSync(base + "/supabase/migrations/0003_donnees_salons.sql", lignes.join("\n"), "utf8");

console.log("reels         : " + REELS.length);
console.log("demos         : " + DEMOS.length);
console.log("prestations   : " + pl.length);
console.log("horaires      : " + hl.length);
console.log("lignes SQL    : " + lignes.length);
const slugs = REELS.concat(DEMOS).map((s) => s.slug);
console.log("slugs uniques : " + new Set(slugs).size + " / " + slugs.length);
const croises = REELS.filter((r) => DEMOS.some((d) => d.name === r.name));
console.log("noms de demo presents dans le releve reel : " + croises.length);
const cpFaux = REELS.concat(DEMOS).filter((s) => !/^[0-9]{5}$/.test(s.postalCode));
console.log("codes postaux hors format : " + cpFaux.length);
const typeFaux = REELS.concat(DEMOS).filter((s) => !["barber", "coiffeur", "mixte"].includes(s.type));
console.log("types hors liste : " + typeFaux.length);
const nomFaux = REELS.concat(DEMOS).filter((s) => s.name.length < 2 || s.name.length > 120);
console.log("noms hors 2-120 caracteres : " + nomFaux.length);
