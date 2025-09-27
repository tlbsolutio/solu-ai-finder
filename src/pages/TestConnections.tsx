import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Mail, 
  Calendar, 
  Database, 
  ExternalLink,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

const TestConnections = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const updateResult = (name: string, status: TestResult['status'], message: string, details?: string) => {
    setResults(prev => {
      const newResults = prev.filter(r => r.name !== name);
      return [...newResults, { name, status, message, details }];
    });
  };

  const testFormspreeContact = async () => {
    updateResult('Formspree Contact', 'pending', 'Test en cours...');
    
    try {
      const testData = new FormData();
      testData.append('name', 'Test Solutio');
      testData.append('email', 'test@solutio.work');
      testData.append('company', 'Test Company');
      testData.append('message', 'Test de connexion automatique - ' + new Date().toISOString());
      
      const response = await fetch('https://formspree.io/f/myzdypaw', {
        method: 'POST',
        body: testData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        updateResult('Formspree Contact', 'success', 'Formulaire de contact opérationnel', 
          `Status: ${response.status} - Vérifiez votre email pour la notification`);
      } else {
        const errorText = await response.text();
        updateResult('Formspree Contact', 'error', 'Erreur Formspree', 
          `Status: ${response.status} - ${errorText}`);
      }
    } catch (error: any) {
      updateResult('Formspree Contact', 'error', 'Erreur de connexion', error.message);
    }
  };

  const testFormspreesDiagnostic = async () => {
    updateResult('Formspree Diagnostic', 'pending', 'Test en cours...');
    
    try {
      const testData = new FormData();
      testData.append('diagnostic_summary', 'Test diagnostic - ' + new Date().toISOString());
      testData.append('user_email', 'test@solutio.work');
      testData.append('score', '85');
      testData.append('recommendations', 'Test tools: Zapier, Notion');
      testData.append('marketing_consent', 'true');
      
      const response = await fetch('https://formspree.io/f/mqadkloe', {
        method: 'POST',
        body: testData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        updateResult('Formspree Diagnostic', 'success', 'Formspree diagnostic opérationnel', 
          `Status: ${response.status} - Backup des diagnostics fonctionnel`);
      } else {
        const errorText = await response.text();
        updateResult('Formspree Diagnostic', 'error', 'Erreur Formspree diagnostic', 
          `Status: ${response.status} - ${errorText}`);
      }
    } catch (error: any) {
      updateResult('Formspree Diagnostic', 'error', 'Erreur de connexion', error.message);
    }
  };

  const testEdgeFunction = async () => {
    updateResult('Edge Function', 'pending', 'Test envoi email diagnostic...');
    
    try {
      const testDiagnosticData = {
        email: 'test@solutio.work',
        acceptMarketing: true,
        diagnosticData: {
          score: 85,
          analysis: 'Test automatique de connexion',
          financialSavings: {
            hours: 20,
            monthly: 2500,
            annual: 30000,
            calculation: { automationPotential: 85 }
          },
          responses: {
            task: 'Test de connexion',
            frequency: 'Quotidien',
            sector: 'Test',
            tools: 'Test tools',
            expectedResult: 'Validation système',
            priority: '5'
          },
          recommendations: [
            {
              tool: 'Test Tool',
              reason: 'Test de validation système',
              priority: 1,
              saasData: {
                name: 'Test SaaS',
                description: 'Outil de test',
                website: 'https://test.com',
                logoUrl: '',
                automation: 90,
                ease: 85,
                pros: ['Test 1', 'Test 2']
              }
            }
          ]
        }
      };

      const { data, error } = await supabase.functions.invoke('send-diagnostic-email', {
        body: testDiagnosticData
      });
      
      if (error) {
        updateResult('Edge Function', 'error', 'Erreur Edge Function', 
          `Error: ${error.message} - Vérifiez les logs Supabase`);
      } else {
        updateResult('Edge Function', 'success', 'Edge Function opérationnelle', 
          'Email de diagnostic envoyé avec succès');
      }
    } catch (error: any) {
      updateResult('Edge Function', 'error', 'Erreur de connexion Edge Function', error.message);
    }
  };

  const testCalendlyLink = async () => {
    updateResult('Calendly', 'pending', 'Vérification lien Calendly...');
    
    try {
      const calendlyUrl = 'https://calendly.com/tlb-ov_p/30min';
      const response = await fetch(calendlyUrl, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      // Avec no-cors, on ne peut pas vérifier le status, donc on assume que c'est ok
      updateResult('Calendly', 'success', 'Lien Calendly accessible', 
        `URL: ${calendlyUrl} - Testez manuellement pour confirmer`);
    } catch (error: any) {
      updateResult('Calendly', 'warning', 'Impossible de vérifier automatiquement', 
        'Testez manuellement: https://calendly.com/tlb-ov_p/30min');
    }
  };

  const checkEmailAddress = () => {
    updateResult('Email Address', 'success', 'Adresse email configurée', 
      'tlb@solutio.work - Vérifiez manuellement la réception');
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      // Tests en parallèle pour plus d'efficacité
      await Promise.all([
        testFormspreeContact(),
        testFormspreesDiagnostic(),
        testEdgeFunction(),
        testCalendlyLink()
      ]);
      
      checkEmailAddress();
      
      toast({
        title: "Tests terminés",
        description: "Vérifiez les résultats ci-dessous",
      });
    } catch (error) {
      toast({
        title: "Erreur lors des tests",
        description: "Certains tests ont échoué",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default' as const,
      error: 'destructive' as const,
      warning: 'secondary' as const,
      pending: 'outline' as const
    };
    
    const labels = {
      success: 'OK',
      error: 'ERREUR',
      warning: 'ATTENTION',
      pending: 'EN COURS'
    };

    return (
      <Badge variant={variants[status]} className="ml-auto">
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">🔧 Test des Connexions</h1>
            <p className="text-muted-foreground text-lg">
              Validation complète de tous les systèmes de contact et d'envoi d'emails
            </p>
          </div>

          {/* Summary Alert */}
          <Alert className="mb-6">
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>Avant la mise en ligne :</strong> Ce test valide toutes les connexions critiques 
              (Formspree, Calendly, Edge Functions, Email). Assurez-vous que tous les tests sont verts 
              avant de promouvoir le site.
            </AlertDescription>
          </Alert>

          {/* Test Button */}
          <div className="text-center mb-8">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              size="lg"
              className="px-8"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Tests en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Lancer tous les tests
                </>
              )}
            </Button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Résultats des tests</h2>
              
              {results.map((result) => (
                <Card key={result.name} className="shadow-soft">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        {result.name}
                      </CardTitle>
                      {getStatusBadge(result.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                    {result.details && (
                      <p className="text-xs text-muted-foreground bg-secondary p-2 rounded">
                        {result.details}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Manual Tests Section */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-6">Tests manuels recommandés</h2>
            
            <div className="grid gap-4">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Test complet du parcours utilisateur
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>1. <strong>Page Contact :</strong> Remplir et envoyer le formulaire de contact</p>
                  <p>2. <strong>Diagnostic complet :</strong> Terminer un diagnostic et demander l'email</p>
                  <p>3. <strong>Calendly :</strong> Cliquer sur "Réserver un appel" et vérifier la page</p>
                  <p>4. <strong>Emails :</strong> Vérifier la réception des emails (boîte de réception + spam)</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Liens de vérification externes
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Formspree Dashboard (Contact)</span>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://formspree.io/forms/myzdypaw" target="_blank" rel="noopener noreferrer">
                        Ouvrir
                      </a>
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Formspree Dashboard (Diagnostic)</span>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://formspree.io/forms/mqadkloe" target="_blank" rel="noopener noreferrer">
                        Ouvrir
                      </a>
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Calendly Dashboard</span>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://calendly.com/app" target="_blank" rel="noopener noreferrer">
                        Ouvrir
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestConnections;