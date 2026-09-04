-- ============================================================
-- PISTE ÉCARTÉE, NON EXÉCUTÉE. Refus des demandes en double.
--
-- Ce fichier n'est PAS dans supabase/migrations/ : il n'a jamais
-- été appliqué à la base. Le jour où un abus le justifie, le
-- déplacer dans migrations/ sous le numéro suivant, puis
-- l'exécuter dans l'éditeur SQL de Supabase.
--
-- Écarté le 04/09/2026, non parce qu'il serait mauvais, mais
-- parce que le piège à robots suffit tant qu'aucun abus n'est
-- constaté. Se protéger d'un problème qu'on n'a pas encore, c'est
-- du travail immobilisé.
--
-- Ce qu'il bloquerait, et que le piège ne bloque pas :
--   le visiteur qui clique deux fois sur « Envoyer »
--   l'automate qui rejoue exactement la même requête en boucle
-- ============================================================

-- L'unicité porterait sur la demande ENTIÈRE, pas seulement sur le
-- couple salon plus e-mail. Le choix se paie dans les deux sens :
--
--   Sur trois colonnes (salon, e-mail, date), un père qui demande
--   un rendez-vous pour lui et pour son fils le même jour serait
--   refusé. C'est rare, mais c'est un vrai client perdu.
--
--   Sur cinq colonnes, un automate qui varie la prestation passe
--   au travers. C'est acceptable : le but n'est pas de rendre
--   l'abus impossible, il est de le rendre plus coûteux que ce
--   qu'il rapporte.
--
-- lower(email) parce que « Marie@x.fr » et « marie@x.fr » sont la
-- même personne, et que rien côté application ne normalise la casse.
create unique index demandes_sans_doublon
  on public.demandes (salon_slug, lower(email), date_souhaitee, creneau, prestation);

comment on index public.demandes_sans_doublon is
  'Une même personne ne redépose pas deux fois la même demande. Le double-clic et la boucle bête butent ici.';

-- ============================================================
-- CÔTÉ APPLICATION, à ne pas oublier si ce fichier est appliqué.
--
-- Sans ce complément, un doublon remonterait au visiteur comme une
-- panne : « L'envoi n'a pas abouti, réessayez ». C'est faux et
-- c'est décourageant, le salon a déjà sa demande.
--
-- 1. enregistrerDemande() dans lib/demandes-schema.ts renvoie
--    « doublon » au lieu de lever, quand error.code vaut 23505,
--    le code PostgreSQL d'une violation d'unicité. Tout autre
--    échec continue de lever.
--
-- 2. EtatEnvoi dans lib/demandes.ts porte un drapeau doublon sur
--    sa variante « succes ».
--
-- 3. L'écran de confirmation affiche alors, en plus du reste :
--    « Vous aviez déjà envoyé cette demande. Le salon l'a bien,
--    elle n'a pas été transmise une seconde fois. »
--
--    Formulation retenue le 04/09/2026 parmi trois. Les deux
--    autres étaient écartées : « Vous avez déjà envoyé cette
--    demande » révèle à un curieux qu'une adresse donnée a écrit
--    à ce salon, et l'écran de confirmation inchangé revient à
--    mentir au visiteur sur l'effet de sa relance.
-- ============================================================
