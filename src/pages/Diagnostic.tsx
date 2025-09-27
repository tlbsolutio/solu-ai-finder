import React, { useState } from 'react';
import Navigation from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DiagnosticFormSkeleton } from '@/components/ui/loading-skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageCircle, ArrowRight, ArrowLeft, CheckCircle, TrendingUp, Clock, Target, Mail, ExternalLink, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

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
    expectedResult: '',
    constraints: '',
    priority: ''
  });
  
  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ email: '', acceptMarketing: false });
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiScore, setAiScore] = useState<number>(0);
  const [aiEconomies, setAiEconomies] = useState<{
    heures: number;
    mensuelles: number;
    annuelles: number;
  }>({ heures: 0, mensuelles: 0, annuelles: 0 });
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  const questions = [
    {
      id: 1,
      title: t('diagnostic.question_task_title'),
      subtitle: t('diagnostic.question_task_subtitle'),
      type: "textarea",
      field: "task",
      placeholder: t('diagnostic.question_task_placeholder'),
      examples: ["Saisie de données clients", "Création de rapports", "Gestion des emails", "Planification de rendez-vous"]
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
      type: "textarea", 
      field: "sector",
      placeholder: t('diagnostic.question_sector_placeholder'),
      examples: ["E-commerce", "Consulting", "SaaS", "Finance", "Marketing", "RH"]
    },
    {
      id: 4,
      title: t('diagnostic.question_tools_title'),
      subtitle: t('diagnostic.question_tools_subtitle'),
      type: "input",
      field: "tools",
      placeholder: t('diagnostic.question_tools_placeholder'),
      examples: ["Excel", "Google Sheets", "CRM", "ERP", "Email", "Aucun outil"]
    },
    {
      id: 5,
      title: t('diagnostic.question_deliverable_title'),
      subtitle: t('diagnostic.question_deliverable_subtitle'),
      type: "textarea",
      field: "expectedResult",
      placeholder: t('diagnostic.question_deliverable_placeholder'),
      examples: ["Gagner du temps", "Réduire les erreurs", "Améliorer la productivité", "Simplifier les processus"]
    },
    {
      id: 6,
      title: t('diagnostic.question_constraints_title'),
      subtitle: t('diagnostic.question_constraints_subtitle'),
      type: "textarea",
      field: "constraints",
      placeholder: t('diagnostic.question_constraints_placeholder'),
      examples: ["Budget < 100€/mois", "Intégration ERP obligatoire", "Conformité RGPD", "Hébergement France", "Aucune contrainte"]
    },
    {
      id: 7,
      title: t('diagnostic.question_priority_title'),
      subtitle: t('diagnostic.question_priority_subtitle'),
      type: "input",
      field: "priority",
      placeholder: t('diagnostic.question_priority_placeholder'),
      examples: ["1", "2", "3", "4", "5"]
    }
  ];

  const currentQuestion = questions[currentStep - 1];
  const progress = (currentStep / questions.length) * 100;

  // Calculate financial savings
  const calculateFinancialSavings = () => {
    const hourlyRate = 21; // €/hour brut moyen France 2024
    const softwareCostMonthly = 35; // Coût moyen logiciel d'automatisation/mois
    let timePerTask = 4; // Default 4 heures (au lieu de 1h)
    let frequencyPerMonth = 1;
    
    // Estimate time based on task description - estimations réalistes
    const taskLower = responses.task.toLowerCase();
    
    // Rapports et analyses - tâches complexes
    if (taskLower.includes('rapport') || taskLower.includes('analyse') || taskLower.includes('dashboard') || taskLower.includes('indicateur') || taskLower.includes('kpi')) {
      timePerTask = 10; // 8-12h en moyenne
    }
    // Emails et saisie de données - tâches répétitives mais chronophages
    else if (taskLower.includes('email') || taskLower.includes('saisie') || taskLower.includes('données') || taskLower.includes('import') || taskLower.includes('export')) {
      timePerTask = 2.5; // 2-3h en moyenne
    }
    // Planification et gestion - tâches managériales
    else if (taskLower.includes('planification') || taskLower.includes('gestion') || taskLower.includes('suivi') || taskLower.includes('coordination') || taskLower.includes('organisation')) {
      timePerTask = 7; // 6-8h en moyenne
    }
    // Comptabilité et finance
    else if (taskLower.includes('comptabilité') || taskLower.includes('facture') || taskLower.includes('commande') || taskLower.includes('devis') || taskLower.includes('budget')) {
      timePerTask = 6; // 5-7h en moyenne
    }
    // Marketing et communication
    else if (taskLower.includes('marketing') || taskLower.includes('communication') || taskLower.includes('newsletter') || taskLower.includes('contenu') || taskLower.includes('social')) {
      timePerTask = 5; // 4-6h en moyenne
    }
    // RH et administratif
    else if (taskLower.includes('recrutement') || taskLower.includes('formation') || taskLower.includes('administratif') || taskLower.includes('documentation')) {
      timePerTask = 4.5; // 3-6h en moyenne
    }
    
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

  const handleNext = async () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsLoadingResults(true);
      try {
        console.log('🚀 Début analyse IA - Données diagnostiques:', responses);
        const result = await getAIRecommendations();
        console.log('🔍 DEBUG - AI Response reçue:', {
          recommendations: result.recommendations?.length || 0,
          score: result.score,
          economiesHeures: result.economiesHeures,
          economiesMensuelles: result.economiesMensuelles,
          economiesAnnuelles: result.economiesAnnuelles,
          analysis: result.analysis
        });
        
        // Stocker TOUS les résultats IA (pas de recalcul local)
        setAiScore(result.score);
        setAiEconomies({
          heures: result.economiesHeures,
          mensuelles: result.economiesMensuelles,
          annuelles: result.economiesAnnuelles
        });
        
        // Log des résultats IA pour diagnostic
        if (!result.recommendations || result.recommendations.length === 0) {
          console.warn('⚠️ ATTENTION - Aucune recommandation IA spécifique reçue');
          console.log('💡 Affichage des résultats avec message informatif');
          setAiRecommendations([]);
        } else {
          console.log('✅ Recommandations IA valides:', result.recommendations.length);
          setAiRecommendations(result.recommendations);
        }
        
        setShowResults(true);
      } catch (error) {
        console.error('❌ Erreur complète lors de la récupération des recommandations:', error);
        toast({
          title: "Service temporairement indisponible",
          description: "Impossible de générer les recommandations IA. Nos experts peuvent vous aider directement.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingResults(false);
      }
    }
  };

  const isFormValid = () => {
    return Object.values(responses).every(response => response.trim() !== '');
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

  // Get AI-powered recommendations
  const getAIRecommendations = async () => {
    try {
      console.log('🚀 Appel Supabase Function get-ai-recommendations...');
      const { data, error } = await supabase.functions.invoke('get-ai-recommendations', {
        body: { diagnosticData: responses }
      });
      
      if (error) {
        console.error('❌ Erreur Supabase Function:', error);
        throw error;
      }
      
      console.log('✅ Réponse Supabase Function reçue:', {
        hasData: !!data,
        score: data?.score,
        recommendationsCount: data?.recommendations?.length || 0,
        analysis: data?.analysis?.substring(0, 50) + '...'
      });
      
      return {
        score: data.score || 75,
        recommendations: data.recommendations || [],
        economiesHeures: data.economiesHeures || 15,
        economiesMensuelles: data.economiesMensuelles || 800,
        economiesAnnuelles: data.economiesAnnuelles || 9600,
        analysis: data.analysis || 'Analyse personnalisée de vos besoins'
      };
    } catch (error) {
      console.error('❌ Erreur complète getAIRecommendations:', error);
      toast({
        title: "Service temporairement indisponible",
        description: "Impossible de générer les recommandations IA. Veuillez réessayer.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Generate fallback score when AI is unavailable
  const generateScore = () => {
    let score = 60;
    if (responses.frequency.toLowerCase().includes('jour') || responses.frequency.toLowerCase().includes('quotidien')) score += 20;
    if (responses.task.length > 50) score += 10;
    if (responses.tools.toLowerCase().includes('excel') || responses.tools.toLowerCase().includes('manuel')) score += 15;
    return Math.min(score, 95);
  };

  const startNewDiagnostic = () => {
    setShowResults(false);
    setCurrentStep(1);
    setResponses({
      task: '',
      frequency: '',
      sector: '',
      tools: '',
      expectedResult: '',
      constraints: '',
      priority: ''
    });
    setEmailData({ email: '', acceptMarketing: false });
    setAiRecommendations([]);
    setAiScore(0);
    setAiEconomies({ heures: 0, mensuelles: 0, annuelles: 0 });
  };

  // Email sending functionality
  const handleSendEmail = async () => {
    if (!emailData.email || !emailData.acceptMarketing) return;
    
    setIsLoadingEmail(true);
    
    try {
      // Use current AI data (already loaded)
      const aiData = {
        score: aiScore,
        recommendations: aiRecommendations,
        analysis: 'Analyse personnalisée de vos besoins'
      };
      
      const financialSavings = {
        monthly: aiEconomies.mensuelles,
        annual: aiEconomies.annuelles,
        hours: aiEconomies.heures
      };
      
      // Send diagnostic data via Resend
      const { data, error } = await supabase.functions.invoke('send-diagnostic-email', {
        body: {
          email: emailData.email,
          acceptMarketing: emailData.acceptMarketing,
          diagnosticData: {
            responses,
            score: aiData.score,
            recommendations: aiData.recommendations,
            financialSavings,
            analysis: aiData.analysis
          }
        }
      });
      
      if (error) throw error;
      
      // Also send to Formspree for backup
      const diagnosticSummary = `
Diagnostic d'automatisation Solutio

Score d'automatisation: ${aiData.score}%
Économies mensuelles: ${financialSavings.monthly}€
Économies annuelles: ${financialSavings.annual}€

Résumé des réponses:
- Tâche à automatiser: ${responses.task}
- Fréquence: ${responses.frequency}
- Secteur: ${responses.sector}
- Outils actuels: ${responses.tools}
- Résultat attendu: ${responses.expectedResult}
- Contraintes spécifiques: ${responses.constraints}
- Priorité: ${responses.priority}/5

Recommandations:
${aiData.recommendations.map((rec, i) => `${i + 1}. ${rec.tool} - ${rec.reason}`).join('\n')}

Contact marketing accepté: ${emailData.acceptMarketing ? 'Oui' : 'Non'}

Généré par Solutio - https://solutio.work
      `;

      const formspreeData = new FormData();
      formspreeData.append('diagnostic_summary', diagnosticSummary);
      formspreeData.append('user_email', emailData.email);
      formspreeData.append('score', aiData.score.toString());
      formspreeData.append('recommendations', aiData.recommendations.map(r => r.tool).join(', '));
      formspreeData.append('marketing_consent', emailData.acceptMarketing.toString());
      
      await fetch('https://formspree.io/f/mqadkloe', {
        method: 'POST',
        body: formspreeData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      toast({
        title: "Récapitulatif envoyé !",
        description: "Vous recevrez le diagnostic détaillé par email dans quelques minutes.",
      });
      
      setShowEmailModal(false);
      setEmailData({ email: '', acceptMarketing: false });
      
    } catch (error) {
      console.error('Email sending error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le récapitulatif. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEmail(false);
    }
  };

  // Affichage du loader pendant l'analyse IA
  if (isLoadingResults) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-elegant bg-gradient-to-br from-background to-secondary/50">
              <CardContent className="text-center py-16">
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-spin border-t-primary"></div>
                    <div className="absolute inset-0 w-16 h-16 border-2 border-primary/10 rounded-full animate-pulse"></div>
                  </div>
                  
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Analyse en cours...</h2>
                    <p className="text-muted-foreground">
                      Notre IA analyse vos réponses et recherche les meilleures solutions d'automatisation
                    </p>
                    
                    <div className="flex items-center justify-center space-x-2 mt-4">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Affichage des résultats (avec ou sans recommandations IA)
  if (showResults) {
    // Utiliser les données IA (pas de recalcul local)

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
                  <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-20"></div>
                  <div className="w-40 h-40 rounded-full border-8 border-primary/20 flex items-center justify-center bg-background/80 backdrop-blur-sm shadow-glow">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary animate-fade-in">
                        {Math.round(aiScore)}%
                      </div>
                      <div className="text-sm text-muted-foreground">{t('diagnostic.potential_label')}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                    <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="font-semibold text-green-700 dark:text-green-400">
                      {Math.round(aiScore * 0.6)}%
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-500">{t('diagnostic.time_saved_label')}</div>
                  </Card>
                  
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                    <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="font-semibold text-blue-700 dark:text-blue-400">{aiEconomies.heures}h</div>
                    <div className="text-xs text-blue-600 dark:text-blue-500">Temps/mois économisé</div>
                  </Card>
                  
                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                    <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="font-semibold text-purple-700 dark:text-purple-400">{aiEconomies.mensuelles}€</div>
                    <div className="text-xs text-purple-600 dark:text-purple-500">Économies/mois</div>
                  </Card>
                  
                  <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
                    <TrendingUp className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <div className="font-semibold text-orange-700 dark:text-orange-400">{aiEconomies.annuelles}€</div>
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
                     <div className="font-semibold text-sm text-muted-foreground mb-1">Tâche à automatiser</div>
                     <p className="text-sm">{responses.task}</p>
                   </div>
                   <div>
                     <div className="font-semibold text-sm text-muted-foreground mb-1">Fréquence</div>
                     <p className="text-sm">{responses.frequency}</p>
                   </div>
                   <div>
                     <div className="font-semibold text-sm text-muted-foreground mb-1">Secteur et contraintes</div>
                     <p className="text-sm">{responses.sector}</p>
                   </div>
                   <div>
                     <div className="font-semibold text-sm text-muted-foreground mb-1">Outils actuels</div>
                     <p className="text-sm">{responses.tools}</p>
                   </div>
                   <div>
                     <div className="font-semibold text-sm text-muted-foreground mb-1">Résultat attendu</div>
                     <p className="text-sm">{responses.expectedResult}</p>
                   </div>
                   <div>
                      <div className="font-semibold text-sm text-muted-foreground mb-1">Contraintes spécifiques</div>
                      <p className="text-sm">{responses.constraints}</p>
                   </div>
                   <div>
                     <div className="font-semibold text-sm text-muted-foreground mb-1">Priorité</div>
                     <p className="text-sm">{responses.priority}/5</p>
                   </div>
                 </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="mb-6 shadow-elegant bg-gradient-to-br from-background to-secondary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  {t('diagnostic.ai_recommendations_title')}
                  {isLoadingResults && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                </CardTitle>
                <p className="text-muted-foreground">
                  Recommandations SaaS personnalisées basées sur votre diagnostic
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingResults ? (
                    <div className="grid gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                            <div className="w-12 h-12 bg-muted rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                              <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : aiRecommendations && aiRecommendations.length > 0 ? (
                    <div className="grid gap-6">
                      {aiRecommendations.map((rec: any, index: number) => {
                        const saas = rec.saasData;
                        
                        return (
                          <div
                            key={index}
                            className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-background to-secondary/30 p-6 shadow-medium hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
                          >
                            {/* Priority Badge */}
                            <div className="absolute top-4 right-4">
                              <Badge variant={rec.priority === 1 ? "default" : "secondary"} className="text-xs">
                                Priorité #{rec.priority}
                              </Badge>
                            </div>

                            {/* Header with logo and basic info */}
                            <div className="flex items-start gap-4 mb-4">
                              <div className="flex-shrink-0">
                                {saas?.logoUrl ? (
                                  <img 
                                    src={saas.logoUrl} 
                                    alt={`${saas.name} logo`}
                                    className="w-16 h-16 rounded-xl object-contain bg-background p-2 border border-border/20 shadow-sm"
                                    onError={(e) => {
                                      e.currentTarget.src = '/placeholder.svg';
                                    }}
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center border border-border/20">
                                    <TrendingUp className="h-8 w-8 text-primary" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                                  {saas?.name || rec.name || rec.tool}
                                </h3>
                                
                                {saas?.tagline && (
                                  <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                                    {saas.tagline}
                                  </p>
                                )}
                                
                                {/* Pricing */}
                                {saas?.pricingLinked?.length > 0 && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
                                      À partir de {saas.pricingLinked[0].price}
                                    </Badge>
                                    {saas.pricingLinked[0].popular && (
                                      <Badge variant="secondary" className="text-xs">
                                        Populaire
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* AI Recommendation reason */}
                            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-start gap-2">
                                <div className="p-1 bg-blue-100 dark:bg-blue-900/50 rounded">
                                  <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                    Recommandation IA personnalisée
                                  </p>
                                  <p className="text-sm text-blue-700 dark:text-blue-300">
                                    {rec.reason}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Pros/Advantages */}
                            {saas?.pros?.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  Avantages principaux
                                </h4>
                                <div className="grid gap-1">
                                  {saas.pros.slice(0, 3).map((pro: string, i: number) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                                      {pro}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Scores */}
                            {saas && (
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1">
                                  📊 Évaluation
                                </h4>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                                    <div className="text-lg font-bold text-green-600">{saas.automation || 0}%</div>
                                    <div className="text-xs text-muted-foreground">Automatisation</div>
                                  </div>
                                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                                    <div className="text-lg font-bold text-blue-600">{saas.ease || 0}%</div>
                                    <div className="text-xs text-muted-foreground">Facilité</div>
                                  </div>
                                  <div className="text-center p-2 bg-muted/30 rounded-lg">
                                    <div className="text-lg font-bold text-primary">{rec.automationScore || saas.score || 0}</div>
                                    <div className="text-xs text-muted-foreground">Score IA</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-border/20">
                              {saas?.website && (
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 min-w-[120px] hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                                >
                                  <a href={saas.website} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Site web
                                  </a>
                                </Button>
                              )}
                              
                              {saas?.trialUrl && (
                                <Button
                                  asChild
                                  variant="default"
                                  size="sm"
                                  className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                >
                                  <a href={saas.trialUrl} target="_blank" rel="noopener noreferrer">
                                    🆓 Essai gratuit
                                  </a>
                                </Button>
                              )}
                              
                              <Button
                                asChild
                                variant="hero"
                                size="sm"
                                className="flex-1 min-w-[120px] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                              >
                                <a 
                                  href={rec.id ? `/saas/${rec.id}` : `/catalogue?search=${encodeURIComponent(rec.name || rec.tool)}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={() => console.log(`Navigating to SaaS: ${rec.name} (ID: ${rec.id})`)}
                                >
                                  📋 Voir les détails
                                </a>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                     </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                        <div className="flex items-center justify-center mb-4">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                            <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          Analyse personnalisée nécessaire
                        </h3>
                        <p className="text-blue-700 dark:text-blue-300 mb-4">
                          Votre besoin d'automatisation est spécifique. Nos experts peuvent vous orienter vers les meilleures solutions adaptées à votre contexte.
                        </p>
                        <div className="space-y-3">
                          <Button 
                            asChild
                            variant="default"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <a href="/contact" target="_blank" rel="noopener noreferrer">
                              💬 Consulter nos experts
                            </a>
                          </Button>
                          <div className="text-sm text-blue-600 dark:text-blue-400">
                            Consultation gratuite • Réponse sous 24h
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Score IA:</span>
                        <span className="font-medium">{aiScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temps économisé/mois:</span>
                        <span className="font-medium">{aiEconomies.heures}h</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Économies mensuelles:</span>
                        <span className="font-medium text-green-600">{aiEconomies.mensuelles}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Économies annuelles:</span>
                        <span className="font-medium text-primary">{aiEconomies.annuelles}€</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recommandations:</span>
                        <span className="font-medium">{aiRecommendations.length} SaaS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Statut analyse:</span>
                        <span className="font-medium text-green-600">✓ Complète</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                    <strong>Note:</strong> Ces résultats sont générés par notre IA en analysant vos réponses et en sélectionnant les SaaS les plus adaptés à vos besoins spécifiques.
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
                     onClick={() => setShowEmailModal(true)}
                   >
                     Recevoir le récapitulatif par email
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
        
        {/* Email Modal */}
        <EmailModal 
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          emailData={emailData}
          setEmailData={setEmailData}
          onSendEmail={handleSendEmail}
          isLoading={isLoadingEmail}
        />
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

// Email Modal Component (will be added at the end)
const EmailModal = ({ 
  isOpen, 
  onClose, 
  emailData, 
  setEmailData, 
  onSendEmail, 
  isLoading 
}: {
  isOpen: boolean;
  onClose: () => void;
  emailData: { email: string; acceptMarketing: boolean };
  setEmailData: (data: { email: string; acceptMarketing: boolean }) => void;
  onSendEmail: () => void;
  isLoading: boolean;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Recevoir le récapitulatif par email
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Votre adresse email</label>
            <Input
              type="email"
              placeholder="votre.email@exemple.com"
              value={emailData.email}
              onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
              className="mt-1"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="marketing"
                checked={emailData.acceptMarketing}
                onCheckedChange={(checked) => 
                  setEmailData({ ...emailData, acceptMarketing: checked as boolean })
                }
                className="mt-1"
              />
              <label htmlFor="marketing" className="text-sm text-muted-foreground">
                J'accepte d'être contacté par Solutio pour des conseils personnalisés 
                et des informations sur leurs services d'automatisation. Mes clients 
                sont des professionnels, je comprends que ce démarchage est pertinent 
                pour mon activité.
              </label>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={onSendEmail}
              disabled={!emailData.email || !emailData.acceptMarketing || isLoading}
              className="flex-1"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Envoyer le récapitulatif
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};