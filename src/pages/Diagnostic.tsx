import React, { useState } from 'react';
import Navigation from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DiagnosticFormSkeleton } from '@/components/ui/loading-skeleton';
import { MessageCircle, ArrowRight, ArrowLeft, CheckCircle, TrendingUp, Clock, Target, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

const Diagnostic = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [responses, setResponses] = useState({
    task: '',
    frequency: '',
    sector: '',
    tools: '',
    deliverable: '',
    constraints: '',
    email: ''
  });

  const questions = [
    {
      id: 1,
      title: t('diagnostic.question_task_title'),
      subtitle: t('diagnostic.question_task_subtitle'),
      type: "textarea",
      field: "task",
      placeholder: t('diagnostic.question_task_placeholder'),
      examples: ["Saisie de données", "Création de rapports", "Gestion des emails", "Planification"]
    },
    {
      id: 2,
      title: t('diagnostic.question_frequency_title'),
      subtitle: t('diagnostic.question_frequency_subtitle'),
      type: "input",
      field: "frequency",
      placeholder: t('diagnostic.question_frequency_placeholder'),
      examples: ["Quotidien", "Hebdomadaire", "Mensuel", "Ponctuel"]
    },
    {
      id: 3,
      title: t('diagnostic.question_sector_title'),
      subtitle: t('diagnostic.question_sector_subtitle'),
      type: "input", 
      field: "sector",
      placeholder: t('diagnostic.question_sector_placeholder'),
      examples: ["E-commerce", "Consulting", "SaaS", "Finance", "Marketing", "RH"]
    },
    {
      id: 4,
      title: t('diagnostic.question_tools_title'),
      subtitle: t('diagnostic.question_tools_subtitle'),
      type: "textarea",
      field: "tools",
      placeholder: t('diagnostic.question_tools_placeholder'),
      examples: ["Excel", "Google Sheets", "CRM", "ERP", "Email"]
    },
    {
      id: 5,
      title: t('diagnostic.question_deliverable_title'),
      subtitle: t('diagnostic.question_deliverable_subtitle'),
      type: "textarea",
      field: "deliverable",
      placeholder: t('diagnostic.question_deliverable_placeholder'),
      examples: ["Rapport", "Base de données", "Email", "Document", "Tableau de bord"]
    },
    {
      id: 6,
      title: t('diagnostic.question_constraints_title'),
      subtitle: t('diagnostic.question_constraints_subtitle'),
      type: "textarea",
      field: "constraints",
      placeholder: t('diagnostic.question_constraints_placeholder'),
      examples: ["RGPD", "Validation manuelle", "Budget limité", "Urgence", "Sécurité"]
    },
    {
      id: 7,
      title: "Votre adresse email",
      subtitle: "Pour recevoir votre rapport personnalisé par email",
      type: "input",
      field: "email",
      placeholder: "votre.email@exemple.com",
      examples: []
    }
  ];

  const currentQuestion = questions[currentStep - 1];
  const progress = (currentStep / questions.length) * 100;

  // Calculate financial savings
  const calculateFinancialSavings = () => {
    const hourlyRate = 43.5; // €/hour superbrut moyen France
    const softwareCostMonthly = 35; // Coût moyen logiciel d'automatisation/mois
    let timePerTask = 1; // Default 1 hour
    let frequencyPerMonth = 1;
    
    // Estimate time based on task description
    const taskLower = responses.task.toLowerCase();
    if (taskLower.includes('rapport') || taskLower.includes('analyse')) timePerTask = 3;
    else if (taskLower.includes('email') || taskLower.includes('saisie')) timePerTask = 0.5;
    else if (taskLower.includes('planification') || taskLower.includes('gestion')) timePerTask = 2;
    
    // Convert frequency to monthly
    const freqLower = responses.frequency.toLowerCase();
    if (freqLower.includes('jour') || freqLower.includes('quotidien')) frequencyPerMonth = 22;
    else if (freqLower.includes('semaine') || freqLower.includes('hebdo')) frequencyPerMonth = 4;
    else if (freqLower.includes('mois') || freqLower.includes('mensuel')) frequencyPerMonth = 1;
    
    const automationPotential = generateScore() / 100;
    const monthlyHours = timePerTask * frequencyPerMonth * automationPotential;
    const grossMonthlySavings = monthlyHours * hourlyRate;
    const netMonthlySavings = grossMonthlySavings - softwareCostMonthly;
    const netAnnualSavings = netMonthlySavings * 12;
    
    return {
      monthly: Math.max(0, Math.round(netMonthlySavings)),
      annual: Math.max(0, Math.round(netAnnualSavings)),
      hours: Math.round(monthlyHours),
      gross: Math.round(grossMonthlySavings),
      calculation: {
        timePerTask,
        frequencyPerMonth,
        hourlyRate,
        softwareCostMonthly,
        automationPotential: Math.round(automationPotential * 100)
      }
    };
  };

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show results page
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.field]: value
    }));
  };

  const isCurrentStepComplete = () => {
    const currentValue = responses[currentQuestion?.field as keyof typeof responses]?.trim();
    if (!currentValue) return false;
    
    // Email validation for the email field
    if (currentQuestion?.field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(currentValue);
    }
    
    return currentValue !== '';
  };

  // Generate AI-like recommendations
  const generateScore = () => {
    let score = 60; // Base score
    if (responses.frequency.toLowerCase().includes('jour') || responses.frequency.toLowerCase().includes('quotidien')) score += 20;
    if (responses.task.length > 50) score += 10;
    if (responses.tools.toLowerCase().includes('excel') || responses.tools.toLowerCase().includes('manuel')) score += 15;
    return Math.min(score, 95);
  };

  const getRecommendations = () => {
    const sector = responses.sector.toLowerCase();
    const task = responses.task.toLowerCase();
    
    if (task.includes('email') || task.includes('mail')) {
      return ['Mailchimp', 'HubSpot CRM', 'Zapier'];
    } else if (task.includes('rapport') || task.includes('données')) {
      return ['Monday.com', 'Zapier', 'Google Sheets API'];
    } else if (task.includes('rendez-vous') || task.includes('planning')) {
      return ['Calendly', 'Acuity Scheduling', 'HubSpot CRM'];
    } else {
      return ['Zapier', 'Monday.com', 'HubSpot CRM'];
    }
  };

  const startNewDiagnostic = () => {
    setShowResults(false);
    setCurrentStep(1);
    setResponses({
      task: '',
      frequency: '',
      sector: '',
      tools: '',
      deliverable: '',
      constraints: '',
      email: ''
    });
  };

  if (showResults) {
    const score = generateScore();
    const recommendations = getRecommendations();
    const timeSaved = Math.round(score * 0.6);
    const financialSavings = calculateFinancialSavings();

  return (
    <div className="min-h-screen bg-gradient-subtle">
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Results Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <h1 className="text-3xl font-bold text-foreground">{t('diagnostic.results_title')}</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                {t('diagnostic.results_subtitle')}
              </p>
            </div>

            {/* Score Card */}
            <Card className="mb-6 shadow-elegant bg-gradient-to-br from-background to-secondary/50 animate-scale-in">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">{t('diagnostic.automation_score')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-20 animate-pulse"></div>
                  <div className="w-40 h-40 rounded-full border-8 border-primary/20 flex items-center justify-center bg-background/80 backdrop-blur-sm shadow-glow">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary animate-fade-in">{score}%</div>
                      <div className="text-sm text-muted-foreground">{t('diagnostic.potential_label')}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                    <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="font-semibold text-green-700 dark:text-green-400">{timeSaved}%</div>
                    <div className="text-xs text-green-600 dark:text-green-500">{t('diagnostic.time_saved_label')}</div>
                  </Card>
                  
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                    <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="font-semibold text-blue-700 dark:text-blue-400">{financialSavings.hours}h</div>
                    <div className="text-xs text-blue-600 dark:text-blue-500">Temps/mois économisé</div>
                  </Card>
                  
                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                    <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="font-semibold text-purple-700 dark:text-purple-400">{financialSavings.monthly}€</div>
                    <div className="text-xs text-purple-600 dark:text-purple-500">Économies/mois</div>
                  </Card>
                  
                  <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
                    <TrendingUp className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <div className="font-semibold text-orange-700 dark:text-orange-400">{financialSavings.annual}€</div>
                    <div className="text-xs text-orange-600 dark:text-orange-500">Économies/an</div>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="mb-6 shadow-medium">
              <CardHeader>
                <CardTitle>{t('diagnostic.summary_title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground mb-1">{t('diagnostic.task_to_automate')}</div>
                    <p className="text-sm">{responses.task}</p>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground mb-1">{t('diagnostic.frequency_label_caps')}</div>
                    <p className="text-sm">{responses.frequency}</p>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground mb-1">{t('diagnostic.sector_label_caps')}</div>
                    <p className="text-sm">{responses.sector}</p>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground mb-1">{t('diagnostic.current_tools')}</div>
                    <p className="text-sm">{responses.tools}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="mb-6 shadow-medium">
              <CardHeader>
                <CardTitle>{t('diagnostic.recommendations_title')}</CardTitle>
                <p className="text-muted-foreground">{t('diagnostic.recommendations_subtitle')}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.map((tool, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{tool}</div>
                          <div className="text-sm text-muted-foreground">{t('diagnostic.recommended_solution')}</div>
                        </div>
                      </div>
                      <Badge variant="secondary">{t('diagnostic.high_score')}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calculation Details */}
            <Card className="mb-6 shadow-medium">
              <CardHeader>
                <CardTitle>💰 Détail du calcul financier</CardTitle>
                <p className="text-muted-foreground">Comment nous calculons vos économies potentielles</p>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temps estimé par tâche:</span>
                        <span className="font-medium">{financialSavings.calculation.timePerTask}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fréquence mensuelle:</span>
                        <span className="font-medium">{financialSavings.calculation.frequencyPerMonth}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Potentiel d'automatisation:</span>
                        <span className="font-medium">{financialSavings.calculation.automationPotential}%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taux horaire superbrut:</span>
                        <span className="font-medium">{financialSavings.calculation.hourlyRate}€/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coût logiciel estimé:</span>
                        <span className="font-medium">{financialSavings.calculation.softwareCostMonthly}€/mois</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temps économisé/mois:</span>
                        <span className="font-medium">{financialSavings.hours}h</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between font-medium">
                      <span>Économies brutes/mois:</span>
                      <span className="text-green-600">{financialSavings.gross}€</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>- Coût logiciel/mois:</span>
                      <span className="text-red-600">-{financialSavings.calculation.softwareCostMonthly}€</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Économies nettes/mois:</span>
                      <span className="text-primary">{financialSavings.monthly}€</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                    <strong>Note:</strong> Ce calcul utilise le taux horaire superbrut moyen en France (43,5€/h) et déduit un coût moyen de logiciel d'automatisation (35€/mois). Les estimations peuvent varier selon votre situation spécifique.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="shadow-medium">
                <CardContent className="p-6 text-center">
                  <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">{t('diagnostic.receive_email_title')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('diagnostic.receive_email_subtitle')}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={async () => {
                      try {
                        const diagnosticSummary = `
Diagnostic d'automatisation Solutio

Score d'automatisation: ${score}%
Temps estimé gagné: ${timeSaved}%

Résumé des réponses:
- Tâche à automatiser: ${responses.task}
- Fréquence: ${responses.frequency}
- Secteur: ${responses.sector}
- Outils actuels: ${responses.tools}
- Livrable attendu: ${responses.deliverable}
- Contraintes: ${responses.constraints}

Recommandations:
${recommendations.map((tool, i) => `${i + 1}. ${tool}`).join('\n')}

Généré par Solutio - https://solutio.work
                        `;

                        const formspreeData = new FormData();
                        formspreeData.append('diagnostic_summary', diagnosticSummary);
                        formspreeData.append('user_email', responses.email);
                        formspreeData.append('score', score.toString());
                        formspreeData.append('recommendations', recommendations.join(', '));
                        
                        await fetch('https://formspree.io/f/mqadkloe', {
                          method: 'POST',
                          body: formspreeData,
                          headers: {
                            'Accept': 'application/json'
                          }
                        });
                        
                        toast({
                          title: "Rapport envoyé !",
                          description: "Vous recevrez le récapitulatif par email.",
                        });
                      } catch (error) {
                        toast({
                          title: "Erreur",
                          description: "Impossible d'envoyer le rapport.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    {t('diagnostic.send_report')}
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-medium">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">{t('diagnostic.free_consultation_title')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('diagnostic.free_consultation_subtitle')}
                  </p>
                  <Button 
                    variant="hero" 
                    className="w-full"
                    asChild
                  >
                    <a href="https://calendly.com/tlb-ov_p/30min" target="_blank" rel="noopener noreferrer">
                      {t('diagnostic.book_slot')}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Restart button */}
            <div className="text-center mt-8">
              <Button variant="outline" onClick={startNewDiagnostic}>
                {t('diagnostic.new_diagnostic')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-3xl font-bold text-foreground">{t('diagnostic.title')}</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('diagnostic.subtitle')}
            </p>
            
            {/* Progress bar */}
            <div className="mt-6 w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>{t('diagnostic.step_label')} {currentStep}/7</span>
              <span>{Math.round(progress)}% {t('diagnostic.progress_completed')}</span>
            </div>
          </div>

          {/* Question Card */}
          <Card className="shadow-elegant animate-fade-in hover-scale bg-gradient-to-br from-background to-secondary/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-primary">
                  {t('diagnostic.question_number')} {currentStep}
                </Badge>
                {currentStep === questions.length && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              <CardTitle className="text-xl">{currentQuestion.title}</CardTitle>
              <p className="text-muted-foreground">{currentQuestion.subtitle}</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Input field */}
              <div className="space-y-2">
                {currentQuestion.type === 'textarea' ? (
                  <Textarea
                    placeholder={currentQuestion.placeholder}
                    value={responses[currentQuestion.field as keyof typeof responses]}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                ) : (
                  <Input
                    placeholder={currentQuestion.placeholder}
                    value={responses[currentQuestion.field as keyof typeof responses]}
                    onChange={(e) => handleInputChange(e.target.value)}
                  />
                )}
              </div>

              {/* Examples */}
              {currentQuestion.examples.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('diagnostic.examples_label')}</p>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.examples.map((example, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-105 hover:shadow-md"
                        onClick={() => handleInputChange(example)}
                      >
                      {example}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="flex items-center transition-all duration-200 hover:scale-105"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('diagnostic.previous_button')}
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentStepComplete()}
                  variant={currentStep === questions.length ? "hero" : "default"}
                  className="flex items-center transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  {currentStep === questions.length ? t('diagnostic.see_recommendations') : t('diagnostic.next_button')}
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