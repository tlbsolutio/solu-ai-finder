import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";

const LegalEn = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>Legal Notice - Solutio</title>
        <meta name="description" content="Solutio Legal Notice - Legal information and publisher" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-slate max-w-none">
          <h1 className="text-4xl font-bold mb-8">Legal Notice – Solutio</h1>
          
          <div className="bg-muted/30 p-6 rounded-lg mb-8">
            <div className="grid gap-4">
              <div>
                <h3 className="font-semibold mb-2">Publisher</h3>
                <p>Solutio – Théo Le Breton (micro-enterprise)</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Address</h3>
                <p>1 bis Côte de la Maison Brûlée</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">SIREN (France)</h3>
                <p>853 851 335</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p><a href="mailto:tlb@solutio.work" className="text-primary underline">tlb@solutio.work</a></p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Phone</h3>
                <p>(not published)</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Publishing Director</h3>
                <p>Théo Le Breton</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Host</h3>
                <p>Hostinger</p>
              </div>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Intellectual property</h2>
            <p>All site content is protected.</p>
            <p>Contact: <a href="mailto:tlb@solutio.work" className="text-primary underline">tlb@solutio.work</a></p>
          </section>

          <div className="mt-12 text-sm text-muted-foreground">
            <p>Last update: {new Date().toLocaleDateString('en-US')}</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default LegalEn;