-- ============================================================
-- Coiff'92, migration 0004 : le signalement de fiche réclamée,
-- et la fermeture de gerant_id.
--
-- À exécuter dans l'éditeur SQL de Supabase, APRÈS la 0003.
--
-- Deux sujets qui n'en font qu'un : l'écran « cette fiche a déjà
-- un gérant » a besoin d'une table pour ne pas être un cul-de-sac,
-- et l'espace du gérant a besoin de retrouver SON salon sans que
-- gerant_id soit lisible par le premier venu.
-- ============================================================


-- ─────────────────────────  les litiges  ─────────────────────────
--
-- Quelqu'un affirme être le vrai gérant d'une fiche déjà réclamée.
-- Exemple prévu par la planche : un changement de propriétaire.
--
-- La planche proposait un bouton « Contacter l'équipe » qui ne
-- pointait nulle part. Cette table est ce qui le remplace : le
-- formulaire écrit ici, et Kader lit les signalements depuis
-- l'éditeur SQL. Pas d'interface d'administration, pas d'envoi
-- d'e-mail, rien qu'on ne sache pas encore faire.

create table public.litiges (
  id          uuid        primary key default gen_random_uuid(),

  -- La fiche contestée. « on delete cascade » : si le salon
  -- disparaît de l'annuaire, le litige n'a plus d'objet.
  salon_slug  text        not null references public.salons(slug) on delete cascade,

  email       text        not null,
  situation   text        not null,

  statut      text        not null default 'nouveau',
  cree_le     timestamptz not null default now(),

  constraint litige_statut_valide check (statut in ('nouveau', 'traite', 'rejete')),
  constraint litige_email_plausible check (position('@' in email) > 1),
  constraint litige_email_longueur check (char_length(email) between 5 and 200),

  -- Assez long pour expliquer une reprise de fonds de commerce,
  -- assez court pour qu'un robot n'y déverse pas un roman.
  constraint litige_situation_longueur check (char_length(situation) between 20 and 2000)
);

create index litiges_a_traiter on public.litiges (cree_le desc) where statut = 'nouveau';

comment on table public.litiges is
  'Signalements déposés depuis l''écran « fiche déjà réclamée ». Se lisent dans l''éditeur SQL, il n''existe pas d''interface.';


-- ─────────────────────────  reclamee  ─────────────────────────
--
-- Le public a besoin de savoir si une fiche a un gérant. Il n'a
-- aucun besoin de savoir LEQUEL. La vue le calculait déjà, mais
-- elle lisait gerant_id pour le faire, ce qui obligeait à laisser
-- la colonne lisible.
--
-- Une colonne générée déplace le calcul dans la base. Ce n'est pas
-- une duplication de vérité : Postgres la recalcule à chaque
-- écriture de gerant_id, elle ne peut pas diverger. C'est la
-- différence avec la colonne « complete » qu'on a refusé de
-- stocker en 0002, et qui, elle, aurait dû être maintenue à la
-- main.

alter table public.salons
  add column reclamee boolean generated always as (gerant_id is not null) stored;

comment on column public.salons.reclamee is
  'Dérivée de gerant_id par la base. Lisible par tous, là où gerant_id ne l''est par personne.';


-- ─────────────────────────  fermeture de gerant_id  ─────────────────────────
--
-- Constat mesuré avant d'écrire ces lignes :
--
--   GET /rest/v1/salons?select=slug,gerant_id  avec la clé publiable
--   → 200  [{"slug":"235th-barber-street-...","gerant_id":null}, ...]
--
-- La 0002 faisait « grant select on public.salons », donc sur
-- TOUTES les colonnes. La vue masquait gerant_id, la table non.
-- Tant qu'aucune fiche n'est réclamée la colonne ne vaut que null,
-- mais dès le premier gérant on saurait quel compte tient quel
-- salon, et quels salons partagent un propriétaire.
--
-- On repart donc d'un revoke, et on rouvre colonne par colonne.
-- gerant_id n'est dans aucune des deux listes.

revoke select on public.salons from anon, authenticated;

grant select (
  id, slug, nom, ville, code_postal, rue, type,
  description, telephone, demo, reclamee, cree_le, modifie_le
) on public.salons to anon, authenticated;

-- Les GRANT d'écriture de la 0002 ne sont pas touchés : un REVOKE
-- SELECT ne retire pas un UPDATE. Le gérant écrit toujours nom,
-- description et telephone, et rien d'autre.
--
-- ATTENTION, cette migration CASSE cinq politiques, et la 0005 les
-- répare. Ne pas exécuter l'une sans l'autre.
--
-- Ce commentaire affirmait ici qu'une politique n'a pas besoin que
-- l'appelant sache lire la colonne qu'elle teste. C'est FAUX, et le
-- test l'a montré en une exécution :
--
--   ERROR 42501: permission denied for table salons
--   HINT: GRANT SELECT ON public.salons TO authenticated;
--
-- Une expression de politique est évaluée avec les droits de
-- l'appelant. Toute politique qui lit gerant_id se met donc à
-- échouer dès que la colonne lui est retirée. Cinq sont
-- concernées : la lecture et le changement de statut des demandes,
-- la gestion des prestations et des horaires, et la modification
-- de la fiche.
--
-- La 0005 les réécrit autour d'une fonction SECURITY DEFINER, qui
-- est la façon prévue de poser cette question sans ouvrir la
-- colonne.


-- ─────────────────────────  la vue annuaire  ─────────────────────────
--
-- Même liste de colonnes, même ordre, mêmes types : « create or
-- replace » suffit, la vue n'a pas à être supprimée. Seule
-- l'expression de « reclamee » change, et elle cesse de lire
-- gerant_id.

create or replace view public.annuaire
with (security_invoker = true)
as
select
  s.id, s.slug, s.nom, s.ville, s.code_postal, s.rue, s.type, s.demo,
  s.description, s.telephone,
  s.reclamee,
  exists (select 1 from public.prestations p where p.salon_id = s.id) as complete
from public.salons s;


-- ─────────────────────────  mon_salon()  ─────────────────────────
--
-- Un gérant connecté doit retrouver sa fiche. La requête naturelle
-- serait « where gerant_id = auth.uid() », mais Postgres exige le
-- droit de LIRE toute colonne citée dans un WHERE, et on vient
-- justement de le retirer.
--
-- D'où cette fonction. En SECURITY DEFINER elle s'exécute avec les
-- droits de son propriétaire, donc elle peut lire gerant_id ; et
-- comme elle filtre elle-même sur auth.uid(), elle ne rend jamais
-- que la ligne de l'appelant. La colonne reste fermée, le gérant
-- retrouve son salon.
--
-- Depuis l'application : POST /rest/v1/rpc/mon_salon

create function public.mon_salon()
returns setof public.annuaire
language sql
stable
security definer
set search_path = public
as $fn$
  select a.*
    from public.annuaire a
    join public.salons s on s.id = a.id
   where s.gerant_id = auth.uid();
$fn$;

revoke all on function public.mon_salon() from public, anon;
grant execute on function public.mon_salon() to authenticated;

comment on function public.mon_salon() is
  'La fiche du gérant connecté, ou rien. Seul chemin vers « quel salon est le mien » depuis que gerant_id n''est plus lisible.';


-- ─────────────────────────  sécurité des litiges  ─────────────────────────
--
-- Même forme que les demandes en 0001 : tout le monde en dépose,
-- personne ne les lit depuis le web. Kader les lit dans l'éditeur
-- SQL, où il est postgres et passe outre RLS.

alter table public.litiges enable row level security;

-- Le piège des privilèges par défaut, une troisième fois : toute
-- table créée dans public naît avec tous les droits accordés à
-- anon et authenticated. Sans ce revoke, la suite est décorative.
revoke all on public.litiges from anon, authenticated;

grant insert on public.litiges to anon, authenticated;

create policy "chacun depose un signalement"
  on public.litiges for insert
  to anon, authenticated
  with check (statut = 'nouveau');

-- Aucune politique de lecture, de modification ni de suppression.
-- Un signalement déposé ne se relit pas, ne se corrige pas et ne
-- s'efface pas depuis le site.
--
-- « with check (statut = 'nouveau') » : sans cette condition, on
-- pourrait déposer un litige déjà marqué « traite » et le faire
-- disparaître de l'index des signalements en attente.


-- ─────────────────────────  contrôle  ─────────────────────────
--
-- Attendu :
--   gerant_id lisible par anon         false
--   gerant_id lisible par authenticated false
--   reclamee lisible par anon          true
--   litiges lisibles par anon          false
--   litiges insérables par anon        true

select
  has_column_privilege('anon',          'public.salons', 'gerant_id', 'select') as "gerant_id lu par anon",
  has_column_privilege('authenticated', 'public.salons', 'gerant_id', 'select') as "gerant_id lu par connecte",
  has_column_privilege('anon',          'public.salons', 'reclamee',  'select') as "reclamee lu par anon",
  has_table_privilege ('anon',          'public.litiges', 'select')             as "litiges lus par anon",
  has_table_privilege ('anon',          'public.litiges', 'insert')             as "litiges deposes par anon";
