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
    'nav.diagnostic': 'Diagnostic IA',
    'nav.catalogue': 'Catalogue SaaS',
    'nav.contact': 'Contact',
    'nav.start_diagnostic': 'Commencer le diagnostic',

    // Hero section
    'hero.badge': 'Transformation Digitale',
    'hero.title': 'Trouvez la meilleure solution SaaS pour automatiser votre activité',
    'hero.subtitle': 'Diagnostic gratuit + recommandations personnalisées',
    'hero.description': 'Solutio vous aide aussi à implémenter l\'IA dans vos processus métier.',
    'hero.cta_diagnostic': 'Commencer le diagnostic gratuit',
    'hero.cta_catalog': 'Explorer le catalogue',
    
    // Features section
    'features.intelligent_diagnostic.title': 'Diagnostic IA Intelligent',
    'features.intelligent_diagnostic.description': 'Notre assistant conversationnel analyse vos processus en 6 questions ciblées pour identifier les tâches à automatiser.',
    'features.personalized_catalog.title': 'Catalogue SaaS Personnalisé',
    'features.personalized_catalog.description': 'Découvrez une sélection de solutions SaaS triées sur le volet, adaptées à votre secteur et vos besoins spécifiques.',
    'features.custom_recommendations.title': 'Recommandations Sur Mesure',
    'features.custom_recommendations.description': 'Recevez des recommandations précises basées sur le potentiel d\'automatisation et la facilité d\'implémentation.',
    
    // Benefits section
    'benefits.save_time.title': 'Gagnez du temps',
    'benefits.save_time.description': 'Jusqu\'à 70% de temps économisé sur vos tâches répétitives',
    'benefits.reduce_costs.title': 'Réduisez vos coûts',
    'benefits.reduce_costs.description': 'ROI moyen de 300% dès la première année',
    'benefits.targeted_solutions.title': 'Solutions ciblées',
    'benefits.targeted_solutions.description': 'Recommandations adaptées à votre secteur et taille d\'entreprise',
    
    // Categories
    'categories.crm': 'CRM & Relation Client',
    'categories.marketing': 'Marketing & Growth',
    'categories.automation': 'Automatisation & No-code',
    'categories.design': 'Création, Design & Multimédia',
    'categories.sales': 'Ventes & E-commerce',
    'categories.project_management': 'Gestion de Projet & Collaboration',
    'categories.productivity': 'Productivité & Outils Bureautiques',
    'categories.security': 'Sécurité & Conformité',
    'categories.finance': 'Finance & Comptabilité',
    'categories.hr': 'Ressources Humaines & Recrutement',
    'categories.education': 'Éducation & Formation',
    'categories.customer_service': 'Service Client & Support',
    'categories.health': 'Santé & Bien-être',
    'categories.industry': 'Industrie & Logistique',
    'categories.development': 'Développement & IT',
    'categories.legal': 'LegalTech & Juridique',
    'categories.count': '{count} outils',
    
    // Catalog page
    'catalog.title': 'Catalogue SaaS',
    'catalog.subtitle': 'Découvrez les meilleures solutions pour automatiser votre activité',
    'catalog.search_placeholder': 'Rechercher une solution...',
    'catalog.filter_category': 'Catégorie',
    'catalog.filter_target': 'Cible',
    'catalog.all_categories': 'Toutes les catégories',
    'catalog.all_targets': 'Toutes les cibles',
    'catalog.key_features': 'Fonctionnalités clés',
    'catalog.view_details': 'Voir le détail',
    'catalog.no_results_title': 'Aucune solution trouvée',
    'catalog.no_results_subtitle': 'Essayez de modifier vos critères de recherche',

    // Contact page
    'contact.title': 'Contactez-nous',
    'contact.subtitle': 'Besoin d\'aide pour choisir la meilleure solution ? Nos experts sont là pour vous accompagner.',
    'contact.form_title': 'Envoyez-nous un message',
    'contact.name_label': 'Nom complet *',
    'contact.name_placeholder': 'Votre nom',
    'contact.email_label': 'Email *',
    'contact.email_placeholder': 'votre@email.com',
    'contact.company_label': 'Entreprise',
    'contact.company_placeholder': 'Nom de votre entreprise',
    'contact.message_label': 'Message *',
    'contact.message_placeholder': 'Décrivez votre besoin ou votre projet...',
    'contact.submit_button': 'Envoyer le message',
    'contact.success_title': 'Merci pour votre message !',
    'contact.success_message': 'Nous avons bien reçu votre demande et vous répondrons dans les plus brefs délais.',
    'contact.send_another': 'Envoyer un autre message',

    // Diagnostic page
    'diagnostic.title': 'Diagnostic IA',
    'diagnostic.subtitle': 'Répondez à 6 questions simples pour découvrir les meilleures solutions d\'automatisation pour votre activité',

    // Home page
    'home.badge': 'Transformation Digitale',
    'home.title': 'Automatisez votre activité avec l\'IA',
    'home.subtitle': 'Découvrez les meilleures solutions SaaS pour automatiser vos tâches répétitives. Diagnostic IA gratuit et recommandations personnalisées en 5 minutes.',
    'home.cta_diagnostic': 'Commencer le diagnostic gratuit',
    'home.cta_catalogue': 'Voir le catalogue',
    'home.free': 'Gratuit',
    'home.minutes': '5 minutes',
    'home.no_commitment': 'Sans engagement',
    'home.how_title': 'Comment Solutio révolutionne votre productivité',
    'home.how_subtitle': 'Une approche en 3 étapes pour identifier, choisir et implémenter les meilleures solutions d\'automatisation',
    'home.feature1_title': 'Diagnostic IA Intelligent',
    'home.feature1_desc': 'Notre assistant conversationnel analyse vos processus en 6 questions ciblées pour identifier les tâches à automatiser.',
    'home.feature2_title': 'Catalogue SaaS Personnalisé',
    'home.feature2_desc': 'Découvrez une sélection de solutions SaaS triées sur le volet, adaptées à votre secteur et vos besoins spécifiques.',
    'home.feature3_title': 'Recommandations Sur Mesure',
    'home.feature3_desc': 'Recevez des recommandations précises basées sur le potentiel d\'automatisation et la facilité d\'implémentation.',
    'home.why_title': 'Pourquoi choisir Solutio ?',
    'home.why_subtitle': 'Nous ne vendons pas de solutions, nous trouvons LA solution qui vous convient parfaitement.',
    'home.benefit1_title': 'Gagnez du temps',
    'home.benefit1_desc': 'Jusqu\'à 70% de temps économisé sur vos tâches répétitives',
    'home.benefit2_title': 'Réduisez vos coûts',
    'home.benefit2_desc': 'ROI moyen de 300% dès la première année',
    'home.benefit3_title': 'Solutions ciblées',
    'home.benefit3_desc': 'Recommandations adaptées à votre secteur et taille d\'entreprise',
    'home.demo_cta': 'Demander une démo personnalisée',
    'home.cta_title': 'Prêt à automatiser votre activité ?',
    'home.cta_subtitle': 'Commencez votre diagnostic gratuit dès maintenant et découvrez comment gagner des heures chaque semaine.',
    'home.diagnostic_5min': 'Diagnostic gratuit en 5 min',
    'home.explore_catalogue': 'Explorer le catalogue',
    'home.solutions_count': 'Solutions référencées',
    'home.satisfaction': 'Clients satisfaits',
    'home.response_time': 'Temps de réponse',

    // Catalogue
    'catalogue.title': 'Catalogue SaaS',
    'catalogue.subtitle': 'Découvrez les meilleures solutions pour automatiser votre activité',
    'catalogue.search_placeholder': 'Rechercher une solution...',
    'catalogue.category_filter': 'Catégorie',
    'catalogue.target_filter': 'Cible',
    'catalogue.all_categories': 'Toutes les catégories',
    'catalogue.all_targets': 'Toutes les cibles',
    'catalogue.solutions_found': 'solution trouvée',
    'catalogue.solutions_found_plural': 'solutions trouvées',
    'catalogue.key_features': 'Fonctionnalités clés :',
    'catalogue.view_detail': 'Voir le détail',
    'catalogue.no_results': 'Aucune solution trouvée',
    'catalogue.modify_search': 'Essayez de modifier vos critères de recherche',

    // Footer
    'footer.tagline': 'Votre partenaire pour la transformation digitale et l\'automatisation.',
    'footer.solutions': 'Solutions',
    'footer.support': 'Support',
    'footer.legal': 'Légal',
    'footer.legal_notice': 'Mentions légales',
    'footer.privacy': 'Confidentialité',
    'footer.terms': 'CGU',
    'footer.copyright': '© 2024 Solutio. Tous droits réservés.'
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.diagnostic': 'AI Diagnostic',
    'nav.catalogue': 'SaaS Catalogue',
    'nav.contact': 'Contact',
    'nav.start_diagnostic': 'Start diagnostic',

    // Hero section
    'hero.badge': 'Digital Transformation',
    'hero.title': 'Find the best SaaS solution to automate your business',
    'hero.subtitle': 'Free diagnostic + personalized recommendations',
    'hero.description': 'Solutio also helps you implement AI in your business processes.',
    'hero.cta_diagnostic': 'Start free diagnostic',
    'hero.cta_catalog': 'Explore catalog',
    
    // Features section
    'features.intelligent_diagnostic.title': 'Intelligent AI Diagnostic',
    'features.intelligent_diagnostic.description': 'Our conversational assistant analyzes your processes with 6 targeted questions to identify tasks to automate.',
    'features.personalized_catalog.title': 'Personalized SaaS Catalog',
    'features.personalized_catalog.description': 'Discover a curated selection of SaaS solutions, tailored to your industry and specific needs.',
    'features.custom_recommendations.title': 'Custom Recommendations',
    'features.custom_recommendations.description': 'Receive precise recommendations based on automation potential and implementation ease.',
    
    // Benefits section
    'benefits.save_time.title': 'Save time',
    'benefits.save_time.description': 'Up to 70% time saved on your repetitive tasks',
    'benefits.reduce_costs.title': 'Reduce costs',
    'benefits.reduce_costs.description': 'Average ROI of 300% from the first year',
    'benefits.targeted_solutions.title': 'Targeted solutions',
    'benefits.targeted_solutions.description': 'Recommendations adapted to your industry and company size',
    
    // Categories
    'categories.crm': 'CRM & Customer Relations',
    'categories.marketing': 'Marketing & Growth',
    'categories.automation': 'Automation & No-code',
    'categories.design': 'Creation, Design & Multimedia',
    'categories.sales': 'Sales & E-commerce',
    'categories.project_management': 'Project Management & Collaboration',
    'categories.productivity': 'Productivity & Office Tools',
    'categories.security': 'Security & Compliance',
    'categories.finance': 'Finance & Accounting',
    'categories.hr': 'Human Resources & Recruitment',
    'categories.education': 'Education & Training',
    'categories.customer_service': 'Customer Service & Support',
    'categories.health': 'Health & Wellness',
    'categories.industry': 'Industry & Logistics',
    'categories.development': 'Development & IT',
    'categories.legal': 'LegalTech & Legal',
    'categories.count': '{count} tools',
    
    // Catalog page
    'catalog.title': 'SaaS Catalog',
    'catalog.subtitle': 'Discover the best solutions to automate your business',
    'catalog.search_placeholder': 'Search for a solution...',
    'catalog.filter_category': 'Category',
    'catalog.filter_target': 'Target',
    'catalog.all_categories': 'All categories',
    'catalog.all_targets': 'All targets',
    'catalog.key_features': 'Key features',
    'catalog.view_details': 'View details',
    'catalog.no_results_title': 'No solutions found',
    'catalog.no_results_subtitle': 'Try modifying your search criteria',

    // Contact page
    'contact.title': 'Contact us',
    'contact.subtitle': 'Need help choosing the best solution? Our experts are here to help you.',
    'contact.form_title': 'Send us a message',
    'contact.name_label': 'Full name *',
    'contact.name_placeholder': 'Your name',
    'contact.email_label': 'Email *',
    'contact.email_placeholder': 'your@email.com',
    'contact.company_label': 'Company',
    'contact.company_placeholder': 'Your company name',
    'contact.message_label': 'Message *',
    'contact.message_placeholder': 'Describe your need or project...',
    'contact.submit_button': 'Send message',
    'contact.success_title': 'Thank you for your message!',
    'contact.success_message': 'We have received your request and will respond as soon as possible.',
    'contact.send_another': 'Send another message',

    // Diagnostic page
    'diagnostic.title': 'AI Diagnostic',
    'diagnostic.subtitle': 'Answer 6 simple questions to discover the best automation solutions for your business',

    // Home page
    'home.badge': 'Digital Transformation',
    'home.title': 'Automate your business with AI',
    'home.subtitle': 'Discover the best SaaS solutions to automate your repetitive tasks. Free AI diagnostic and personalized recommendations in 5 minutes.',
    'home.cta_diagnostic': 'Start free diagnostic',
    'home.cta_catalogue': 'View catalogue',
    'home.free': 'Free',
    'home.minutes': '5 minutes',
    'home.no_commitment': 'No commitment',
    'home.how_title': 'How Solutio revolutionizes your productivity',
    'home.how_subtitle': 'A 3-step approach to identify, choose and implement the best automation solutions',
    'home.feature1_title': 'Intelligent AI Diagnostic',
    'home.feature1_desc': 'Our conversational assistant analyzes your processes with 6 targeted questions to identify tasks to automate.',
    'home.feature2_title': 'Personalized SaaS Catalogue',
    'home.feature2_desc': 'Discover a curated selection of SaaS solutions, tailored to your industry and specific needs.',
    'home.feature3_title': 'Custom Recommendations',
    'home.feature3_desc': 'Receive precise recommendations based on automation potential and implementation ease.',
    'home.why_title': 'Why choose Solutio?',
    'home.why_subtitle': 'We don\'t sell solutions, we find THE solution that fits you perfectly.',
    'home.benefit1_title': 'Save time',
    'home.benefit1_desc': 'Up to 70% time saved on your repetitive tasks',
    'home.benefit2_title': 'Reduce costs',
    'home.benefit2_desc': 'Average ROI of 300% from the first year',
    'home.benefit3_title': 'Targeted solutions',
    'home.benefit3_desc': 'Recommendations adapted to your industry and company size',
    'home.demo_cta': 'Request a personalized demo',
    'home.cta_title': 'Ready to automate your business?',
    'home.cta_subtitle': 'Start your free diagnostic now and discover how to save hours every week.',
    'home.diagnostic_5min': 'Free 5-min diagnostic',
    'home.explore_catalogue': 'Explore catalogue',
    'home.solutions_count': 'Referenced solutions',
    'home.satisfaction': 'Satisfied customers',
    'home.response_time': 'Response time',

    // Catalogue
    'catalogue.title': 'SaaS Catalogue',
    'catalogue.subtitle': 'Discover the best solutions to automate your business',
    'catalogue.search_placeholder': 'Search for a solution...',
    'catalogue.category_filter': 'Category',
    'catalogue.target_filter': 'Target',
    'catalogue.all_categories': 'All categories',
    'catalogue.all_targets': 'All targets',
    'catalogue.solutions_found': 'solution found',
    'catalogue.solutions_found_plural': 'solutions found',
    'catalogue.key_features': 'Key features:',
    'catalogue.view_detail': 'View details',
    'catalogue.no_results': 'No solutions found',
    'catalogue.modify_search': 'Try modifying your search criteria',

    // Footer
    'footer.tagline': 'Your partner for digital transformation and automation.',
    'footer.solutions': 'Solutions',
    'footer.support': 'Support',
    'footer.legal': 'Legal',
    'footer.legal_notice': 'Legal notice',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.copyright': '© 2024 Solutio. All rights reserved.'
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