-- Admin bypass: allow tlb@solutio.work to read ALL rows in cart_* tables
-- Uses auth.jwt()->>'email' to identify admin user

CREATE POLICY "cart_sessions_admin_read" ON cart_sessions FOR SELECT
  USING (auth.jwt()->>'email' = 'tlb@solutio.work');

CREATE POLICY "cart_reponses_admin_read" ON cart_reponses FOR SELECT
  USING (auth.jwt()->>'email' = 'tlb@solutio.work');

CREATE POLICY "cart_pack_resumes_admin_read" ON cart_pack_resumes FOR SELECT
  USING (auth.jwt()->>'email' = 'tlb@solutio.work');

CREATE POLICY "cart_processus_admin_read" ON cart_processus FOR SELECT
  USING (auth.jwt()->>'email' = 'tlb@solutio.work');

CREATE POLICY "cart_outils_admin_read" ON cart_outils FOR SELECT
  USING (auth.jwt()->>'email' = 'tlb@solutio.work');

CREATE POLICY "cart_equipes_admin_read" ON cart_equipes FOR SELECT
  USING (auth.jwt()->>'email' = 'tlb@solutio.work');

CREATE POLICY "cart_irritants_admin_read" ON cart_irritants FOR SELECT
  USING (auth.jwt()->>'email' = 'tlb@solutio.work');

CREATE POLICY "cart_taches_admin_read" ON cart_taches FOR SELECT
  USING (auth.jwt()->>'email' = 'tlb@solutio.work');

CREATE POLICY "cart_quickwins_admin_read" ON cart_quickwins FOR SELECT
  USING (auth.jwt()->>'email' = 'tlb@solutio.work');

CREATE POLICY "cart_subscriptions_admin_read" ON cart_subscriptions FOR SELECT
  USING (auth.jwt()->>'email' = 'tlb@solutio.work');

CREATE POLICY "cart_quick_scans_admin_read" ON cart_quick_scans FOR SELECT
  USING (auth.jwt()->>'email' = 'tlb@solutio.work');

-- Also allow admin to read analyses table if it exists
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cart_analyses') THEN
    EXECUTE 'CREATE POLICY "cart_analyses_admin_read" ON cart_analyses FOR SELECT USING (auth.jwt()->>''email'' = ''tlb@solutio.work'')';
  END IF;
END $$;
