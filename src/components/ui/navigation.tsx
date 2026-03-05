import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages, ArrowRight } from 'lucide-react';
import MobileNav from './mobile-nav';

const Navigation = () => {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.cartographie'), path: '/cartographie' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/lovable-uploads/876ba1fd-d1e8-4a94-939e-0a2357028335.png"
            alt="Solutio"
            className="h-7 w-auto"
          />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary relative py-1",
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
              {location.pathname === item.path && (
                <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-primary rounded-full" />
              )}
            </Link>
          ))}
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
              <Button size="sm" className="h-8 bg-gradient-primary hover:opacity-90 shadow-sm text-xs font-medium">
                {t('nav.start_scan')}
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
          <MobileNav />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
