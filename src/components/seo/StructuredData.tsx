import React from 'react';
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'Organization' | 'Product' | 'Article' | 'FAQPage' | 'Service' | 'WebSite';
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
          url: "https://solutio.work",
          logo: "https://solutio.work/lovable-uploads/876ba1fd-d1e8-4a94-939e-0a2357028335.png",
          contactPoint: {
            "@type": "ContactPoint",
            email: "tlb@solutio.work",
            contactType: "customer service",
            availableLanguage: ["French", "English"]
          },
          sameAs: [
            "https://www.linkedin.com/company/solutio-work/",
            "https://www.linkedin.com/in/theo-le-breton/"
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
      
      case 'WebSite':
        return {
          ...baseData,
          url: data.url || "https://solutio.work",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${data.url || "https://solutio.work"}/catalogue?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
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