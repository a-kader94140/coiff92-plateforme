-- ============================================================
-- Coiff'92, effacement RGPD sur demande.
--
-- Pas une migration : ce fichier ne s'exécute jamais tel quel. Il
-- documente la requête à lancer dans l'éditeur SQL de Supabase quand
-- une personne écrit à kdr.drb94@gmail.com pour demander l'effacement
-- de ses données (droit d'accès et d'effacement, RGPD). Remplacer
-- 'exemple@mail.com' par l'e-mail exact fourni par la personne, puis
-- exécuter chaque bloc un par un pour voir ce qui va être supprimé
-- avant de le supprimer.
--
-- La purge automatique (migration 0008) couvre déjà le cas général,
-- 12 mois après l'envoi. Ce script sert pour une demande plus tôt que
-- ça.
-- ============================================================

-- ─────────────────────────  1. repérer  ─────────────────────────
-- Vérifie ce qui existe avant de supprimer quoi que ce soit.

select id, salon_slug, nom, email, cree_le, statut
  from public.demandes
 where email = 'exemple@mail.com';

select id, salon_slug, email, cree_le, statut
  from public.litiges
 where email = 'exemple@mail.com';

-- Si la personne a aussi un compte gérant (elle s'est connectée par
-- lien magique avec cet e-mail), il apparaît ici. Effacer ce compte
-- libère automatiquement sa fiche (gerant_id redevient null), voir
-- plus bas.
select id, email, created_at
  from auth.users
 where email = 'exemple@mail.com';

-- ─────────────────────────  2. supprimer  ─────────────────────────

delete from public.demandes where email = 'exemple@mail.com';
delete from public.litiges  where email = 'exemple@mail.com';

-- Seulement si la personne a explicitement demandé la suppression de
-- son compte gérant, pas seulement de ses demandes/signalements.
--
-- gerant_id n'a PAS de clé étrangère vers auth.users (voir la 0002),
-- donc supprimer auth.users sans libérer la fiche d'abord laisserait
-- un gerant_id qui pointe sur un compte qui n'existe plus : la fiche
-- resterait « réclamée » pour toujours, sans que personne ne puisse
-- plus jamais y accéder. Toujours libérer avant de supprimer le
-- compte, jamais l'inverse.
--
-- Remplacer 'slug-du-salon' par le slug de la fiche que possédait
-- cette personne (visible dans la requête de repérage ci-dessus, via
-- select gerant_id, slug from public.salons where gerant_id = '...').
--
-- Une mise à jour directe, pas liberer_salon() : cette fonction
-- vérifie gerant_id = auth.uid(), qui est toujours null dans
-- l'éditeur SQL (pas de session). Ici on écrit directement dans la
-- table, ce que le rôle postgres peut faire, RLS ne s'applique pas à
-- lui.
-- update public.salons set gerant_id = null, modifie_le = now() where slug = 'slug-du-salon';
-- delete from auth.users where email = 'exemple@mail.com';
