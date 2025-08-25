import React from 'react';
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'Organization' | 'Product' | 'Article' | 'FAQPage' | 'Service';
  data: any;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type,
      ...data
    };

    switch (type) {
      case 'Organization':
        return {
          ...baseData,
          url: "https://solutio.fr",
          logo: "https://solutio.fr/lovable-uploads/876ba1fd-d1e8-4a94-939e-0a2357028335.png",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+33-1-23-45-67-89",
            contactType: "customer service",
            availableLanguage: ["French", "English"]
          },
          sameAs: [
            // Add social media URLs when available
          ]
        };
      
      case 'Service':
        return {
          ...baseData,
          provider: {
            "@type": "Organization",
            name: "Solutio",
            url: "https://solutio.fr"
          },
          serviceType: "SaaS Consulting",
          areaServed: "FR"
        };
      
      case 'Product':
        return {
          ...baseData,
          brand: {
            "@type": "Brand",
            name: "Solutio"
          },
          offers: {
            "@type": "Offer",
            availability: "https://schema.org/InStock",
            priceCurrency: "EUR"
          }
        };
      
      case 'FAQPage':
        return {
          ...baseData,
          mainEntity: data.questions?.map((q: any) => ({
            "@type": "Question",
            name: q.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: q.answer
            }
          })) || []
        };
      
      default:
        return baseData;
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(getStructuredData())}
      </script>
    </Helmet>
  );
};

export default StructuredData;