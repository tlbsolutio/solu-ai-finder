/**
 * SaaS Recommendations Catalog
 * Curated list of real SaaS tools organized by category,
 * matching the 10 cartographie diagnostic axes.
 *
 * Each tool has verified pricing, target audience, and use cases.
 * Used by the analysis engine to recommend concrete tools to users.
 */

export interface SaasRecommendation {
  nom: string;
  categorie: SaasCategorie;
  sous_categorie: string;
  description: string;
  cas_usage: string[];
  taille_cible: ("TPE" | "PME" | "ETI")[];
  prix_indicatif: string;
  modele_prix: "Freemium" | "Abonnement" | "Par utilisateur" | "Sur devis";
  site_url: string;
  origine: "FR" | "EU" | "US" | "Autre";
  hebergement_eu: boolean;
  integration_cles: string[];
  note_marche: string; // e.g. "Leader CRM PME France"
  alternative_a: string[]; // "Remplace Excel pour..."
}

export type SaasCategorie =
  | "CRM"
  | "ERP"
  | "Gestion de projet"
  | "RH"
  | "Communication"
  | "Comptabilite"
  | "Automatisation"
  | "BI & Reporting"
  | "Qualite & Conformite"
  | "Marketing"
  | "Collaboration"
  | "Service client"
  | "Gestion documentaire"
  | "Signature electronique";

/**
 * Maps diagnostic blocs to relevant SaaS categories
 */
export const BLOC_TO_CATEGORIES: Record<number, SaasCategorie[]> = {
  1: ["ERP", "Collaboration", "Gestion documentaire"], // Contexte & Organisation
  2: ["CRM", "Marketing", "Service client"], // Clients & Offres
  3: ["Gestion de projet", "Collaboration", "BI & Reporting"], // Organisation & Gouvernance
  4: ["RH", "Communication", "Collaboration"], // Ressources Humaines
  5: ["CRM", "Marketing", "Automatisation", "Signature electronique"], // Processus Commerciaux
  6: ["ERP", "Gestion de projet", "Automatisation"], // Processus Operationnels
  7: ["Automatisation", "ERP", "Collaboration"], // Outils & SI
  8: ["Communication", "Collaboration", "Gestion documentaire"], // Communication Interne
  9: ["Qualite & Conformite", "Gestion documentaire", "Automatisation"], // Qualite & Conformite
  10: ["BI & Reporting", "Comptabilite", "ERP"], // KPIs & Pilotage
};

export const SAAS_CATALOG: SaasRecommendation[] = [
  // ═══════════════════════════════════════
  // CRM
  // ═══════════════════════════════════════
  {
    nom: "HubSpot CRM",
    categorie: "CRM",
    sous_categorie: "CRM tout-en-un",
    description: "CRM gratuit avec modules marketing, vente et service. Interface intuitive, adoption rapide.",
    cas_usage: ["Gestion pipeline commercial", "Suivi contacts et entreprises", "Email marketing", "Automatisation vente"],
    taille_cible: ["TPE", "PME"],
    prix_indicatif: "Gratuit (core), 20-90€/mois/utilisateur (Pro)",
    modele_prix: "Freemium",
    site_url: "https://www.hubspot.fr",
    origine: "US",
    hebergement_eu: true,
    integration_cles: ["Gmail", "Outlook", "Slack", "Zapier", "WordPress"],
    note_marche: "Leader mondial CRM freemium, adoption facile",
    alternative_a: ["Excel pour le suivi commercial", "Fichiers contacts eparpilles"],
  },
  {
    nom: "Pipedrive",
    categorie: "CRM",
    sous_categorie: "CRM commercial",
    description: "CRM oriente pipeline de vente. Simplicite d'utilisation, ideal pour equipes commerciales.",
    cas_usage: ["Pipeline de vente visuel", "Suivi des deals", "Previsions de CA", "Reporting commercial"],
    taille_cible: ["TPE", "PME"],
    prix_indicatif: "14-99€/mois/utilisateur",
    modele_prix: "Par utilisateur",
    site_url: "https://www.pipedrive.com/fr",
    origine: "EU",
    hebergement_eu: true,
    integration_cles: ["Gmail", "Outlook", "Slack", "Zapier", "Trello"],
    note_marche: "Meilleur rapport qualite-prix CRM PME",
    alternative_a: ["Excel pour le suivi des devis", "Carnet de contacts"],
  },
  {
    nom: "Sellsy",
    categorie: "CRM",
    sous_categorie: "CRM + Facturation",
    description: "Solution francaise tout-en-un : CRM, devis, facturation, tresorerie. Conforme legislation francaise.",
    cas_usage: ["CRM + Facturation unifiee", "Devis et bons de commande", "Suivi tresorerie", "Relances automatiques"],
    taille_cible: ["TPE", "PME"],
    prix_indicatif: "29-99€/mois/utilisateur",
    modele_prix: "Par utilisateur",
    site_url: "https://www.sellsy.com",
    origine: "FR",
    hebergement_eu: true,
    integration_cles: ["Stripe", "PayPal", "Mailchimp", "Zapier", "Pennylane"],
    note_marche: "Leader CRM+Facturation francais, conforme FEC",
    alternative_a: ["Excel + logiciel comptable separe", "Devis manuels Word/Excel"],
  },
  {
    nom: "Zoho CRM",
    categorie: "CRM",
    sous_categorie: "CRM modulaire",
    description: "CRM complet et abordable. Fait partie de la suite Zoho (40+ apps).",
    cas_usage: ["Gestion leads", "Automatisation commerciale", "Scoring leads", "Multi-canal"],
    taille_cible: ["TPE", "PME", "ETI"],
    prix_indicatif: "Gratuit (3 users), 14-52€/mois/utilisateur",
    modele_prix: "Freemium",
    site_url: "https://www.zoho.com/fr/crm/",
    origine: "Autre",
    hebergement_eu: true,
    integration_cles: ["Google Workspace", "Microsoft 365", "Slack", "Zapier", "Mailchimp"],
    note_marche: "Meilleur CRM rapport fonctionnalites/prix",
    alternative_a: ["Fichiers Excel multiples", "CRM trop complexes type Salesforce"],
  },

  // ═══════════════════════════════════════
  // ERP
  // ═══════════════════════════════════════
  {
    nom: "Odoo",
    categorie: "ERP",
    sous_categorie: "ERP modulaire open source",
    description: "ERP open source modulaire : CRM, ventes, achats, inventaire, comptabilite, RH, projet. Plus de 40 modules.",
    cas_usage: ["Gestion complete entreprise", "Inventaire", "Achats", "Fabrication", "Comptabilite"],
    taille_cible: ["TPE", "PME", "ETI"],
    prix_indicatif: "Gratuit (1 app), 24-36€/mois/utilisateur",
    modele_prix: "Freemium",
    site_url: "https://www.odoo.com/fr_FR",
    origine: "EU",
    hebergement_eu: true,
    integration_cles: ["Amazon", "eBay", "UPS", "FedEx", "Stripe"],
    note_marche: "ERP open source le plus deploye au monde",
    alternative_a: ["Excel pour la gestion", "Multiples logiciels non connectes"],
  },
  {
    nom: "Axonaut",
    categorie: "ERP",
    sous_categorie: "ERP TPE/PME francais",
    description: "ERP francais tout-en-un pour TPE/PME : CRM, facturation, comptabilite, RH, tresorerie.",
    cas_usage: ["Facturation conforme", "Suivi tresorerie", "Gestion RH basique", "Reporting"],
    taille_cible: ["TPE", "PME"],
    prix_indicatif: "49-99€/mois (forfait, pas par utilisateur)",
    modele_prix: "Abonnement",
    site_url: "https://www.axonaut.com",
    origine: "FR",
    hebergement_eu: true,
    integration_cles: ["Stripe", "GoCardless", "Pennylane", "Zapier"],
    note_marche: "ERP francais reference pour TPE, prix forfaitaire",
    alternative_a: ["Multiples outils non connectes", "Excel + comptable externe uniquement"],
  },

  // ═══════════════════════════════════════
  // Gestion de projet
  // ═══════════════════════════════════════
  {
    nom: "Monday.com",
    categorie: "Gestion de projet",
    sous_categorie: "Work OS",
    description: "Plateforme de gestion du travail visuelle et flexible. Tableaux, timelines, automatisations.",
    cas_usage: ["Gestion de projets", "Suivi des taches", "Planification", "Collaboration equipe"],
    taille_cible: ["TPE", "PME", "ETI"],
    prix_indicatif: "Gratuit (2 users), 9-19€/mois/utilisateur",
    modele_prix: "Freemium",
    site_url: "https://monday.com/lang/fr",
    origine: "US",
    hebergement_eu: true,
    integration_cles: ["Slack", "Gmail", "Outlook", "Jira", "GitHub", "Zapier"],
    note_marche: "Plateforme de travail la plus flexible",
    alternative_a: ["Suivi de projet sur Excel", "Emails pour la coordination"],
  },
  {
    nom: "Notion",
    categorie: "Gestion de projet",
    sous_categorie: "Espace de travail tout-en-un",
    description: "Wiki, gestion de projet, bases de donnees, notes. Espace de travail modulaire.",
    cas_usage: ["Base de connaissances", "Gestion de projet legere", "Documentation", "Wiki interne"],
    taille_cible: ["TPE", "PME"],
    prix_indicatif: "Gratuit (personnel), 8-15€/mois/utilisateur",
    modele_prix: "Freemium",
    site_url: "https://www.notion.so",
    origine: "US",
    hebergement_eu: true,
    integration_cles: ["Slack", "Google Drive", "Figma", "Jira", "GitHub"],
    note_marche: "Outil productivite le plus adopte par les startups",
    alternative_a: ["Documents Word eparpilles", "Confluence trop complexe"],
  },
  {
    nom: "Asana",
    categorie: "Gestion de projet",
    sous_categorie: "Gestion de projet structuree",
    description: "Gestion de projets et taches avec vues multiples, timelines et automatisations.",
    cas_usage: ["Planification projets", "Suivi taches equipe", "Workflows", "Reporting projet"],
    taille_cible: ["PME", "ETI"],
    prix_indicatif: "Gratuit (basique), 11-25€/mois/utilisateur",
    modele_prix: "Freemium",
    site_url: "https://asana.com/fr",
    origine: "US",
    hebergement_eu: true,
    integration_cles: ["Slack", "Google Workspace", "Microsoft Teams", "Salesforce", "Jira"],
    note_marche: "Reference gestion de projet pour equipes structurees",
    alternative_a: ["Fichiers Excel partages", "Emails pour le suivi des taches"],
  },

  // ═══════════════════════════════════════
  // RH
  // ═══════════════════════════════════════
  {
    nom: "Lucca",
    categorie: "RH",
    sous_categorie: "SIRH modulaire",
    description: "Suite RH francaise modulaire : conges, notes de frais, temps, entretiens, paie. RGPD natif.",
    cas_usage: ["Gestion conges/absences", "Notes de frais", "Suivi du temps", "Entretiens annuels"],
    taille_cible: ["PME", "ETI"],
    prix_indicatif: "A partir de 5€/mois/collaborateur par module",
    modele_prix: "Par utilisateur",
    site_url: "https://www.lucca.fr",
    origine: "FR",
    hebergement_eu: true,
    integration_cles: ["PayFit", "Silae", "Sage", "ADP", "Google Workspace"],
    note_marche: "Leader SIRH francais pour PME, UX exemplaire",
    alternative_a: ["Excel pour le suivi des conges", "Process papier RH"],
  },
  {
    nom: "PayFit",
    categorie: "RH",
    sous_categorie: "Paie et administration",
    description: "Solution de paie automatisee pour PME. Bulletins de paie, declarations sociales, conges.",
    cas_usage: ["Bulletins de paie automatises", "Declarations sociales", "Onboarding", "Portail salarie"],
    taille_cible: ["TPE", "PME"],
    prix_indicatif: "29-79€/mois + 19-29€/mois/collaborateur",
    modele_prix: "Par utilisateur",
    site_url: "https://payfit.com/fr/",
    origine: "FR",
    hebergement_eu: true,
    integration_cles: ["Lucca", "Pennylane", "Qonto", "Slack"],
    note_marche: "Reference paie PME en France",
    alternative_a: ["Cabinet comptable uniquement pour la paie", "Calculs manuels"],
  },
  {
    nom: "BambooHR",
    categorie: "RH",
    sous_categorie: "SIRH tout-en-un",
    description: "Plateforme RH complete : recrutement, onboarding, performance, reporting. Simple et efficace.",
    cas_usage: ["Recrutement (ATS)", "Onboarding", "Evaluations performance", "Reporting RH"],
    taille_cible: ["PME", "ETI"],
    prix_indicatif: "A partir de 5€/mois/collaborateur",
    modele_prix: "Par utilisateur",
    site_url: "https://www.bamboohr.com",
    origine: "US",
    hebergement_eu: false,
    integration_cles: ["Slack", "Google Workspace", "Microsoft 365", "Indeed", "LinkedIn"],
    note_marche: "SIRH americain reference pour PME",
    alternative_a: ["Fichiers Excel RH", "Process recrutement non structure"],
  },

  // ═══════════════════════════════════════
  // Communication & Collaboration
  // ═══════════════════════════════════════
  {
    nom: "Slack",
    categorie: "Communication",
    sous_categorie: "Messagerie d'equipe",
    description: "Messagerie instantanee professionnelle avec canaux thematiques, integrations et automations.",
    cas_usage: ["Communication equipe", "Canaux par projet/service", "Integrations outils", "Notifications centralisees"],
    taille_cible: ["TPE", "PME", "ETI"],
    prix_indicatif: "Gratuit (basique), 7-12€/mois/utilisateur",
    modele_prix: "Freemium",
    site_url: "https://slack.com/intl/fr-fr",
    origine: "US",
    hebergement_eu: true,
    integration_cles: ["Google Workspace", "Microsoft 365", "Asana", "Jira", "HubSpot", "Notion"],
    note_marche: "Standard de facto en messagerie professionnelle",
    alternative_a: ["WhatsApp pro", "Emails internes"],
  },
  {
    nom: "Microsoft Teams",
    categorie: "Communication",
    sous_categorie: "Communication unifiee",
    description: "Chat, visioconference, collaboration fichiers. Integre a Microsoft 365.",
    cas_usage: ["Visioconference", "Chat equipe", "Collaboration fichiers", "Telephonie"],
    taille_cible: ["PME", "ETI"],
    prix_indicatif: "Inclus dans Microsoft 365 (a partir de 6€/mois/utilisateur)",
    modele_prix: "Par utilisateur",
    site_url: "https://www.microsoft.com/fr-fr/microsoft-teams/group-chat-software",
    origine: "US",
    hebergement_eu: true,
    integration_cles: ["Microsoft 365", "SharePoint", "Power BI", "Dynamics 365"],
    note_marche: "Incontournable si deja equipe Microsoft",
    alternative_a: ["Multiples outils (mail + visio + chat)", "WhatsApp professionnel"],
  },
  {
    nom: "Google Workspace",
    categorie: "Collaboration",
    sous_categorie: "Suite collaborative cloud",
    description: "Gmail, Drive, Docs, Sheets, Meet, Calendar. Suite collaborative complete dans le cloud.",
    cas_usage: ["Email professionnel", "Stockage cloud", "Edition collaborative", "Visioconference"],
    taille_cible: ["TPE", "PME", "ETI"],
    prix_indicatif: "6-18€/mois/utilisateur",
    modele_prix: "Par utilisateur",
    site_url: "https://workspace.google.com/intl/fr/",
    origine: "US",
    hebergement_eu: true,
    integration_cles: ["Slack", "Asana", "HubSpot", "Zapier", "Notion"],
    note_marche: "Suite collaborative la plus utilisee au monde",
    alternative_a: ["Fichiers locaux non partages", "Email gratuit non professionnel"],
  },

  // ═══════════════════════════════════════
  // Comptabilite & Finance
  // ═══════════════════════════════════════
  {
    nom: "Pennylane",
    categorie: "Comptabilite",
    sous_categorie: "Comptabilite collaborative",
    description: "Plateforme comptable collaborative entre l'entreprise et son expert-comptable. Automatisation des ecritures.",
    cas_usage: ["Comptabilite automatisee", "Collaboration expert-comptable", "Suivi tresorerie", "Reporting financier"],
    taille_cible: ["TPE", "PME"],
    prix_indicatif: "14-49€/mois (+ honoraires comptable)",
    modele_prix: "Abonnement",
    site_url: "https://www.pennylane.com",
    origine: "FR",
    hebergement_eu: true,
    integration_cles: ["Qonto", "Stripe", "PayFit", "Sellsy", "GoCardless"],
    note_marche: "Licorne francaise fintech, revolution comptable PME",
    alternative_a: ["Comptabilite 100% externalisee", "Saisie manuelle des ecritures"],
  },
  {
    nom: "Qonto",
    categorie: "Comptabilite",
    sous_categorie: "Banque pro en ligne",
    description: "Compte pro en ligne avec cartes, virements, gestion des depenses, export comptable automatique.",
    cas_usage: ["Compte bancaire pro", "Cartes equipe avec plafonds", "Notes de frais", "Export comptable"],
    taille_cible: ["TPE", "PME"],
    prix_indicatif: "9-39€/mois + 5€/mois/carte supplementaire",
    modele_prix: "Abonnement",
    site_url: "https://qonto.com/fr",
    origine: "FR",
    hebergement_eu: true,
    integration_cles: ["Pennylane", "Sage", "Cegid", "Sellsy", "Slack"],
    note_marche: "Leader neobanque pro en France",
    alternative_a: ["Banque traditionnelle avec peu de fonctionnalites digitales"],
  },

  // ═══════════════════════════════════════
  // Automatisation
  // ═══════════════════════════════════════
  {
    nom: "Make (ex-Integromat)",
    categorie: "Automatisation",
    sous_categorie: "Automatisation no-code",
    description: "Plateforme d'automatisation visuelle. Connecte des centaines d'apps sans code.",
    cas_usage: ["Automatisation workflows", "Synchronisation donnees", "Alertes automatiques", "Integration inter-apps"],
    taille_cible: ["TPE", "PME", "ETI"],
    prix_indicatif: "Gratuit (1000 ops), 9-29€/mois",
    modele_prix: "Freemium",
    site_url: "https://www.make.com",
    origine: "EU",
    hebergement_eu: true,
    integration_cles: ["Google Workspace", "Slack", "HubSpot", "Shopify", "Notion", "Airtable"],
    note_marche: "Alternative europeenne a Zapier, plus puissante visuellement",
    alternative_a: ["Process manuels repetitifs", "Copier-coller entre applications"],
  },
  {
    nom: "Zapier",
    categorie: "Automatisation",
    sous_categorie: "Automatisation inter-apps",
    description: "Connecte plus de 6000 applications. Automatise les taches repetitives sans code.",
    cas_usage: ["Automatisation taches", "Connexion inter-outils", "Notifications", "Synchronisation CRM"],
    taille_cible: ["TPE", "PME", "ETI"],
    prix_indicatif: "Gratuit (100 taches), 19-69€/mois",
    modele_prix: "Freemium",
    site_url: "https://zapier.com",
    origine: "US",
    hebergement_eu: false,
    integration_cles: ["6000+ applications"],
    note_marche: "Leader mondial automatisation no-code",
    alternative_a: ["Saisie manuelle dans plusieurs outils", "Exports/imports CSV"],
  },
  {
    nom: "n8n",
    categorie: "Automatisation",
    sous_categorie: "Automatisation open source",
    description: "Plateforme d'automatisation open source, auto-hebergeable. Alternative a Zapier/Make pour les equipes techniques.",
    cas_usage: ["Automatisation complexe", "Workflows avec logique", "Integration API", "Self-hosting donnees sensibles"],
    taille_cible: ["PME", "ETI"],
    prix_indicatif: "Gratuit (self-hosted), 20€/mois (cloud)",
    modele_prix: "Freemium",
    site_url: "https://n8n.io",
    origine: "EU",
    hebergement_eu: true,
    integration_cles: ["400+ integrations", "API REST", "Webhooks", "Bases de donnees"],
    note_marche: "Meilleure option pour donnees sensibles (self-hosted)",
    alternative_a: ["Scripts manuels", "Developpement custom couteux"],
  },

  // ═══════════════════════════════════════
  // BI & Reporting
  // ═══════════════════════════════════════
  {
    nom: "Metabase",
    categorie: "BI & Reporting",
    sous_categorie: "BI open source",
    description: "Outil BI open source. Tableaux de bord, requetes visuelles, partage. Simple a deployer.",
    cas_usage: ["Dashboards KPI", "Exploration donnees", "Rapports automatises", "Self-service analytics"],
    taille_cible: ["PME", "ETI"],
    prix_indicatif: "Gratuit (open source), 85€/mois (cloud)",
    modele_prix: "Freemium",
    site_url: "https://www.metabase.com",
    origine: "US",
    hebergement_eu: true,
    integration_cles: ["PostgreSQL", "MySQL", "Google BigQuery", "Snowflake"],
    note_marche: "BI open source le plus deploye",
    alternative_a: ["Reporting sur Excel", "Pas de dashboard centralise"],
  },
  {
    nom: "Power BI",
    categorie: "BI & Reporting",
    sous_categorie: "BI enterprise",
    description: "Outil BI Microsoft. Dashboards interactifs, connecteurs multiples, AI insights.",
    cas_usage: ["Dashboards direction", "Reporting automatise", "Analyse predictive", "KPI temps reel"],
    taille_cible: ["PME", "ETI"],
    prix_indicatif: "Gratuit (desktop), 9-19€/mois/utilisateur (Pro)",
    modele_prix: "Freemium",
    site_url: "https://powerbi.microsoft.com/fr-fr/",
    origine: "US",
    hebergement_eu: true,
    integration_cles: ["Microsoft 365", "Azure", "Dynamics 365", "SQL Server", "Salesforce"],
    note_marche: "Leader BI si environnement Microsoft",
    alternative_a: ["Tableaux Excel manuels", "Reporting artisanal"],
  },
  {
    nom: "Google Looker Studio",
    categorie: "BI & Reporting",
    sous_categorie: "BI gratuit",
    description: "Outil de reporting gratuit de Google. Dashboards personnalises, multiples connecteurs.",
    cas_usage: ["Dashboards marketing", "Reporting Google Ads/Analytics", "KPI visuels", "Rapports partageables"],
    taille_cible: ["TPE", "PME"],
    prix_indicatif: "Gratuit",
    modele_prix: "Freemium",
    site_url: "https://lookerstudio.google.com",
    origine: "US",
    hebergement_eu: true,
    integration_cles: ["Google Analytics", "Google Ads", "Google Sheets", "BigQuery", "MySQL"],
    note_marche: "Meilleur outil BI gratuit",
    alternative_a: ["Reporting manuel sur Excel", "Screenshots de dashboards"],
  },

  // ═══════════════════════════════════════
  // Qualite & Conformite
  // ═══════════════════════════════════════
  {
    nom: "Dipeeo",
    categorie: "Qualite & Conformite",
    sous_categorie: "RGPD / DPO externalise",
    description: "Solution francaise de mise en conformite RGPD avec DPO externalise. Audit, registre, formation.",
    cas_usage: ["Conformite RGPD", "Registre des traitements", "Analyse d'impact", "Formation equipes"],
    taille_cible: ["TPE", "PME"],
    prix_indicatif: "A partir de 299€/mois",
    modele_prix: "Abonnement",
    site_url: "https://www.dipeeo.com",
    origine: "FR",
    hebergement_eu: true,
    integration_cles: [],
    note_marche: "Leader DPO externalise France",
    alternative_a: ["Pas de conformite RGPD structuree"],
  },
  {
    nom: "Qualios",
    categorie: "Qualite & Conformite",
    sous_categorie: "Gestion qualite (SMQ)",
    description: "Logiciel de gestion qualite francais : processus, documents, audits, non-conformites, indicateurs.",
    cas_usage: ["Systeme management qualite", "Gestion documentaire ISO", "Audits internes", "Non-conformites"],
    taille_cible: ["PME", "ETI"],
    prix_indicatif: "Sur devis (environ 200-500€/mois)",
    modele_prix: "Sur devis",
    site_url: "https://www.qualios.com",
    origine: "FR",
    hebergement_eu: true,
    integration_cles: ["ERP", "Outlook", "Active Directory"],
    note_marche: "Reference SMQ francais pour PME",
    alternative_a: ["Documents qualite sur serveur partage", "Process papier"],
  },

  // ═══════════════════════════════════════
  // Marketing
  // ═══════════════════════════════════════
  {
    nom: "Brevo (ex-Sendinblue)",
    categorie: "Marketing",
    sous_categorie: "Marketing automation",
    description: "Plateforme marketing francaise : email, SMS, chat, CRM, automation. Alternative abordable a HubSpot.",
    cas_usage: ["Email marketing", "Marketing automation", "SMS campaigns", "Landing pages"],
    taille_cible: ["TPE", "PME"],
    prix_indicatif: "Gratuit (300 emails/jour), 25-65€/mois",
    modele_prix: "Freemium",
    site_url: "https://www.brevo.com/fr/",
    origine: "FR",
    hebergement_eu: true,
    integration_cles: ["WordPress", "Shopify", "Salesforce", "Google Analytics", "Zapier"],
    note_marche: "Alternative francaise a Mailchimp, RGPD natif",
    alternative_a: ["Envois email manuels", "Newsletter artisanale"],
  },
  {
    nom: "Plezi",
    categorie: "Marketing",
    sous_categorie: "Marketing B2B",
    description: "Plateforme de marketing automation B2B francaise. Lead nurturing, scoring, contenus intelligents.",
    cas_usage: ["Lead generation B2B", "Content marketing", "Lead scoring", "Nurturing automatise"],
    taille_cible: ["PME", "ETI"],
    prix_indicatif: "A partir de 169€/mois",
    modele_prix: "Abonnement",
    site_url: "https://www.plezi.co",
    origine: "FR",
    hebergement_eu: true,
    integration_cles: ["Salesforce", "HubSpot", "Pipedrive", "WordPress", "LinkedIn"],
    note_marche: "Leader marketing automation B2B en France",
    alternative_a: ["Marketing manuel sans automation", "Envois email non segmentes"],
  },

  // ═══════════════════════════════════════
  // Service client
  // ═══════════════════════════════════════
  {
    nom: "Zendesk",
    categorie: "Service client",
    sous_categorie: "Helpdesk & Support",
    description: "Plateforme de support client multi-canal : tickets, chat, base de connaissances, telephonie.",
    cas_usage: ["Support client ticketing", "Base de connaissances", "Chat en direct", "Reporting satisfaction"],
    taille_cible: ["PME", "ETI"],
    prix_indicatif: "19-55€/mois/agent",
    modele_prix: "Par utilisateur",
    site_url: "https://www.zendesk.fr",
    origine: "US",
    hebergement_eu: true,
    integration_cles: ["Slack", "Salesforce", "Shopify", "Jira", "Zapier"],
    note_marche: "Leader mondial support client PME/ETI",
    alternative_a: ["Support par email non structure", "Pas de suivi des demandes"],
  },
  {
    nom: "Crisp",
    categorie: "Service client",
    sous_categorie: "Chat & Support",
    description: "Plateforme de messagerie client francaise : chat, chatbot, base de connaissances, CRM integre.",
    cas_usage: ["Chat en direct site web", "Chatbot", "Base de connaissances", "Support multi-canal"],
    taille_cible: ["TPE", "PME"],
    prix_indicatif: "Gratuit (2 agents), 25-95€/mois",
    modele_prix: "Freemium",
    site_url: "https://crisp.chat/fr/",
    origine: "FR",
    hebergement_eu: true,
    integration_cles: ["WordPress", "Shopify", "Slack", "Zapier", "WhatsApp"],
    note_marche: "Alternative francaise a Intercom, prix accessible",
    alternative_a: ["Formulaire de contact basique", "Support email uniquement"],
  },

  // ═══════════════════════════════════════
  // Gestion documentaire & Signature
  // ═══════════════════════════════════════
  {
    nom: "Yousign",
    categorie: "Signature electronique",
    sous_categorie: "Signature electronique",
    description: "Solution de signature electronique francaise, conforme eIDAS. Simple, rapide, legalement valide.",
    cas_usage: ["Signature de contrats", "Devis a signer", "Documents RH", "Baux et mandats"],
    taille_cible: ["TPE", "PME", "ETI"],
    prix_indicatif: "Gratuit (5/mois), 25-50€/mois",
    modele_prix: "Freemium",
    site_url: "https://yousign.com/fr-fr",
    origine: "FR",
    hebergement_eu: true,
    integration_cles: ["Salesforce", "HubSpot", "Sellsy", "Zapier", "API REST"],
    note_marche: "Leader signature electronique en France",
    alternative_a: ["Impression + scan + envoi postal", "DocuSign (US, plus cher)"],
  },
];

/**
 * Get recommended SaaS tools for a specific diagnostic bloc
 */
export function getRecommendationsForBloc(bloc: number, tailleEntreprise?: "TPE" | "PME" | "ETI"): SaasRecommendation[] {
  const categories = BLOC_TO_CATEGORIES[bloc] || [];
  let filtered = SAAS_CATALOG.filter(s => categories.includes(s.categorie));
  if (tailleEntreprise) {
    filtered = filtered.filter(s => s.taille_cible.includes(tailleEntreprise));
  }
  return filtered;
}

/**
 * Get recommended SaaS tools matching detected irritants/issues
 */
export function getRecommendationsForIssues(issues: string[]): SaasRecommendation[] {
  const issuesLower = issues.map(i => i.toLowerCase());
  return SAAS_CATALOG.filter(saas => {
    const searchText = [
      ...saas.cas_usage,
      ...saas.alternative_a,
      saas.description,
      saas.sous_categorie,
    ].join(" ").toLowerCase();
    return issuesLower.some(issue => {
      const keywords = issue.split(/\s+/).filter(w => w.length > 3);
      return keywords.some(kw => searchText.includes(kw));
    });
  });
}

/**
 * Format SaaS recommendation for display
 */
export function formatRecommendation(saas: SaasRecommendation): string {
  const flags = [];
  if (saas.origine === "FR") flags.push("Francais");
  if (saas.hebergement_eu) flags.push("Hebergement UE");
  if (saas.modele_prix === "Freemium") flags.push("Version gratuite");
  return `${saas.nom} — ${saas.description} | ${saas.prix_indicatif} | ${flags.join(", ")}`;
}
