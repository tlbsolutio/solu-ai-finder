import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Save, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useSeoContentGenerator, type SeoContentInput, type SeoContentOutput } from '@/hooks/useSeoContentGenerator';

const SeoContentGenerator: React.FC = () => {
  const [input, setInput] = useState<SeoContentInput>({
    page_name: '',
    goal: '',
    audience: '',
    target_keywords: [],
  });
  
  const [keywordInput, setKeywordInput] = useState('');
  const { isLoading, error, generatedContent, generateContent, saveContent } = useSeoContentGenerator();

  const handleInputChange = (field: keyof SeoContentInput, value: string) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const handleKeywordAdd = () => {
    if (keywordInput.trim()) {
      const keywords = keywordInput.split(',').map(k => k.trim()).filter(Boolean);
      setInput(prev => ({
        ...prev,
        target_keywords: [...new Set([...prev.target_keywords, ...keywords])]
      }));
      setKeywordInput('');
    }
  };

  const handleKeywordRemove = (keyword: string) => {
    setInput(prev => ({
      ...prev,
      target_keywords: prev.target_keywords.filter(k => k !== keyword)
    }));
  };

  const handleGenerate = async () => {
    if (!input.page_name || !input.goal || !input.audience || input.target_keywords.length === 0) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    await generateContent(input);
  };

  const handleSave = async () => {
    if (!generatedContent) return;
    
    const success = await saveContent(input, generatedContent);
    if (success) {
      toast.success('Contenu SEO sauvegardé avec succès');
    } else {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Copié dans le presse-papiers');
    } catch {
      toast.error('Erreur lors de la copie');
    }
  };

  const handleCopyJson = async () => {
    if (!generatedContent) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2));
      toast.success('JSON copié dans le presse-papiers');
    } catch {
      toast.error('Erreur lors de la copie du JSON');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Générateur de Contenu SEO
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="page_name">Nom de la page *</Label>
              <Input
                id="page_name"
                value={input.page_name}
                onChange={(e) => handleInputChange('page_name', e.target.value)}
                placeholder="ex: Page d'accueil, Catalogue SaaS..."
              />
            </div>
            
            <div>
              <Label htmlFor="goal">Objectif *</Label>
              <Input
                id="goal"
                value={input.goal}
                onChange={(e) => handleInputChange('goal', e.target.value)}
                placeholder="ex: Attirer des PME cherchant des SaaS..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="audience">Audience *</Label>
            <Input
              id="audience"
              value={input.audience}
              onChange={(e) => handleInputChange('audience', e.target.value)}
              placeholder="ex: PME, freelances, startups..."
            />
          </div>

          <div>
            <Label htmlFor="keywords">Mots-clés ciblés *</Label>
            <div className="flex gap-2">
              <Input
                id="keywords"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Tapez des mots-clés séparés par des virgules..."
                onKeyDown={(e) => e.key === 'Enter' && handleKeywordAdd()}
              />
              <Button type="button" onClick={handleKeywordAdd} variant="outline">
                Ajouter
              </Button>
            </div>
            
            {input.target_keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {input.target_keywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleKeywordRemove(keyword)}
                  >
                    {keyword} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Générer le contenu SEO
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Contenu généré</CardTitle>
              <div className="flex gap-2">
                <Button onClick={handleCopyJson} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copier JSON
                </Button>
                <Button onClick={handleSave} variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Slug URL</Label>
              <div className="flex items-center gap-2">
                <Input value={generatedContent.slug} readOnly />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(generatedContent.slug)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Titre SEO ({generatedContent.seo_title.length}/60)</Label>
              <div className="flex items-center gap-2">
                <Input value={generatedContent.seo_title} readOnly />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(generatedContent.seo_title)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {generatedContent.seo_title.length > 60 && (
                <p className="text-destructive text-xs mt-1">⚠️ Dépasse 60 caractères</p>
              )}
            </div>

            <div>
              <Label>Meta Description ({generatedContent.meta_description.length}/160)</Label>
              <div className="flex items-start gap-2">
                <Textarea value={generatedContent.meta_description} readOnly rows={2} />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(generatedContent.meta_description)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {generatedContent.meta_description.length > 160 && (
                <p className="text-destructive text-xs mt-1">⚠️ Dépasse 160 caractères</p>
              )}
            </div>

            <div>
              <Label>Titre H1</Label>
              <div className="flex items-center gap-2">
                <Input value={generatedContent.h1} readOnly />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(generatedContent.h1)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Texte d'introduction</Label>
              <div className="flex items-start gap-2">
                <Textarea value={generatedContent.intro_text} readOnly rows={4} />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(generatedContent.intro_text)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Call-to-Action</Label>
              <div className="flex items-center gap-2">
                <Input value={generatedContent.cta} readOnly />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(generatedContent.cta)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Mots-clés SEO</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {generatedContent.seo_keywords.map((keyword) => (
                  <Badge key={keyword} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeoContentGenerator;