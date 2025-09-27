import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Zap, Users, CheckCircle, XCircle } from "lucide-react";

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
  pricingLinked?: PricingPlan[];
}

interface PricingPlan {
  id: string;
  plan: string;
  price: string;
  included: string[];
  popular: boolean;
}

interface SaasHeaderProps {
  saasDetail: SaaSItem;
  showLogoFallback: boolean;
  imageKey: number;
  onImageError: () => void;
  onImageLoad: () => void;
}

const SaasHeader = memo(({ saasDetail, showLogoFallback, imageKey, onImageError, onImageLoad }: SaasHeaderProps) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
    <div className="lg:col-span-2">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="flex-shrink-0">
          {showLogoFallback ? (
            <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 bg-primary/20 rounded mx-auto mb-2"></div>
                <div className="text-xs text-muted-foreground font-medium">
                  {saasDetail.name.substring(0, 3).toUpperCase()}
                </div>
              </div>
            </div>
          ) : (
            <img
              key={`${saasDetail.id}-${imageKey}`}
              src={`${saasDetail.logoUrl}${saasDetail.logoUrl.includes('?') ? '&' : '?'}t=${Date.now()}`}
              alt={`Logo ${saasDetail.name}`}
              referrerPolicy="no-referrer"
              className="w-32 h-32 object-contain bg-background/50 p-4 rounded-lg"
              onError={onImageError}
              onLoad={onImageLoad}
              loading="eager"
            />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {saasDetail.name}
          </h1>
          {saasDetail.tagline && (
            <p className="text-lg text-muted-foreground mb-4">
              {saasDetail.tagline}
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
));

SaasHeader.displayName = 'SaasHeader';

interface SaasStatsProps {
  saasDetail: SaaSItem;
}

const SaasStats = memo(({ saasDetail }: SaasStatsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
    <Card>
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <Star className="h-5 w-5 text-yellow-500 mr-1" />
          <span className="text-2xl font-bold">{saasDetail.score}/10</span>
        </div>
        <p className="text-sm text-muted-foreground">Score global</p>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <Zap className="h-5 w-5 text-blue-500 mr-1" />
          <span className="text-2xl font-bold">{saasDetail.automation}/10</span>
        </div>
        <p className="text-sm text-muted-foreground">Automatisation</p>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <Users className="h-5 w-5 text-green-500 mr-1" />
          <span className="text-2xl font-bold">{saasDetail.ease}/10</span>
        </div>
        <p className="text-sm text-muted-foreground">Facilité d'usage</p>
      </CardContent>
    </Card>
  </div>
));

SaasStats.displayName = 'SaasStats';

interface SaasFeaturesProps {
  features: string[];
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SaasFeatures = memo(({ features, title, icon: Icon }: SaasFeaturesProps) => (
  <Card className="mb-6">
    <CardContent className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
));

SaasFeatures.displayName = 'SaasFeatures';

export { SaasHeader, SaasStats, SaasFeatures };