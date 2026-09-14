-- ============================================================
-- Coiff'92, migration 0008 : purge RGPD des données expirées.
--
-- Durée de conservation retenue : 12 mois à partir de la création,
-- pour les demandes de rendez-vous (nom, email, téléphone, message)
-- et les signalements de litige (email, situation). Passé ce délai,
-- la donnée est effacée automatiquement, qu'elle ait été traitée ou
-- non par le gérant.
--
-- La fonction est SECURITY DEFINER : elle s'exécute avec les droits
-- de son propriétaire, donc elle peut supprimer des lignes que RLS
-- interdirait sinon à anon/authenticated. Elle ne prend aucun
-- paramètre et ne peut rien supprimer d'autre que « plus vieux que
-- 12 mois » : l'ouvrir à anon/authenticated ne donne aucune prise à
-- un appelant malveillant, au pire il déclenche un nettoyage qui
-- aurait eu lieu de toute façon. C'est délibéré : ça permet de la
-- déclencher depuis une route Next appelée par un cron Vercel, sans
-- avoir besoin d'une clé de service côté application.
--
-- Déclenchée quotidiennement par /api/rgpd/purge, voir vercel.json.
-- ============================================================

create or replace function public.purger_donnees_expirees()
returns table (demandes_supprimees bigint, litiges_supprimes bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  n_demandes bigint;
  n_litiges  bigint;
begin
  delete from public.demandes
   where cree_le < now() - interval '12 months';
  get diagnostics n_demandes = row_count;

  delete from public.litiges
   where cree_le < now() - interval '12 months';
  get diagnostics n_litiges = row_count;

  return query select n_demandes, n_litiges;
end;
$$;

revoke all on function public.purger_donnees_expirees() from public;
grant execute on function public.purger_donnees_expirees() to anon, authenticated;

comment on function public.purger_donnees_expirees() is
  'Purge RGPD : supprime les demandes et litiges de plus de 12 mois. Appelée quotidiennement par /api/rgpd/purge.';

-- Contrôle : exécute la purge immédiatement et affiche ce qu'elle a
-- supprimé. Sur une base neuve, les deux valeurs seront à 0, aucune
-- ligne n'ayant encore un an.
select * from public.purger_donnees_expirees();
