-- Cartographie tables for solutio.work
-- Adapted from human-scan-suite: owner_id replaces consultant_id, no FK to entreprises

-- Sessions
CREATE TABLE IF NOT EXISTS cart_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL,
  nom TEXT NOT NULL DEFAULT 'Nouvelle session',
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'paid')),
  status TEXT NOT NULL DEFAULT 'brouillon',
  packs_completed INTEGER NOT NULL DEFAULT 0,
  pack_status_json JSONB NOT NULL DEFAULT '{}',
  final_generation_done BOOLEAN NOT NULL DEFAULT false,
  ai_resume_executif TEXT,
  ai_forces TEXT,
  ai_dysfonctionnements TEXT,
  ai_plan_optimisation TEXT,
  ai_vision_cible TEXT,
  ai_analyse_transversale TEXT,
  analyse_status TEXT NOT NULL DEFAULT 'non_generee',
  sector_id TEXT,
  sector_confidence NUMERIC,
  ai_cartography_json JSONB,
  ai_impact_quantification JSONB,
  ai_cross_pack_analysis JSONB,
  ai_target_vision JSONB,
  ai_cout_inaction_annuel TEXT,
  ai_kpis_de_suivi TEXT,
  notes_internes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Questions (seed data loaded separately)
CREATE TABLE IF NOT EXISTS cart_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT,
  bloc INTEGER NOT NULL,
  section TEXT,
  texte TEXT NOT NULL,
  type_reponse TEXT NOT NULL DEFAULT 'Texte',
  actif BOOLEAN NOT NULL DEFAULT true,
  ordre INTEGER NOT NULL DEFAULT 0
);

-- Responses
CREATE TABLE IF NOT EXISTS cart_reponses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES cart_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES cart_questions(id),
  code_question TEXT,
  bloc INTEGER,
  reponse_brute TEXT,
  importance INTEGER,
  answered_at TIMESTAMPTZ,
  pack_batch_id TEXT,
  UNIQUE(session_id, question_id)
);

-- Pack resumes (per-bloc AI analysis)
CREATE TABLE IF NOT EXISTS cart_pack_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES cart_sessions(id) ON DELETE CASCADE,
  bloc INTEGER NOT NULL,
  resume TEXT,
  score_maturite INTEGER,
  alertes JSONB DEFAULT '[]',
  quickwins_ids TEXT[] DEFAULT '{}',
  objets_generes_count INTEGER DEFAULT 0,
  generated_at TIMESTAMPTZ,
  UNIQUE(session_id, bloc)
);

-- Processus
CREATE TABLE IF NOT EXISTS cart_processus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES cart_sessions(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  type TEXT,
  niveau_criticite TEXT,
  description TEXT,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  validated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Outils
CREATE TABLE IF NOT EXISTS cart_outils (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES cart_sessions(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  type_outil TEXT,
  niveau_usage INTEGER,
  problemes TEXT,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  validated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Equipes
CREATE TABLE IF NOT EXISTS cart_equipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES cart_sessions(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  mission TEXT,
  charge_estimee INTEGER,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  validated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Irritants
CREATE TABLE IF NOT EXISTS cart_irritants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES cart_sessions(id) ON DELETE CASCADE,
  intitule TEXT NOT NULL,
  type TEXT,
  gravite INTEGER,
  impact TEXT,
  description TEXT,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  validated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Taches manuelles
CREATE TABLE IF NOT EXISTS cart_taches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES cart_sessions(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  frequence TEXT,
  double_saisie BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quickwins
CREATE TABLE IF NOT EXISTS cart_quickwins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES cart_sessions(id) ON DELETE CASCADE,
  bloc_source INTEGER,
  intitule TEXT NOT NULL,
  categorie TEXT,
  impact TEXT,
  effort TEXT,
  description TEXT,
  statut TEXT NOT NULL DEFAULT 'a_faire',
  priorite_calculee TEXT,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions (freemium tracking)
CREATE TABLE IF NOT EXISTS cart_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired')),
  payment_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quick scans (teaser results)
CREATE TABLE IF NOT EXISTS cart_quick_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL,
  description_libre TEXT,
  reponses_rapides JSONB DEFAULT '{}',
  resultats JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE cart_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_reponses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_pack_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_processus ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_outils ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_irritants ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_taches ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_quickwins ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_quick_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can read questions
CREATE POLICY "cart_questions_read" ON cart_questions FOR SELECT USING (true);

-- Owner-based policies for sessions
CREATE POLICY "cart_sessions_owner" ON cart_sessions FOR ALL USING (owner_id = auth.uid()::TEXT);
CREATE POLICY "cart_reponses_owner" ON cart_reponses FOR ALL USING (
  session_id IN (SELECT id FROM cart_sessions WHERE owner_id = auth.uid()::TEXT)
);
CREATE POLICY "cart_pack_resumes_owner" ON cart_pack_resumes FOR ALL USING (
  session_id IN (SELECT id FROM cart_sessions WHERE owner_id = auth.uid()::TEXT)
);
CREATE POLICY "cart_processus_owner" ON cart_processus FOR ALL USING (
  session_id IN (SELECT id FROM cart_sessions WHERE owner_id = auth.uid()::TEXT)
);
CREATE POLICY "cart_outils_owner" ON cart_outils FOR ALL USING (
  session_id IN (SELECT id FROM cart_sessions WHERE owner_id = auth.uid()::TEXT)
);
CREATE POLICY "cart_equipes_owner" ON cart_equipes FOR ALL USING (
  session_id IN (SELECT id FROM cart_sessions WHERE owner_id = auth.uid()::TEXT)
);
CREATE POLICY "cart_irritants_owner" ON cart_irritants FOR ALL USING (
  session_id IN (SELECT id FROM cart_sessions WHERE owner_id = auth.uid()::TEXT)
);
CREATE POLICY "cart_taches_owner" ON cart_taches FOR ALL USING (
  session_id IN (SELECT id FROM cart_sessions WHERE owner_id = auth.uid()::TEXT)
);
CREATE POLICY "cart_quickwins_owner" ON cart_quickwins FOR ALL USING (
  session_id IN (SELECT id FROM cart_sessions WHERE owner_id = auth.uid()::TEXT)
);
CREATE POLICY "cart_subscriptions_owner" ON cart_subscriptions FOR ALL USING (owner_id = auth.uid()::TEXT);
CREATE POLICY "cart_quick_scans_owner" ON cart_quick_scans FOR ALL USING (owner_id = auth.uid()::TEXT);

-- Indexes
CREATE INDEX idx_cart_sessions_owner ON cart_sessions(owner_id);
CREATE INDEX idx_cart_reponses_session ON cart_reponses(session_id);
CREATE INDEX idx_cart_reponses_bloc ON cart_reponses(session_id, bloc);
CREATE INDEX idx_cart_questions_bloc ON cart_questions(bloc, actif);
CREATE INDEX idx_cart_pack_resumes_session ON cart_pack_resumes(session_id);
CREATE INDEX idx_cart_quickwins_session ON cart_quickwins(session_id);
