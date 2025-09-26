import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";

const Legal = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>Mentions légales - Solutio</title>
        <meta name="description" content="Mentions légales de Solutio - Informations légales et éditeur" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-slate max-w-none">
          <h1 className="text-4xl font-bold mb-8">Mentions légales – Solutio</h1>
          
          <div className="bg-muted/30 p-6 rounded-lg mb-8">
            <div className="grid gap-4">
              <div>
                <h3 className="font-semibold mb-2">Éditeur du site</h3>
                <p>Solutio – Théo Le Breton (micro-entreprise)</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Adresse</h3>
                <p>1 bis Côte de la Maison Brûlée</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">SIREN</h3>
                <p>853 851 335</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p><a href="mailto:tlb@solutio.work" className="text-primary underline">tlb@solutio.work</a></p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Téléphone</h3>
                <p>(non publié)</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Responsable de la publication</h3>
                <p>Théo Le Breton</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Hébergeur</h3>
                <p>Hostinger</p>
              </div>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Propriété intellectuelle</h2>
            <p>L'ensemble des contenus du site est protégé.</p>
            <p>Contact : <a href="mailto:tlb@solutio.work" className="text-primary underline">tlb@solutio.work</a></p>
          </section>

          <div className="mt-12 text-sm text-muted-foreground">
            <p>Mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default Legal;