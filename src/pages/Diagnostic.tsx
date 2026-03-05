import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, ArrowRight, ArrowLeft, CheckCircle, TrendingUp, Clock, Target, Mail, Loader2, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import MetaTags from '@/components/seo/MetaTags';

const Diagnostic = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ email: '', acceptMarketing: false });
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);

  const [responses, setResponses] = useState({
    companySize: '',
    sector: '',
    challenges: '',
    maturity: '',
    priorities: '',
  });

  const questions = [
    {
      id: 1,
      title: t('diagnostic.question_company_title'),
      subtitle: t('diagnostic.question_company_subtitle'),
      field: 'companySize',
      examples: [
        t('diagnostic.examples_company_1'),
        t('diagnostic.examples_company_2'),
        t('diagnostic.examples_company_3'),
        t('diagnostic.examples_company_4'),
      ],
    },
    {
      id: 2,
      title: t('diagnostic.question_sector_title'),
      subtitle: t('diagnostic.question_sector_subtitle'),
      field: 'sector',
      examples: [
        t('diagnostic.examples_sector_1'),
        t('diagnostic.examples_sector_2'),
        t('diagnostic.examples_sector_3'),
        t('diagnostic.examples_sector_4'),
        t('diagnostic.examples_sector_5'),
        t('diagnostic.examples_sector_6'),
      ],
    },
    {
      id: 3,
      title: t('diagnostic.question_challenges_title'),
      subtitle: t('diagnostic.question_challenges_subtitle'),
      field: 'challenges',
      examples: [
        t('diagnostic.examples_challenges_1'),
        t('diagnostic.examples_challenges_2'),
        t('diagnostic.examples_challenges_3'),
        t('diagnostic.examples_challenges_4'),
        t('diagnostic.examples_challenges_5'),
      ],
    },
    {
      id: 4,
      title: t('diagnostic.question_maturity_title'),
      subtitle: t('diagnostic.question_maturity_subtitle'),
      field: 'maturity',
      examples: [
        t('diagnostic.examples_maturity_1'),
        t('diagnostic.examples_maturity_2'),
        t('diagnostic.examples_maturity_3'),
        t('diagnostic.examples_maturity_4'),
      ],
    },
    {
      id: 5,
      title: t('diagnostic.question_priorities_title'),
      subtitle: t('diagnostic.question_priorities_subtitle'),
      field: 'priorities',
      examples: [
        t('diagnostic.examples_priorities_1'),
        t('diagnostic.examples_priorities_2'),
        t('diagnostic.examples_priorities_3'),
        t('diagnostic.examples_priorities_4'),
        t('diagnostic.examples_priorities_5'),
      ],
    },
  ];

  const currentQuestion = questions[currentStep - 1];
  const totalSteps = questions.length;
  const progress = (currentStep / totalSteps) * 100;

  const handleSelectExample = (example: string) => {
    const field = currentQuestion.field as keyof typeof responses;
    const current = responses[field];
    if (current === example) return;
    setResponses(prev => ({ ...prev, [field]: example }));
  };

  const isCurrentStepComplete = () => {
    const field = currentQuestion?.field as keyof typeof responses;
    return responses[field]?.trim() !== '';
  };

  // Calculate maturity score locally (fallback)
  const calculateMaturityScore = () => {
    let score = 40;

    // Company size factor
    if (responses.companySize.includes('200+') || responses.companySize.includes('51-200')) score += 10;
    if (responses.companySize.includes('11-50')) score += 5;

    // Maturity level
    const matLower = responses.maturity.toLowerCase();
    if (matLower.includes('très peu') || matLower.includes('very low') || matLower.includes('excel') || matLower.includes('papier')) score += 25;
    else if (matLower.includes('isolé') || matLower.includes('isolated') || matLower.includes('quelques')) score += 20;
    else if (matLower.includes('sous-utilisé') || matLower.includes('underused') || matLower.includes('connecté')) score += 15;
    else if (matLower.includes('bonne') || matLower.includes('good') || matLower.includes('optimiser')) score += 10;

    // Challenges complexity
    if (responses.challenges.length > 30) score += 10;

    return Math.min(score, 95);
  };

  const getMaturityLevel = (score: number) => {
    if (score >= 80) return { label: 'Fort potentiel', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-200 dark:border-red-800' };
    if (score >= 60) return { label: 'Potentiel significatif', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800' };
    if (score >= 40) return { label: 'Potentiel modéré', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-yellow-200 dark:border-yellow-800' };
    return { label: 'En bonne voie', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-800' };
  };

  const getRecommendations = (score: number) => {
    const recs = [];

    const matLower = responses.maturity.toLowerCase();
    if (matLower.includes('très peu') || matLower.includes('very low') || matLower.includes('papier')) {
      recs.push({
        title: 'Digitaliser les processus de base',
        description: 'Commencer par migrer les processus papier/Excel vers des outils numériques adaptés.',
        priority: 'Haute',
      });
    }

    const chalLower = responses.challenges.toLowerCase();
    if (chalLower.includes('manuel') || chalLower.includes('manual') || chalLower.includes('chronophage') || chalLower.includes('time')) {
      recs.push({
        title: 'Automatiser les tâches répétitives',
        description: 'Identifier les 3 processus les plus chronophages et mettre en place des automatisations.',
        priority: 'Haute',
      });
    }

    if (chalLower.includes('visibilité') || chalLower.includes('reporting') || chalLower.includes('visibility')) {
      recs.push({
        title: 'Mettre en place un reporting centralisé',
        description: 'Créer des tableaux de bord consolidés pour piloter l\'activité avec des données fiables.',
        priority: 'Moyenne',
      });
    }

    if (chalLower.includes('communication') || chalLower.includes('équipe') || chalLower.includes('team')) {
      recs.push({
        title: 'Améliorer la collaboration inter-équipes',
        description: 'Déployer des outils de communication et de gestion de projet pour fluidifier les échanges.',
        priority: 'Moyenne',
      });
    }

    if (chalLower.includes('document') || chalLower.includes('désorganis')) {
      recs.push({
        title: 'Structurer la gestion documentaire',
        description: 'Mettre en place une arborescence claire et des règles de nommage pour retrouver facilement l\'information.',
        priority: 'Moyenne',
      });
    }

    // Always add cartographie recommendation
    recs.push({
      title: 'Réaliser une cartographie complète',
      description: 'La cartographie organisationnelle Solutio analyse 10 domaines clés pour établir une feuille de route priorisée.',
      priority: 'Recommandé',
    });

    return recs.slice(0, 5);
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsLoadingResults(true);
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoadingResults(false);
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startNewDiagnostic = () => {
    setShowResults(false);
    setCurrentStep(1);
    setResponses({ companySize: '', sector: '', challenges: '', maturity: '', priorities: '' });
  };

  const handleSendEmail = async () => {
    if (!emailData.email || !emailData.acceptMarketing) return;
    setIsLoadingEmail(true);

    try {
      const score = calculateMaturityScore();
      const recommendations = getRecommendations(score);

      // Send via Formspree
      const formData = new FormData();
      formData.append('user_email', emailData.email);
      formData.append('score', score.toString());
      formData.append('company_size', responses.companySize);
      formData.append('sector', responses.sector);
      formData.append('challenges', responses.challenges);
      formData.append('maturity', responses.maturity);
      formData.append('priorities', responses.priorities);
      formData.append('recommendations', recommendations.map(r => r.title).join(', '));
      formData.append('marketing_consent', emailData.acceptMarketing.toString());

      await fetch('https://formspree.io/f/mqadkloe', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      toast({
        title: 'Diagnostic envoyé !',
        description: 'Vous recevrez le récapitulatif par email dans quelques minutes.',
      });

      setShowEmailModal(false);
      setEmailData({ email: '', acceptMarketing: false });
    } catch (error) {
      console.error('Email sending error:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer le récapitulatif. Veuillez réessayer.",
        variant: 'destructive',
      });
    } finally {
      setIsLoadingEmail(false);
    }
  };

  // Loading state
  if (isLoadingResults) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto">
            <Card className="border border-border">
              <CardContent className="text-center py-16">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-14 h-14 border-4 border-primary/20 rounded-full animate-spin border-t-primary" />
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-2">Analyse en cours...</h2>
                    <p className="text-muted-foreground text-sm">
                      Nous analysons vos réponses pour établir votre score de maturité digitale.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Results view
  if (showResults) {
    const score = calculateMaturityScore();
    const level = getMaturityLevel(score);
    const recommendations = getRecommendations(score);

    return (
      <div className="min-h-screen bg-background">
        <MetaTags
          title={t('diagnostic.results_title')}
          description={t('diagnostic.results_subtitle')}
          type="website"
        />

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Results Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <CheckCircle className="h-7 w-7 text-green-500" />
                <h1 className="text-2xl font-bold text-foreground">{t('diagnostic.results_title')}</h1>
              </div>
              <p className="text-muted-foreground">{t('diagnostic.results_subtitle')}</p>
            </div>

            {/* Score Card */}
            <Card className="mb-8 border border-border">
              <CardContent className="p-8 text-center">
                <h2 className="text-lg font-semibold text-foreground mb-6">{t('diagnostic.maturity_score')}</h2>

                <div className="w-36 h-36 rounded-full border-[6px] border-primary/20 flex items-center justify-center mx-auto mb-6 bg-primary/5">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{score}%</div>
                    <div className="text-xs text-muted-foreground">{t('diagnostic.potential_label')}</div>
                  </div>
                </div>

                <Badge className={`${level.bg} ${level.color} ${level.border} border px-4 py-1 text-sm font-medium`}>
                  {level.label}
                </Badge>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-foreground">{Math.round(score * 0.6)}%</div>
                    <div className="text-xs text-muted-foreground">{t('diagnostic.time_saved_label')}</div>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <Clock className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-foreground">{t('diagnostic.implementation_time')}</div>
                    <div className="text-xs text-muted-foreground">{t('diagnostic.implementation_label')}</div>
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <Target className="h-5 w-5 text-orange-600 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-foreground">{t('diagnostic.roi_value')}</div>
                    <div className="text-xs text-muted-foreground">{t('diagnostic.roi_label')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="mb-8 border border-border">
              <CardHeader>
                <CardTitle className="text-base">{t('diagnostic.summary_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">{t('diagnostic.company_size_caps')}</div>
                    <p className="text-sm text-foreground">{responses.companySize}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">{t('diagnostic.sector_label_caps')}</div>
                    <p className="text-sm text-foreground">{responses.sector}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">{t('diagnostic.challenges_caps')}</div>
                    <p className="text-sm text-foreground">{responses.challenges}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">{t('diagnostic.maturity_caps')}</div>
                    <p className="text-sm text-foreground">{responses.maturity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="mb-8 border border-border">
              <CardHeader>
                <CardTitle className="text-base">{t('diagnostic.recommendations_title')}</CardTitle>
                <p className="text-sm text-muted-foreground">{t('diagnostic.recommendations_subtitle')}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground text-sm">{rec.title}</h4>
                          <Badge variant="outline" className="text-xs">{rec.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA: Cartographie */}
            <Card className="mb-8 border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-8 text-center">
                <MapPin className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">{t('diagnostic.cta_cartographie_title')}</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
                  {t('diagnostic.cta_cartographie_subtitle')}
                </p>
                <Link to="/cartographie">
                  <Button size="lg" className="transition-all duration-200 hover:scale-[1.02]">
                    <MapPin className="h-5 w-5 mr-2" />
                    {t('diagnostic.cta_cartographie_button')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="border border-border">
                <CardContent className="p-6 text-center">
                  <Mail className="h-7 w-7 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-sm mb-1">{t('diagnostic.receive_email_title')}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{t('diagnostic.receive_email_subtitle')}</p>
                  <Button variant="outline" className="w-full" size="sm" onClick={() => setShowEmailModal(true)}>
                    {t('diagnostic.send_report')}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardContent className="p-6 text-center">
                  <Target className="h-7 w-7 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-sm mb-1">{t('diagnostic.free_consultation_title')}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{t('diagnostic.free_consultation_subtitle')}</p>
                  <Button className="w-full" size="sm" asChild>
                    <a href="https://calendly.com/tlb-ov_p/30min" target="_blank" rel="noopener noreferrer">
                      {t('diagnostic.book_slot')}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button variant="ghost" onClick={startNewDiagnostic} className="text-muted-foreground">
                {t('diagnostic.new_diagnostic')}
              </Button>
            </div>
          </div>
        </div>

        {/* Email Modal */}
        <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('diagnostic.receive_email_title')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="votre@email.com"
                value={emailData.email}
                onChange={(e) => setEmailData(prev => ({ ...prev, email: e.target.value }))}
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="marketing"
                  checked={emailData.acceptMarketing}
                  onCheckedChange={(checked) => setEmailData(prev => ({ ...prev, acceptMarketing: !!checked }))}
                />
                <label htmlFor="marketing" className="text-sm text-muted-foreground">
                  J'accepte de recevoir des communications de Solutio
                </label>
              </div>
              <Button
                className="w-full"
                onClick={handleSendEmail}
                disabled={!emailData.email || !emailData.acceptMarketing || isLoadingEmail}
              >
                {isLoadingEmail ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t('diagnostic.send_report')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Question form
  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title={t('diagnostic.title')}
        description={t('diagnostic.subtitle')}
        type="website"
        keywords="diagnostic maturité digitale, transformation digitale, évaluation organisation"
      />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{t('diagnostic.title')}</h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              {t('diagnostic.subtitle')}
            </p>

            {/* Progress */}
            <div className="mt-8 w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{t('diagnostic.step_label')} {currentStep}/{totalSteps}</span>
              <span>{Math.round(progress)}% {t('diagnostic.progress_completed')}</span>
            </div>
          </div>

          {/* Question Card */}
          <Card className="border border-border mb-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {t('diagnostic.question_number')} {currentStep}
                </Badge>
              </div>
              <CardTitle className="text-lg">{currentQuestion.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{currentQuestion.subtitle}</p>
            </CardHeader>
            <CardContent>
              {/* Options */}
              <div className="space-y-2 mb-6">
                <p className="text-xs font-medium text-muted-foreground">{t('diagnostic.examples_label')}</p>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.examples.map((example, idx) => {
                    const field = currentQuestion.field as keyof typeof responses;
                    const isSelected = responses[field] === example;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectExample(example)}
                        className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 border ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card text-foreground border-border hover:border-primary/50'
                        }`}
                      >
                        {example}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('diagnostic.previous_button')}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentStepComplete()}
                >
                  {currentStep === totalSteps ? t('diagnostic.see_recommendations') : t('diagnostic.next_button')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Diagnostic;
