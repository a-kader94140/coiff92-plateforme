-- Suppression des deux lignes de test créées au branchement du 04/09/2026.
-- À exécuter une fois dans l'éditeur SQL de Supabase, puis ce fichier
-- peut être supprimé.
--
-- Ces lignes ne sont pas supprimables depuis l'application : aucune
-- politique RLS n'autorise la suppression. C'est voulu. L'éditeur SQL
-- du tableau de bord, lui, passe outre RLS.

delete from public.demandes
where email in ('test@exemple.fr', 'kader.test@exemple.fr');

-- Vérification : doit renvoyer 0.
select count(*) as restantes from public.demandes;
