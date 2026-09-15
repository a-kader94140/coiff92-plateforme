-- ============================================================
-- Coiff'92, migration 0010 : coordonnées GPS des salons.
--
-- Ajoute latitude/longitude, géocodées depuis l'adresse (API Adresse
-- de l'IGN, https://data.geopf.fr/geocodage). Sert le menu
-- d'itinéraire de la fiche : Citymapper exige des coordonnées, il ne
-- sait pas partir d'une simple adresse texte.
--
-- Les valeurs elles-mêmes ne sont pas ici : elles arrivent avec le
-- reste du relevé via la 0003 régénérée (node supabase/outils/
-- generer-0003.js), qui sait déjà comment ne toucher que les colonnes
-- relevées d'un salon réel sans écraser ce qu'un gérant a rempli.
-- Cette migration ne fait que préparer la colonne et la vue avant que
-- la 0003 ne soit rejouée.
-- ============================================================

alter table public.salons
  add column if not exists latitude  double precision,
  add column if not exists longitude double precision;


-- ─────────────────────────  la vue annuaire  ─────────────────────────
--
-- Même précaution que pour reclamee en 0004 : « create or replace »
-- garde la vue en place, on ajoute juste les deux colonnes. Mais
-- Postgres n'autorise ça qu'à la fin de la liste, pas au milieu :
-- latitude/longitude vont donc après complete, et non à côté de type
-- comme dans la table elle-même. Insérer une colonne plus tôt aurait
-- décalé toutes celles qui suivent, et Postgres refuse ce genre de
-- renommage implicite (erreur 42P16).

create or replace view public.annuaire
with (security_invoker = true)
as
select
  s.id, s.slug, s.nom, s.ville, s.code_postal, s.rue, s.type, s.demo,
  s.description, s.telephone,
  s.reclamee,
  exists (select 1 from public.prestations p where p.salon_id = s.id) as complete,
  s.latitude, s.longitude
from public.salons s;
