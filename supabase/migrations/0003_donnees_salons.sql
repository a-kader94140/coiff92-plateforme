-- ============================================================
-- Coiff'92, migration 0003 : les fiches en base.
--
-- À exécuter dans l'éditeur SQL de Supabase, APRÈS la 0002.
--
-- GENERE depuis data/salons.ts et data/demo.ts. Ne pas éditer à
-- la main : corriger le fichier de données, puis régénérer avec
--
--   node supabase/outils/generer-0003.js
--
-- Ce script est REJOUABLE. Il peut être exécuté autant de fois
-- que nécessaire sans rien casser, et c'est le point délicat :
--
--   * Sur un salon RÉEL, il ne réécrit que le relevé vérifié
--     (nom, ville, code postal, rue, type). La description et le
--     téléphone, remplis par le gérant depuis son espace, ne sont
--     jamais touchés. Ce sont exactement les colonnes que les GRANT
--     de la 0002 lui laissent écrire.
--
--   * Sur un salon de DÉMO, il réécrit tout, prestations et
--     horaires compris. Ces fiches sont fictives, le fichier en
--     est la seule vérité et aucun gérant ne les édite.
--
-- Il ne supprime jamais les prestations ni les horaires d'un salon
-- réel : la clause « where demo » du bloc de nettoyage est la seule
-- chose qui protège le travail d'un vrai gérant. Ne pas l'ôter.
--
-- 136 salons relevés, 6 fiches de démonstration.
-- ============================================================


-- ───────────────  les salons relevés  ───────────────
--
-- Commerces réels du 92, relevé vérifié d'août 2026. Aucun tarif,
-- horaire ou description : nous ne les connaissons pas, et les
-- inventer reviendrait à leur prêter des prix qu'ils ne pratiquent
-- pas.

insert into public.salons (slug, nom, ville, code_postal, rue, type, latitude, longitude, demo) values
  ('235th-barber-street-boulogne-billancourt', '235th Barber Street', 'Boulogne-Billancourt', '92100', '123 route de la Reine', 'barber', 48.840331, 2.231313, false),
  ('2n-locks-asnieres-sur-seine', '2n.locks', 'Asnières-sur-Seine', '92600', '2 rue Bourdarie Lefure', 'coiffeur', 48.919132, 2.281219, false),
  ('a-s-coiffure-clamart', 'A.S Coiffure', 'Clamart', '92140', '42 bis avenue Jean Jaurès', 'mixte', 48.802702, 2.265107, false),
  ('alexandre-pour-l-homme-chaville', 'Alexandre Pour L''Homme', 'Chaville', '92370', '428 avenue Roger Salengro', 'barber', 48.816986, 2.195319, false),
  ('barber-bb-boulogne-billancourt', 'Barber BB', 'Boulogne-Billancourt', '92100', '228 boulevard Jean Jaurès', 'mixte', 48.830843, 2.244954, false),
  ('barber-game-levallois-perret', 'Barber Game', 'Levallois-Perret', '92300', '66 rue Aristide Briand', 'barber', 48.89192, 2.287368, false),
  ('barber-men-meudon', 'Barber Men', 'Meudon', '92360', '17 avenue du Maréchal Leclerc', 'barber', 48.789626, 2.223228, false),
  ('barber-shop-rueil-malmaison', 'Barber Shop', 'Rueil-Malmaison', '92500', '67 avenue du 18 Juin 1940', 'barber', 48.868286, 2.194136, false),
  ('barber-shop-by-bou-asnieres-sur-seine', 'Barber Shop By Bou', 'Asnières-sur-Seine', '92600', '10-12 rue des Bourguignons', 'barber', 48.911058, 2.27225, false),
  ('barber-shop-nanterre-nanterre', 'Barber Shop Nanterre', 'Nanterre', '92000', '232 avenue Georges Clemenceau', 'barber', 48.885661, 2.216939, false),
  ('barber-side-boulogne-billancourt', 'Barber Side', 'Boulogne-Billancourt', '92100', '59 avenue Pierre Grenier', 'barber', 48.831878, 2.252772, false),
  ('barber-town-92-asnieres-sur-seine', 'Barber Town 92', 'Asnières-sur-Seine', '92600', '274 avenue des Grésillons', 'barber', 48.919812, 2.314951, false),
  ('wallace-s-barber-suresnes', 'Wallace''s Barber', 'Suresnes', '92150', '16 esplanade Jacques Chirac', 'barber', 48.869137, 2.226216, false),
  ('barbershop-by-bou-la-defense-courbevoie', 'Barbershop by Bou La Défense', 'Courbevoie', '92400', '2 rue Armand Silvestre', 'barber', 48.899585, 2.261999, false),
  ('barbershop-de-la-gare-courbevoie', 'Barbershop de la Gare', 'Courbevoie', '92400', '2 rue Eugène Caron', 'barber', 48.898159, 2.246862, false),
  ('beauty-barber-du-forum-boulogne-billancourt', 'Beauty & Barber du Forum', 'Boulogne-Billancourt', '92100', '77 allée du Forum', 'mixte', 48.829545, 2.234507, false),
  ('beauty-jess-issy-les-moulineaux', 'Beauty Jess', 'Issy-les-Moulineaux', '92130', '3 rue Adolphe Chérioux', 'coiffeur', 48.824592, 2.269883, false),
  ('belom-issy-les-moulineaux', 'BELOM', 'Issy-les-Moulineaux', '92130', '5 rue Auguste Gervais', 'barber', 48.823654, 2.273094, false),
  ('ben-s-barber-levallois-perret', 'Ben''s Barber', 'Levallois-Perret', '92300', '19 rue Louise Michel', 'barber', 48.888178, 2.285963, false),
  ('blackbox-boulogne-billancourt', 'BLACKBOX', 'Boulogne-Billancourt', '92100', '112 rue de Paris', 'barber', 48.841373, 2.239588, false),
  ('bros-barber-boulogne-billancourt', 'Bros.Barber', 'Boulogne-Billancourt', '92100', '68 rue Gallieni', 'barber', 48.837325, 2.245494, false),
  ('charles-b-barbers-groomers-levallois-perret', 'Charles.B Barbers & Groomers', 'Levallois-Perret', '92300', '23 rue Carnot', 'barber', 48.889814, 2.288376, false),
  ('chez-nico-chatillon', 'Chez Nico', 'Châtillon', '92320', '2 place de l''Église', 'barber', 48.800061, 2.290769, false),
  ('coiffeur-barbier-skyby-rubio-issy-les-moulineaux', 'Coiffeur Barbier Skyby Rubio', 'Issy-les-Moulineaux', '92130', '53 boulevard Gallieni', 'barber', 48.825572, 2.267831, false),
  ('costi-coiffure-boulogne-billancourt', 'Costi Coiffure', 'Boulogne-Billancourt', '92100', '164 rue du Vieux Pont de Sèvres', 'mixte', 48.830614, 2.239619, false),
  ('dukes-barber-sceaux', 'Dukes'' Barber', 'Sceaux', '92330', '21 rue Houdan', 'barber', 48.777268, 2.295052, false),
  ('french-barber-courbevoie-courbevoie', 'French Barber Courbevoie', 'Courbevoie', '92400', '38 boulevard Aristide Briand', 'barber', 48.90006, 2.260076, false),
  ('french-barber-la-garenne-colombes-la-garenne-colombes', 'French Barber La Garenne-Colombes', 'La Garenne-Colombes', '92250', '3 rue Émile Delsol', 'barber', 48.9097, 2.241038, false),
  ('french-barber-rueil-rueil-malmaison', 'French Barber Rueil', 'Rueil-Malmaison', '92500', '65 avenue Paul Doumer', 'barber', 48.880952, 2.184015, false),
  ('the-nine-barbershop-rueil-malmaison', 'The Nine Barbershop', 'Rueil-Malmaison', '92500', '9 avenue Gabriel Péri', 'barber', 48.883079, 2.188561, false),
  ('golden-scissors-issy-les-moulineaux', 'Golden Scissors', 'Issy-les-Moulineaux', '92130', '20 rue Horace Vernet', 'barber', 48.826577, 2.273239, false),
  ('hair-spur-antony', 'Hair''sPur', 'Antony', '92160', '67 avenue Raymond Aron', 'coiffeur', 48.770134, 2.311371, false),
  ('hairbyshe-nanterre', 'Hairbyshe', 'Nanterre', '92000', '64 rue de la Source', 'coiffeur', 48.884285, 2.20667, false),
  ('jackson-911-rueil-malmaison', 'Jackson 911', 'Rueil-Malmaison', '92500', '9 rue du Gué', 'barber', 48.87885, 2.184371, false),
  ('katia-g-coiffure-levallois-perret', 'Katia G Coiffure', 'Levallois-Perret', '92300', 'rue Louis Blanc', 'coiffeur', 48.890796, 2.292363, false),
  ('kome-prestige-rueil-malmaison', 'Kome Prestige', 'Rueil-Malmaison', '92500', '113 avenue Paul Doumer', 'mixte', 48.879191, 2.179122, false),
  ('la-parisienne-beauty-nanterre', 'La Parisienne Beauty', 'Nanterre', '92000', '25 avenue Hoche', 'coiffeur', 48.90076, 2.199198, false),
  ('le-barbier-club-saint-cloud', 'Le Barbier Club', 'Saint-Cloud', '92210', '18 rue de la Libération', 'barber', 48.845158, 2.21914, false),
  ('le-beau-cercle-issy-les-moulineaux', 'Le Beau Cercle', 'Issy-les-Moulineaux', '92130', '46 avenue Victor Cresson', 'mixte', 48.82261, 2.267725, false),
  ('les-barboristes-boulogne-boulogne-billancourt', 'Les Barboristes Boulogne', 'Boulogne-Billancourt', '92100', '87 ter boulevard de la République', 'barber', 48.832533, 2.249697, false),
  ('les-barboristes-rueil-rueil-malmaison', 'Les Barboristes Rueil', 'Rueil-Malmaison', '92500', '19 rue de Maurepas', 'barber', 48.878468, 2.181953, false),
  ('mina-maison-beaute-puteaux', 'Mina Maison Beauté', 'Puteaux', '92800', '4 square Léon Blum', 'coiffeur', 48.883007, 2.246896, false),
  ('mister-barber-nanterre', 'Mister Barber', 'Nanterre', '92000', '92 allée de Corse', 'barber', 48.900742, 2.214142, false),
  ('r-barber-neuilly-sur-seine', 'R.Barber', 'Neuilly-sur-Seine', '92200', '8 rue Berteaux Dumas', 'barber', 48.881531, 2.275038, false),
  ('salongreg-boulogne-billancourt', 'SalonGreg', 'Boulogne-Billancourt', '92100', '8 boulevard Jean Jaurès', 'barber', 48.844912, 2.237146, false),
  ('studio-capillaire-suresnes', 'Studio Capillaire', 'Suresnes', '92150', '28 avenue Jean Jaurès', 'coiffeur', 48.863466, 2.20898, false),
  ('tag-barber-shop-neuilly-sur-seine', 'TAG Barber Shop', 'Neuilly-sur-Seine', '92200', '140b avenue Charles de Gaulle', 'barber', 48.88393, 2.264162, false),
  ('the-barber-by-lacrim-nanterre', 'The Barber by Lacrim', 'Nanterre', '92000', '146 avenue Georges Clemenceau', 'barber', 48.886119, 2.211127, false),
  ('the-barber-company-issy-issy-les-moulineaux', 'The Barber Company Issy', 'Issy-les-Moulineaux', '92130', '3 promenade Cœur de Ville', 'barber', 48.825697, 2.274858, false),
  ('the-barber-company-rueil-rueil-malmaison', 'The Barber Company Rueil', 'Rueil-Malmaison', '92500', '58 avenue de Fouilleuse', 'barber', 48.862248, 2.195072, false),
  ('the-kut-barber-and-shop-rueil-malmaison', 'The Kut Barber and Shop', 'Rueil-Malmaison', '92500', '22 place des Maîtres Vignerons', 'barber', 48.872922, 2.193132, false),
  ('your-barber-92-bagneux', 'Your Barber 92', 'Bagneux', '92220', '5 avenue du Général de Gaulle', 'barber', 48.797272, 2.297776, false),
  ('3m-barber-coiffure-antony', '3M Barber Coiffure', 'Antony', '92160', '17 rue de l''Église', 'barber', 48.753896, 2.297074, false),
  ('jean-claude-biguine-antony', 'Jean-Claude Biguine', 'Antony', '92160', '23 rue Auguste Mounié', 'coiffeur', 48.753969, 2.302036, false),
  ('brigitte-coiffure-antony', 'Brigitte Coiffure', 'Antony', '92160', '70 rue Adolphe Pajeaud', 'coiffeur', 48.744146, 2.290851, false),
  ('frederic-moreno-antony', 'Frédéric Moreno', 'Antony', '92160', '11-13 avenue Aristide Briand', 'coiffeur', 48.754457, 2.305346, false),
  ('franck-provost-antony-antony', 'Franck Provost Antony', 'Antony', '92160', '19-21 rue Auguste Mounié', 'coiffeur', 48.753925, 2.302257, false),
  ('jean-louis-david-antony-antony', 'Jean Louis David Antony', 'Antony', '92160', '5 rue Auguste Mounié', 'coiffeur', 48.75349, 2.304557, false),
  ('pascal-coste-antony-antony', 'Pascal Coste Antony', 'Antony', '92160', '34 rue Maurice Labrousse', 'coiffeur', 48.755036, 2.29699, false),
  ('salon-yannick-guillaume-antony', 'Salon Yannick Guillaume', 'Antony', '92160', '54 avenue de la Division Leclerc', 'coiffeur', 48.750038, 2.304143, false),
  ('the-best-concept-antony', 'The Best Concept', 'Antony', '92160', '26 avenue de la Division Leclerc', 'coiffeur', 48.75191, 2.304399, false),
  ('camille-albane-boulogne-boulogne-billancourt', 'Camille Albane Boulogne', 'Boulogne-Billancourt', '92100', '11 boulevard Jean Jaurès', 'coiffeur', 48.843348, 2.238126, false),
  ('dessange-boulogne-boulogne-billancourt', 'Dessange Boulogne', 'Boulogne-Billancourt', '92100', '1 bis boulevard Jean Jaurès', 'coiffeur', 48.845613, 2.237209, false),
  ('franck-provost-boulogne-boulogne-billancourt', 'Franck Provost Boulogne', 'Boulogne-Billancourt', '92100', '252-254 boulevard Jean Jaurès', 'coiffeur', 48.827639, 2.246769, false),
  ('gerard-valentino-boulogne-billancourt', 'Gérard Valentino', 'Boulogne-Billancourt', '92100', '93 avenue Édouard Vaillant', 'coiffeur', 48.833985, 2.24525, false),
  ('h-a-coiffure-boulogne-billancourt', 'H&A Coiffure', 'Boulogne-Billancourt', '92100', '184 rue de Billancourt', 'coiffeur', 48.832425, 2.237934, false),
  ('poptif-nanterre', 'Poptif', 'Nanterre', '92000', '14 rue Henri Barbusse', 'coiffeur', 48.890245, 2.196225, false),
  ('jean-louis-david-boulogne-boulogne-billancourt', 'Jean Louis David Boulogne', 'Boulogne-Billancourt', '92100', '5 rue Tony Garnier', 'coiffeur', 48.836829, 2.239283, false),
  ('johann-bartoche-boulogne-billancourt', 'Johann Bartoche', 'Boulogne-Billancourt', '92100', '69 rue de la Saussière', 'coiffeur', 48.836121, 2.241381, false),
  ('blackbox-levallois-levallois-perret', 'BLACKBOX Levallois', 'Levallois-Perret', '92300', '62 rue du Président Wilson', 'barber', 48.892781, 2.289806, false),
  ('dessange-levallois-levallois-perret', 'Dessange Levallois', 'Levallois-Perret', '92300', '31 rue du Président Wilson', 'coiffeur', 48.891055, 2.291183, false),
  ('la-casa-barbier-levallois-perret', 'La Casa Barbier', 'Levallois-Perret', '92300', '27 rue Voltaire', 'barber', 48.891258, 2.282282, false),
  ('le-salon-levallois-perret', 'Le Salon', 'Levallois-Perret', '92300', '83 rue Aristide Briand', 'coiffeur', 48.893595, 2.290849, false),
  ('saint-algue-levallois-levallois-perret', 'Saint Algue Levallois', 'Levallois-Perret', '92300', '50 rue Voltaire', 'coiffeur', 48.892728, 2.286227, false),
  ('atelier-w-coiffeur-institut-neuilly-sur-seine', 'Atelier W Coiffeur & Institut', 'Neuilly-sur-Seine', '92200', '16 bis rue Ernest Deloison', 'coiffeur', 48.877122, 2.249367, false),
  ('racine-beaute-nanterre', 'Racine Beauté', 'Nanterre', '92000', '136 avenue Félix Faure', 'coiffeur', 48.882771, 2.223243, false),
  ('lorentz-by-gerard-puteaux', 'Lorentz By Gérard', 'Puteaux', '92800', '37 boulevard Richard Wallace', 'coiffeur', 48.880199, 2.238978, false),
  ('cyril-franck-montrouge', 'Cyril Franck', 'Montrouge', '92120', '37 avenue Aristide Briand', 'coiffeur', 48.819152, 2.32583, false),
  ('adriano-tosca-rueil-malmaison', 'Adriano Tosca', 'Rueil-Malmaison', '92500', '20 rue du Docteur Zamenhof', 'coiffeur', 48.878859, 2.182854, false),
  ('jacques-dessange-saint-cloud-saint-cloud', 'Jacques Dessange Saint-Cloud', 'Saint-Cloud', '92210', '78 boulevard de la République', 'coiffeur', 48.846279, 2.214105, false),
  ('ramon-coiffures-diffusion-meudon', 'Ramon Coiffures Diffusion', 'Meudon', '92190', '72 avenue Jean Jaurès', 'coiffeur', 48.808397, 2.241161, false),
  ('melissa-coiffure-courbevoie', 'Mélissa Coiffure', 'Courbevoie', '92400', '47 rue de l''Alma', 'coiffeur', 48.896771, 2.253882, false),
  ('salon-de-coiffure-edouard-medioni-issy-les-moulineaux', 'Salon de Coiffure Edouard Médioni', 'Issy-les-Moulineaux', '92130', '36 rue Ernest Renan', 'coiffeur', 48.828114, 2.281078, false),
  ('alex-coiffure-issy-les-moulineaux', 'Alex Coiffure', 'Issy-les-Moulineaux', '92130', '30 rue de la Défense', 'coiffeur', 48.819419, 2.26136, false),
  ('caprices-des-dames-issy-les-moulineaux', 'Caprices des Dames', 'Issy-les-Moulineaux', '92130', '2 rue Baudin', 'coiffeur', 48.820444, 2.275091, false),
  ('ana-et-co-issy-les-moulineaux', 'Ana et Co', 'Issy-les-Moulineaux', '92130', '8 rue Auguste Gervais', 'coiffeur', 48.823163, 2.27323, false),
  ('robinson-coiffure-le-plessis-robinson', 'Robinson Coiffure', 'Le Plessis-Robinson', '92350', '60 avenue de Robinson', 'coiffeur', 48.779837, 2.274495, false),
  ('atelier-dessaigne-boulogne-billancourt', 'Atelier Dessaigne', 'Boulogne-Billancourt', '92100', '10 bis boulevard Jean Jaurès', 'coiffeur', 48.84464, 2.237266, false),
  ('espace-coiffure-beaute-neuilly-sur-seine', 'Espace Coiffure Beauté', 'Neuilly-sur-Seine', '92200', '209 avenue Charles de Gaulle', 'coiffeur', 48.884836, 2.259067, false),
  ('barberland-clamart-clamart', 'BarberLand Clamart', 'Clamart', '92140', '3 rue de Châtillon', 'barber', 48.801429, 2.268111, false),
  ('eric-stipa-bois-colombes', 'Eric Stipa', 'Bois-Colombes', '92270', '47 rue des Bourguignons', 'coiffeur', 48.914176, 2.273939, false),
  ('a-beauty-r-rueil-malmaison', 'A Beauty R', 'Rueil-Malmaison', '92500', '14 rue Lieutenant-Colonel de Montbrison', 'coiffeur', 48.866526, 2.197739, false),
  ('rosique-christine-chatenay-malabry', 'Rosique Christine', 'Châtenay-Malabry', '92290', '21 avenue Albert Thomas', 'coiffeur', 48.763665, 2.259412, false),
  ('attitude-coiffure-boulogne-billancourt', 'Attitude Coiffure', 'Boulogne-Billancourt', '92100', '32 rue Escudier', 'coiffeur', 48.843348, 2.237026, false),
  ('l-artisan-coiffeur-bourg-la-reine', 'L''Artisan Coiffeur', 'Bourg-la-Reine', '92340', '90 avenue du Général Leclerc', 'coiffeur', 48.780371, 2.315595, false),
  ('her-look-sceaux', 'Her Look', 'Sceaux', '92330', '12 rue du Docteur Roux', 'coiffeur', 48.784494, 2.303668, false),
  ('barber-shop-by-bou-bagneux-bagneux', 'Barber Shop By Bou Bagneux', 'Bagneux', '92220', '7 avenue Henri Ravera', 'barber', 48.796269, 2.301496, false),
  ('gentlemen-s-barber-shop-bagneux', 'Gentlemen''s Barber Shop', 'Bagneux', '92220', 'rue Gustave Courbet', 'barber', 48.80326, 2.322092, false),
  ('hair-cut-montrouge-montrouge', 'Hair Cut Montrouge', 'Montrouge', '92120', '1 avenue Jean Jaurès', 'coiffeur', 48.818082, 2.318736, false),
  ('so-beauty-hair-malakoff', 'So Beauty Hair', 'Malakoff', '92240', '37 bis rue Gabriel Crié', 'coiffeur', 48.822137, 2.30177, false),
  ('oshun-by-dicaro-montrouge', 'Oshun by Dicaro', 'Montrouge', '92120', '39 avenue Léon Gambetta', 'coiffeur', 48.814043, 2.322154, false),
  ('aukeo-creation-bourg-la-reine', 'Aukeo Création', 'Bourg-la-Reine', '92340', '31 rue Jean Mermoz', 'coiffeur', 48.787246, 2.320289, false),
  ('corinne-brault-la-garenne-colombes', 'Corinne Brault', 'La Garenne-Colombes', '92250', '48 rue Voltaire', 'coiffeur', 48.904121, 2.249507, false),
  ('franck-provost-la-garenne-colombes-la-garenne-colombes', 'Franck Provost La Garenne-Colombes', 'La Garenne-Colombes', '92250', '13 place de la Liberté', 'coiffeur', 48.908951, 2.247258, false),
  ('h-barber-la-garenne-colombes', 'H Barber', 'La Garenne-Colombes', '92250', '32 rue Léon Maurice Nordmann', 'barber', 48.903029, 2.24221, false),
  ('l-atelier-b-la-garenne-colombes', 'L''Atelier B', 'La Garenne-Colombes', '92250', '7 place des Champs-Philippe', 'mixte', 48.903809, 2.234189, false),
  ('un-look-pour-tous-la-garenne-la-garenne-colombes', 'Un Look Pour Tous La Garenne', 'La Garenne-Colombes', '92250', '11 boulevard de la République', 'coiffeur', 48.905774, 2.252455, false),
  ('un-moment-pour-soi-colombes', 'Un Moment Pour Soi', 'Colombes', '92700', '40 rue du Commerce', 'coiffeur', 48.910921, 2.241425, false),
  ('coiffure-sampaio-fontenay-aux-roses', 'Coiffure Sampaio', 'Fontenay-aux-Roses', '92260', 'Centre commercial Scarron, rue des Bénards', 'coiffeur', 48.791103, 2.295405, false),
  ('jean-francois-michelle-fontenay-aux-roses', 'Jean-François Michelle', 'Fontenay-aux-Roses', '92260', '2 rue Antoine Petit', 'coiffeur', 48.790521, 2.288872, false),
  ('lydia-coiffure-fontenay-aux-roses', 'Lydia Coiffure', 'Fontenay-aux-Roses', '92260', '51 rue Boucicaut', 'mixte', 48.790522, 2.289076, false),
  ('j-s-coiffure-chaville', 'J&S Coiffure', 'Chaville', '92370', '2237 avenue Roger Salengro', 'coiffeur', 48.804848, 2.181414, false),
  ('salon-lph-chaville', 'Salon LPH', 'Chaville', '92370', '1974 avenue Roger Salengro', 'coiffeur', 48.805934, 2.18434, false),
  ('nature-coiff-meudon', 'Nature Coiff''', 'Meudon', '92190', '59 rue de la République', 'coiffeur', 48.80629, 2.235929, false),
  ('the-platinum-barber-vlg-villeneuve-la-garenne', 'The Platinum Barber VLG', 'Villeneuve-la-Garenne', '92390', '107-109 voie Promenade', 'barber', 48.934177, 2.329226, false),
  ('barberland-ii-sevres', 'BarberLand II', 'Sèvres', '92310', '99 Grande Rue', 'barber', 48.823039, 2.207857, false),
  ('barbershop-longchamp-suresnes', 'Barbershop Longchamp', 'Suresnes', '92150', '53 boulevard Henri Sellier', 'barber', 48.867651, 2.221927, false),
  ('barberzer-bagneux', 'Barberzer', 'Bagneux', '92220', '8 rond-point du Dr Albert Schweitzer', 'barber', 48.789576, 2.313937, false),
  ('bcb-barber-garches', 'BCB Barber', 'Garches', '92380', '10 avenue du Maréchal Leclerc', 'barber', 48.843872, 2.186835, false),
  ('the-barbers-city-bagneux', 'The Barbers City', 'Bagneux', '92220', '272 avenue Aristide Briand', 'barber', 48.790087, 2.319272, false),
  ('the-barber-92-asnieres-sur-seine', 'The Barber 92', 'Asnières-sur-Seine', '92600', '71 avenue d''Argenteuil', 'barber', 48.913706, 2.283505, false),
  ('barber-shop-les-amis-bois-colombes', 'Barber Shop Les Amis', 'Bois-Colombes', '92270', '136 rue Paul Déroulède', 'barber', 48.914399, 2.261907, false),
  ('mjm-coiffure-suresnes', 'MJM Coiffure', 'Suresnes', '92150', '3 esplanade Jacques Chirac', 'coiffeur', 48.869137, 2.226216, false),
  ('look-92-villeneuve-la-garenne', 'Look 92', 'Villeneuve-la-Garenne', '92390', '59 avenue Jean Moulin', 'coiffeur', 48.940242, 2.329079, false),
  ('beauty-glam-villeneuve-la-garenne', 'Beauty & Glam', 'Villeneuve-la-Garenne', '92390', '47 avenue de Verdun', 'coiffeur', 48.935219, 2.330156, false),
  ('beaulieu-coiffure-bourg-la-reine', 'Beaulieu Coiffure', 'Bourg-la-Reine', '92340', '110 avenue du Général Leclerc', 'coiffeur', 48.778991, 2.314983, false),
  ('dk-hair-gennevilliers', 'DK Hair', 'Gennevilliers', '92230', '142 avenue Gabriel Péri', 'coiffeur', 48.924913, 2.29462, false),
  ('dop-coiffure-clichy', 'Dop Coiffure', 'Clichy', '92110', '53 boulevard Victor Hugo', 'coiffeur', 48.898794, 2.312416, false),
  ('shea-hair-colombes', 'Shea Hair', 'Colombes', '92700', '68 rue Pierre Brossolette', 'coiffeur', 48.90913, 2.237274, false),
  ('coiffure-de-l-amitie-montrouge', 'Coiffure des Amis', 'Montrouge', '92120', '113 avenue Aristide Briand', 'coiffeur', 48.81255, 2.326324, false),
  ('la-moustache-du-gentleman-levallois-perret', 'La Moustache du Gentleman', 'Levallois-Perret', '92300', '43 rue d''Alsace', 'barber', 48.893169, 2.298706, false),
  ('les-barboristes-levallois-levallois-perret', 'Les Barboristes Levallois', 'Levallois-Perret', '92300', '26 rue Voltaire', 'barber', 48.891545, 2.283405, false),
  ('les-belles-barbes-issy-les-moulineaux', 'Les Belles Barbes', 'Issy-les-Moulineaux', '92130', '40 rue Jean-Pierre Timbaud', 'barber', 48.819589, 2.249639, false),
  ('kutbro-barber-shop-rueil-malmaison', 'Kutbro Barber Shop', 'Rueil-Malmaison', '92500', '87 rue Gallieni', 'barber', 48.86573, 2.204257, false),
  ('the-wood-barber-rueil-malmaison', 'The Wood Barber', 'Rueil-Malmaison', '92500', '66 rue d''Estienne d''Orves', 'barber', 48.884918, 2.179974, false),
  ('joe-s-barbershop-clichy', 'Joe''s Barbershop', 'Clichy', '92110', '62 rue Martre', 'barber', 48.901147, 2.307963, false)
on conflict (slug) do update set
  nom         = excluded.nom,
  ville       = excluded.ville,
  code_postal = excluded.code_postal,
  rue         = excluded.rue,
  type        = excluded.type,
  latitude    = excluded.latitude,
  longitude   = excluded.longitude,
  modifie_le  = now();
-- Ni description ni telephone dans ce « do update » : ces deux
-- colonnes appartiennent au gérant une fois la fiche réclamée.


-- ───────────────  les fiches de démonstration  ───────────────
--
-- Six établissements FICTIFS. Aucun de ces noms n'existe dans le
-- relevé réel, vérifié à la création. Ils portent demo = true, ce qui
-- affiche un badge « Démo, salon fictif » sur la fiche comme dans
-- l'annuaire, et permet de tous les effacer d'une ligne le jour où de
-- vrais gérants prennent le relais :
--
--   delete from public.salons where demo;
--
-- Ce sont aujourd'hui les seules fiches qui acceptent une demande de
-- rendez-vous, puisqu'elles sont les seules à porter des prestations.
-- Sans elles en base, la clé étrangère demandes_salon_existe rejette
-- tout envoi du formulaire.

insert into public.salons (slug, nom, ville, code_postal, rue, type, latitude, longitude, demo, description, telephone) values
  ('le-comptoir-des-ciseaux-boulogne-billancourt', 'Le Comptoir des Ciseaux', 'Boulogne-Billancourt', '92100', '14 rue de Paris', 'mixte', 48.839395, 2.249189, true,
   'Salon de quartier ouvert depuis 2011. Coupe homme et femme, taille de barbe, coloration. Sans rendez-vous le matin.',
   '01 46 05 12 34'),
  ('atelier-verdi-levallois-perret', 'Atelier Verdi', 'Levallois-Perret', '92300', '8 rue Danton', 'coiffeur', 48.887541, 2.286879, true,
   'Coupe et couleur végétale. Deux fauteuils, sur rendez-vous uniquement, pour prendre le temps.',
   '01 47 58 40 21'),
  ('maison-kessab-nanterre', 'Maison Kessab', 'Nanterre', '92000', '23 avenue Georges Clemenceau', 'barber', 48.886001, 2.212544, true,
   'Barbier traditionnel. Rasage au coupe-chou, serviette chaude, dégradé américain.',
   '01 41 20 66 09'),
  ('lame-fine-issy-les-moulineaux', 'Lame Fine', 'Issy-les-Moulineaux', '92130', '5 rue du Général Leclerc', 'barber', 48.826681, 2.27893, true,
   'Barbier, coupe et entretien de barbe. Un seul fauteuil, sur rendez-vous.',
   '01 45 29 83 17'),
  ('coupe-franche-clichy', 'Coupe Franche', 'Clichy', '92110', '41 rue Henri Barbusse', 'mixte', 48.900134, 2.306324, true,
   'Salon mixte, coupe sans rendez-vous. Tarif unique quelle que soit la longueur.',
   '01 47 37 25 88'),
  ('le-bon-degrade-colombes', 'Le Bon Dégradé', 'Colombes', '92700', '112 rue Saint-Denis', 'barber', 48.92424, 2.249103, true,
   'Dégradés, motifs, entretien de barbe. Ouvert tard le jeudi et le vendredi.',
   '01 42 42 71 04')
on conflict (slug) do update set
  nom         = excluded.nom,
  ville       = excluded.ville,
  code_postal = excluded.code_postal,
  rue         = excluded.rue,
  type        = excluded.type,
  latitude    = excluded.latitude,
  longitude   = excluded.longitude,
  demo        = excluded.demo,
  description = excluded.description,
  telephone   = excluded.telephone,
  modifie_le  = now();


-- ───────────────  prestations et horaires des démos  ───────────────
--
-- Ces deux tables n'ont pas de clé sur laquelle faire un « on conflict »
-- utile : un gérant peut renommer une prestation, il n'y a pas
-- d'identifiant stable côté fichier. On efface donc puis on réinsère.
--
-- « where demo » n'est pas une commodité, c'est la garantie qu'un
-- rejeu du script ne détruit pas le catalogue d'un vrai salon.

delete from public.prestations
 where salon_id in (select id from public.salons where demo);

delete from public.horaires
 where salon_id in (select id from public.salons where demo);

insert into public.prestations (salon_id, libelle, duree_min, prix_cents, position)
select s.id, p.libelle, p.duree_min, p.prix_cents, p.position
  from public.salons s
  join (values
    ('le-comptoir-des-ciseaux-boulogne-billancourt', 'Coupe homme', 30, 2400, 0),
    ('le-comptoir-des-ciseaux-boulogne-billancourt', 'Coupe homme et barbe', 45, 3500, 1),
    ('le-comptoir-des-ciseaux-boulogne-billancourt', 'Taille de barbe', 20, 1600, 2),
    ('le-comptoir-des-ciseaux-boulogne-billancourt', 'Coupe femme et brushing', 60, 4500, 3),
    ('le-comptoir-des-ciseaux-boulogne-billancourt', 'Coloration', 90, 6200, 4),
    ('atelier-verdi-levallois-perret', 'Coupe et brushing', 45, 3800, 0),
    ('atelier-verdi-levallois-perret', 'Couleur végétale', 120, 7500, 1),
    ('atelier-verdi-levallois-perret', 'Balayage', 150, 9500, 2),
    ('atelier-verdi-levallois-perret', 'Soin profond', 30, 2200, 3),
    ('maison-kessab-nanterre', 'Coupe', 30, 2200, 0),
    ('maison-kessab-nanterre', 'Coupe et barbe', 50, 3300, 1),
    ('maison-kessab-nanterre', 'Rasage au coupe-chou', 35, 2800, 2),
    ('maison-kessab-nanterre', 'Coupe enfant, moins de 10 ans', 25, 1500, 3),
    ('lame-fine-issy-les-moulineaux', 'Coupe', 30, 2500, 0),
    ('lame-fine-issy-les-moulineaux', 'Barbe', 25, 1800, 1),
    ('lame-fine-issy-les-moulineaux', 'Coupe et barbe', 55, 3900, 2),
    ('coupe-franche-clichy', 'Coupe, tarif unique', 40, 2900, 0),
    ('coupe-franche-clichy', 'Barbe', 20, 1500, 1),
    ('coupe-franche-clichy', 'Couleur', 75, 5500, 2),
    ('le-bon-degrade-colombes', 'Dégradé', 35, 2000, 0),
    ('le-bon-degrade-colombes', 'Dégradé et barbe', 55, 3000, 1),
    ('le-bon-degrade-colombes', 'Motif', 15, 800, 2),
    ('le-bon-degrade-colombes', 'Coupe enfant', 25, 1400, 3)
  ) as p(slug, libelle, duree_min, prix_cents, position)
    on p.slug = s.slug;

insert into public.horaires (salon_id, jour, ouvre, ferme)
select s.id, h.jour, h.ouvre, h.ferme
  from public.salons s
  join (values
    ('le-comptoir-des-ciseaux-boulogne-billancourt', 1::smallint, '09:30'::time, '19:00'::time),
    ('le-comptoir-des-ciseaux-boulogne-billancourt', 2::smallint, '09:30'::time, '19:00'::time),
    ('le-comptoir-des-ciseaux-boulogne-billancourt', 3::smallint, '09:30'::time, '19:00'::time),
    ('le-comptoir-des-ciseaux-boulogne-billancourt', 4::smallint, '09:30'::time, '19:00'::time),
    ('le-comptoir-des-ciseaux-boulogne-billancourt', 5::smallint, '09:30'::time, '19:00'::time),
    ('le-comptoir-des-ciseaux-boulogne-billancourt', 6::smallint, '09:00'::time, '18:00'::time),
    ('le-comptoir-des-ciseaux-boulogne-billancourt', 0::smallint, null, null),
    ('atelier-verdi-levallois-perret', 1::smallint, null, null),
    ('atelier-verdi-levallois-perret', 2::smallint, '10:00'::time, '19:30'::time),
    ('atelier-verdi-levallois-perret', 3::smallint, '10:00'::time, '19:30'::time),
    ('atelier-verdi-levallois-perret', 4::smallint, '10:00'::time, '20:00'::time),
    ('atelier-verdi-levallois-perret', 5::smallint, '10:00'::time, '20:00'::time),
    ('atelier-verdi-levallois-perret', 6::smallint, '09:30'::time, '18:00'::time),
    ('atelier-verdi-levallois-perret', 0::smallint, null, null),
    ('maison-kessab-nanterre', 1::smallint, '10:00'::time, '20:00'::time),
    ('maison-kessab-nanterre', 2::smallint, '10:00'::time, '20:00'::time),
    ('maison-kessab-nanterre', 3::smallint, '10:00'::time, '20:00'::time),
    ('maison-kessab-nanterre', 4::smallint, '10:00'::time, '20:00'::time),
    ('maison-kessab-nanterre', 5::smallint, '10:00'::time, '20:00'::time),
    ('maison-kessab-nanterre', 6::smallint, '09:00'::time, '20:00'::time),
    ('maison-kessab-nanterre', 0::smallint, '10:00'::time, '14:00'::time),
    ('lame-fine-issy-les-moulineaux', 1::smallint, null, null),
    ('lame-fine-issy-les-moulineaux', 2::smallint, '11:00'::time, '19:00'::time),
    ('lame-fine-issy-les-moulineaux', 3::smallint, '11:00'::time, '19:00'::time),
    ('lame-fine-issy-les-moulineaux', 4::smallint, '11:00'::time, '20:00'::time),
    ('lame-fine-issy-les-moulineaux', 5::smallint, '11:00'::time, '20:00'::time),
    ('lame-fine-issy-les-moulineaux', 6::smallint, '10:00'::time, '18:00'::time),
    ('lame-fine-issy-les-moulineaux', 0::smallint, null, null),
    ('coupe-franche-clichy', 1::smallint, '09:00'::time, '19:00'::time),
    ('coupe-franche-clichy', 2::smallint, '09:00'::time, '19:00'::time),
    ('coupe-franche-clichy', 3::smallint, '09:00'::time, '19:00'::time),
    ('coupe-franche-clichy', 4::smallint, '09:00'::time, '19:00'::time),
    ('coupe-franche-clichy', 5::smallint, '09:00'::time, '19:00'::time),
    ('coupe-franche-clichy', 6::smallint, '09:00'::time, '19:00'::time),
    ('coupe-franche-clichy', 0::smallint, null, null),
    ('le-bon-degrade-colombes', 1::smallint, '10:00'::time, '19:30'::time),
    ('le-bon-degrade-colombes', 2::smallint, '10:00'::time, '19:30'::time),
    ('le-bon-degrade-colombes', 3::smallint, '10:00'::time, '19:30'::time),
    ('le-bon-degrade-colombes', 4::smallint, '10:00'::time, '21:00'::time),
    ('le-bon-degrade-colombes', 5::smallint, '10:00'::time, '21:00'::time),
    ('le-bon-degrade-colombes', 6::smallint, '09:00'::time, '19:30'::time),
    ('le-bon-degrade-colombes', 0::smallint, null, null)
  ) as h(slug, jour, ouvre, ferme)
    on h.slug = s.slug;


-- ───────────────  contrôle  ───────────────
--
-- Attendu, quel que soit le nombre d'exécutions :
--   salons relevés 136 · démos 6 · prestations 23 · horaires 42

select
  (select count(*) from public.salons where not demo)    as "salons releves",
  (select count(*) from public.salons where demo)        as "fiches demo",
  (select count(*) from public.prestations)              as "prestations",
  (select count(*) from public.horaires)                 as "horaires",
  (select count(*) from public.annuaire where complete)  as "fiches completes";
