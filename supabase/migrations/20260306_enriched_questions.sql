-- Enriched questions: new types and improved wording
-- Update sensitive questions to Echelle 1-7 scale
UPDATE cart_questions SET type_reponse = 'Echelle 1-7', texte = 'Comment evaluez-vous la securite psychologique dans votre organisation ? (les collaborateurs osent-ils exprimer des desaccords sans crainte ?)' WHERE code = 'B4_S03_Q03';
UPDATE cart_questions SET type_reponse = 'Echelle 1-7', texte = 'Comment evaluez-vous le niveau de confiance entre la direction et les equipes ? (1=defiance totale, 7=confiance absolue)' WHERE code = 'B8_S01_Q02';

-- Add Frequence type questions (update existing ones)
UPDATE cart_questions SET type_reponse = 'Frequence', texte = 'A quelle frequence les objectifs individuels sont-ils revus avec chaque collaborateur ?' WHERE code = 'B4_S03_Q05';
UPDATE cart_questions SET type_reponse = 'Frequence', texte = 'A quelle frequence faites-vous des retours d''experience (retex) apres chaque projet ?' WHERE code = 'B6_S02_Q04';
UPDATE cart_questions SET type_reponse = 'Frequence', texte = 'A quelle frequence consultez-vous vos tableaux de bord ?' WHERE code = 'B10_S02_Q02';

-- Improve discriminating power of key questions
UPDATE cart_questions SET texte = 'Decrivez votre plus gros defi organisationnel actuel et son impact concret sur votre activite.' WHERE code = 'B1_S01_Q01';
UPDATE cart_questions SET texte = 'Si vous deviez changer UNE chose dans votre organisation demain, ce serait quoi ?' WHERE code = 'B3_S03_Q05';
UPDATE cart_questions SET texte = 'Quel est le cout estime (en EUR ou en temps) de vos dysfonctionnements organisationnels les plus frequents ?' WHERE code = 'B6_S03_Q05';

-- Inverted items for inconsistency detection
UPDATE cart_questions SET texte = 'Les collaborateurs hesitent-ils a signaler les problemes a leur hierarchie ?' WHERE code = 'B8_S01_Q04';
UPDATE cart_questions SET texte = 'Les processus actuels freinent-ils l''initiative individuelle ?' WHERE code = 'B6_S01_Q05';
