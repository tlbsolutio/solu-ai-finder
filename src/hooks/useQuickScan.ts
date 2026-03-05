import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface QuickScanResult {
  scores: Record<string, number>;
  quick_wins: Array<{ action: string; impact: string; effort: string; categorie: string }>;
  dysfonctionnements: string[];
  resume: string;
}

export function useQuickScan() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuickScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runScan = async (descriptionLibre: string, reponsesRapides: Record<string, string>) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("cart-quick-scan", {
        body: { description_libre: descriptionLibre, reponses_rapides: reponsesRapides },
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setResult({
        scores: data.scores || {},
        quick_wins: data.quick_wins || [],
        dysfonctionnements: data.dysfonctionnements || [],
        resume: data.resume || "",
      });
    } catch (e: any) {
      setError(e.message || "Erreur lors du scan");
    } finally {
      setLoading(false);
    }
  };

  return { runScan, loading, result, error };
}
