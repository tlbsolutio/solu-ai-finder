import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  keywords?: string;
}

const MetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  image = '/lovable-uploads/876ba1fd-d1e8-4a94-939e-0a2357028335.png',
  url,
  type = 'website',
  noIndex = false,
  keywords,
}) => {
  const { language } = useLanguage();
  
  const siteTitle = 'Solutio | Diagnostic & comparateur SaaS pour PME';
  const fullTitle = title || siteTitle;
  const defaultDescription = 'Bénéficiez d\'un diagnostic gratuit pour trouver et automatiser vos SaaS. Solutio compare et recommande les meilleurs outils pour PME et freelances.';
  const metaDescription = description || defaultDescription;
  const currentUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="language" content={language} />
      <link rel="canonical" href={currentUrl} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Solutio" />
      <meta property="og:locale" content={language === 'fr' ? 'fr_FR' : 'en_US'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="author" content="Solutio" />
      <meta name="theme-color" content="#3b82f6" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://api.airtable.com" />
    </Helmet>
  );
};

export default MetaTags;