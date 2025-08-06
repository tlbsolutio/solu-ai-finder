import React, { useState } from 'react';
import Navigation from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ArrowRight, ArrowLeft, CheckCircle, TrendingUp, Clock, Target, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Diagnostic = () => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [responses, setResponses] = useState({
    task: '',
    frequency: '',
    sector: '',
    tools: '',
    deliverable: '',
    constraints: ''
  });

  const questions = [
    {
      id: 1,
      title: "Quelle tâche vous fait perdre du temps ?",
      subtitle: "Décrivez la tâche répétitive qui vous fait perdre le plus de temps",
      type: "textarea",
      field: "task",
      placeholder: "Exemple: Saisie manuelle des factures clients, création de rapports mensuels...",
      examples: ["Saisie de données", "Création de rapports", "Gestion des emails", "Planification"]
    },
    {
      id: 2,
      title: "À quelle fréquence effectuez-vous cette tâche ?",
      subtitle: "Indiquez le volume et la fréquence",
      type: "input",
      field: "frequency",
      placeholder: "Exemple: 2 heures par jour, 10 fois par semaine...",
      examples: ["Quotidien", "Hebdomadaire", "Mensuel", "Ponctuel"]
    },
    {
      id: 3,
      title: "Dans quel secteur travaillez-vous ?",
      subtitle: "Précisez votre domaine d'activité",
      type: "input", 
      field: "sector",
      placeholder: "Exemple: E-commerce, Consulting, SaaS, Immobilier...",
      examples: ["E-commerce", "Consulting", "SaaS", "Finance", "Marketing", "RH"]
    },
    {
      id: 4,
      title: "Quels outils utilisez-vous actuellement ?",
      subtitle: "Listez les logiciels et outils que vous utilisez",
      type: "textarea",
      field: "tools",
      placeholder: "Exemple: Excel, Salesforce, Gmail, Slack...",
      examples: ["Excel", "Google Sheets", "CRM", "ERP", "Email"]
    },
    {
      id: 5,
      title: "Quel est le livrable final attendu ?",
      subtitle: "Décrivez le résultat final de cette tâche",
      type: "textarea",
      field: "deliverable",
      placeholder: "Exemple: Rapport PDF, données synchronisées, email personnalisé...",
      examples: ["Rapport", "Base de données", "Email", "Document", "Tableau de bord"]
    },
    {
      id: 6,
      title: "Y a-t-il des contraintes spécifiques ?",
      subtitle: "RGPD, validation manuelle, urgence, budget...",
      type: "textarea",
      field: "constraints",
      placeholder: "Exemple: Conformité RGPD, validation obligatoire, budget limité...",
      examples: ["RGPD", "Validation manuelle", "Budget limité", "Urgence", "Sécurité"]
    }
  ];

  const currentQuestion = questions[currentStep - 1];
  const progress = (currentStep / questions.length) * 100;

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

  const isCurrentStepComplete = responses[currentQuestion?.field as keyof typeof responses]?.trim() !== '';

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
      constraints: ''
    });
  };

  if (showResults) {
    const score = generateScore();
    const recommendations = getRecommendations();
    const timeSaved = Math.round(score * 0.6); // Estimation du temps gagné en %

    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Results Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <h1 className="text-3xl font-bold text-foreground">Diagnostic Terminé !</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Voici votre analyse personnalisée et nos recommandations
              </p>
            </div>

            {/* Score Card */}
            <Card className="mb-6 shadow-medium">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Score d'Automatisation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{score}%</div>
                      <div className="text-sm text-muted-foreground">Potentiel</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <div className="font-semibold">{timeSaved}%</div>
                    <div className="text-sm text-muted-foreground">Temps économisé</div>
                  </div>
                  <div className="text-center">
                    <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <div className="font-semibold">2-4 semaines</div>
                    <div className="text-sm text-muted-foreground">Mise en place</div>
                  </div>
                  <div className="text-center">
                    <Target className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                    <div className="font-semibold">ROI rapide</div>
                    <div className="text-sm text-muted-foreground">Rentabilité</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="mb-6 shadow-medium">
              <CardHeader>
                <CardTitle>Résumé de votre diagnostic</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground mb-1">TÂCHE À AUTOMATISER</div>
                    <p className="text-sm">{responses.task}</p>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground mb-1">FRÉQUENCE</div>
                    <p className="text-sm">{responses.frequency}</p>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground mb-1">SECTEUR</div>
                    <p className="text-sm">{responses.sector}</p>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground mb-1">OUTILS ACTUELS</div>
                    <p className="text-sm">{responses.tools}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="mb-6 shadow-medium">
              <CardHeader>
                <CardTitle>Nos recommandations pour vous</CardTitle>
                <p className="text-muted-foreground">Solutions adaptées à votre profil</p>
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
                          <div className="text-sm text-muted-foreground">Solution recommandée</div>
                        </div>
                      </div>
                      <Badge variant="secondary">Score élevé</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="shadow-medium">
                <CardContent className="p-6 text-center">
                  <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Recevoir par email</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Recevez ce diagnostic et nos recommandations détaillées
                  </p>
                  <Button variant="outline" className="w-full">
                    Envoyer le rapport
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-medium">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Consultation gratuite</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Échangez avec un expert pour affiner votre stratégie
                  </p>
                  <Button variant="hero" className="w-full">
                    Réserver un créneau
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Restart button */}
            <div className="text-center mt-8">
              <Button variant="outline" onClick={startNewDiagnostic}>
                Faire un nouveau diagnostic
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
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
              <span>Étape {currentStep}/6</span>
              <span>{Math.round(progress)}% complété</span>
            </div>
          </div>

          {/* Question Card */}
          <Card className="shadow-medium animate-fade-in">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-primary">
                  Question {currentStep}
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
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Exemples populaires :</p>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.examples.map((example, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleInputChange(example)}
                    >
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentStepComplete}
                  variant="hero"
                  className="flex items-center"
                >
                  {currentStep === questions.length ? 'Voir mes recommandations' : 'Suivant'}
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