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
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        {children}
      </main>

      <footer className="relative border-t bg-card">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <img src="/lovable-uploads/876ba1fd-d1e8-4a94-939e-0a2357028335.png" alt="Solutio" className="h-7 w-auto mb-4" />
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('footer.tagline')}
              </p>
              <a
                href="mailto:tlb@solutio.work"
                className="inline-block mt-3 text-sm text-primary hover:underline transition-colors"
              >
                tlb@solutio.work
              </a>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">{t('footer.solutions')}</h4>
              <div className="space-y-2 text-sm">
                <Link to="/cartographie/scan" className="block text-muted-foreground hover:text-primary transition-colors">{t('nav.start_scan')}</Link>
                <Link to="/cartographie" className="block text-muted-foreground hover:text-primary transition-colors">{t('nav.cartographie')}</Link>
                <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-colors">{t('nav.contact')}</Link>
              </div>
            </div>

            {/* Legal + Social */}
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">{t('footer.legal')}</h4>
              <div className="space-y-2 text-sm">
                <Link to="/legal" className="block text-muted-foreground hover:text-primary transition-colors">{t('footer.legal_notice')}</Link>
                <Link to="/privacy" className="block text-muted-foreground hover:text-primary transition-colors">{t('footer.privacy')}</Link>
                <Link to="/cookies" className="block text-muted-foreground hover:text-primary transition-colors">{t('footer.terms')}</Link>
              </div>
              <div className="mt-4 pt-3 border-t space-y-2">
                <a
                  href="https://www.linkedin.com/company/solutio-work/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Solutio
                </a>
                <br />
                <a
                  href="https://www.linkedin.com/in/theo-le-breton/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Theo Le Breton
                </a>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-5 text-center">
            <p className="text-xs text-muted-foreground">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
