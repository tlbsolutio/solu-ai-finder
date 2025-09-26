import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";

const PrivacyEn = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>Privacy Policy - Solutio</title>
        <meta name="description" content="Solutio Privacy Policy - Personal data protection and cookies" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-slate max-w-none">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy – Solutio</h1>
          
          <div className="bg-muted/30 p-6 rounded-lg mb-8">
            <p><strong>Publisher:</strong> Solutio (micro-enterprise) – Théo Le Breton</p>
            <p><strong>Address:</strong> 1 bis Côte de la Maison Brûlée</p>
            <p><strong>SIREN (France):</strong> 853 851 335</p>
            <p><strong>Host:</strong> Hostinger</p>
            <p><strong>Contact:</strong> tlb@solutio.work</p>
            <p><strong>DPO / Data Controller:</strong> Théo Le Breton</p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1) Data we collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Browsing data (after consent) via Google Analytics 4.</li>
              <li>Affiliate data (clicks on CJ Affiliate / Reditus links) to measure sales and commissions.</li>
              <li>Form submissions (Formspree) and scheduling data (Calendly).</li>
              <li>Internal operations data (Airtable) and technical logs (security).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2) Purposes</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide Solutio's service (SaaS diagnostics and recommendations).</li>
              <li>Audience measurement and site improvement.</li>
              <li>Affiliate remuneration (tracking of consented clicks/sales).</li>
              <li>Respond to requests and manage customer relationships.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3) Legal basis</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Consent (analytics/affiliate/marketing cookies).</li>
              <li>Legitimate interest (security, fraud prevention, logs).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4) Recipients / Processors</h2>
            <p>Google (Analytics, Tag Manager); CJ Affiliate; Reditus; Calendly; Formspree; Airtable.</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Some providers may be outside the EU; appropriate safeguards are applied.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5) Retention</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Analytics: up to 14 months.</li>
              <li>Contacts: as long as needed for support and business.</li>
              <li>Technical logs: per legal obligations.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6) Your rights</h2>
            <p>Access, rectification, erasure, objection, restriction, portability.</p>
            <p>Contact: <a href="mailto:tlb@solutio.work" className="text-primary underline">tlb@solutio.work</a></p>
            <p>You can change cookie choices anytime via 
              <a href="#" onClick={() => (window as any).openCookieSettings?.()} className="text-primary underline ml-1">
                "Cookie settings"
              </a> in the footer.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7) Cookies</h2>
            <p>See <a href="/cookies-en" className="text-primary underline">Cookies Policy</a></p>
          </section>

          <div className="mt-12 text-sm text-muted-foreground">
            <p>Last update: {new Date().toLocaleDateString('en-US')}</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default PrivacyEn;