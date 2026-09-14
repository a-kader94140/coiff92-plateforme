-- Horaires relevés en ligne (Pages Jaunes, Fresha, Planity, sites des
-- salons eux-mêmes) pour un premier lot de 14 des 136 vraies fiches,
-- en attendant que leurs gérants les réclament et les confirment.
--
-- Un lot pilote, pas les 136 : plusieurs sources donnaient des horaires
-- "7j/7" identiques pour des commerces indépendants différents, ce qui
-- sent le défaut d'une plateforme de réservation plutôt que l'horaire
-- réel du salon. Publié quand même, avec le même avertissement que la
-- fiche affiche déjà (« non confirmés par le salon »), mais AUCUNE
-- prestation n'est ajoutée : c'est elle qui déclenche le bouton de
-- rendez-vous, et l'ouvrir sur une fiche non réclamée enverrait des
-- demandes qu'aucun gérant connecté ne peut voir.
--
-- Rejouable : la jointure ne vise que les salons réels et non réclamés
-- (s.demo = false et s.gerant_id is null). Un salon déjà réclamé n'est
-- jamais touché, même si cette migration est rejouée après coup.
--
-- Alexandre Pour L'Homme (Chaville) est absent de ce lot : ses horaires
-- ont une coupure méridienne que le schéma horaires (un seul créneau
-- ouvre/ferme par jour) ne peut pas représenter sans mentir sur la
-- pause déjeuner.

insert into public.horaires (salon_id, jour, ouvre, ferme)
select s.id, h.jour, h.ouvre, h.ferme
  from public.salons s
  join (values
    ('235th-barber-street-boulogne-billancourt', 1::smallint, '10:00'::time, '20:00'::time),
    ('235th-barber-street-boulogne-billancourt', 2::smallint, '10:00'::time, '20:00'::time),
    ('235th-barber-street-boulogne-billancourt', 3::smallint, '10:00'::time, '20:00'::time),
    ('235th-barber-street-boulogne-billancourt', 4::smallint, '10:00'::time, '20:00'::time),
    ('235th-barber-street-boulogne-billancourt', 5::smallint, '10:00'::time, '20:00'::time),
    ('235th-barber-street-boulogne-billancourt', 6::smallint, '10:00'::time, '20:00'::time),
    ('235th-barber-street-boulogne-billancourt', 0::smallint, null, null),

    ('2n-locks-asnieres-sur-seine', 1::smallint, null, null),
    ('2n-locks-asnieres-sur-seine', 2::smallint, '11:00'::time, '21:00'::time),
    ('2n-locks-asnieres-sur-seine', 3::smallint, '11:00'::time, '21:00'::time),
    ('2n-locks-asnieres-sur-seine', 4::smallint, '11:00'::time, '21:00'::time),
    ('2n-locks-asnieres-sur-seine', 5::smallint, '11:00'::time, '21:00'::time),
    ('2n-locks-asnieres-sur-seine', 6::smallint, '11:00'::time, '21:00'::time),
    ('2n-locks-asnieres-sur-seine', 0::smallint, '11:00'::time, '21:00'::time),

    ('a-s-coiffure-clamart', 1::smallint, null, null),
    ('a-s-coiffure-clamart', 2::smallint, '09:00'::time, '19:00'::time),
    ('a-s-coiffure-clamart', 3::smallint, '09:00'::time, '19:00'::time),
    ('a-s-coiffure-clamart', 4::smallint, '09:00'::time, '19:00'::time),
    ('a-s-coiffure-clamart', 5::smallint, '09:00'::time, '19:00'::time),
    ('a-s-coiffure-clamart', 6::smallint, '09:00'::time, '19:00'::time),
    ('a-s-coiffure-clamart', 0::smallint, null, null),

    ('barber-bb-boulogne-billancourt', 1::smallint, '09:30'::time, '20:00'::time),
    ('barber-bb-boulogne-billancourt', 2::smallint, '09:30'::time, '20:00'::time),
    ('barber-bb-boulogne-billancourt', 3::smallint, '09:30'::time, '20:00'::time),
    ('barber-bb-boulogne-billancourt', 4::smallint, '09:30'::time, '20:00'::time),
    ('barber-bb-boulogne-billancourt', 5::smallint, '09:30'::time, '20:00'::time),
    ('barber-bb-boulogne-billancourt', 6::smallint, '09:30'::time, '20:00'::time),
    ('barber-bb-boulogne-billancourt', 0::smallint, '09:30'::time, '20:00'::time),

    ('barber-game-levallois-perret', 1::smallint, '10:00'::time, '20:00'::time),
    ('barber-game-levallois-perret', 2::smallint, '10:00'::time, '20:00'::time),
    ('barber-game-levallois-perret', 3::smallint, '10:00'::time, '20:00'::time),
    ('barber-game-levallois-perret', 4::smallint, '10:00'::time, '20:00'::time),
    ('barber-game-levallois-perret', 5::smallint, '10:00'::time, '20:00'::time),
    ('barber-game-levallois-perret', 6::smallint, '10:00'::time, '19:00'::time),
    ('barber-game-levallois-perret', 0::smallint, null, null),

    ('barber-men-meudon', 1::smallint, '10:00'::time, '19:00'::time),
    ('barber-men-meudon', 2::smallint, '10:00'::time, '19:00'::time),
    ('barber-men-meudon', 3::smallint, '10:00'::time, '19:00'::time),
    ('barber-men-meudon', 4::smallint, '10:00'::time, '19:00'::time),
    ('barber-men-meudon', 5::smallint, '10:00'::time, '19:00'::time),
    ('barber-men-meudon', 6::smallint, '10:00'::time, '19:00'::time),
    ('barber-men-meudon', 0::smallint, null, null),

    ('barber-shop-rueil-malmaison', 1::smallint, '10:30'::time, '20:30'::time),
    ('barber-shop-rueil-malmaison', 2::smallint, '10:30'::time, '20:30'::time),
    ('barber-shop-rueil-malmaison', 3::smallint, '10:30'::time, '20:30'::time),
    ('barber-shop-rueil-malmaison', 4::smallint, '10:30'::time, '20:30'::time),
    ('barber-shop-rueil-malmaison', 5::smallint, '10:30'::time, '20:30'::time),
    ('barber-shop-rueil-malmaison', 6::smallint, '10:30'::time, '20:30'::time),
    ('barber-shop-rueil-malmaison', 0::smallint, '10:30'::time, '20:30'::time),

    ('barber-shop-by-bou-asnieres-sur-seine', 1::smallint, null, null),
    ('barber-shop-by-bou-asnieres-sur-seine', 2::smallint, '10:00'::time, '19:00'::time),
    ('barber-shop-by-bou-asnieres-sur-seine', 3::smallint, '10:00'::time, '19:00'::time),
    ('barber-shop-by-bou-asnieres-sur-seine', 4::smallint, '10:00'::time, '19:00'::time),
    ('barber-shop-by-bou-asnieres-sur-seine', 5::smallint, '10:00'::time, '19:00'::time),
    ('barber-shop-by-bou-asnieres-sur-seine', 6::smallint, '10:00'::time, '19:00'::time),
    ('barber-shop-by-bou-asnieres-sur-seine', 0::smallint, '10:00'::time, '19:00'::time),

    ('barber-shop-nanterre-nanterre', 1::smallint, '09:30'::time, '20:00'::time),
    ('barber-shop-nanterre-nanterre', 2::smallint, '09:30'::time, '20:00'::time),
    ('barber-shop-nanterre-nanterre', 3::smallint, '09:30'::time, '20:00'::time),
    ('barber-shop-nanterre-nanterre', 4::smallint, '09:30'::time, '20:00'::time),
    ('barber-shop-nanterre-nanterre', 5::smallint, '09:30'::time, '20:00'::time),
    ('barber-shop-nanterre-nanterre', 6::smallint, '09:30'::time, '20:00'::time),
    ('barber-shop-nanterre-nanterre', 0::smallint, '09:30'::time, '20:00'::time),

    ('barber-side-boulogne-billancourt', 1::smallint, null, null),
    ('barber-side-boulogne-billancourt', 2::smallint, '10:00'::time, '20:00'::time),
    ('barber-side-boulogne-billancourt', 3::smallint, '10:00'::time, '20:00'::time),
    ('barber-side-boulogne-billancourt', 4::smallint, '11:00'::time, '21:00'::time),
    ('barber-side-boulogne-billancourt', 5::smallint, '10:00'::time, '20:00'::time),
    ('barber-side-boulogne-billancourt', 6::smallint, '08:00'::time, '18:00'::time),
    ('barber-side-boulogne-billancourt', 0::smallint, null, null),

    ('barber-town-92-asnieres-sur-seine', 1::smallint, '10:00'::time, '20:00'::time),
    ('barber-town-92-asnieres-sur-seine', 2::smallint, '10:00'::time, '20:00'::time),
    ('barber-town-92-asnieres-sur-seine', 3::smallint, '10:00'::time, '20:00'::time),
    ('barber-town-92-asnieres-sur-seine', 4::smallint, '10:00'::time, '20:00'::time),
    ('barber-town-92-asnieres-sur-seine', 5::smallint, '10:00'::time, '20:00'::time),
    ('barber-town-92-asnieres-sur-seine', 6::smallint, '10:00'::time, '20:00'::time),
    ('barber-town-92-asnieres-sur-seine', 0::smallint, null, null),

    ('wallace-s-barber-suresnes', 1::smallint, '10:00'::time, '20:00'::time),
    ('wallace-s-barber-suresnes', 2::smallint, '10:00'::time, '20:00'::time),
    ('wallace-s-barber-suresnes', 3::smallint, '10:00'::time, '20:00'::time),
    ('wallace-s-barber-suresnes', 4::smallint, '10:00'::time, '20:00'::time),
    ('wallace-s-barber-suresnes', 5::smallint, '10:00'::time, '20:00'::time),
    ('wallace-s-barber-suresnes', 6::smallint, '10:00'::time, '20:00'::time),
    ('wallace-s-barber-suresnes', 0::smallint, '10:00'::time, '20:00'::time),

    ('barbershop-by-bou-la-defense-courbevoie', 1::smallint, null, null),
    ('barbershop-by-bou-la-defense-courbevoie', 2::smallint, '11:00'::time, '21:00'::time),
    ('barbershop-by-bou-la-defense-courbevoie', 3::smallint, '10:00'::time, '20:00'::time),
    ('barbershop-by-bou-la-defense-courbevoie', 4::smallint, '10:00'::time, '20:00'::time),
    ('barbershop-by-bou-la-defense-courbevoie', 5::smallint, '10:00'::time, '21:00'::time),
    ('barbershop-by-bou-la-defense-courbevoie', 6::smallint, '10:00'::time, '21:00'::time),
    ('barbershop-by-bou-la-defense-courbevoie', 0::smallint, '10:00'::time, '20:00'::time),

    ('barbershop-de-la-gare-courbevoie', 1::smallint, '10:00'::time, '20:00'::time),
    ('barbershop-de-la-gare-courbevoie', 2::smallint, '10:00'::time, '20:00'::time),
    ('barbershop-de-la-gare-courbevoie', 3::smallint, '10:00'::time, '20:00'::time),
    ('barbershop-de-la-gare-courbevoie', 4::smallint, '10:00'::time, '20:00'::time),
    ('barbershop-de-la-gare-courbevoie', 5::smallint, '10:00'::time, '20:00'::time),
    ('barbershop-de-la-gare-courbevoie', 6::smallint, '10:00'::time, '20:00'::time),
    ('barbershop-de-la-gare-courbevoie', 0::smallint, '10:00'::time, '20:00'::time)

  ) as h(slug, jour, ouvre, ferme)
    on h.slug = s.slug
 where s.demo = false
   and s.gerant_id is null
on conflict (salon_id, jour) do update
  set ouvre = excluded.ouvre,
      ferme = excluded.ferme;

-- Contrôle : combien de salons du lot ont désormais des horaires, et
-- combien de lignes ça représente.
select
  count(distinct h.salon_id) as "salons du lot avec horaires",
  count(*)                   as "lignes horaires"
  from public.horaires h
  join public.salons s on s.id = h.salon_id
 where s.demo = false;
