import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";

const Cookies = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>Politique cookies - Solutio</title>
        <meta name="description" content="Politique cookies de Solutio - Gestion des traceurs et consentement" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-slate max-w-none">
          <h1 className="text-4xl font-bold mb-8">Politique cookies – Solutio</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Utilisation des cookies</h2>
            <p>Nous utilisons des cookies et technologies similaires pour :</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Essentiels :</strong> fonctionnement et sécurité du site.</li>
              <li><strong>Analytics (GA4) :</strong> mesure d'audience (uniquement après consentement).</li>
              <li><strong>Affiliation (CJ, Reditus) :</strong> suivi des ventes provenant de nos liens (après consentement).</li>
              <li><strong>Marketing :</strong> mesure publicitaire et personnalisation (après consentement).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Consentement</h2>
            <p>Lors de votre première visite, une bannière vous permet d'Accepter, Refuser ou Personnaliser.</p>
            <p>Vous pouvez revenir sur votre choix à tout moment via 
              <a href="#" onClick={() => (window as any).openCookieSettings?.()} className="text-primary underline ml-1">
                « Paramètres des cookies »
              </a> en bas de page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Catégories gérées</h2>
            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Essentiels</h3>
                <p className="text-sm text-muted-foreground">Toujours actifs.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Analytics</h3>
                <p className="text-sm text-muted-foreground">Soumis à « analytics_storage » (Consent Mode).</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Affiliation</h3>
                <p className="text-sm text-muted-foreground">Soumis à « ad_storage ».</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Marketing</h3>
                <p className="text-sm text-muted-foreground">« ad_user_data » et « ad_personalization ».</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Gestion</h2>
            <p>Vos préférences sont enregistrées localement sur votre appareil.</p>
            <div className="mt-4">
              <button 
                onClick={() => (window as any).openCookieSettings?.()}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Gérer mes préférences
              </button>
            </div>
          </section>

          <div className="mt-12 text-sm text-muted-foreground">
            <p>Mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default Cookies;