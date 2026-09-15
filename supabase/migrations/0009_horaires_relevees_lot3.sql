-- ============================================================
-- Coiff'92, migration 0009 : troisième lot d'horaires relevés.
--
-- Nouvelle passe sur les salons laissés de côté par la 0007 (pas
-- d'horaires trouvés à l'époque, ou sources contradictoires). Sur 21
-- salons re-cherchés, 8 ont donné un résultat exploitable cette
-- fois-ci. Les autres restent sans horaires : toujours rien de fiable
-- trouvé en ligne.
--
-- Coiffure des Amis (Montrouge) affiche des horaires identiques les
-- 7 jours de la semaine, comme plusieurs salons de la 0007 : même
-- réserve que là-bas, ça ressemble à un défaut d'agrégateur plus qu'à
-- un horaire réel. Publié quand même avec l'avertissement habituel.
--
-- Même garde-fou que les migrations précédentes : ne touche que les
-- salons réels non réclamés (s.demo = false et s.gerant_id is null).
-- ============================================================

insert into public.horaires (salon_id, jour, ouvre, ferme)
select s.id, h.jour, h.ouvre, h.ferme
  from public.salons s
  join (values
    ('frederic-moreno-antony', 1::smallint, '10:00'::time, '19:00'::time),
    ('frederic-moreno-antony', 2::smallint, '09:00'::time, '19:00'::time),
    ('frederic-moreno-antony', 3::smallint, '09:00'::time, '19:00'::time),
    ('frederic-moreno-antony', 4::smallint, '10:00'::time, '19:00'::time),
    ('frederic-moreno-antony', 5::smallint, '09:00'::time, '19:00'::time),
    ('frederic-moreno-antony', 6::smallint, '09:00'::time, '19:00'::time),
    ('frederic-moreno-antony', 0::smallint, null, null),

    ('la-casa-barbier-levallois-perret', 1::smallint, '10:00'::time, '20:00'::time),
    ('la-casa-barbier-levallois-perret', 2::smallint, '10:00'::time, '21:00'::time),
    ('la-casa-barbier-levallois-perret', 3::smallint, '10:00'::time, '21:00'::time),
    ('la-casa-barbier-levallois-perret', 4::smallint, '10:00'::time, '21:00'::time),
    ('la-casa-barbier-levallois-perret', 5::smallint, '09:00'::time, '20:00'::time),
    ('la-casa-barbier-levallois-perret', 6::smallint, '09:00'::time, '20:00'::time),
    ('la-casa-barbier-levallois-perret', 0::smallint, '10:00'::time, '15:00'::time),

    ('ana-et-co-issy-les-moulineaux', 1::smallint, null, null),
    ('ana-et-co-issy-les-moulineaux', 2::smallint, '09:30'::time, '19:00'::time),
    ('ana-et-co-issy-les-moulineaux', 3::smallint, '09:30'::time, '19:00'::time),
    ('ana-et-co-issy-les-moulineaux', 4::smallint, '09:30'::time, '20:00'::time),
    ('ana-et-co-issy-les-moulineaux', 5::smallint, '09:30'::time, '19:00'::time),
    ('ana-et-co-issy-les-moulineaux', 6::smallint, '09:00'::time, '19:00'::time),
    ('ana-et-co-issy-les-moulineaux', 0::smallint, null, null),

    ('salon-lph-chaville', 1::smallint, '09:00'::time, '19:00'::time),
    ('salon-lph-chaville', 2::smallint, '09:00'::time, '19:00'::time),
    ('salon-lph-chaville', 3::smallint, '09:00'::time, '19:00'::time),
    ('salon-lph-chaville', 4::smallint, '09:00'::time, '22:00'::time),
    ('salon-lph-chaville', 5::smallint, '09:00'::time, '19:00'::time),
    ('salon-lph-chaville', 6::smallint, '09:00'::time, '19:00'::time),
    ('salon-lph-chaville', 0::smallint, '09:00'::time, '12:00'::time),

    ('la-parisienne-beauty-nanterre', 1::smallint, null, null),
    ('la-parisienne-beauty-nanterre', 2::smallint, '10:30'::time, '17:00'::time),
    ('la-parisienne-beauty-nanterre', 3::smallint, null, null),
    ('la-parisienne-beauty-nanterre', 4::smallint, '10:30'::time, '17:00'::time),
    ('la-parisienne-beauty-nanterre', 5::smallint, '10:30'::time, '17:00'::time),
    ('la-parisienne-beauty-nanterre', 6::smallint, '10:30'::time, '17:00'::time),
    ('la-parisienne-beauty-nanterre', 0::smallint, null, null),

    ('un-look-pour-tous-la-garenne-la-garenne-colombes', 1::smallint, null, null),
    ('un-look-pour-tous-la-garenne-la-garenne-colombes', 2::smallint, '09:30'::time, '18:30'::time),
    ('un-look-pour-tous-la-garenne-la-garenne-colombes', 3::smallint, '09:30'::time, '18:30'::time),
    ('un-look-pour-tous-la-garenne-la-garenne-colombes', 4::smallint, '09:30'::time, '18:30'::time),
    ('un-look-pour-tous-la-garenne-la-garenne-colombes', 5::smallint, '09:30'::time, '18:30'::time),
    ('un-look-pour-tous-la-garenne-la-garenne-colombes', 6::smallint, '09:00'::time, '18:00'::time),
    ('un-look-pour-tous-la-garenne-la-garenne-colombes', 0::smallint, null, null),

    ('the-barbers-city-bagneux', 1::smallint, '11:00'::time, '19:30'::time),
    ('the-barbers-city-bagneux', 2::smallint, '10:00'::time, '19:30'::time),
    ('the-barbers-city-bagneux', 3::smallint, '10:00'::time, '19:30'::time),
    ('the-barbers-city-bagneux', 4::smallint, '10:00'::time, '16:00'::time),
    ('the-barbers-city-bagneux', 5::smallint, '15:00'::time, '19:30'::time),
    ('the-barbers-city-bagneux', 6::smallint, '10:00'::time, '19:30'::time),
    ('the-barbers-city-bagneux', 0::smallint, '10:00'::time, '19:30'::time),

    ('coiffure-de-l-amitie-montrouge', 1::smallint, '09:30'::time, '20:30'::time),
    ('coiffure-de-l-amitie-montrouge', 2::smallint, '09:30'::time, '20:00'::time),
    ('coiffure-de-l-amitie-montrouge', 3::smallint, '09:30'::time, '20:00'::time),
    ('coiffure-de-l-amitie-montrouge', 4::smallint, '09:30'::time, '20:00'::time),
    ('coiffure-de-l-amitie-montrouge', 5::smallint, '09:30'::time, '20:00'::time),
    ('coiffure-de-l-amitie-montrouge', 6::smallint, '09:30'::time, '20:00'::time),
    ('coiffure-de-l-amitie-montrouge', 0::smallint, '09:30'::time, '20:00'::time)

  ) as h(slug, jour, ouvre, ferme)
    on h.slug = s.slug
 where s.demo = false
   and s.gerant_id is null
on conflict (salon_id, jour) do update
  set ouvre = excluded.ouvre,
      ferme = excluded.ferme;

-- Toujours sans horaires fiables après cette deuxième passe :
-- mina-maison-beaute-puteaux, brigitte-coiffure-antony,
-- salon-de-coiffure-edouard-medioni-issy-les-moulineaux,
-- alex-coiffure-issy-les-moulineaux, a-beauty-r-rueil-malmaison,
-- rosique-christine-chatenay-malabry, h-barber-la-garenne-colombes
-- (une seule mention isolée, pas de grille par jour),
-- coiffure-sampaio-fontenay-aux-roses (introuvable, un autre salon
-- semble avoir pris sa place à la même adresse), bcb-barber-garches
-- (sources contradictoires), beaulieu-coiffure-bourg-la-reine,
-- attitude-coiffure-boulogne-billancourt (une seule plage générique,
-- pas de détail par jour), corinne-brault-la-garenne-colombes,
-- beauty-glam-villeneuve-la-garenne (« ouvert jusqu'à 19h », rien de
-- plus précis).
--
-- Plus les 4 coupures méridiennes déjà écartées en 0007 :
-- alexandre-pour-l-homme-chaville, charles-b-barbers-groomers-levallois-perret,
-- caprices-des-dames-issy-les-moulineaux, barber-shop-les-amis-bois-colombes.

-- Contrôle.
select
  count(distinct h.salon_id) as "salons reels avec horaires",
  count(*)                   as "lignes horaires"
  from public.horaires h
  join public.salons s on s.id = h.salon_id
 where s.demo = false;
