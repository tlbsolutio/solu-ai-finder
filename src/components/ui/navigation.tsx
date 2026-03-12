import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages, Calendar } from 'lucide-react';
import MobileNav from './mobile-nav';

const Navigation = () => {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const scrollTo = (id: string) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { name: t('nav.home'), path: '/', type: 'link' as const },
    { name: t('nav.outils'), id: 'outils', type: 'scroll' as const },
    { name: t('nav.realisations'), id: 'realisations', type: 'scroll' as const },
    { name: t('nav.accompagnement'), id: 'accompagnement', type: 'scroll' as const },
    { name: t('nav.conviction'), id: 'conviction', type: 'scroll' as const },
    { name: t('nav.contact'), path: '/contact', type: 'link' as const },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 sm:px-10 bg-white/92 dark:bg-background/92 backdrop-blur-xl border-b border-border/40">
      <Link to="/" className="flex items-center">
        <img
          src="/logo-solutio-full.svg"
          alt="Solutio"
          className="h-9 xl:h-11 w-auto"
        />
      </Link>

      <div className="hidden md:flex items-center gap-0.5">
        {navItems.map((item) =>
          item.type === 'link' ? (
            <Link
              key={item.path}
              to={item.path!}
              className={cn(
                'text-[13.5px] font-medium px-3.5 py-1.5 rounded-lg transition-all',
                location.pathname === item.path
                  ? 'text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5',
              )}
            >
              {item.name}
            </Link>
          ) : (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id!)}
              className="text-[13.5px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 px-3.5 py-1.5 rounded-lg transition-all"
            >
              {item.name}
            </button>
          ),
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Languages className="h-3.5 w-3.5 mr-1" />
            {language === 'fr' ? 'EN' : 'FR'}
          </Button>
          <Link to="/cartographie/scan">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 text-[13px] font-semibold border-primary/30 text-primary hover:bg-primary/5"
            >
              Diagnostic gratuit
            </Button>
          </Link>
          <a href="https://calendly.com/tlb-ov_p/30min" target="_blank" rel="noopener noreferrer">
            <Button
              size="sm"
              className="h-9 px-5 text-[13.5px] font-bold shadow-sm shadow-primary/20 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              {t('nav.book_meeting')}
            </Button>
          </a>
        </div>
        <MobileNav />
      </div>
    </nav>
  );
};

export default Navigation;
