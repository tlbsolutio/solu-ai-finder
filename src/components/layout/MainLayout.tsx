import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import { Linkedin, Mail } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        {children}
      </main>

      <footer className="bg-slate-950 text-white">
        <div className="container mx-auto px-6 sm:px-10 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            {/* Logo + tagline + social */}
            <div className="lg:col-span-2 space-y-4">
              <img
                src="/lovable-uploads/876ba1fd-d1e8-4a94-939e-0a2357028335.png"
                alt="Solutio"
                className="h-7 w-auto brightness-[10] opacity-60"
              />
              <p className="text-sm text-white/40 leading-relaxed max-w-xs">
                Conseil en transformation digitale. Diagnostic, outils sur mesure et accompagnement pour les PME.
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
                  <Link to="/legal" className="text-sm text-white/35 hover:text-white/60 transition-colors">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-sm text-white/35 hover:text-white/60 transition-colors">
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-sm text-white/35 hover:text-white/60 transition-colors">
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
