-- Add enriched analysis fields for Ollama pipeline
ALTER TABLE cart_sessions ADD COLUMN IF NOT EXISTS ai_cartography_json JSONB;
ALTER TABLE cart_sessions ADD COLUMN IF NOT EXISTS ai_impact_quantification JSONB;
ALTER TABLE cart_sessions ADD COLUMN IF NOT EXISTS ai_cross_pack_analysis JSONB;
ALTER TABLE cart_sessions ADD COLUMN IF NOT EXISTS ai_target_vision JSONB;
