import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sparkles, Search, Calendar, FileText, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSeoContentGenerator } from '@/hooks/useSeoContentGenerator';
import SeoContentGenerator from '@/components/seo/SeoContentGenerator';
import MetaTags from '@/components/seo/MetaTags';

interface SavedSeoContent {
  id: string;
  page_name: string;
  goal: string;
  audience: string;
  target_keywords: string[];
  slug: string;
  seo_title: string;
  meta_description: string;
  h1: string;
  intro_text: string;
  cta: string;
  seo_keywords: string[];
  created_at: string;
  updated_at: string;
}

const SeoManager: React.FC = () => {
  const [savedContent, setSavedContent] = useState<SavedSeoContent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('generator');
  const { loadSavedContent } = useSeoContentGenerator();

  useEffect(() => {
    loadSavedContentData();
  }, []);

  const loadSavedContentData = async () => {
    const data = await loadSavedContent();
    setSavedContent(data || []);
  };

  const filteredContent = savedContent.filter((content) =>
    content.page_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.seo_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    content.seo_keywords.some(keyword => 
      keyword.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Gestionnaire SEO - Générateur de contenu optimisé"
        description="Gérez et générez du contenu SEO optimisé pour vos pages web. Outils professionnels de référencement."
        noIndex={true}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Gestionnaire SEO
          </h1>
          <p className="text-muted-foreground mt-2">
            Générez et gérez du contenu SEO optimisé pour toutes vos pages
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Générateur
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contenu sauvé ({savedContent.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Analytics SEO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="mt-6">
            <SeoContentGenerator />
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Contenu SEO sauvegardé</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Rechercher dans le contenu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button onClick={loadSavedContentData} variant="outline" size="sm">
                      Actualiser
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredContent.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {savedContent.length === 0 
                        ? "Aucun contenu SEO sauvegardé"
                        : "Aucun résultat trouvé pour votre recherche"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Page</TableHead>
                          <TableHead>Titre SEO</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Mots-clés</TableHead>
                          <TableHead>Créé le</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredContent.map((content) => (
                          <TableRow key={content.id}>
                            <TableCell className="font-medium">
                              {content.page_name}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate" title={content.seo_title}>
                                {content.seo_title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {content.seo_title.length}/60 chars
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {content.slug}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {content.seo_keywords.slice(0, 3).map((keyword) => (
                                  <Badge key={keyword} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                                {content.seo_keywords.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{content.seo_keywords.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatDate(content.created_at)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics SEO</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Pages optimisées</p>
                          <p className="text-2xl font-bold">{savedContent.length}</p>
                        </div>
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Titres trop longs</p>
                          <p className="text-2xl font-bold text-destructive">
                            {savedContent.filter(c => c.seo_title.length > 60).length}
                          </p>
                        </div>
                        <Settings className="h-8 w-8 text-destructive" />
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Descriptions trop longues</p>
                          <p className="text-2xl font-bold text-destructive">
                            {savedContent.filter(c => c.meta_description.length > 160).length}
                          </p>
                        </div>
                        <Calendar className="h-8 w-8 text-destructive" />
                      </div>
                    </Card>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold mb-4">Pages nécessitant une optimisation</h3>
                    {savedContent.filter(c => c.seo_title.length > 60 || c.meta_description.length > 160).length === 0 ? (
                      <p className="text-muted-foreground">Toutes vos pages respectent les bonnes pratiques SEO ✅</p>
                    ) : (
                      <div className="space-y-2">
                        {savedContent
                          .filter(c => c.seo_title.length > 60 || c.meta_description.length > 160)
                          .map((content) => (
                            <div key={content.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{content.page_name}</p>
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                  {content.seo_title.length > 60 && (
                                    <span className="text-destructive">
                                      Titre: {content.seo_title.length}/60 chars
                                    </span>
                                  )}
                                  {content.meta_description.length > 160 && (
                                    <span className="text-destructive">
                                      Description: {content.meta_description.length}/160 chars
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                Optimiser
                              </Button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SeoManager;