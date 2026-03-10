import React from 'react';
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'Organization' | 'Product' | 'Article' | 'FAQPage' | 'Service' | 'WebSite' | 'ProfessionalService';
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
            email: "contact@solutio.work",
            contactType: "customer service",
            availableLanguage: ["French", "English"]
          },
          sameAs: [
            "https://www.linkedin.com/company/solutio-work/",
            "https://www.linkedin.com/in/theo-le-breton/"
          ],
          offers: [
            {
              "@type": "Offer",
              name: "Cartographie Organisationnelle",
              description: "Scan gratuit en 5 minutes pour identifier vos axes d'optimisation.",
              price: "0",
              priceCurrency: "EUR",
              url: "https://solutio.work/#outils"
            },
            {
              "@type": "Offer",
              name: "Accompagnement Transformation Digitale",
              description: "Diagnostic, architecture des solutions, deploiement et suivi sur mesure.",
              url: "https://solutio.work/#accompagnement"
            }
          ]
        };

      case 'ProfessionalService':
        return {
          ...baseData,
          url: "https://solutio.work",
          logo: "https://solutio.work/lovable-uploads/876ba1fd-d1e8-4a94-939e-0a2357028335.png",
          serviceType: [
            "Transformation digitale",
            "Developpement logiciel sur mesure",
            "Cartographie organisationnelle",
            "Conseil en organisation"
          ],
          areaServed: {
            "@type": "Country",
            name: "France"
          },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Produits & Services Solutio",
            itemListElement: [
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "SoftwareApplication",
                  name: "Cartographie Organisationnelle",
                  applicationCategory: "BusinessApplication",
                  description: "Outil de cartographie organisationnelle — scan gratuit en 5 minutes, radar de maturite, plan d'action priorise."
                }
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "SoftwareApplication",
                  name: "Lead Scraper",
                  applicationCategory: "BusinessApplication",
                  description: "Generation de leads ultra-cibles pour entrepreneurs, freelances et TPE."
                }
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Developpement sur mesure",
                  description: "Conception et developpement de systemes applicatifs tailles pour votre organisation."
                }
              }
            ]
          }
        };

      case 'Service':
        return {
          ...baseData,
          provider: {
            "@type": "Organization",
            name: "Solutio",
            url: "https://solutio.work"
          },
          serviceType: "Digital Transformation Consulting",
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
          inLanguage: "fr-FR",
          publisher: {
            "@type": "Organization",
            name: "Solutio",
            url: "https://solutio.work"
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
