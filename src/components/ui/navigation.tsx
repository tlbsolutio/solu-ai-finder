import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';
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
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/lovable-uploads/876ba1fd-d1e8-4a94-939e-0a2357028335.png"
            alt="Solutio"
            className="h-8 w-auto"
          />
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
          <Link
            to="/cartographie/scan"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === '/cartographie/scan'
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {t('nav.start_scan')}
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="flex"
            >
              <Languages className="h-4 w-4 mr-2" />
              {language === 'fr' ? 'EN' : 'FR'}
            </Button>
            <Link to="/cartographie/scan">
              <Button variant="default" className="bg-gradient-primary hover:opacity-90 shadow-md shadow-primary/25">
                {t('nav.start_scan')}
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