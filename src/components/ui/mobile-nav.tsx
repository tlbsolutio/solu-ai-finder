import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from './sheet';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, Languages, Calendar } from 'lucide-react';

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const scrollTo = (id: string) => {
    setOpen(false);
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="md:hidden"
          size="icon"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-left">
            <img
              src="/logo-solutio-full.svg"
              alt="Solutio"
              className="h-8 w-auto"
            />
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col space-y-4 mt-8">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary p-3 rounded-lg',
              location.pathname === '/'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:bg-accent',
            )}
          >
            {t('nav.home')}
          </Link>

          {[
            { name: t('nav.outils'), id: 'outils' },
            { name: t('nav.realisations'), id: 'realisations' },
            { name: t('nav.accompagnement'), id: 'accompagnement' },
            { name: t('nav.conviction'), id: 'conviction' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent p-3 rounded-lg text-left transition-colors"
            >
              {item.name}
            </button>
          ))}

          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary p-3 rounded-lg',
              location.pathname === '/contact'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:bg-accent',
            )}
          >
            {t('nav.contact')}
          </Link>

          <div className="border-t pt-4 space-y-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLanguage(language === 'fr' ? 'en' : 'fr');
                setOpen(false);
              }}
              className="w-full justify-start"
            >
              <Languages className="h-4 w-4 mr-2" />
              {language === 'fr' ? 'English' : 'Francais'}
            </Button>

            <a href="https://calendly.com/tlb-ov_p/30min" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
              <Button variant="default" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                {t('nav.book_meeting')}
              </Button>
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
