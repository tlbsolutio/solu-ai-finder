import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight,
  UserCheck,
  BarChart3,
  Code,
  Palette,
  ShoppingCart,
  FolderOpen,
  FileText,
  Shield,
  DollarSign,
  Users,
  GraduationCap,
  Headphones,
  Heart,
  Package,
  Database,
  Scale
} from 'lucide-react';

const Index = () => {
  const categories = [
    { icon: UserCheck, name: "CRM & Relation Client", count: "45+" },
    { icon: BarChart3, name: "Marketing & Growth", count: "38+" },
    { icon: Code, name: "Automatisation & No-code", count: "52+" },
    { icon: Palette, name: "Création, Design & Multimédia", count: "29+" },
    { icon: ShoppingCart, name: "Ventes & E-commerce", count: "41+" },
    { icon: FolderOpen, name: "Gestion de Projet & Collaboration", count: "33+" },
    { icon: FileText, name: "Productivité & Outils Bureautiques", count: "47+" },
    { icon: Shield, name: "Sécurité & Conformité", count: "25+" },
    { icon: DollarSign, name: "Finance & Comptabilité", count: "31+" },
    { icon: Users, name: "Ressources Humaines & Recrutement", count: "27+" },
    { icon: GraduationCap, name: "Éducation & Formation", count: "19+" },
    { icon: Headphones, name: "Service Client & Support", count: "23+" },
    { icon: Heart, name: "Santé & Bien-être", count: "15+" },
    { icon: Package, name: "Industrie & Logistique", count: "22+" },
    { icon: Database, name: "Développement & IT", count: "56+" },
    { icon: Scale, name: "LegalTech & Juridique", count: "18+" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden">
        <div 
          className="relative bg-cover bg-center bg-no-repeat min-h-[500px] flex items-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url('/lovable-uploads/1e0e7014-a7fd-4003-aaad-4e8b14608e55.png')`
          }}
        >
          <div className="container mx-auto px-4 text-center text-white">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Trouvez une solution adaptée à votre activité
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Découvrez les meilleures solutions SaaS triées par catégorie pour automatiser vos processus métier
            </p>
            <Link to="/catalogue">
              <Button size="xl" className="bg-white text-primary hover:bg-white/90">
                Explorer le catalogue
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              274 solutions répertoriées pour le moment...
            </h2>
            <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
              <span>Catégories</span>
              <span>Organisations</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, idx) => (
              <Link to="/catalogue" key={idx}>
                <Card className="group hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <category.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm">{category.name}</h3>
                    <p className="text-muted-foreground text-sm">{category.count} outils</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img 
                src="/lovable-uploads/876ba1fd-d1e8-4a94-939e-0a2357028335.png" 
                alt="Solutio" 
                className="h-8 w-auto mb-4"
              />
              <p className="text-muted-foreground text-sm">
                Votre partenaire pour la transformation digitale et l'automatisation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Solutions</h4>
              <div className="space-y-2 text-sm">
                <Link to="/diagnostic" className="block text-muted-foreground hover:text-primary">Diagnostic IA</Link>
                <Link to="/catalogue" className="block text-muted-foreground hover:text-primary">Catalogue SaaS</Link>
                <Link to="/contact" className="block text-muted-foreground hover:text-primary">Conseil Expert</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <Link to="/contact" className="block text-muted-foreground hover:text-primary">Contact</Link>
                <a href="mailto:contact@solutio.fr" className="block text-muted-foreground hover:text-primary">Email</a>
                <a href="tel:+33123456789" className="block text-muted-foreground hover:text-primary">Téléphone</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Légal</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-primary">Mentions légales</a>
                <a href="#" className="block text-muted-foreground hover:text-primary">Confidentialité</a>
                <a href="#" className="block text-muted-foreground hover:text-primary">CGU</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Solutio. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;