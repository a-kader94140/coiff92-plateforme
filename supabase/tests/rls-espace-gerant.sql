-- ============================================================
-- Coiff'92, test des politiques de l'espace gérant.
--
-- À exécuter dans l'éditeur SQL de Supabase, APRÈS la 0002.
-- Rejouable autant de fois que voulu, y compris en production, et
-- il DOIT l'être après toute modification d'une politique.
--
-- Il ne crée aucun compte. Deux gérants sont simulés en posant le
-- jeton que Supabase lirait, ce que fait auth.uid() en coulisse.
--
-- POURQUOI CE SCRIPT EST ÉCRIT AINSI
--
-- Ni table temporaire, ni transaction : l'éditeur SQL de Supabase ne
-- conserve pas les tables temporaires d'une instruction à l'autre.
-- Deux versions s'y sont cassé les dents.
-- Les résultats vont donc dans une vraie table, et le nettoyage est
-- explicite plutôt que confié à un ROLLBACK.
--
-- CE QUE VOUS DEVEZ FAIRE
--   1. exécuter ce fichier, lire le tableau des 15 lignes
--   2. exécuter ensuite la seule ligne indiquée tout en bas, qui
--      supprime la table de résultats
--
-- Tout doit commencer par « OK ».
-- ============================================================

drop table if exists public.zzz_test_resultat;
create table public.zzz_test_resultat (n int, verifie text, verdict text);

-- Dès que le script prend le rôle « authenticated » pour se faire
-- passer pour un gérant, il perd le droit d'écrire dans sa propre
-- table de résultats. On le lui donne tout de suite.
grant insert, select on public.zzz_test_resultat to authenticated, anon;

-- ─────────────  préparation, en tant que propriétaire  ─────────────

delete from public.salons where slug like 'zzz-test-%';

insert into public.salons (slug, nom, ville, code_postal, rue, type, gerant_id) values
  ('zzz-test-alice', 'Salon Test Alice', 'Antony', '92160', '1 rue du Test', 'coiffeur',
   '11111111-1111-1111-1111-111111111111'),
  ('zzz-test-bob',   'Salon Test Bob',   'Antony', '92160', '2 rue du Test', 'barber',
   '22222222-2222-2222-2222-222222222222');

insert into public.demandes
  (salon_slug, nom, email, tel, prestation, date_souhaitee, creneau) values
  ('zzz-test-alice', 'Cliente Alice', 'alice@test.invalid', '0611111111',
   'Coupe', current_date + 1, 'matin'),
  ('zzz-test-bob',   'Client Bob',    'bob@test.invalid',   '0622222222',
   'Coupe', current_date + 1, 'matin');

-- ─────────────  Alice se connecte  ─────────────
--
-- SET et non SET LOCAL : sans transaction, SET LOCAL ne survivrait
-- pas à l'instruction en cours.

set role authenticated;
set request.jwt.claims =
  '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

insert into public.zzz_test_resultat select 1, 'Alice lit ses propres demandes',
  case when count(*) = 1 then 'OK' else 'ECHEC' end
  from public.demandes where salon_slug = 'zzz-test-alice';

insert into public.zzz_test_resultat select 2, 'Alice ne voit AUCUNE demande de Bob',
  case when count(*) = 0 then 'OK' else 'ECHEC, FUITE' end
  from public.demandes where salon_slug = 'zzz-test-bob';

insert into public.zzz_test_resultat select 3, 'Alice ne voit qu''une ligne en tout',
  case when count(*) = 1 then 'OK' else 'ECHEC, FUITE' end
  from public.demandes;

-- ── écriture : le statut d'une demande ──

with maj as (
  update public.demandes set statut = 'acceptee'
   where salon_slug = 'zzz-test-alice' returning 1
)
insert into public.zzz_test_resultat select 4, 'Alice change le statut de SA demande',
  case when count(*) = 1 then 'OK' else 'ECHEC' end from maj;

with maj as (
  update public.demandes set statut = 'refusee'
   where salon_slug = 'zzz-test-bob' returning 1
)
insert into public.zzz_test_resultat select 5, 'Alice ne change pas le statut chez Bob',
  case when count(*) = 0 then 'OK' else 'ECHEC, ALTERATION' end from maj;

-- ── écriture : la fiche ──

with maj as (
  update public.salons set description = 'Modifiee par Alice'
   where slug = 'zzz-test-alice' returning 1
)
insert into public.zzz_test_resultat select 6, 'Alice modifie SA fiche',
  case when count(*) = 1 then 'OK' else 'ECHEC' end from maj;

with maj as (
  update public.salons set description = 'Piratee par Alice'
   where slug = 'zzz-test-bob' returning 1
)
insert into public.zzz_test_resultat select 7, 'Alice ne modifie pas la fiche de Bob',
  case when count(*) = 0 then 'OK' else 'ECHEC, ALTERATION' end from maj;

-- ── les colonnes interdites ──
--
-- Les GRANT ne couvrent ni gerant_id ni slug. La tentative doit lever
-- une erreur de permission, pas passer silencieusement. On l'attrape.

do $bloc$
begin
  update public.salons set gerant_id = '11111111-1111-1111-1111-111111111111'
   where slug = 'zzz-test-bob';
  insert into public.zzz_test_resultat values (8, 'Alice ne prend pas le salon de Bob',
    'ECHEC GRAVE, PRISE DE CONTROLE');
exception when insufficient_privilege then
  insert into public.zzz_test_resultat values (8, 'Alice ne prend pas le salon de Bob',
    'OK');
end $bloc$;

do $bloc$
begin
  update public.salons set slug = 'zzz-vole' where slug = 'zzz-test-alice';
  insert into public.zzz_test_resultat values (9, 'Alice ne change pas son propre slug',
    'ECHEC, DETOURNEMENT POSSIBLE');
exception when insufficient_privilege then
  insert into public.zzz_test_resultat values (9, 'Alice ne change pas son propre slug',
    'OK');
end $bloc$;

-- ── les prestations ──

do $bloc$
declare id_alice uuid; id_bob uuid;
begin
  select id into id_alice from public.salons where slug = 'zzz-test-alice';
  select id into id_bob   from public.salons where slug = 'zzz-test-bob';

  insert into public.prestations (salon_id, libelle, duree_min, prix_cents)
  values (id_alice, 'Coupe test', 30, 2400);
  insert into public.zzz_test_resultat
    values (10, 'Alice ajoute une prestation chez elle', 'OK');

  begin
    insert into public.prestations (salon_id, libelle, duree_min, prix_cents)
    values (id_bob, 'Prestation pirate', 30, 100);
    insert into public.zzz_test_resultat
      values (11, 'Alice n''ajoute rien chez Bob', 'ECHEC, INTRUSION');
  exception when others then
    insert into public.zzz_test_resultat
      values (11, 'Alice n''ajoute rien chez Bob', 'OK');
  end;
end $bloc$;

-- ─────────────  un visiteur anonyme  ─────────────

set role anon;
set request.jwt.claims = '';

-- Deux verrous en série protègent les demandes : le privilège SELECT
-- n'est pas accordé à anon, et aucune politique de lecture ne le vise.
-- Le premier se déclenche en premier, donc on attend une erreur de
-- permission plutôt que zéro ligne. Les deux verdicts valent « OK ».
do $bloc$
declare compte int;
begin
  select count(*) into compte from public.demandes;
  insert into public.zzz_test_resultat values (12, 'Un anonyme ne lit AUCUNE demande',
    case when compte = 0 then 'OK, filtre par RLS' else 'ECHEC, FUITE' end);
exception when insufficient_privilege then
  insert into public.zzz_test_resultat values (12, 'Un anonyme ne lit AUCUNE demande',
    'OK, prive du droit de lire');
end $bloc$;

insert into public.zzz_test_resultat select 13, 'Un anonyme lit bien l''annuaire',
  case when count(*) = 2 then 'OK' else 'ECHEC' end
  from public.annuaire where slug like 'zzz-test-%';

insert into public.zzz_test_resultat select 14, 'La vue annuaire n''expose pas gerant_id',
  case when count(*) = 0 then 'OK' else 'ECHEC, FUITE' end
  from information_schema.columns
 where table_schema = 'public' and table_name = 'annuaire'
   and column_name = 'gerant_id';

do $bloc$
begin
  update public.salons set description = 'anon' where slug like 'zzz-test-%';
  insert into public.zzz_test_resultat values (15, 'Un anonyme ne modifie aucune fiche',
    'ECHEC, ALTERATION');
exception when insufficient_privilege then
  insert into public.zzz_test_resultat values (15, 'Un anonyme ne modifie aucune fiche',
    'OK');
end $bloc$;

-- ─────────────  nettoyage et résultat  ─────────────

reset role;

-- Les deux salons fictifs disparaissent, et avec eux leurs demandes et
-- leurs prestations, emportées par la cascade. Il ne reste que la
-- table de résultats, que la dernière ligne du fichier supprime.
delete from public.salons where slug like 'zzz-test-%';

select n, verifie as "ce qui est verifie", verdict from public.zzz_test_resultat
 order by n;

-- ============================================================
-- UNE FOIS LE TABLEAU LU, exécuter cette ligne seule :
--
--   drop table public.zzz_test_resultat;
--
-- Elle est laissée en commentaire pour que le tableau ci-dessus
-- reste le dernier résultat affiché.
-- ============================================================
