import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main>
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img src="/lovable-uploads/876ba1fd-d1e8-4a94-939e-0a2357028335.png" alt="Solutio" className="h-8 w-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                {t('footer.tagline')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t('footer.solutions')}</h4>
              <div className="space-y-2 text-sm">
                <Link to="/diagnostic" className="block text-muted-foreground hover:text-primary">{t('nav.diagnostic')}</Link>
                <Link to="/catalogue" className="block text-muted-foreground hover:text-primary">{t('nav.catalogue')}</Link>
                <Link to="/contact" className="block text-muted-foreground hover:text-primary">{t('nav.contact')}</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t('footer.support')}</h4>
              <div className="space-y-2 text-sm">
                <Link to="/contact" className="block text-muted-foreground hover:text-primary">{t('nav.contact')}</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t('footer.legal')}</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-primary">{t('footer.legal_notice')}</a>
                <a href="#" className="block text-muted-foreground hover:text-primary">{t('footer.privacy')}</a>
                <a href="#" className="block text-muted-foreground hover:text-primary">{t('footer.terms')}</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;