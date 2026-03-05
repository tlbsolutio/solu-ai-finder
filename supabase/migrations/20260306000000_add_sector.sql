-- Add sector detection fields
ALTER TABLE cart_sessions ADD COLUMN IF NOT EXISTS sector_id TEXT;
ALTER TABLE cart_sessions ADD COLUMN IF NOT EXISTS sector_confidence REAL DEFAULT 0;
ALTER TABLE cart_quick_scans ADD COLUMN IF NOT EXISTS sector_detected TEXT;
