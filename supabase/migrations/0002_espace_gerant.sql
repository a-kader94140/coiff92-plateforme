-- ============================================================
-- Coiff'92, migration 0002 : les salons en base, et l'espace
-- du gérant.
--
-- À exécuter dans l'éditeur SQL de Supabase, APRÈS la 0001.
--
-- Ce que la planche du 07/09 rend modifiable, et qui vit
-- aujourd'hui dans un fichier TypeScript : le nom public, la
-- description, le téléphone, les prestations et les horaires.
-- Un fichier ne se modifie pas depuis un site déployé.
-- ============================================================

-- ─────────────────────────  les salons  ─────────────────────────

create table public.salons (
  id           uuid primary key default gen_random_uuid(),

  -- L'identité, relevée et vérifiée. Le gérant ne la modifie pas :
  -- il ne renomme pas sa commune et ne déplace pas sa rue. Voir les
  -- GRANT plus bas, qui limitent l'écriture aux trois colonnes
  -- réellement éditables.
  slug         text        not null unique,
  nom          text        not null,
  ville        text        not null,
  code_postal  text        not null,
  rue          text        not null,
  type         text        not null,

  -- Ce que le gérant remplit une fois sa fiche réclamée.
  description  text,
  telephone    text,

  -- Le gérant, s'il y en a un. Pas de clé étrangère vers
  -- auth.users : ce schéma appartient à Supabase, s'y accrocher
  -- alourdit beaucoup le test des politiques. Le prix de ce choix
  -- est un identifiant orphelin si un compte disparaît, et c'est
  -- à ça que sert liberer_salon() plus bas.
  gerant_id    uuid,

  demo         boolean     not null default false,
  cree_le      timestamptz not null default now(),
  modifie_le   timestamptz not null default now(),

  constraint type_valide  check (type in ('barber', 'coiffeur', 'mixte')),
  constraint nom_longueur check (char_length(nom) between 2 and 120),
  constraint cp_forme     check (code_postal ~ '^[0-9]{5}$')
);

comment on column public.salons.gerant_id is
  'Null tant que la fiche est libre. Ce champ, et lui seul, donne le droit de modifier la fiche et de lire ses demandes.';

create index salons_par_ville  on public.salons (ville, nom);
create index salons_par_gerant on public.salons (gerant_id) where gerant_id is not null;

-- Il n'y a PAS de colonne « complete ».
--
-- Une fiche est complète quand elle porte au moins une prestation :
-- c'est exactement la condition qui autorise une demande de
-- rendez-vous. Stocker le booléen à côté, ce serait se donner deux
-- vérités qui divergeront le jour où une prestation est supprimée.
-- La vue « annuaire », en fin de fichier, le calcule.

-- ─────────────────────────  les prestations  ─────────────────────────

create table public.prestations (
  id         uuid primary key default gen_random_uuid(),
  salon_id   uuid not null references public.salons(id) on delete cascade,

  libelle    text not null,

  -- Des NOMBRES, pas « 30 min » ni « 24 € ». La planche proposait
  -- des champs texte libres : un gérant qui tape « une demi-heure »
  -- ou « sur devis » casserait l'affichage et tout calcul. L'unité
  -- s'affiche à côté du champ, elle n'entre pas dans la valeur.
  duree_min  int  not null,
  prix_cents int  not null,

  -- L'ordre d'affichage, choisi par le gérant.
  position   int  not null default 0,

  constraint libelle_longueur check (char_length(libelle) between 2 and 80),
  constraint duree_plausible  check (duree_min between 5 and 480),
  constraint prix_plausible   check (prix_cents between 0 and 100000)
);

create index prestations_par_salon on public.prestations (salon_id, position);

-- ─────────────────────────  les horaires  ─────────────────────────

create table public.horaires (
  salon_id uuid     not null references public.salons(id) on delete cascade,
  -- 0 = dimanche, 6 = samedi, comme JavaScript.
  jour     smallint not null,
  ouvre    time,
  ferme    time,

  primary key (salon_id, jour),

  constraint jour_valide check (jour between 0 and 6),

  -- Un jour est soit fermé, soit ouvert avec ses deux bornes dans le
  -- bon ordre. Impossible d'enregistrer une ouverture sans fermeture,
  -- ni un salon qui ferme avant d'ouvrir.
  constraint plage_coherente check (
    (ouvre is null and ferme is null)
    or (ouvre is not null and ferme is not null and ferme > ouvre)
  )
);

-- ─────────────────────────  demandes, raccord  ─────────────────────────

-- La 0001 ne pouvait pas poser cette clé, la table des salons
-- n'existait pas encore. Une demande vise désormais un salon réel,
-- et c'est la base qui le garantit.
alter table public.demandes
  add constraint demandes_salon_existe
  foreign key (salon_slug) references public.salons(slug) on delete cascade;

-- ============================================================
-- SÉCURITÉ
--
-- Rappel de la 0001 : la clé publiable est publique. Rien n'est
-- lisible ni modifiable sans une politique qui l'autorise.
--
-- Deux niveaux se combinent ici :
--   les GRANT disent QUELLES COLONNES peuvent être écrites
--   les POLICY disent QUELLES LIGNES sont concernées
--
-- Le premier niveau est ce qui empêche un gérant de s'attribuer le
-- salon du voisin en modifiant gerant_id, ou de changer son slug
-- pour capter les demandes d'un autre. Une politique seule ne
-- suffirait pas : elle autorise ou refuse la ligne entière, elle
-- ne dit rien des colonnes.
-- ============================================================

alter table public.salons      enable row level security;
alter table public.prestations enable row level security;
alter table public.horaires    enable row level security;

-- ---- D'ABORD, tout retirer ----
--
-- CE BLOC EST INDISPENSABLE, et c'est le piège de Supabase.
--
-- Supabase pose « alter default privileges in schema public grant all
-- on tables to anon, authenticated ». Toute table créée ici naît donc
-- avec TOUS les privilèges déjà accordés aux deux rôles publics.
--
-- Un GRANT par colonne ne restreint rien : il s'ajoute. Sans les
-- REVOKE ci-dessous, « grant update (nom, description, telephone) »
-- serait décoratif, et un gérant pourrait réécrire n'importe quelle
-- colonne de sa ligne, slug compris.
--
-- On repart donc de zéro, et on ne redonne que le strict nécessaire.

revoke all on public.salons      from anon, authenticated;
revoke all on public.prestations from anon, authenticated;
revoke all on public.horaires    from anon, authenticated;
revoke all on public.demandes    from anon, authenticated;

-- Lecture publique de l'annuaire et de ce qui s'y affiche.
grant select on public.salons      to anon, authenticated;
grant select on public.prestations to anon, authenticated;
grant select on public.horaires    to anon, authenticated;

-- Les demandes : tout le monde en dépose, seul un gérant connecté
-- peut en lire. Les politiques disent lesquelles.
grant insert on public.demandes to anon, authenticated;
grant select on public.demandes to authenticated;

-- Le gérant gère ses prestations et ses horaires de bout en bout.
-- Les politiques limitent les lignes à son salon.
grant insert, update, delete on public.prestations to authenticated;
grant insert, update, delete on public.horaires    to authenticated;

-- ---- salons ----

create policy "annuaire public"
  on public.salons for select
  to anon, authenticated
  using (true);

-- Trois colonnes, pas une de plus.
grant update (nom, description, telephone) on public.salons to authenticated;

create policy "le gerant modifie sa fiche"
  on public.salons for update
  to authenticated
  using (gerant_id = auth.uid())
  with check (gerant_id = auth.uid());

-- Aucune politique d'insertion ni de suppression : les fiches
-- viennent du relevé vérifié d'août 2026, personne ne crée ni ne
-- supprime un salon depuis le web.

-- ---- prestations et horaires ----

create policy "prestations publiques"
  on public.prestations for select
  to anon, authenticated using (true);

create policy "le gerant gere ses prestations"
  on public.prestations for all
  to authenticated
  using (exists (select 1 from public.salons s
                  where s.id = prestations.salon_id and s.gerant_id = auth.uid()))
  with check (exists (select 1 from public.salons s
                  where s.id = prestations.salon_id and s.gerant_id = auth.uid()));

create policy "horaires publics"
  on public.horaires for select
  to anon, authenticated using (true);

create policy "le gerant gere ses horaires"
  on public.horaires for all
  to authenticated
  using (exists (select 1 from public.salons s
                  where s.id = horaires.salon_id and s.gerant_id = auth.uid()))
  with check (exists (select 1 from public.salons s
                  where s.id = horaires.salon_id and s.gerant_id = auth.uid()));

-- ---- demandes ----
--
-- La 0001 laissait la lecture fermée à tous, en attendant l'espace
-- gérant. Il arrive.

create policy "le gerant lit ses demandes"
  on public.demandes for select
  to authenticated
  using (exists (select 1 from public.salons s
                  where s.slug = demandes.salon_slug and s.gerant_id = auth.uid()));

-- Le statut, et rien d'autre. Un gérant ne réécrit pas le nom ni le
-- téléphone du client qui lui a écrit.
grant update (statut) on public.demandes to authenticated;

create policy "le gerant change le statut"
  on public.demandes for update
  to authenticated
  using (exists (select 1 from public.salons s
                  where s.slug = demandes.salon_slug and s.gerant_id = auth.uid()))
  with check (exists (select 1 from public.salons s
                  where s.slug = demandes.salon_slug and s.gerant_id = auth.uid()));

-- Toujours aucune politique de suppression. Une demande reçue ne
-- s'efface pas d'un clic, et la purge RGPD passera par une tâche
-- planifiée, pas par l'interface.

-- ============================================================
-- RÉCLAMATION
--
-- Réclamer une fiche revient à écrire gerant_id, la colonne que les
-- GRANT ci-dessus interdisent justement d'écrire. C'est voulu :
-- l'opération est trop sensible pour un UPDATE ordinaire. Elle passe
-- donc par une fonction, qui pose sa propre condition.
-- ============================================================

create function public.reclamer_salon(p_slug text)
returns public.salons
language plpgsql
security definer
set search_path = public
as $fn$
declare
  resultat public.salons;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise pour réclamer une fiche.';
  end if;

  -- « gerant_id is null » dans le WHERE, et non dans un IF qui
  -- précéderait l'UPDATE : deux personnes qui réclament la même
  -- fiche à la même seconde ne peuvent pas passer toutes les deux.
  -- L'UPDATE verrouille la ligne, la seconde ne trouve plus rien.
  update public.salons
     set gerant_id = auth.uid(),
         modifie_le = now()
   where slug = p_slug
     and gerant_id is null
  returning * into resultat;

  if not found then
    raise exception 'Fiche introuvable, ou déjà réclamée par un autre compte.';
  end if;

  return resultat;
end;
$fn$;

revoke all on function public.reclamer_salon(text) from public, anon;
grant execute on function public.reclamer_salon(text) to authenticated;

-- Le pendant : rendre une fiche. Sert au gérant qui cède son salon,
-- et à réparer un gerant_id devenu orphelin.
create function public.liberer_salon(p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  update public.salons
     set gerant_id = null,
         modifie_le = now()
   where slug = p_slug
     and gerant_id = auth.uid();

  if not found then
    raise exception 'Vous ne gérez pas cette fiche.';
  end if;
end;
$fn$;

revoke all on function public.liberer_salon(text) from public, anon;
grant execute on function public.liberer_salon(text) to authenticated;

-- ============================================================
-- L'ANNUAIRE
-- ============================================================

create view public.annuaire
with (security_invoker = true)
as
select
  s.id, s.slug, s.nom, s.ville, s.code_postal, s.rue, s.type, s.demo,
  s.description, s.telephone,
  (s.gerant_id is not null) as reclamee,
  exists (select 1 from public.prestations p where p.salon_id = s.id) as complete
from public.salons s;

-- security_invoker : la vue applique les politiques de CELUI QUI
-- L'INTERROGE, et non celles de son créateur. Sans cette option une
-- vue contourne RLS, et c'est l'erreur classique du débutant en
-- Postgres : on croit avoir tout verrouillé, et une vue ouvre une
-- porte de côté.
--
-- gerant_id n'est pas exposé, seulement « reclamee ». Savoir qu'une
-- fiche a un gérant est utile au public ; savoir lequel ne l'est pas.

-- Même précaution que pour les tables : une vue naît elle aussi avec
-- tous les privilèges accordés par défaut.
revoke all on public.annuaire from anon, authenticated;
grant select on public.annuaire to anon, authenticated;
