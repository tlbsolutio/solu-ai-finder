// Cartographie types for solutio.work
// Adapted from human-scan-suite: owner_id replaces consultant_id

export interface CartSessionV2 {
  id: string;
  owner_id: string;
  nom: string;
  tier: "free" | "paid";
  status: string;
  packs_completed: number;
  pack_status_json: Record<string, string>;
  final_generation_done: boolean;
  ai_resume_executif: string | null;
  ai_forces: string | null;
  ai_dysfonctionnements: string | null;
  ai_plan_optimisation: string | null;
  ai_vision_cible: string | null;
  ai_analyse_transversale: string | null;
  analyse_status: string;
  notes_internes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartPackResume {
  id: string;
  session_id: string;
  bloc: number;
  resume: string | null;
  score_maturite: number | null;
  alertes: any[];
  quickwins_ids: string[];
  objets_generes_count: number;
  generated_at: string | null;
}

export interface CartProcessusV2 {
  id: string;
  session_id: string;
  nom: string;
  type: string | null;
  niveau_criticite: string | null;
  description: string | null;
  ai_generated: boolean;
  validated: boolean;
  created_at: string;
}

export interface CartOutilV2 {
  id: string;
  session_id: string;
  nom: string;
  type_outil: string | null;
  niveau_usage: number | null;
  problemes: string | null;
  ai_generated: boolean;
  validated: boolean;
  created_at: string;
}

export interface CartEquipeV2 {
  id: string;
  session_id: string;
  nom: string;
  mission: string | null;
  charge_estimee: number | null;
  ai_generated: boolean;
  validated: boolean;
  created_at: string;
}

export interface CartIrritantV2 {
  id: string;
  session_id: string;
  intitule: string;
  type: string | null;
  gravite: number | null;
  impact: string | null;
  description: string | null;
  ai_generated: boolean;
  validated: boolean;
  created_at: string;
}

export interface CartTacheV2 {
  id: string;
  session_id: string;
  nom: string;
  frequence: string | null;
  double_saisie: boolean;
  description: string | null;
  ai_generated: boolean;
  created_at: string;
}

export interface CartQuickwinV2 {
  id: string;
  session_id: string;
  bloc_source: number | null;
  intitule: string;
  categorie: string | null;
  impact: string | null;
  effort: string | null;
  description: string | null;
  statut: string;
  priorite_calculee: string | null;
  ai_generated: boolean;
  created_at: string;
}

export interface CartReponseV2 {
  id: string;
  session_id: string;
  question_id: string | null;
  code_question: string | null;
  bloc: number | null;
  reponse_brute: string | null;
  importance: number | null;
  answered_at: string | null;
  pack_batch_id: string | null;
}

export interface CartQuestionV2 {
  id: string;
  code: string | null;
  bloc: number;
  section: string | null;
  texte: string;
  type_reponse: string;
  actif: boolean;
  ordre: number;
}
