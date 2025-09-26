import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";

const CookiesEn = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>Cookies Policy - Solutio</title>
        <meta name="description" content="Solutio Cookies Policy - Trackers management and consent" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-slate max-w-none">
          <h1 className="text-4xl font-bold mb-8">Cookies Policy – Solutio</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookie usage</h2>
            <p>We use cookies and similar tech for:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Essential:</strong> site operation and security.</li>
              <li><strong>Analytics (GA4):</strong> audience measurement (after consent).</li>
              <li><strong>Affiliate (CJ, Reditus):</strong> track sales from our links (after consent).</li>
              <li><strong>Marketing:</strong> advertising measurement & personalization (after consent).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Consent</h2>
            <p>On your first visit, a banner lets you Accept, Reject or Customize.</p>
            <p>You can change your choices anytime via 
              <a href="#" onClick={() => (window as any).openCookieSettings?.()} className="text-primary underline ml-1">
                "Cookie settings"
              </a> in the footer.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Categories</h2>
            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Essential</h3>
                <p className="text-sm text-muted-foreground">Always on.</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Analytics</h3>
                <p className="text-sm text-muted-foreground">Requires "analytics_storage".</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Affiliate</h3>
                <p className="text-sm text-muted-foreground">Requires "ad_storage".</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Marketing</h3>
                <p className="text-sm text-muted-foreground">Requires "ad_user_data" & "ad_personalization".</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Storage</h2>
            <p>Your preferences are saved locally on your device.</p>
            <div className="mt-4">
              <button 
                onClick={() => (window as any).openCookieSettings?.()}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Manage preferences
              </button>
            </div>
          </section>

          <div className="mt-12 text-sm text-muted-foreground">
            <p>Last update: {new Date().toLocaleDateString('en-US')}</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default CookiesEn;