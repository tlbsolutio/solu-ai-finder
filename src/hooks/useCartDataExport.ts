import { useCallback, useState } from "react";
import type {
  CartSessionV2, CartPackResume, CartProcessusV2, CartOutilV2,
  CartEquipeV2, CartIrritantV2, CartTacheV2, CartQuickwinV2,
} from "@/lib/cartTypes";

export interface CartDataForExport {
  session: CartSessionV2;
  packResumes: CartPackResume[];
  processus: CartProcessusV2[];
  outils: CartOutilV2[];
  equipes: CartEquipeV2[];
  irritants: CartIrritantV2[];
  taches: CartTacheV2[];
  quickwins: CartQuickwinV2[];
}

const PACK_NAMES: Record<number, string> = {
  1: "Contexte & Strategie", 2: "Clients & Marche", 3: "Organisation",
  4: "Ressources Humaines", 5: "Communication", 6: "Operations",
  7: "Systemes d'Information", 8: "Communication Interne",
  9: "Qualite & Conformite", 10: "KPIs & Pilotage",
};

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 60);
}

// ─── JSON builders ──────────────────────────────────────────────────

function buildFreeJSON(data: CartDataForExport) {
  const { session, packResumes } = data;
  return {
    export_type: "free",
    exported_at: new Date().toISOString(),
    session: {
      id: session.id,
      nom: session.nom,
      status: session.status,
      sector_id: session.sector_id,
      packs_completed: session.packs_completed,
      created_at: session.created_at,
      updated_at: session.updated_at,
    },
    scores: packResumes.map((pr) => ({
      bloc: pr.bloc,
      pack_name: PACK_NAMES[pr.bloc] || `Pack ${pr.bloc}`,
      score_maturite: pr.score_maturite,
      objets_generes_count: pr.objets_generes_count,
      generated_at: pr.generated_at,
    })),
  };
}

function buildPaidJSON(data: CartDataForExport) {
  const { session, packResumes, processus, outils, equipes, irritants, taches, quickwins } = data;
  return {
    export_type: "full",
    exported_at: new Date().toISOString(),
    session: {
      id: session.id,
      nom: session.nom,
      status: session.status,
      tier: session.tier,
      sector_id: session.sector_id,
      sector_confidence: session.sector_confidence,
      packs_completed: session.packs_completed,
      final_generation_done: session.final_generation_done,
      analyse_status: session.analyse_status,
      created_at: session.created_at,
      updated_at: session.updated_at,
    },
    ai_analysis: {
      resume_executif: session.ai_resume_executif,
      forces: session.ai_forces,
      dysfonctionnements: session.ai_dysfonctionnements,
      plan_optimisation: session.ai_plan_optimisation,
      vision_cible: session.ai_vision_cible,
      analyse_transversale: session.ai_analyse_transversale,
      cout_inaction_annuel: session.ai_cout_inaction_annuel,
      kpis_de_suivi: session.ai_kpis_de_suivi,
      cartography_json: session.ai_cartography_json,
      impact_quantification: session.ai_impact_quantification,
      cross_pack_analysis: session.ai_cross_pack_analysis,
      target_vision: session.ai_target_vision,
    },
    scores: packResumes.map((pr) => ({
      bloc: pr.bloc,
      pack_name: PACK_NAMES[pr.bloc] || `Pack ${pr.bloc}`,
      score_maturite: pr.score_maturite,
      resume: pr.resume,
      alertes: pr.alertes,
      quickwins_ids: pr.quickwins_ids,
      objets_generes_count: pr.objets_generes_count,
      generated_at: pr.generated_at,
    })),
    processus: processus.map((p) => ({
      nom: p.nom,
      type: p.type,
      niveau_criticite: p.niveau_criticite,
      description: p.description,
      ai_generated: p.ai_generated,
      validated: p.validated,
    })),
    outils: outils.map((o) => ({
      nom: o.nom,
      type_outil: o.type_outil,
      niveau_usage: o.niveau_usage,
      problemes: o.problemes,
      ai_generated: o.ai_generated,
      validated: o.validated,
    })),
    equipes: equipes.map((e) => ({
      nom: e.nom,
      mission: e.mission,
      charge_estimee: e.charge_estimee,
      ai_generated: e.ai_generated,
      validated: e.validated,
    })),
    irritants: irritants.map((i) => ({
      intitule: i.intitule,
      type: i.type,
      gravite: i.gravite,
      impact: i.impact,
      description: i.description,
      ai_generated: i.ai_generated,
      validated: i.validated,
    })),
    taches: taches.map((t) => ({
      nom: t.nom,
      frequence: t.frequence,
      double_saisie: t.double_saisie,
      description: t.description,
      ai_generated: t.ai_generated,
    })),
    quickwins: quickwins.map((q) => ({
      intitule: q.intitule,
      categorie: q.categorie,
      impact: q.impact,
      effort: q.effort,
      description: q.description,
      statut: q.statut,
      priorite_calculee: q.priorite_calculee,
      bloc_source: q.bloc_source,
      ai_generated: q.ai_generated,
    })),
  };
}

// ─── CSV builders ───────────────────────────────────────────────────

function escapeCSV(value: unknown): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function arrayToCSV(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(escapeCSV).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCSV).join(","));
  }
  return lines.join("\n");
}

function buildFreeCSV(data: CartDataForExport): string {
  const { session, packResumes } = data;
  const parts: string[] = [];

  // Session info section
  parts.push("## Session");
  parts.push(arrayToCSV(
    ["Champ", "Valeur"],
    [
      ["ID", session.id],
      ["Nom", session.nom],
      ["Statut", session.status],
      ["Secteur", session.sector_id || ""],
      ["Packs completes", session.packs_completed],
      ["Cree le", session.created_at],
      ["Mis a jour", session.updated_at],
    ],
  ));

  parts.push("");
  parts.push("## Scores par pack");
  parts.push(arrayToCSV(
    ["Bloc", "Pack", "Score maturite", "Objets generes", "Date"],
    packResumes.map((pr) => [
      pr.bloc,
      PACK_NAMES[pr.bloc] || `Pack ${pr.bloc}`,
      pr.score_maturite ?? "",
      pr.objets_generes_count,
      pr.generated_at || "",
    ]),
  ));

  return parts.join("\n");
}

function buildPaidCSV(data: CartDataForExport): string {
  const { session, packResumes, processus, outils, equipes, irritants, taches, quickwins } = data;
  const parts: string[] = [];

  // Session info
  parts.push("## Session");
  parts.push(arrayToCSV(
    ["Champ", "Valeur"],
    [
      ["ID", session.id],
      ["Nom", session.nom],
      ["Tier", session.tier],
      ["Statut", session.status],
      ["Secteur", session.sector_id || ""],
      ["Packs completes", session.packs_completed],
      ["Analyse terminee", session.final_generation_done ? "Oui" : "Non"],
      ["Cree le", session.created_at],
      ["Mis a jour", session.updated_at],
    ],
  ));

  // Scores
  parts.push("");
  parts.push("## Scores par pack");
  parts.push(arrayToCSV(
    ["Bloc", "Pack", "Score maturite", "Resume", "Objets generes", "Date"],
    packResumes.map((pr) => [
      pr.bloc,
      PACK_NAMES[pr.bloc] || `Pack ${pr.bloc}`,
      pr.score_maturite ?? "",
      pr.resume || "",
      pr.objets_generes_count,
      pr.generated_at || "",
    ]),
  ));

  // Processus
  if (processus.length > 0) {
    parts.push("");
    parts.push("## Processus");
    parts.push(arrayToCSV(
      ["Nom", "Type", "Criticite", "Description", "IA", "Valide"],
      processus.map((p) => [p.nom, p.type || "", p.niveau_criticite || "", p.description || "", p.ai_generated ? "Oui" : "Non", p.validated ? "Oui" : "Non"]),
    ));
  }

  // Outils
  if (outils.length > 0) {
    parts.push("");
    parts.push("## Outils");
    parts.push(arrayToCSV(
      ["Nom", "Type", "Niveau usage", "Problemes", "IA", "Valide"],
      outils.map((o) => [o.nom, o.type_outil || "", o.niveau_usage ?? "", o.problemes || "", o.ai_generated ? "Oui" : "Non", o.validated ? "Oui" : "Non"]),
    ));
  }

  // Equipes
  if (equipes.length > 0) {
    parts.push("");
    parts.push("## Equipes");
    parts.push(arrayToCSV(
      ["Nom", "Mission", "Charge estimee", "IA", "Valide"],
      equipes.map((e) => [e.nom, e.mission || "", e.charge_estimee ?? "", e.ai_generated ? "Oui" : "Non", e.validated ? "Oui" : "Non"]),
    ));
  }

  // Irritants
  if (irritants.length > 0) {
    parts.push("");
    parts.push("## Irritants");
    parts.push(arrayToCSV(
      ["Intitule", "Type", "Gravite", "Impact", "Description", "IA", "Valide"],
      irritants.map((i) => [i.intitule, i.type || "", i.gravite ?? "", i.impact || "", i.description || "", i.ai_generated ? "Oui" : "Non", i.validated ? "Oui" : "Non"]),
    ));
  }

  // Quick Wins
  if (quickwins.length > 0) {
    parts.push("");
    parts.push("## Quick Wins");
    parts.push(arrayToCSV(
      ["Intitule", "Categorie", "Impact", "Effort", "Statut", "Priorite", "Description"],
      quickwins.map((q) => [q.intitule, q.categorie || "", q.impact || "", q.effort || "", q.statut, q.priorite_calculee || "", q.description || ""]),
    ));
  }

  // Taches
  if (taches.length > 0) {
    parts.push("");
    parts.push("## Taches");
    parts.push(arrayToCSV(
      ["Nom", "Frequence", "Double saisie", "Description", "IA"],
      taches.map((t) => [t.nom, t.frequence || "", t.double_saisie ? "Oui" : "Non", t.description || "", t.ai_generated ? "Oui" : "Non"]),
    ));
  }

  // AI Analysis text fields
  const aiFields: [string, string | null][] = [
    ["Resume executif", session.ai_resume_executif],
    ["Forces", session.ai_forces],
    ["Dysfonctionnements", session.ai_dysfonctionnements],
    ["Plan d'optimisation", session.ai_plan_optimisation],
    ["Vision cible", session.ai_vision_cible],
    ["Analyse transversale", session.ai_analyse_transversale],
    ["Cout inaction annuel", session.ai_cout_inaction_annuel],
    ["KPIs de suivi", session.ai_kpis_de_suivi],
  ];
  const nonNullAi = aiFields.filter(([, v]) => v);
  if (nonNullAi.length > 0) {
    parts.push("");
    parts.push("## Analyse IA");
    parts.push(arrayToCSV(
      ["Section", "Contenu"],
      nonNullAi.map(([label, value]) => [label, value || ""]),
    ));
  }

  return parts.join("\n");
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useCartDataExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportJSON = useCallback((data: CartDataForExport, isPaid: boolean) => {
    setIsExporting(true);
    try {
      const json = isPaid ? buildPaidJSON(data) : buildFreeJSON(data);
      const content = JSON.stringify(json, null, 2);
      const safeName = sanitizeFilename(data.session.nom);
      const suffix = isPaid ? "complet" : "apercu";
      downloadFile(content, `${safeName}_export_${suffix}.json`, "application/json");
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportCSV = useCallback((data: CartDataForExport, isPaid: boolean) => {
    setIsExporting(true);
    try {
      const csv = isPaid ? buildPaidCSV(data) : buildFreeCSV(data);
      const safeName = sanitizeFilename(data.session.nom);
      const suffix = isPaid ? "complet" : "apercu";
      downloadFile(csv, `${safeName}_export_${suffix}.csv`, "text/csv;charset=utf-8");
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportJSON, exportCSV, isExporting };
}
