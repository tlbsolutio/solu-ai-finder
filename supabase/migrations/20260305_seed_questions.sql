-- Seed cart_questions: 150 questions (10 blocs x 3 sections x 5 questions)
-- Each question has a unique code: B{bloc}_S{section}_Q{question}

INSERT INTO cart_questions (code, bloc, section, texte, type_reponse, actif, ordre) VALUES
-- ═══ BLOC 1 : Contexte & Organisation ═══
('B1_S01_Q01', 1, 'Identite entreprise', 'Quelle est la raison d''etre de votre entreprise (mission principale) ?', 'Texte', true, 10101),
('B1_S01_Q02', 1, 'Identite entreprise', 'Depuis combien d''annees votre entreprise existe-t-elle ?', 'Numerique', true, 10102),
('B1_S01_Q03', 1, 'Identite entreprise', 'Combien de salaries compte votre organisation ?', 'Numerique', true, 10103),
('B1_S01_Q04', 1, 'Identite entreprise', 'Quel est votre secteur d''activite principal ?', 'Texte', true, 10104),
('B1_S01_Q05', 1, 'Identite entreprise', 'Votre entreprise a-t-elle connu une croissance significative ces 3 dernieres annees ?', 'OuiNon', true, 10105),

('B1_S02_Q01', 1, 'Modele economique', 'Quel est votre modele de revenus principal (abonnement, prestation, produit, mixte) ?', 'Texte', true, 10201),
('B1_S02_Q02', 1, 'Modele economique', 'Quelle est la repartition de votre chiffre d''affaires entre vos differentes offres ?', 'Texte', true, 10202),
('B1_S02_Q03', 1, 'Modele economique', 'Avez-vous une visibilite financiere superieure a 6 mois ?', 'OuiNon', true, 10203),
('B1_S02_Q04', 1, 'Modele economique', 'Comment evaluez-vous la sante financiere de votre entreprise ? (1-5)', 'Echelle 1-5', true, 10204),
('B1_S02_Q05', 1, 'Modele economique', 'Avez-vous des revenus recurrents ?', 'OuiNon', true, 10205),

('B1_S03_Q01', 1, 'Structure organisationnelle', 'Votre organigramme est-il clairement defini et communique ?', 'OuiNon', true, 10301),
('B1_S03_Q02', 1, 'Structure organisationnelle', 'Combien de niveaux hierarchiques existe-t-il dans votre organisation ?', 'Numerique', true, 10302),
('B1_S03_Q03', 1, 'Structure organisationnelle', 'Les roles et responsabilites sont-ils clairement documentes ?', 'OuiNon', true, 10303),
('B1_S03_Q04', 1, 'Structure organisationnelle', 'Comment evaluez-vous la clarte de votre organisation interne ? (1-5)', 'Echelle 1-5', true, 10304),
('B1_S03_Q05', 1, 'Structure organisationnelle', 'Y a-t-il des chevauchements de responsabilites entre equipes ?', 'OuiNon', true, 10305),

-- ═══ BLOC 2 : Clients & Offres ═══
('B2_S01_Q01', 2, 'Connaissance client', 'Avez-vous une segmentation claire de votre clientele ?', 'OuiNon', true, 20101),
('B2_S01_Q02', 2, 'Connaissance client', 'Comment mesurez-vous la satisfaction de vos clients ?', 'Texte', true, 20102),
('B2_S01_Q03', 2, 'Connaissance client', 'Quel est votre taux de retention client annuel estime ?', 'Texte', true, 20103),
('B2_S01_Q04', 2, 'Connaissance client', 'Collectez-vous regulierement des feedbacks clients ?', 'OuiNon', true, 20104),
('B2_S01_Q05', 2, 'Connaissance client', 'Comment evaluez-vous votre connaissance des besoins clients ? (1-5)', 'Echelle 1-5', true, 20105),

('B2_S02_Q01', 2, 'Offres et livrables', 'Vos offres sont-elles clairement documentees et packagees ?', 'OuiNon', true, 20201),
('B2_S02_Q02', 2, 'Offres et livrables', 'Combien d''offres ou produits distincts proposez-vous ?', 'Numerique', true, 20202),
('B2_S02_Q03', 2, 'Offres et livrables', 'Avez-vous un processus de creation/mise a jour de vos offres ?', 'OuiNon', true, 20203),
('B2_S02_Q04', 2, 'Offres et livrables', 'Vos livrables sont-ils standardises ou sur-mesure ?', 'Texte', true, 20204),
('B2_S02_Q05', 2, 'Offres et livrables', 'Comment evaluez-vous la competitivite de vos offres ? (1-5)', 'Echelle 1-5', true, 20205),

('B2_S03_Q01', 2, 'Positionnement marche', 'Connaissez-vous precisement vos principaux concurrents ?', 'OuiNon', true, 20301),
('B2_S03_Q02', 2, 'Positionnement marche', 'Quel est votre avantage concurrentiel principal ?', 'Texte', true, 20302),
('B2_S03_Q03', 2, 'Positionnement marche', 'Faites-vous une veille concurrentielle reguliere ?', 'OuiNon', true, 20303),
('B2_S03_Q04', 2, 'Positionnement marche', 'Comment evaluez-vous votre positionnement prix ? (1-5)', 'Echelle 1-5', true, 20304),
('B2_S03_Q05', 2, 'Positionnement marche', 'Votre marque est-elle bien identifiee par vos prospects ?', 'OuiNon', true, 20305),

-- ═══ BLOC 3 : Organisation & Gouvernance ═══
('B3_S01_Q01', 3, 'Prise de decision', 'Les processus de decision sont-ils clairement definis ?', 'OuiNon', true, 30101),
('B3_S01_Q02', 3, 'Prise de decision', 'En combien de temps une decision strategique est-elle prise en moyenne ?', 'Texte', true, 30102),
('B3_S01_Q03', 3, 'Prise de decision', 'Les decisions sont-elles tracees et documentees ?', 'OuiNon', true, 30103),
('B3_S01_Q04', 3, 'Prise de decision', 'Comment evaluez-vous la rapidite de prise de decision ? (1-5)', 'Echelle 1-5', true, 30104),
('B3_S01_Q05', 3, 'Prise de decision', 'Les collaborateurs ont-ils une autonomie de decision dans leur perimetre ?', 'OuiNon', true, 30105),

('B3_S02_Q01', 3, 'Coordination inter-equipes', 'Existe-t-il des reunions regulieres de coordination entre services ?', 'OuiNon', true, 30201),
('B3_S02_Q02', 3, 'Coordination inter-equipes', 'Comment evaluez-vous la collaboration entre equipes ? (1-5)', 'Echelle 1-5', true, 30202),
('B3_S02_Q03', 3, 'Coordination inter-equipes', 'Y a-t-il des conflits recurrents entre services ?', 'OuiNon', true, 30203),
('B3_S02_Q04', 3, 'Coordination inter-equipes', 'Les projets transverses sont-ils bien coordonnes ?', 'OuiNon', true, 30204),
('B3_S02_Q05', 3, 'Coordination inter-equipes', 'Utilisez-vous un outil de gestion de projet partage ?', 'OuiNon', true, 30205),

('B3_S03_Q01', 3, 'Strategie et vision', 'Votre vision strategique a 3-5 ans est-elle formalisee ?', 'OuiNon', true, 30301),
('B3_S03_Q02', 3, 'Strategie et vision', 'Les objectifs strategiques sont-ils partages avec l''ensemble des equipes ?', 'OuiNon', true, 30302),
('B3_S03_Q03', 3, 'Strategie et vision', 'Comment evaluez-vous l''alignement entre strategie et execution ? (1-5)', 'Echelle 1-5', true, 30303),
('B3_S03_Q04', 3, 'Strategie et vision', 'Faites-vous des bilans strategiques reguliers (trimestriels, annuels) ?', 'OuiNon', true, 30304),
('B3_S03_Q05', 3, 'Strategie et vision', 'La strategie est-elle adaptee regulierement aux evolutions du marche ?', 'OuiNon', true, 30305),

-- ═══ BLOC 4 : Ressources Humaines ═══
('B4_S01_Q01', 4, 'Recrutement et integration', 'Avez-vous des difficultes de recrutement actuellement ?', 'OuiNon', true, 40101),
('B4_S01_Q02', 4, 'Recrutement et integration', 'Disposez-vous d''un processus d''onboarding structure ?', 'OuiNon', true, 40102),
('B4_S01_Q03', 4, 'Recrutement et integration', 'Quel est votre delai moyen de recrutement ?', 'Texte', true, 40103),
('B4_S01_Q04', 4, 'Recrutement et integration', 'Comment evaluez-vous la qualite de vos recrutements recents ? (1-5)', 'Echelle 1-5', true, 40104),
('B4_S01_Q05', 4, 'Recrutement et integration', 'Utilisez-vous des outils numeriques pour le recrutement ?', 'OuiNon', true, 40105),

('B4_S02_Q01', 4, 'Competences et formation', 'Avez-vous un plan de formation annuel ?', 'OuiNon', true, 40201),
('B4_S02_Q02', 4, 'Competences et formation', 'Les competences cles necessaires sont-elles identifiees par poste ?', 'OuiNon', true, 40202),
('B4_S02_Q03', 4, 'Competences et formation', 'Quel budget consacrez-vous a la formation (% masse salariale) ?', 'Texte', true, 40203),
('B4_S02_Q04', 4, 'Competences et formation', 'Comment evaluez-vous le niveau de competences de vos equipes ? (1-5)', 'Echelle 1-5', true, 40204),
('B4_S02_Q05', 4, 'Competences et formation', 'Y a-t-il des competences critiques manquantes dans l''organisation ?', 'OuiNon', true, 40205),

('B4_S03_Q01', 4, 'Engagement et retention', 'Quel est votre taux de turnover annuel ?', 'Texte', true, 40301),
('B4_S03_Q02', 4, 'Engagement et retention', 'Mesurez-vous regulierement la satisfaction des collaborateurs ?', 'OuiNon', true, 40302),
('B4_S03_Q03', 4, 'Engagement et retention', 'Comment evaluez-vous l''engagement de vos equipes ? (1-5)', 'Echelle 1-5', true, 40303),
('B4_S03_Q04', 4, 'Engagement et retention', 'Proposez-vous des avantages extra-salariaux (teletravail, flexibilite, etc.) ?', 'OuiNon', true, 40304),
('B4_S03_Q05', 4, 'Engagement et retention', 'Les entretiens annuels sont-ils realises systematiquement ?', 'OuiNon', true, 40305),

-- ═══ BLOC 5 : Processus Commerciaux ═══
('B5_S01_Q01', 5, 'Prospection et acquisition', 'Avez-vous un processus de prospection clairement defini ?', 'OuiNon', true, 50101),
('B5_S01_Q02', 5, 'Prospection et acquisition', 'Quels canaux d''acquisition utilisez-vous (digital, reseau, appels, etc.) ?', 'Texte', true, 50102),
('B5_S01_Q03', 5, 'Prospection et acquisition', 'Quel est votre taux de conversion prospect vers client ?', 'Texte', true, 50103),
('B5_S01_Q04', 5, 'Prospection et acquisition', 'Comment evaluez-vous l''efficacite de votre prospection ? (1-5)', 'Echelle 1-5', true, 50104),
('B5_S01_Q05', 5, 'Prospection et acquisition', 'Utilisez-vous un CRM pour suivre vos prospects ?', 'OuiNon', true, 50105),

('B5_S02_Q01', 5, 'Vente et negociation', 'Vos processus de vente sont-ils standardises ?', 'OuiNon', true, 50201),
('B5_S02_Q02', 5, 'Vente et negociation', 'Quel est votre cycle de vente moyen (en jours) ?', 'Numerique', true, 50202),
('B5_S02_Q03', 5, 'Vente et negociation', 'Avez-vous des scripts ou guides de vente pour l''equipe commerciale ?', 'OuiNon', true, 50203),
('B5_S02_Q04', 5, 'Vente et negociation', 'Comment evaluez-vous la performance de votre equipe commerciale ? (1-5)', 'Echelle 1-5', true, 50204),
('B5_S02_Q05', 5, 'Vente et negociation', 'Le suivi des opportunites est-il rigoureux et a jour ?', 'OuiNon', true, 50205),

('B5_S03_Q01', 5, 'Facturation et recouvrement', 'Votre processus de facturation est-il automatise ?', 'OuiNon', true, 50301),
('B5_S03_Q02', 5, 'Facturation et recouvrement', 'Quel est votre delai moyen de paiement client (en jours) ?', 'Numerique', true, 50302),
('B5_S03_Q03', 5, 'Facturation et recouvrement', 'Avez-vous des impayes ou retards de paiement frequents ?', 'OuiNon', true, 50303),
('B5_S03_Q04', 5, 'Facturation et recouvrement', 'Comment evaluez-vous l''efficacite de votre facturation ? (1-5)', 'Echelle 1-5', true, 50304),
('B5_S03_Q05', 5, 'Facturation et recouvrement', 'Utilisez-vous un logiciel de facturation dedie ?', 'OuiNon', true, 50305),

-- ═══ BLOC 6 : Processus Operationnels ═══
('B6_S01_Q01', 6, 'Production et livraison', 'Vos processus de production/livraison sont-ils documentes ?', 'OuiNon', true, 60101),
('B6_S01_Q02', 6, 'Production et livraison', 'Quel est votre taux de livraison dans les delais ?', 'Texte', true, 60102),
('B6_S01_Q03', 6, 'Production et livraison', 'Avez-vous des goulots d''etranglement identifies dans la production ?', 'OuiNon', true, 60103),
('B6_S01_Q04', 6, 'Production et livraison', 'Comment evaluez-vous l''efficacite de vos processus operationnels ? (1-5)', 'Echelle 1-5', true, 60104),
('B6_S01_Q05', 6, 'Production et livraison', 'Les taches repetitives sont-elles identifiees et documentees ?', 'OuiNon', true, 60105),

('B6_S02_Q01', 6, 'Gestion de projet', 'Utilisez-vous une methodologie de gestion de projet (agile, waterfall, etc.) ?', 'Texte', true, 60201),
('B6_S02_Q02', 6, 'Gestion de projet', 'Vos projets respectent-ils generalement les delais et budgets ?', 'OuiNon', true, 60202),
('B6_S02_Q03', 6, 'Gestion de projet', 'Comment evaluez-vous la gestion de projet dans votre organisation ? (1-5)', 'Echelle 1-5', true, 60203),
('B6_S02_Q04', 6, 'Gestion de projet', 'Faites-vous des retours d''experience (retex) apres chaque projet ?', 'OuiNon', true, 60204),
('B6_S02_Q05', 6, 'Gestion de projet', 'Les ressources sont-elles correctement allouees aux projets ?', 'OuiNon', true, 60205),

('B6_S03_Q01', 6, 'Amelioration continue', 'Avez-vous une demarche d''amelioration continue formalisee ?', 'OuiNon', true, 60301),
('B6_S03_Q02', 6, 'Amelioration continue', 'Les incidents ou problemes recurrents sont-ils traces ?', 'OuiNon', true, 60302),
('B6_S03_Q03', 6, 'Amelioration continue', 'Comment evaluez-vous la capacite d''amelioration de votre organisation ? (1-5)', 'Echelle 1-5', true, 60303),
('B6_S03_Q04', 6, 'Amelioration continue', 'Les suggestions des collaborateurs sont-elles prises en compte ?', 'OuiNon', true, 60304),
('B6_S03_Q05', 6, 'Amelioration continue', 'Mesurez-vous l''impact de vos actions d''amelioration ?', 'OuiNon', true, 60305),

-- ═══ BLOC 7 : Outils & SI ═══
('B7_S01_Q01', 7, 'Parc logiciel', 'Combien de logiciels/outils SaaS utilisez-vous au quotidien ?', 'Numerique', true, 70101),
('B7_S01_Q02', 7, 'Parc logiciel', 'Avez-vous un inventaire a jour de tous vos outils numeriques ?', 'OuiNon', true, 70102),
('B7_S01_Q03', 7, 'Parc logiciel', 'Comment evaluez-vous la satisfaction globale vis-a-vis de vos outils ? (1-5)', 'Echelle 1-5', true, 70103),
('B7_S01_Q04', 7, 'Parc logiciel', 'Avez-vous des outils redondants (qui font la meme chose) ?', 'OuiNon', true, 70104),
('B7_S01_Q05', 7, 'Parc logiciel', 'Quel est votre budget annuel en outils SaaS/licences ?', 'Texte', true, 70105),

('B7_S02_Q01', 7, 'Integration et donnees', 'Vos outils principaux sont-ils connectes entre eux ?', 'OuiNon', true, 70201),
('B7_S02_Q02', 7, 'Integration et donnees', 'Comment evaluez-vous l''integration de vos outils entre eux ? (1-5)', 'Echelle 1-5', true, 70202),
('B7_S02_Q03', 7, 'Integration et donnees', 'Y a-t-il des doubles saisies regulieres entre outils ?', 'OuiNon', true, 70203),
('B7_S02_Q04', 7, 'Integration et donnees', 'Vos donnees sont-elles centralisees ou eparpillees ?', 'Texte', true, 70204),
('B7_S02_Q05', 7, 'Integration et donnees', 'Avez-vous une politique de sauvegarde des donnees ?', 'OuiNon', true, 70205),

('B7_S03_Q01', 7, 'Securite et maintenance', 'Avez-vous une politique de securite informatique ?', 'OuiNon', true, 70301),
('B7_S03_Q02', 7, 'Securite et maintenance', 'Les mots de passe sont-ils geres de maniere securisee (gestionnaire, 2FA) ?', 'OuiNon', true, 70302),
('B7_S03_Q03', 7, 'Securite et maintenance', 'Comment evaluez-vous la securite de votre infrastructure IT ? (1-5)', 'Echelle 1-5', true, 70303),
('B7_S03_Q04', 7, 'Securite et maintenance', 'Avez-vous un support technique interne ou externe identifie ?', 'OuiNon', true, 70304),
('B7_S03_Q05', 7, 'Securite et maintenance', 'Vos logiciels sont-ils regulierement mis a jour ?', 'OuiNon', true, 70305),

-- ═══ BLOC 8 : Communication Interne ═══
('B8_S01_Q01', 8, 'Canaux de communication', 'Quels outils de communication interne utilisez-vous (email, chat, visio, etc.) ?', 'Texte', true, 80101),
('B8_S01_Q02', 8, 'Canaux de communication', 'Comment evaluez-vous l''efficacite de votre communication interne ? (1-5)', 'Echelle 1-5', true, 80102),
('B8_S01_Q03', 8, 'Canaux de communication', 'Les informations importantes sont-elles facilement accessibles a tous ?', 'OuiNon', true, 80103),
('B8_S01_Q04', 8, 'Canaux de communication', 'Y a-t-il une surcharge informationnelle (trop d''emails, messages, etc.) ?', 'OuiNon', true, 80104),
('B8_S01_Q05', 8, 'Canaux de communication', 'Les canaux de communication sont-ils bien definis (quand utiliser quoi) ?', 'OuiNon', true, 80105),

('B8_S02_Q01', 8, 'Reunions', 'Combien de reunions par semaine avez-vous en moyenne ?', 'Numerique', true, 80201),
('B8_S02_Q02', 8, 'Reunions', 'Les reunions ont-elles systematiquement un ordre du jour ?', 'OuiNon', true, 80202),
('B8_S02_Q03', 8, 'Reunions', 'Comment evaluez-vous l''efficacite de vos reunions ? (1-5)', 'Echelle 1-5', true, 80203),
('B8_S02_Q04', 8, 'Reunions', 'Les decisions prises en reunion sont-elles tracees et suivies ?', 'OuiNon', true, 80204),
('B8_S02_Q05', 8, 'Reunions', 'Pourriez-vous reduire le nombre de reunions sans impact negatif ?', 'OuiNon', true, 80205),

('B8_S03_Q01', 8, 'Documentation et partage', 'Disposez-vous d''une base de connaissances partagee (wiki, drive, etc.) ?', 'OuiNon', true, 80301),
('B8_S03_Q02', 8, 'Documentation et partage', 'Les procedures sont-elles documentees et accessibles ?', 'OuiNon', true, 80302),
('B8_S03_Q03', 8, 'Documentation et partage', 'Comment evaluez-vous le partage de connaissances dans l''equipe ? (1-5)', 'Echelle 1-5', true, 80303),
('B8_S03_Q04', 8, 'Documentation et partage', 'Y a-t-il des risques de perte de savoir en cas de depart d''un collaborateur cle ?', 'OuiNon', true, 80304),
('B8_S03_Q05', 8, 'Documentation et partage', 'Les nouveaux arrivants trouvent-ils facilement les informations dont ils ont besoin ?', 'OuiNon', true, 80305),

-- ═══ BLOC 9 : Qualite & Conformite ═══
('B9_S01_Q01', 9, 'Processus qualite', 'Avez-vous des procedures qualite formalisees ?', 'OuiNon', true, 90101),
('B9_S01_Q02', 9, 'Processus qualite', 'Disposez-vous d''une certification qualite (ISO, etc.) ?', 'OuiNon', true, 90102),
('B9_S01_Q03', 9, 'Processus qualite', 'Comment evaluez-vous la qualite de vos livrables/produits ? (1-5)', 'Echelle 1-5', true, 90103),
('B9_S01_Q04', 9, 'Processus qualite', 'Les reclamations clients sont-elles tracees et analysees ?', 'OuiNon', true, 90104),
('B9_S01_Q05', 9, 'Processus qualite', 'Quel est votre taux d''erreur ou de non-conformite estime ?', 'Texte', true, 90105),

('B9_S02_Q01', 9, 'Gestion des risques', 'Avez-vous une cartographie des risques de votre activite ?', 'OuiNon', true, 90201),
('B9_S02_Q02', 9, 'Gestion des risques', 'Les risques juridiques et reglementaires sont-ils identifies ?', 'OuiNon', true, 90202),
('B9_S02_Q03', 9, 'Gestion des risques', 'Comment evaluez-vous votre gestion des risques ? (1-5)', 'Echelle 1-5', true, 90203),
('B9_S02_Q04', 9, 'Gestion des risques', 'Avez-vous un plan de continuite d''activite (PCA) ?', 'OuiNon', true, 90204),
('B9_S02_Q05', 9, 'Gestion des risques', 'Les donnees personnelles (RGPD) sont-elles gerees conformement a la reglementation ?', 'OuiNon', true, 90205),

('B9_S03_Q01', 9, 'Conformite et audit', 'Faites-vous des audits internes reguliers ?', 'OuiNon', true, 90301),
('B9_S03_Q02', 9, 'Conformite et audit', 'Etes-vous a jour de toutes vos obligations legales et reglementaires ?', 'OuiNon', true, 90302),
('B9_S03_Q03', 9, 'Conformite et audit', 'Comment evaluez-vous votre niveau de conformite globale ? (1-5)', 'Echelle 1-5', true, 90303),
('B9_S03_Q04', 9, 'Conformite et audit', 'Avez-vous un responsable qualite ou conformite identifie ?', 'OuiNon', true, 90304),
('B9_S03_Q05', 9, 'Conformite et audit', 'Les non-conformites detectees sont-elles corrigees dans des delais definis ?', 'OuiNon', true, 90305),

-- ═══ BLOC 10 : KPIs & Pilotage ═══
('B10_S01_Q01', 10, 'Indicateurs de performance', 'Avez-vous defini des KPIs pour chaque service/equipe ?', 'OuiNon', true, 100101),
('B10_S01_Q02', 10, 'Indicateurs de performance', 'Combien de KPIs suivez-vous regulierement ?', 'Numerique', true, 100102),
('B10_S01_Q03', 10, 'Indicateurs de performance', 'Comment evaluez-vous la pertinence de vos indicateurs actuels ? (1-5)', 'Echelle 1-5', true, 100103),
('B10_S01_Q04', 10, 'Indicateurs de performance', 'Les KPIs sont-ils partages et visibles par les equipes concernees ?', 'OuiNon', true, 100104),
('B10_S01_Q05', 10, 'Indicateurs de performance', 'Vos KPIs sont-ils alignes avec vos objectifs strategiques ?', 'OuiNon', true, 100105),

('B10_S02_Q01', 10, 'Tableaux de bord', 'Disposez-vous de tableaux de bord de pilotage ?', 'OuiNon', true, 100201),
('B10_S02_Q02', 10, 'Tableaux de bord', 'A quelle frequence consultez-vous vos tableaux de bord ?', 'Texte', true, 100202),
('B10_S02_Q03', 10, 'Tableaux de bord', 'Comment evaluez-vous la qualite de vos tableaux de bord ? (1-5)', 'Echelle 1-5', true, 100203),
('B10_S02_Q04', 10, 'Tableaux de bord', 'Les donnees de vos tableaux de bord sont-elles fiables et a jour ?', 'OuiNon', true, 100204),
('B10_S02_Q05', 10, 'Tableaux de bord', 'Utilisez-vous un outil dedie pour vos tableaux de bord (BI, Excel, etc.) ?', 'Texte', true, 100205),

('B10_S03_Q01', 10, 'Pilotage strategique', 'Faites-vous des revues de performance regulieres (hebdo, mensuelle) ?', 'OuiNon', true, 100301),
('B10_S03_Q02', 10, 'Pilotage strategique', 'Les ecarts par rapport aux objectifs sont-ils analyses et corriges ?', 'OuiNon', true, 100302),
('B10_S03_Q03', 10, 'Pilotage strategique', 'Comment evaluez-vous votre capacite de pilotage global ? (1-5)', 'Echelle 1-5', true, 100303),
('B10_S03_Q04', 10, 'Pilotage strategique', 'Avez-vous un budget previsionnel suivi mensuellement ?', 'OuiNon', true, 100304),
('B10_S03_Q05', 10, 'Pilotage strategique', 'Les decisions de pilotage sont-elles basees sur des donnees ou sur l''intuition ?', 'Texte', true, 100305);
