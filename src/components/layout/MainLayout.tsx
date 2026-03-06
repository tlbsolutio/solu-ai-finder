import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Linkedin, Mail } from 'lucide-react';

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

      <footer className="bg-slate-950 text-white">
        <div className="container mx-auto px-6 sm:px-10 py-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/lovable-uploads/876ba1fd-d1e8-4a94-939e-0a2357028335.png"
              alt="Solutio"
              className="h-7 w-auto brightness-[10] opacity-50"
            />
            <div className="flex items-center gap-2">
              <a
                href="https://www.linkedin.com/company/solutio-work"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5 text-white/50" />
              </a>
              <a
                href="mailto:tlb@solutio.work"
                className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <Mail className="w-3.5 h-3.5 text-white/50" />
              </a>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            {[
              { name: t('nav.outils'), href: '/#outils' },
              { name: t('nav.realisations'), href: '/#realisations' },
              { name: t('nav.contact'), href: '/contact' },
              { name: t('footer.legal_notice'), href: '/legal' },
              { name: t('footer.privacy'), href: '/privacy' },
            ].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-xs text-white/25 hover:text-white/50 transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <span className="text-xs text-white/20">
            {t('footer.copyright')}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
