import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";

const Privacy = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>Politique de confidentialité - Solutio</title>
        <meta name="description" content="Politique de confidentialité de Solutio - Protection des données personnelles et cookies" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-slate max-w-none">
          <h1 className="text-4xl font-bold mb-8">Politique de confidentialité – Solutio</h1>
          
          <div className="bg-muted/30 p-6 rounded-lg mb-8">
            <p><strong>Éditeur :</strong> Solutio (micro-entreprise) – Théo Le Breton</p>
            <p><strong>Adresse :</strong> 1 bis Côte de la Maison Brûlée</p>
            <p><strong>SIREN :</strong> 853 851 335</p>
            <p><strong>Hébergeur :</strong> Hostinger</p>
            <p><strong>Contact :</strong> tlb@solutio.work</p>
            <p><strong>DPO / Responsable du traitement :</strong> Théo Le Breton</p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1) Données que nous collectons</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Données de navigation (après consentement) via Google Analytics 4.</li>
              <li>Données d'affiliation (clics sur liens CJ Affiliate / Reditus) pour mesurer les ventes et nous rémunérer.</li>
              <li>Données fournies via formulaires (Formspree) et prise de rendez-vous (Calendly).</li>
              <li>Données internes de suivi (Airtable) et logs techniques (sécurité).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2) Finalités</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fournir le service Solutio (diagnostic, recommandations SaaS).</li>
              <li>Mesure d'audience et amélioration du site.</li>
              <li>Rémunération affiliée (traçage des ventes/clics consentis).</li>
              <li>Réponse aux demandes et gestion commerciale.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3) Base légale</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Consentement (cookies d'analyse/affiliation/marketing).</li>
              <li>Intérêt légitime (sécurité, prévention fraude, logs).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4) Destinataires / Sous-traitants</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Google (Analytics, Tag Manager).</li>
              <li>CJ Affiliate, Reditus (suivi d'affiliation).</li>
              <li>Calendly (rendez-vous).</li>
              <li>Formspree (formulaires).</li>
              <li>Airtable (organisation interne).</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Ces prestataires peuvent être situés hors UE ; des garanties appropriées sont mises en place.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5) Durées de conservation</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Analytics : 14 mois maximum.</li>
              <li>Contacts : le temps de traiter la demande et la relation commerciale.</li>
              <li>Logs techniques : conformément aux obligations légales.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6) Vos droits</h2>
            <p>Accès, rectification, effacement, opposition, limitation, portabilité.</p>
            <p>Exercez vos droits à : <a href="mailto:tlb@solutio.work" className="text-primary underline">tlb@solutio.work</a></p>
            <p>Vous pouvez aussi définir vos préférences cookies à tout moment via 
              <a href="#" onClick={() => (window as any).openCookieSettings?.()} className="text-primary underline ml-1">
                « Paramètres des cookies »
              </a> en bas de page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7) Cookies</h2>
            <p>Voir la <a href="/cookies" className="text-primary underline">Politique cookies</a></p>
          </section>

          <div className="mt-12 text-sm text-muted-foreground">
            <p>Mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default Privacy;