import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import { Linkedin, Mail, ArrowRight, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t, language } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        {children}
      </main>

      {/* CTA Final */}
      <div className="relative bg-slate-950">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(6,182,212,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(59,130,246,0.1) 0%, transparent 60%)' }} />
        <div className="relative container mx-auto px-6 sm:px-10 py-14 sm:py-16 text-center">
          <p className="text-xs font-bold tracking-[.2em] uppercase text-cyan-400/70 mb-3">
            {language === 'fr' ? "Pret a passer a l'action ?" : "Ready to take action?"}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight">
            {language === 'fr' ? 'Transformez votre organisation,' : 'Transform your organization,'}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              {language === 'fr' ? 'concretement.' : 'for real.'}
            </span>
          </h3>
          <p className="text-sm text-white/50 mb-8 max-w-md mx-auto leading-relaxed">
            {language === 'fr'
              ? "Diagnostic gratuit sur 10 axes, outils sur mesure et accompagnement jusqu'à l'adoption. Un seul interlocuteur."
              : "Free diagnostic on 10 axes, custom tools and support through adoption. One point of contact."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/cartographie" className="w-full sm:w-auto">
              <Button size="lg" className="h-12 px-8 w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25 font-semibold text-white group">
                {language === 'fr' ? 'Lancer le diagnostic' : 'Start the diagnostic'}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <a href="https://calendly.com/tlb-ov_p/30min" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button size="lg" className="h-12 px-8 w-full sm:w-auto bg-transparent border border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm">
                <Calendar className="w-4 h-4 mr-2" />
                {t('nav.book_meeting')}
              </Button>
            </a>
          </div>
        </div>
      </div>
      <footer className="bg-slate-950 text-white -mt-px">
        <div className="container mx-auto px-6 sm:px-10 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            {/* Logo + tagline + social */}
            <div className="lg:col-span-2 space-y-4">
              <img
                src="/logos/logo_solutio.svg"
                alt="Solutio"
                className="h-9 w-auto brightness-[10] opacity-60"
              />
              <p className="text-sm text-white/40 leading-relaxed max-w-xs">
                Conseil en transformation digitale. Diagnostic, outils sur mesure et accompagnement.
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.linkedin.com/company/solutio-work"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-white/50" />
                </a>
                <a
                  href="mailto:contact@solutio.work"
                  className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4 text-white/50" />
                </a>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60">Services</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/#outils" className="text-sm text-white/35 hover:text-white/60 transition-colors">
                    Outils
                  </Link>
                </li>
                <li>
                  <Link to="/#realisations" className="text-sm text-white/35 hover:text-white/60 transition-colors">
                    Réalisations
                  </Link>
                </li>
                <li>
                  <Link to="/#accompagnement" className="text-sm text-white/35 hover:text-white/60 transition-colors">
                    Accompagnement
                  </Link>
                </li>
              </ul>
            </div>

            {/* Produits */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60">Produits</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/cartographie" className="text-sm text-white/35 hover:text-white/60 transition-colors">
                    Solutio Carto
                  </Link>
                </li>
                <li>
                  <Link to="/cartographie/pricing" className="text-sm text-white/35 hover:text-white/60 transition-colors">
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-white/35 hover:text-white/60 transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <a
                    href="https://calendly.com/tlb-ov_p/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/35 hover:text-white/60 transition-colors"
                  >
                    Prendre RDV
                  </a>
                </li>
              </ul>
            </div>

            {/* Légal */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60">Légal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to={language === 'en' ? '/legal-en' : '/legal'} className="text-sm text-white/35 hover:text-white/60 transition-colors">
                    {language === 'en' ? 'Legal notice' : 'Mentions légales'}
                  </Link>
                </li>
                <li>
                  <Link to={language === 'en' ? '/privacy-en' : '/privacy'} className="text-sm text-white/35 hover:text-white/60 transition-colors">
                    {language === 'en' ? 'Privacy policy' : 'Confidentialité'}
                  </Link>
                </li>
                <li>
                  <Link to={language === 'en' ? '/cookies-en' : '/cookies'} className="text-sm text-white/35 hover:text-white/60 transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5">
          <div className="container mx-auto px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-xs text-white/20">
              © 2026 Solutio. Tous droits réservés.
            </span>
            <span className="text-xs text-white/20">
              France — Données hébergées en Europe
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
