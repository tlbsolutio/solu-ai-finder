import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './button';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Accueil', path: '/' },
    { name: 'Diagnostic IA', path: '/diagnostic' },
    { name: 'Catalogue SaaS', path: '/catalogue' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/876ba1fd-d1e8-4a94-939e-0a2357028335.png" 
            alt="Solutio" 
            className="h-8 w-auto"
          />
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
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
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/diagnostic">
            <Button variant="default" className="bg-gradient-primary hover:opacity-90">
              Commencer le diagnostic
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;