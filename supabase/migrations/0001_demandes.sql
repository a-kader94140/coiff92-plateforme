-- ============================================================
-- Coiff'92, migration 0001 : les demandes de rendez-vous.
--
-- À exécuter dans l'éditeur SQL de Supabase, projet Coiff'92,
-- branche « principal ». Une seule fois.
--
-- Nom de la table : « demandes » et non « booking_requests »
-- annoncé par le README. Tout le code du projet est en français
-- (enregistrerDemande, DemandeValide, creneau) ; une seule table
-- en anglais au milieu se paierait à chaque relecture.
-- ============================================================

create table public.demandes (
  id              uuid primary key default gen_random_uuid(),

  -- Le salon visé. Pas de clé étrangère : les salons vivent
  -- encore dans le code, pas en base. La garde est côté serveur,
  -- le schéma zod refuse un slug inconnu.
  salon_slug      text        not null,

  nom             text        not null,
  email           text        not null,
  tel             text        not null,
  prestation      text        not null,

  -- « date » seul serait un mot trop générique en SQL.
  date_souhaitee  date        not null,
  creneau         text        not null,

  message         text        not null default '',
  statut          text        not null default 'nouvelle',
  cree_le         timestamptz not null default now(),

  -- Les mêmes bornes que le schéma zod, réécrites ici.
  -- Ce n'est pas une redite inutile : la validation applicative
  -- protège d'une saisie, la contrainte de base protège de tout
  -- ce qui n'est pas passé par l'application.
  constraint creneau_valide  check (creneau in ('matin', 'apres_midi', 'soir')),
  constraint statut_valide   check (statut in ('nouvelle', 'acceptee', 'refusee', 'traitee')),
  constraint nom_longueur    check (char_length(nom) between 2 and 80),
  constraint message_court   check (char_length(message) <= 1000),
  constraint email_plausible check (position('@' in email) > 1),
  constraint slug_non_vide   check (char_length(salon_slug) between 1 and 200)
);

comment on table public.demandes is
  'Demandes de rendez-vous envoyées depuis les fiches salon. Une demande, pas une réservation : le salon rappelle.';

-- L'espace gérant listera les demandes d'un salon, les plus
-- récentes en premier. L'index suit cette lecture.
create index demandes_par_salon on public.demandes (salon_slug, cree_le desc);

-- ============================================================
-- Sécurité au niveau des lignes
-- ============================================================

alter table public.demandes enable row level security;

-- Écriture : ouverte au public, c'est le formulaire de demande.
-- « with check » impose qu'une demande naisse toujours au statut
-- « nouvelle » : personne ne s'auto-accepte un rendez-vous.
create policy "insertion publique d une demande"
  on public.demandes
  for insert
  to anon, authenticated
  with check (statut = 'nouvelle');

-- Lecture : AUCUNE POLITIQUE, volontairement.
--
-- Sans politique de lecture, la clé publiable ne peut rien lire de
-- cette table, même en connaissant un identifiant. Les demandes
-- contiennent des noms, e-mails et téléphones de vraies personnes :
-- tant que l'espace gérant n'existe pas, personne n'a de raison
-- légitime de les lire depuis le web.
--
-- La politique de lecture s'ajoutera avec l'espace gérant, et elle
-- sera restreinte au salon dont la personne connectée est gérante.
-- Ne pas ouvrir la lecture « en attendant ».

-- Modification et suppression : aucune politique non plus, même
-- raison. Le changement de statut viendra avec l'espace gérant.
