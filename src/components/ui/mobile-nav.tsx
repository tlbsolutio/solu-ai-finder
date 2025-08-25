import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from './sheet';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, Languages, Brain } from 'lucide-react';

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.diagnostic'), path: '/diagnostic' },
    { name: t('nav.catalogue'), path: '/catalogue' },
    { name: t('nav.contact'), path: '/contact' },
  ];

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
              src="/lovable-uploads/876ba1fd-d1e8-4a94-939e-0a2357028335.png" 
              alt="Solutio" 
              className="h-8 w-auto"
            />
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col space-y-4 mt-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary p-3 rounded-lg",
                location.pathname === item.path
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              {item.name}
            </Link>
          ))}
          
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
              {language === 'fr' ? 'English' : 'Français'}
            </Button>
            
            <Link to="/diagnostic" onClick={() => setOpen(false)}>
              <Button variant="default" className="w-full bg-gradient-primary hover:opacity-90">
                <Brain className="h-4 w-4 mr-2" />
                {t('nav.start_diagnostic')}
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;