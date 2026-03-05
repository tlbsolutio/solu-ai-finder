import type { CartPackResume } from "@/lib/cartTypes";

export interface ValidationAlert {
  type: "incoherence" | "contradiction" | "anomalie";
  packs: number[];
  message: string;
  severity: "info" | "warning" | "critical";
}

export function validateCrossPack(packResumes: CartPackResume[]): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];
  const scores: Record<number, number> = {};

  for (const pr of packResumes) {
    if (pr.score_maturite != null) {
      scores[pr.bloc] = pr.score_maturite;
    }
  }

  // Rule 1: High RH score but low communication = suspicious
  if (scores[4] && scores[8] && scores[4] >= 4 && scores[8] <= 2) {
    alerts.push({
      type: "incoherence",
      packs: [4, 8],
      message: "Score RH eleve mais communication interne faible : verifier la coherence des reponses sur l'engagement et la communication.",
      severity: "warning",
    });
  }

  // Rule 2: High tools score but low processes = tool sprawl
  if (scores[7] && scores[6] && scores[7] >= 4 && scores[6] <= 2) {
    alerts.push({
      type: "anomalie",
      packs: [7, 6],
      message: "Outils bien notes mais processus operationnels faibles : risque de surabondance d'outils sans processus structures.",
      severity: "warning",
    });
  }

  // Rule 3: Strong KPIs but weak strategy
  if (scores[10] && scores[3] && scores[10] >= 4 && scores[3] <= 2) {
    alerts.push({
      type: "incoherence",
      packs: [10, 3],
      message: "Bon pilotage KPI mais gouvernance faible : les indicateurs ne sont peut-etre pas alignes sur une vision strategique claire.",
      severity: "warning",
    });
  }

  // Rule 4: Weak quality + weak operations = critical
  if (scores[9] && scores[6] && scores[9] <= 2 && scores[6] <= 2) {
    alerts.push({
      type: "anomalie",
      packs: [9, 6],
      message: "Qualite ET processus operationnels faibles : risque majeur pour la satisfaction client et la perennite.",
      severity: "critical",
    });
  }

  // Rule 5: Very high commercial but low delivery
  if (scores[5] && scores[6] && scores[5] >= 4 && scores[6] <= 2) {
    alerts.push({
      type: "contradiction",
      packs: [5, 6],
      message: "Forte performance commerciale mais operations faibles : risque de sur-promesse et d'insatisfaction client.",
      severity: "critical",
    });
  }

  // Rule 6: Large spread between best and worst scores
  const scoreValues = Object.values(scores);
  if (scoreValues.length >= 5) {
    const max = Math.max(...scoreValues);
    const min = Math.min(...scoreValues);
    if (max - min >= 3) {
      alerts.push({
        type: "anomalie",
        packs: [],
        message: `Ecart important entre le meilleur pack (${max}/5) et le plus faible (${min}/5) : l'organisation presente des desequilibres significatifs.`,
        severity: "info",
      });
    }
  }

  return alerts;
}
