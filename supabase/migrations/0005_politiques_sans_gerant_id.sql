-- ============================================================
-- Coiff'92, migration 0005 : les politiques cessent de lire
-- gerant_id.
--
-- À exécuter dans l'éditeur SQL de Supabase, APRÈS la 0004.
-- La 0004 seule laisse la base dans un état cassé : elle ferme
-- gerant_id, ce qui fait échouer cinq politiques qui le lisaient.
--
-- CE QUI S'EST PASSÉ
--
-- J'ai écrit dans la 0004 qu'une politique RLS était évaluée par le
-- moteur et n'avait donc pas besoin que l'appelant sache lire la
-- colonne qu'elle teste. C'était faux. Le test l'a établi :
--
--   ERROR 42501: permission denied for table salons
--   HINT: GRANT SELECT ON public.salons TO authenticated;
--
-- Une expression de politique s'exécute avec les droits de
-- l'appelant, exactement comme le reste de sa requête. Fermer
-- gerant_id a donc fermé les politiques avec.
--
-- LA SORTIE
--
-- Une fonction SECURITY DEFINER pose la question à la place de
-- l'appelant. Elle s'exécute avec les droits de son propriétaire,
-- lit gerant_id, et ne rend qu'un booléen. Les politiques
-- l'appellent au lieu de lire la colonne.
--
-- Ce booléen ne dit rien de neuf à personne : il répond « ce salon
-- est-il à VOUS », question dont l'appelant connaît déjà la
-- réponse. Il ne permet pas de découvrir à qui appartient une
-- fiche qu'on ne possède pas.
-- ============================================================


-- ─────────────────────────  les deux fonctions  ─────────────────────────
--
-- Deux signatures parce que les tables ne désignent pas un salon de
-- la même façon : demandes porte le slug, prestations et horaires
-- portent l'identifiant.

create function public.est_mon_salon(p_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1 from public.salons s
     where s.slug = p_slug
       and s.gerant_id = auth.uid()
  );
$fn$;

create function public.est_mon_salon_id(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1 from public.salons s
     where s.id = p_id
       and s.gerant_id = auth.uid()
  );
$fn$;

comment on function public.est_mon_salon(text) is
  'Le salon de ce slug appartient-il a l''appelant ? Seule facon de poser la question depuis une politique, gerant_id n''etant plus lisible.';

comment on function public.est_mon_salon_id(uuid) is
  'Meme question, par identifiant. Pour prestations et horaires, qui referencent salon_id.';

-- auth.uid() vaut null sans jeton, donc les deux fonctions rendent
-- « false » pour un visiteur anonyme. Elles restent néanmoins
-- fermées à anon : une politique visant anon n'a aucune raison de
-- les appeler, et une fonction inutile qui reste ouverte finit par
-- servir à quelque chose.
revoke all on function public.est_mon_salon(text)   from public, anon;
revoke all on function public.est_mon_salon_id(uuid) from public, anon;
grant execute on function public.est_mon_salon(text)   to authenticated;
grant execute on function public.est_mon_salon_id(uuid) to authenticated;


-- ─────────────────────────  salons  ─────────────────────────
--
-- La politique de lecture « annuaire public » n'est pas touchée :
-- son « using (true) » ne lit aucune colonne, et c'est pour ça que
-- le public n'a jamais cessé de fonctionner pendant la panne.

drop policy if exists "le gerant modifie sa fiche" on public.salons;

create policy "le gerant modifie sa fiche"
  on public.salons for update
  to authenticated
  using (public.est_mon_salon(slug))
  with check (public.est_mon_salon(slug));

-- Le « with check » compte autant que le « using » : sans lui, un
-- gérant pourrait modifier sa ligne de façon à ce qu'elle cesse de
-- lui appartenir. Ici les GRANT l'en empêchent déjà, slug et
-- gerant_id n'étant pas écrivables, mais une politique ne doit pas
-- dépendre d'une protection posée ailleurs.


-- ─────────────────────────  prestations  ─────────────────────────

drop policy if exists "le gerant gere ses prestations" on public.prestations;

create policy "le gerant gere ses prestations"
  on public.prestations for all
  to authenticated
  using (public.est_mon_salon_id(salon_id))
  with check (public.est_mon_salon_id(salon_id));


-- ─────────────────────────  horaires  ─────────────────────────

drop policy if exists "le gerant gere ses horaires" on public.horaires;

create policy "le gerant gere ses horaires"
  on public.horaires for all
  to authenticated
  using (public.est_mon_salon_id(salon_id))
  with check (public.est_mon_salon_id(salon_id));


-- ─────────────────────────  demandes  ─────────────────────────

drop policy if exists "le gerant lit ses demandes" on public.demandes;

create policy "le gerant lit ses demandes"
  on public.demandes for select
  to authenticated
  using (public.est_mon_salon(salon_slug));

drop policy if exists "le gerant change le statut" on public.demandes;

create policy "le gerant change le statut"
  on public.demandes for update
  to authenticated
  using (public.est_mon_salon(salon_slug))
  with check (public.est_mon_salon(salon_slug));

-- La politique d'insertion des demandes, elle, n'a jamais lu
-- gerant_id : son « with check (statut = ''nouvelle'') » ne regarde
-- que la ligne déposée. Le formulaire public n'a donc pas cessé de
-- fonctionner non plus.


-- ─────────────────────────  contrôle  ─────────────────────────
--
-- Les cinq politiques réécrites, et ce qu'elles testent désormais.
-- Aucune ne doit plus contenir « gerant_id ».

select
  tablename                                          as "table",
  policyname                                         as "politique",
  case when qual like '%gerant_id%'
         or coalesce(with_check, '') like '%gerant_id%'
       then 'ENCORE gerant_id' else 'OK, passe par la fonction'
  end                                                as verdict
from pg_policies
where schemaname = 'public'
  and policyname in (
    'le gerant modifie sa fiche',
    'le gerant gere ses prestations',
    'le gerant gere ses horaires',
    'le gerant lit ses demandes',
    'le gerant change le statut'
  )
order by tablename, policyname;

-- Une fois ces cinq lignes vertes, relancer
-- supabase/tests/rls-espace-gerant.sql. C'est lui qui prouve que
-- le cloisonnement tient toujours, pas cette requête.
