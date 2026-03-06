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
  image = 'https://solutio.work/lovable-uploads/c8143545-6b97-49dd-85ba-65b954b9e501.png',
  url,
  type = 'website',
  noIndex = false,
  keywords,
}) => {
  const { language } = useLanguage();

  const siteTitle = 'Solutio — Outils & Conseil en Transformation Digitale';
  const fullTitle = title || siteTitle;
  const defaultDescription = 'Solutio aide les professionnels a se concentrer sur ce qui leur rapporte. Cartographie organisationnelle gratuite, developpement de systemes sur mesure et accompagnement transformation digitale pour equipes ambitieuses.';
  const metaDescription = description || defaultDescription;
  const currentUrl = url || window.location.href;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="language" content={language} />
      <link rel="canonical" href={currentUrl} />

      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Solutio" />
      <meta property="og:locale" content={language === 'fr' ? 'fr_FR' : 'en_US'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />

      <meta name="author" content="Solutio" />
      <meta name="theme-color" content="#2563eb" />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://flolwmwyfgmvascfrahy.supabase.co" />
    </Helmet>
  );
};

export default MetaTags;
