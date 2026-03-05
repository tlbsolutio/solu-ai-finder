import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.diagnostic': 'Diagnostic',
    'nav.cartographie': 'Cartographie',
    'nav.contact': 'Contact',
    'nav.start_diagnostic': 'Scanner gratuitement',
    'nav.start_scan': 'Scanner gratuitement',

    // Hero section
    'hero.badge': 'Conseil & Transformation Digitale',
    'hero.title': 'Solutio | Conseil en transformation digitale & cartographie organisationnelle',
    'hero.h1_title': 'Transformez votre organisation avec l\'IA',
    'hero.subtitle': 'Cartographie organisationnelle, analyse IA et accompagnement sur mesure',
    'hero.description': 'Solutio vous accompagne dans votre transformation digitale : scan gratuit en 3 minutes, cartographie complète de vos processus et plan d\'action concret pour gagner en efficacité.',
    'hero.cta_diagnostic': 'Scanner mon organisation',
    'hero.cta_scan': 'Scanner mon organisation',
    'hero.cta_cartographie': 'Cartographie complète',
    'hero.cta_expert': 'Parler à un expert',
    'home.scan_free_3min': 'Scan gratuit en 3 min',

    // Trust indicators
    'home.free': 'Gratuit',
    'home.minutes': '3 minutes',
    'home.no_commitment': 'Sans engagement',

    // Problem section
    'problem.title': 'Les défis de la transformation digitale',
    'problem.pain1': 'Vos processus internes sont opaques et difficiles à optimiser',
    'problem.pain2': 'Vous perdez du temps sur des tâches à faible valeur ajoutée',
    'problem.pain3': 'Vos équipes manquent de visibilité sur les priorités',
    'problem.pain4': 'Vous ne savez pas par où commencer votre transformation',
    'problem.stat': '70% des projets de transformation digitale échouent par manque de diagnostic préalable',
    'problem.stat_source': 'Étude McKinsey 2024',
    'problem.transition': 'Un diagnostic structuré change tout.',

    // Services section (NEW - replaces Categories)
    'services.title': 'Notre offre',
    'services.subtitle': 'Un accompagnement complet pour réussir votre transformation digitale',
    'services.diagnostic.title': 'Diagnostic IA',
    'services.diagnostic.description': 'Évaluation rapide de votre maturité digitale et identification des axes d\'amélioration prioritaires.',
    'services.diagnostic.cta': 'Lancer le diagnostic',
    'services.cartographie.title': 'Cartographie organisationnelle',
    'services.cartographie.description': '10 packs d\'analyse couvrant tous vos processus : RH, finance, commercial, IT et plus encore.',
    'services.cartographie.cta': 'Découvrir les packs',
    'services.conseil.title': 'Conseil stratégique',
    'services.conseil.description': 'Recommandations personnalisées et plan d\'action concret pour chaque axe de transformation identifié.',
    'services.conseil.cta': 'En savoir plus',
    'services.accompagnement.title': 'Accompagnement',
    'services.accompagnement.description': 'Suivi de la mise en œuvre, formation des équipes et mesure des résultats sur la durée.',
    'services.accompagnement.cta': 'Nous contacter',

    // Method section
    'method.title': 'Notre méthode en 3 étapes',
    'method.subtitle': 'Un parcours structuré pour transformer votre organisation efficacement',
    'method.step1.title': 'Diagnostic IA rapide',
    'method.step1.description': '5 questions ciblées pour évaluer votre maturité digitale et identifier vos priorités. Gratuit et sans engagement.',
    'method.step2.title': 'Cartographie organisationnelle',
    'method.step2.description': '10 packs d\'analyse approfondis couvrant tous les domaines de votre organisation, enrichis par l\'IA.',
    'method.step3.title': 'Plan d\'action & accompagnement',
    'method.step3.description': 'Recommandations concrètes, feuille de route priorisée et accompagnement dans la mise en œuvre.',

    // Proof section
    'proof.title': 'Pourquoi investir dans la transformation digitale',
    'proof.stat1': '-30%',
    'proof.stat1_detail': 'de coûts opérationnels grâce à l\'optimisation des processus',
    'proof.stat1_source': 'McKinsey 2024',
    'proof.stat2': '+40%',
    'proof.stat2_detail': 'de productivité avec des processus bien cartographiés',
    'proof.stat2_source': 'Forrester Research',
    'proof.stat3': '3x',
    'proof.stat3_detail': 'plus de chances de réussir sa transformation avec un diagnostic préalable',
    'proof.stat3_message': 'Commencez par le diagnostic',
    'proof.urgency': 'Chaque mois sans diagnostic clair, c\'est du temps et des ressources mal orientés',
    'proof.cta': 'Commencer mon diagnostic gratuit',

    // Benefits section
    'benefits.title': 'Ce que Solutio vous apporte',
    'benefits.subtitle': 'Une approche concrète et mesurable de la transformation digitale.',
    'benefits.time.title': 'Clarté immédiate',
    'benefits.time.description': 'En 5 minutes, obtenez un état des lieux clair de votre maturité digitale et vos axes prioritaires.',
    'benefits.costs.title': 'Réduction des coûts',
    'benefits.costs.description': 'Identifiez les processus à optimiser en priorité pour un impact financier rapide.',
    'benefits.clarity.title': 'Vision 360° de votre organisation',
    'benefits.clarity.description': 'La cartographie révèle les interdépendances et les leviers de transformation.',
    'benefits.expert.title': 'Accompagnement expert',
    'benefits.expert.description': 'Un plan d\'action sur mesure et un suivi pour garantir des résultats concrets.',

    // CTA section
    'home.cta_title': 'Prêt à transformer votre organisation ?',
    'home.cta_subtitle': 'Le diagnostic est gratuit, les résultats sont immédiats, l\'impact est mesurable.',
    'home.cta_additional': 'Commencez par un diagnostic IA de 5 minutes ou explorez notre cartographie organisationnelle complète.',
    'home.diagnostic_5min': 'Diagnostic gratuit (5 min)',
    'home.expert_cta': 'Découvrir la cartographie',
    'home.solutions_count': 'entreprises accompagnées',
    'home.satisfaction': 'de satisfaction client',
    'home.response_time': 'pour obtenir votre diagnostic personnalisé',

    // Testimonials
    'testimonial.1.quote': 'Le diagnostic nous a permis de prioriser nos chantiers de transformation. En 3 mois, nous avons gagné 15h/semaine.',
    'testimonial.1.author': 'Marie D.',
    'testimonial.1.role': 'Directrice des opérations',
    'testimonial.1.company': 'PME Services',
    'testimonial.2.quote': 'La cartographie organisationnelle a révélé des inefficacités qu\'on ne soupçonnait pas. Un vrai game-changer.',
    'testimonial.2.author': 'Thomas L.',
    'testimonial.2.role': 'CEO',
    'testimonial.2.company': 'TechStart',

    // Contact page
    'contact.title': 'Contactez-nous',
    'contact.subtitle': 'Besoin d\'accompagnement pour votre transformation digitale ? Nos experts sont là pour vous guider.',
    'contact.form_title': 'Envoyez-nous un message',
    'contact.name_label': 'Nom complet *',
    'contact.name_placeholder': 'Votre nom',
    'contact.email_label': 'Email *',
    'contact.email_placeholder': 'votre@email.com',
    'contact.company_label': 'Entreprise',
    'contact.company_placeholder': 'Nom de votre entreprise',
    'contact.message_label': 'Message *',
    'contact.message_placeholder': 'Décrivez votre besoin ou votre projet de transformation...',
    'contact.submit_button': 'Envoyer le message',
    'contact.success_title': 'Merci pour votre message !',
    'contact.success_message': 'Nous avons bien reçu votre demande et vous répondrons dans les plus brefs délais.',
    'contact.send_another': 'Envoyer un autre message',
    'contact.direct_contact_title': 'Contact direct',
    'contact.email_label_info': 'Email',
    'contact.phone_label': 'Téléphone',
    'contact.hours_label': 'Horaires',
    'contact.hours_value': 'Lun-Ven, 9h-18h',
    'contact.book_call_title': 'Réserver un appel',
    'contact.book_call_subtitle': 'Planifiez un appel de 30 minutes avec un expert pour discuter de vos besoins.',
    'contact.book_call_benefit1': 'Diagnostic gratuit de vos processus',
    'contact.book_call_benefit2': 'Recommandations personnalisées',
    'contact.book_call_benefit3': 'Plan d\'action détaillé',
    'contact.book_call_button': 'Réserver maintenant',
    'contact.faq_title': 'Questions fréquentes',
    'contact.faq_q1': 'Combien coûte un diagnostic ?',
    'contact.faq_a1': 'Le diagnostic IA en ligne est entièrement gratuit. L\'accompagnement personnalisé est sur devis.',
    'contact.faq_q2': 'Combien de temps pour voir des résultats ?',
    'contact.faq_a2': 'Le diagnostic donne des résultats immédiats. Les premiers gains concrets apparaissent sous 4 à 8 semaines.',
    'contact.faq_q3': 'Vous accompagnez la mise en œuvre ?',
    'contact.faq_a3': 'Oui, nous proposons un accompagnement complet : de la stratégie à l\'exécution.',

    // Diagnostic page (simplified 5-step version)
    'diagnostic.title': 'Diagnostic de maturité digitale',
    'diagnostic.subtitle': 'Répondez à 5 questions pour évaluer votre organisation et recevoir des recommandations personnalisées',
    'diagnostic.question_company_title': 'Quelle est la taille de votre entreprise ?',
    'diagnostic.question_company_subtitle': 'Nombre de collaborateurs',
    'diagnostic.question_sector_title': 'Quel est votre secteur d\'activité ?',
    'diagnostic.question_sector_subtitle': 'Votre domaine principal',
    'diagnostic.question_challenges_title': 'Quels sont vos principaux défis ?',
    'diagnostic.question_challenges_subtitle': 'Sélectionnez ou décrivez vos problématiques actuelles',
    'diagnostic.question_maturity_title': 'Quel est votre niveau de digitalisation actuel ?',
    'diagnostic.question_maturity_subtitle': 'Évaluez votre situation actuelle',
    'diagnostic.question_priorities_title': 'Quelles sont vos priorités de transformation ?',
    'diagnostic.question_priorities_subtitle': 'Ce que vous souhaitez améliorer en priorité',

    'diagnostic.examples_company_1': '1-10 personnes',
    'diagnostic.examples_company_2': '11-50 personnes',
    'diagnostic.examples_company_3': '51-200 personnes',
    'diagnostic.examples_company_4': '200+ personnes',
    'diagnostic.examples_sector_1': 'Services',
    'diagnostic.examples_sector_2': 'Commerce',
    'diagnostic.examples_sector_3': 'Industrie',
    'diagnostic.examples_sector_4': 'Tech / SaaS',
    'diagnostic.examples_sector_5': 'Santé',
    'diagnostic.examples_sector_6': 'Finance',
    'diagnostic.examples_challenges_1': 'Processus manuels chronophages',
    'diagnostic.examples_challenges_2': 'Manque de visibilité / reporting',
    'diagnostic.examples_challenges_3': 'Communication inter-équipes',
    'diagnostic.examples_challenges_4': 'Gestion documentaire désorganisée',
    'diagnostic.examples_challenges_5': 'Outils non connectés',
    'diagnostic.examples_maturity_1': 'Très peu digitalisé (Excel, papier)',
    'diagnostic.examples_maturity_2': 'Quelques outils isolés',
    'diagnostic.examples_maturity_3': 'Outils connectés mais sous-utilisés',
    'diagnostic.examples_maturity_4': 'Bonne digitalisation, besoin d\'optimiser',
    'diagnostic.examples_priorities_1': 'Automatiser les tâches répétitives',
    'diagnostic.examples_priorities_2': 'Améliorer la collaboration',
    'diagnostic.examples_priorities_3': 'Optimiser les processus métier',
    'diagnostic.examples_priorities_4': 'Mieux piloter avec des données',
    'diagnostic.examples_priorities_5': 'Réduire les coûts opérationnels',

    'diagnostic.examples_label': 'Options :',
    'diagnostic.step_label': 'Étape',
    'diagnostic.progress_completed': 'complété',
    'diagnostic.question_number': 'Question',
    'diagnostic.previous_button': 'Précédent',
    'diagnostic.next_button': 'Suivant',
    'diagnostic.see_recommendations': 'Voir mon diagnostic',
    'diagnostic.results_title': 'Votre diagnostic de maturité digitale',
    'diagnostic.results_subtitle': 'Voici votre score et nos recommandations personnalisées',
    'diagnostic.maturity_score': 'Score de maturité',
    'diagnostic.potential_label': 'Potentiel',
    'diagnostic.time_saved_label': 'Gain estimé',
    'diagnostic.implementation_time': '4-8 semaines',
    'diagnostic.implementation_label': 'Premiers résultats',
    'diagnostic.roi_label': 'ROI rapide',
    'diagnostic.roi_value': 'Mesurable',
    'diagnostic.summary_title': 'Résumé de votre diagnostic',
    'diagnostic.company_size_caps': 'TAILLE',
    'diagnostic.sector_label_caps': 'SECTEUR',
    'diagnostic.challenges_caps': 'DÉFIS',
    'diagnostic.maturity_caps': 'MATURITÉ',
    'diagnostic.recommendations_title': 'Nos recommandations',
    'diagnostic.recommendations_subtitle': 'Actions prioritaires pour votre organisation',
    'diagnostic.cta_cartographie_title': 'Aller plus loin avec la cartographie',
    'diagnostic.cta_cartographie_subtitle': 'Obtenez une analyse détaillée de chaque domaine de votre organisation avec nos 10 packs d\'analyse.',
    'diagnostic.cta_cartographie_button': 'Découvrir la cartographie',
    'diagnostic.receive_email_title': 'Recevoir par email',
    'diagnostic.receive_email_subtitle': 'Recevez ce diagnostic et nos recommandations détaillées',
    'diagnostic.send_report': 'Envoyer le rapport',
    'diagnostic.free_consultation_title': 'Consultation gratuite',
    'diagnostic.free_consultation_subtitle': 'Échangez avec un expert pour affiner votre stratégie',
    'diagnostic.book_slot': 'Réserver un créneau',
    'diagnostic.new_diagnostic': 'Refaire le diagnostic',

    // Footer
    'footer.tagline': 'Conseil en transformation digitale et cartographie organisationnelle.',
    'footer.solutions': 'Services',
    'footer.support': 'Support',
    'footer.legal': 'Légal',
    'footer.legal_notice': 'Mentions légales',
    'footer.privacy': 'Confidentialité',
    'footer.terms': 'CGU',
    'footer.copyright': '© 2025 Solutio. Tous droits réservés.',

    // Not Found page
    'notfound.title': '404',
    'notfound.message': 'Oops ! Page introuvable',
    'notfound.back_home': 'Retour à l\'accueil',

    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.close': 'Fermer',
    'common.confirm': 'Confirmer'
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.diagnostic': 'Diagnostic',
    'nav.cartographie': 'Mapping',
    'nav.contact': 'Contact',
    'nav.start_diagnostic': 'Free scan',
    'nav.start_scan': 'Free scan',

    // Hero section
    'hero.badge': 'Digital Transformation Consulting',
    'hero.title': 'Solutio | Digital transformation consulting & organizational mapping',
    'hero.h1_title': 'Transform your organization with AI',
    'hero.subtitle': 'Organizational mapping, AI analysis and tailored support',
    'hero.description': 'Solutio supports your digital transformation: free 3-minute scan, comprehensive process mapping and a concrete action plan to boost efficiency.',
    'hero.cta_diagnostic': 'Scan my organization',
    'hero.cta_scan': 'Scan my organization',
    'hero.cta_cartographie': 'Full mapping',
    'hero.cta_expert': 'Talk to an expert',
    'home.scan_free_3min': 'Free 3-min scan',

    // Trust indicators
    'home.free': 'Free',
    'home.minutes': '3 minutes',
    'home.no_commitment': 'No commitment',

    // Problem section
    'problem.title': 'The challenges of digital transformation',
    'problem.pain1': 'Your internal processes are opaque and hard to optimize',
    'problem.pain2': 'You waste time on low-value tasks',
    'problem.pain3': 'Your teams lack visibility on priorities',
    'problem.pain4': 'You don\'t know where to start your transformation',
    'problem.stat': '70% of digital transformation projects fail due to lack of prior diagnosis',
    'problem.stat_source': 'McKinsey Study 2024',
    'problem.transition': 'A structured diagnosis changes everything.',

    // Services section
    'services.title': 'Our services',
    'services.subtitle': 'Comprehensive support to succeed in your digital transformation',
    'services.diagnostic.title': 'AI Diagnostic',
    'services.diagnostic.description': 'Quick assessment of your digital maturity and identification of priority improvement areas.',
    'services.diagnostic.cta': 'Start diagnostic',
    'services.cartographie.title': 'Organizational Mapping',
    'services.cartographie.description': '10 analysis packs covering all your processes: HR, finance, sales, IT and more.',
    'services.cartographie.cta': 'Discover packs',
    'services.conseil.title': 'Strategic Consulting',
    'services.conseil.description': 'Personalized recommendations and concrete action plan for each identified transformation area.',
    'services.conseil.cta': 'Learn more',
    'services.accompagnement.title': 'Implementation Support',
    'services.accompagnement.description': 'Implementation follow-up, team training and long-term results measurement.',
    'services.accompagnement.cta': 'Contact us',

    // Method section
    'method.title': 'Our 3-step method',
    'method.subtitle': 'A structured approach to effectively transform your organization',
    'method.step1.title': 'Quick AI Diagnostic',
    'method.step1.description': '5 targeted questions to assess your digital maturity and identify your priorities. Free, no commitment.',
    'method.step2.title': 'Organizational Mapping',
    'method.step2.description': '10 in-depth analysis packs covering all areas of your organization, enhanced by AI.',
    'method.step3.title': 'Action plan & support',
    'method.step3.description': 'Concrete recommendations, prioritized roadmap and support through implementation.',

    // Proof section
    'proof.title': 'Why invest in digital transformation',
    'proof.stat1': '-30%',
    'proof.stat1_detail': 'operational costs through process optimization',
    'proof.stat1_source': 'McKinsey 2024',
    'proof.stat2': '+40%',
    'proof.stat2_detail': 'productivity with well-mapped processes',
    'proof.stat2_source': 'Forrester Research',
    'proof.stat3': '3x',
    'proof.stat3_detail': 'more likely to succeed with prior diagnosis',
    'proof.stat3_message': 'Start with the diagnostic',
    'proof.urgency': 'Every month without a clear diagnosis means misallocated time and resources',
    'proof.cta': 'Start my free diagnostic',

    // Benefits section
    'benefits.title': 'What Solutio brings you',
    'benefits.subtitle': 'A concrete and measurable approach to digital transformation.',
    'benefits.time.title': 'Immediate clarity',
    'benefits.time.description': 'In 5 minutes, get a clear picture of your digital maturity and priority areas.',
    'benefits.costs.title': 'Cost reduction',
    'benefits.costs.description': 'Identify processes to optimize first for quick financial impact.',
    'benefits.clarity.title': '360° view of your organization',
    'benefits.clarity.description': 'Mapping reveals interdependencies and transformation levers.',
    'benefits.expert.title': 'Expert support',
    'benefits.expert.description': 'A tailored action plan and follow-up to ensure concrete results.',

    // CTA section
    'home.cta_title': 'Ready to transform your organization?',
    'home.cta_subtitle': 'The diagnostic is free, results are immediate, impact is measurable.',
    'home.cta_additional': 'Start with a 5-minute AI diagnostic or explore our comprehensive organizational mapping.',
    'home.diagnostic_5min': 'Free diagnostic (5 min)',
    'home.expert_cta': 'Discover mapping',
    'home.solutions_count': 'companies supported',
    'home.satisfaction': 'client satisfaction',
    'home.response_time': 'to get your personalized diagnostic',

    // Testimonials
    'testimonial.1.quote': 'The diagnostic helped us prioritize our transformation projects. In 3 months, we saved 15h/week.',
    'testimonial.1.author': 'Marie D.',
    'testimonial.1.role': 'Operations Director',
    'testimonial.1.company': 'PME Services',
    'testimonial.2.quote': 'Organizational mapping revealed inefficiencies we didn\'t suspect. A real game-changer.',
    'testimonial.2.author': 'Thomas L.',
    'testimonial.2.role': 'CEO',
    'testimonial.2.company': 'TechStart',

    // Contact page
    'contact.title': 'Contact us',
    'contact.subtitle': 'Need support for your digital transformation? Our experts are here to guide you.',
    'contact.form_title': 'Send us a message',
    'contact.name_label': 'Full name *',
    'contact.name_placeholder': 'Your name',
    'contact.email_label': 'Email *',
    'contact.email_placeholder': 'your@email.com',
    'contact.company_label': 'Company',
    'contact.company_placeholder': 'Your company name',
    'contact.message_label': 'Message *',
    'contact.message_placeholder': 'Describe your transformation need or project...',
    'contact.submit_button': 'Send message',
    'contact.success_title': 'Thank you for your message!',
    'contact.success_message': 'We have received your request and will respond as soon as possible.',
    'contact.send_another': 'Send another message',
    'contact.direct_contact_title': 'Direct contact',
    'contact.email_label_info': 'Email',
    'contact.phone_label': 'Phone',
    'contact.hours_label': 'Hours',
    'contact.hours_value': 'Mon-Fri, 9am-6pm',
    'contact.book_call_title': 'Book a call',
    'contact.book_call_subtitle': 'Schedule a 30-minute call with an expert to discuss your needs.',
    'contact.book_call_benefit1': 'Free process diagnostic',
    'contact.book_call_benefit2': 'Personalized recommendations',
    'contact.book_call_benefit3': 'Detailed action plan',
    'contact.book_call_button': 'Book now',
    'contact.faq_title': 'Frequently asked questions',
    'contact.faq_q1': 'How much does a diagnostic cost?',
    'contact.faq_a1': 'The online AI diagnostic is completely free. Personalized support is quoted on request.',
    'contact.faq_q2': 'How long to see results?',
    'contact.faq_a2': 'The diagnostic gives immediate results. First concrete gains appear within 4 to 8 weeks.',
    'contact.faq_q3': 'Do you support implementation?',
    'contact.faq_a3': 'Yes, we offer complete support: from strategy to execution.',

    // Diagnostic page (simplified 5-step version)
    'diagnostic.title': 'Digital Maturity Diagnostic',
    'diagnostic.subtitle': 'Answer 5 questions to assess your organization and receive personalized recommendations',
    'diagnostic.question_company_title': 'What is your company size?',
    'diagnostic.question_company_subtitle': 'Number of employees',
    'diagnostic.question_sector_title': 'What is your industry?',
    'diagnostic.question_sector_subtitle': 'Your main domain',
    'diagnostic.question_challenges_title': 'What are your main challenges?',
    'diagnostic.question_challenges_subtitle': 'Select or describe your current issues',
    'diagnostic.question_maturity_title': 'What is your current digitalization level?',
    'diagnostic.question_maturity_subtitle': 'Assess your current situation',
    'diagnostic.question_priorities_title': 'What are your transformation priorities?',
    'diagnostic.question_priorities_subtitle': 'What you want to improve first',

    'diagnostic.examples_company_1': '1-10 people',
    'diagnostic.examples_company_2': '11-50 people',
    'diagnostic.examples_company_3': '51-200 people',
    'diagnostic.examples_company_4': '200+ people',
    'diagnostic.examples_sector_1': 'Services',
    'diagnostic.examples_sector_2': 'Retail',
    'diagnostic.examples_sector_3': 'Manufacturing',
    'diagnostic.examples_sector_4': 'Tech / SaaS',
    'diagnostic.examples_sector_5': 'Healthcare',
    'diagnostic.examples_sector_6': 'Finance',
    'diagnostic.examples_challenges_1': 'Time-consuming manual processes',
    'diagnostic.examples_challenges_2': 'Lack of visibility / reporting',
    'diagnostic.examples_challenges_3': 'Inter-team communication',
    'diagnostic.examples_challenges_4': 'Disorganized document management',
    'diagnostic.examples_challenges_5': 'Disconnected tools',
    'diagnostic.examples_maturity_1': 'Very low digitalization (Excel, paper)',
    'diagnostic.examples_maturity_2': 'A few isolated tools',
    'diagnostic.examples_maturity_3': 'Connected but underused tools',
    'diagnostic.examples_maturity_4': 'Good digitalization, need to optimize',
    'diagnostic.examples_priorities_1': 'Automate repetitive tasks',
    'diagnostic.examples_priorities_2': 'Improve collaboration',
    'diagnostic.examples_priorities_3': 'Optimize business processes',
    'diagnostic.examples_priorities_4': 'Better data-driven decisions',
    'diagnostic.examples_priorities_5': 'Reduce operational costs',

    'diagnostic.examples_label': 'Options:',
    'diagnostic.step_label': 'Step',
    'diagnostic.progress_completed': 'completed',
    'diagnostic.question_number': 'Question',
    'diagnostic.previous_button': 'Previous',
    'diagnostic.next_button': 'Next',
    'diagnostic.see_recommendations': 'See my diagnostic',
    'diagnostic.results_title': 'Your digital maturity diagnostic',
    'diagnostic.results_subtitle': 'Here is your score and personalized recommendations',
    'diagnostic.maturity_score': 'Maturity Score',
    'diagnostic.potential_label': 'Potential',
    'diagnostic.time_saved_label': 'Estimated gain',
    'diagnostic.implementation_time': '4-8 weeks',
    'diagnostic.implementation_label': 'First results',
    'diagnostic.roi_label': 'Fast ROI',
    'diagnostic.roi_value': 'Measurable',
    'diagnostic.summary_title': 'Diagnostic summary',
    'diagnostic.company_size_caps': 'SIZE',
    'diagnostic.sector_label_caps': 'SECTOR',
    'diagnostic.challenges_caps': 'CHALLENGES',
    'diagnostic.maturity_caps': 'MATURITY',
    'diagnostic.recommendations_title': 'Our recommendations',
    'diagnostic.recommendations_subtitle': 'Priority actions for your organization',
    'diagnostic.cta_cartographie_title': 'Go further with mapping',
    'diagnostic.cta_cartographie_subtitle': 'Get a detailed analysis of each area of your organization with our 10 analysis packs.',
    'diagnostic.cta_cartographie_button': 'Discover mapping',
    'diagnostic.receive_email_title': 'Receive by email',
    'diagnostic.receive_email_subtitle': 'Get this diagnostic and our detailed recommendations',
    'diagnostic.send_report': 'Send report',
    'diagnostic.free_consultation_title': 'Free consultation',
    'diagnostic.free_consultation_subtitle': 'Talk with an expert to refine your strategy',
    'diagnostic.book_slot': 'Book a slot',
    'diagnostic.new_diagnostic': 'Redo diagnostic',

    // Footer
    'footer.tagline': 'Digital transformation consulting and organizational mapping.',
    'footer.solutions': 'Services',
    'footer.support': 'Support',
    'footer.legal': 'Legal',
    'footer.legal_notice': 'Legal notice',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.copyright': '© 2025 Solutio. All rights reserved.',

    // Not Found page
    'notfound.title': '404',
    'notfound.message': 'Oops! Page not found',
    'notfound.back_home': 'Return to Home',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.close': 'Close',
    'common.confirm': 'Confirm'
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string, params?: Record<string, string>): string => {
    let translation = translations[language][key] || key;

    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param]);
      });
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
