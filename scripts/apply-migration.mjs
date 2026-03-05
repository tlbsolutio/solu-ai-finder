/**
 * Script to apply cartographie migration and seed questions.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/apply-migration.mjs
 *
 * Or run the SQL files directly in the Supabase SQL Editor:
 *   1. supabase/migrations/20260305_cartographie.sql
 *   2. supabase/migrations/20260305_seed_questions.sql
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Migration manuelle requise                                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Pas de SUPABASE_SERVICE_ROLE_KEY disponible.                ║
║                                                              ║
║  Veuillez executer les fichiers SQL suivants dans le         ║
║  SQL Editor du dashboard Supabase :                          ║
║                                                              ║
║  1. supabase/migrations/20260305_cartographie.sql            ║
║     → Cree les 12 tables cart_*                              ║
║                                                              ║
║  2. supabase/migrations/20260305_seed_questions.sql           ║
║     → Insere les 150 questions (10 blocs x 15)               ║
║                                                              ║
║  Dashboard: https://supabase.com/dashboard/project/          ║
║             excqwhuvfyoqvcpxtxsa/sql/new                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log('Applying cartographie migration...');

  const migrationSql = readFileSync(
    resolve(__dirname, '../supabase/migrations/20260305_cartographie.sql'),
    'utf-8'
  );

  const { error: migError } = await supabase.rpc('exec_sql', { sql: migrationSql });
  if (migError) {
    console.error('Migration error:', migError.message);
    console.log('You may need to run this SQL directly in the Supabase SQL Editor.');
    process.exit(1);
  }
  console.log('✓ Tables created');

  // Check if questions already exist
  const { count } = await supabase.from('cart_questions').select('*', { count: 'exact', head: true });
  if (count && count > 0) {
    console.log(`✓ Questions already seeded (${count} questions)`);
    return;
  }

  const seedSql = readFileSync(
    resolve(__dirname, '../supabase/migrations/20260305_seed_questions.sql'),
    'utf-8'
  );

  const { error: seedError } = await supabase.rpc('exec_sql', { sql: seedSql });
  if (seedError) {
    console.error('Seed error:', seedError.message);
    console.log('You may need to run this SQL directly in the Supabase SQL Editor.');
    process.exit(1);
  }
  console.log('✓ 150 questions seeded');
}

run().catch(console.error);
