import React, { useState } from 'react';
import Navigation from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, Phone, MessageCircle, Clock, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, send email and process form
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Merci pour votre message !</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Nous avons bien reçu votre demande et vous répondrons dans les plus brefs délais.
            </p>
            <Button variant="hero" onClick={() => setIsSubmitted(false)}>
              Envoyer un autre message
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Contactez-nous</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Besoin d'aide pour choisir la meilleure solution ? Nos experts sont là pour vous accompagner.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact form */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                Envoyez-nous un message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Nom complet *
                    </label>
                    <Input
                      id="name"
                      placeholder="Votre nom"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="company" className="text-sm font-medium">
                    Entreprise
                  </label>
                  <Input
                    id="company"
                    placeholder="Nom de votre entreprise"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Décrivez votre besoin ou votre projet..."
                    className="min-h-[120px] resize-none"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" variant="hero" size="lg">
                  Envoyer le message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact info & Calendly */}
          <div className="space-y-6">
            {/* Quick contact */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Contact direct</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">contact@solutio.fr</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <p className="text-muted-foreground">+33 1 23 45 67 89</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Horaires</p>
                    <p className="text-muted-foreground">Lun-Ven, 9h-18h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendly booking */}
            <Card className="shadow-medium border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Réserver un appel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Planifiez un appel de 30 minutes avec un expert pour discuter de vos besoins spécifiques.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Analyse gratuite de vos processus</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Recommandations personnalisées</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Plan d'implémentation détaillé</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant="premium" 
                  size="lg"
                  asChild
                >
                  <a href="https://calendly.com/solutio-expert" target="_blank" rel="noopener noreferrer">
                    <Calendar className="h-4 w-4 mr-2" />
                    Réserver maintenant
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* FAQ Quick */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Questions fréquentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Combien coûte un audit ?</h4>
                  <p className="text-sm text-muted-foreground">
                    L'audit initial est gratuit lors de notre premier appel.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Combien de temps pour voir des résultats ?</h4>
                  <p className="text-sm text-muted-foreground">
                    La plupart de nos clients voient des gains de temps dès la première semaine.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Vous accompagnez l'implémentation ?</h4>
                  <p className="text-sm text-muted-foreground">
                    Oui, nous proposons un accompagnement complet de A à Z.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;