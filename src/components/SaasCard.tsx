import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Users, DollarSign, Check } from 'lucide-react';

interface SaaSItem {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  categories: string[];
  targets: string[];
  score: number;
  automation: number;
  ease: number;
  priceText: string;
  features: string[];
  useCases: string[];
  pros: string[];
  cons: string[];
  logoUrl: string;
  website?: string;
  trialUrl?: string;
  affiliate?: string;
}

interface SaasCardProps {
  saas: SaaSItem;
  categoryLabels: Record<string, string>;
  selectedCategory: string;
  selectedTarget: string;
  onKeyFeaturesLabel: string;
}

const SaasCard = React.memo(({ saas, categoryLabels, selectedCategory, selectedTarget, onKeyFeaturesLabel }: SaasCardProps) => {
  const formatScore = (score: number) => {
    if (score % 1 === 0) return score.toFixed(0);
    if (score % 1 === 0.5) return score.toFixed(1);
    return (Math.round(score * 2) / 2).toFixed(1);
  };

  return (
    <Card className="group hover:shadow-card-hover transition-all duration-300 cursor-pointer h-full self-stretch flex flex-col bg-gradient-card border-border/50 hover:border-primary/20">
      <div className="relative overflow-hidden rounded-t-lg">
        {saas.logoUrl ? (
          <img
            src={`${saas.logoUrl}?w=400&h=200&fit=contain`}
            alt={`Logo ${saas.name} - ${saas.categories.join(', ')}`}
            loading="lazy"
            className="w-full h-32 object-contain bg-white group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-full h-32 ${saas.logoUrl ? 'hidden' : 'flex'} items-center justify-center bg-gradient-primary text-white text-2xl font-bold`}
          style={{ display: saas.logoUrl ? 'none' : 'flex' }}
        >
          {saas.name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-white/90">
            <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
            {formatScore(saas.score)}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-xl line-clamp-1">{saas.name}</CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        <div className="flex flex-col gap-3 flex-1 min-h-0">
          {/* Categories */}
          <div className="flex flex-wrap gap-1">
            {saas.categories.map((cat, idx) => {
              const isActiveFilter = selectedCategory === cat;
              return (
                <Badge 
                  key={idx} 
                  variant={isActiveFilter ? "default" : "secondary"} 
                  className={`text-xs ${isActiveFilter ? 'ring-2 ring-primary/50 bg-primary text-primary-foreground' : ''}`}
                >
                  {categoryLabels[cat] || cat}
                </Badge>
              );
            })}
          </div>

          {/* Tagline */}
          {saas.tagline && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {saas.tagline}
            </p>
          )}

          {/* Key Features (max 3) */}
          {saas.features && saas.features.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {onKeyFeaturesLabel}
              </h4>
              <div className="space-y-1">
                {saas.features.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex items-center text-xs">
                    <Check className="h-3 w-3 text-green-500 mr-1.5 flex-shrink-0" />
                    <span className="line-clamp-1">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rating and automation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
              <span className="text-sm font-medium">{formatScore(saas.score)}</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>{saas.automation || 0}% auto.</span>
            </div>
          </div>

          {/* Targets */}
          <div className="flex flex-wrap gap-1 mt-2">
            {(() => {
              if (!saas.targets) return null;
              
              // Prioritize selected target first, then show others (max 2 total)
              const targetsToShow = [...saas.targets];
              if (selectedTarget && targetsToShow.includes(selectedTarget)) {
                // Move selected target to front
                const filtered = targetsToShow.filter(t => t !== selectedTarget);
                targetsToShow.splice(0, targetsToShow.length, selectedTarget, ...filtered);
              }
              
              return targetsToShow.slice(0, 2).map((target, idx) => {
                const isActiveFilter = selectedTarget === target;
                return (
                  <Badge 
                    key={idx} 
                    variant={isActiveFilter ? "default" : "outline"} 
                    className={`text-xs ${isActiveFilter ? 'ring-2 ring-primary/50 bg-primary text-primary-foreground' : ''}`}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    {target}
                  </Badge>
                );
              });
            })()}
          </div>

          {/* Price */}
          <div className="flex items-center mt-3 pt-3 border-t border-border/50">
            <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-sm font-medium">{saas.priceText}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

SaasCard.displayName = 'SaasCard';

export default SaasCard;