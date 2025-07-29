import React, { useState } from 'react';
import Navigation from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

const Diagnostic = () => {
  const [currentStep, setCurrentStep] = useState(1);
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
      // Generate results
      console.log('Diagnostic completed:', responses);
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

  const isCurrentStepComplete = responses[currentQuestion.field as keyof typeof responses].trim() !== '';

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-3xl font-bold text-foreground">Diagnostic IA</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Répondez à 6 questions simples pour découvrir les meilleures solutions d'automatisation pour votre activité
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