-- Add session_id to cart_subscriptions for per-session payment model
-- 1 payment = 1 session (not global access)
ALTER TABLE cart_subscriptions ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES cart_sessions(id);

-- Index for fast lookup by session
CREATE INDEX IF NOT EXISTS idx_cart_subscriptions_session_id ON cart_subscriptions(session_id);

-- Update RLS policy to allow reading subscriptions for sessions you own
DROP POLICY IF EXISTS "cart_subscriptions_owner" ON cart_subscriptions;
CREATE POLICY "cart_subscriptions_owner" ON cart_subscriptions
  FOR ALL USING (owner_id = auth.uid()::TEXT);
