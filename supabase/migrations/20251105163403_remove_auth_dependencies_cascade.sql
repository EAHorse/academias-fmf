/*
  # Remove Authentication Dependencies (Cascade)

  1. Changes
    - Drop all RLS policies from all tables
    - Remove auth-related columns from evaluators table
    - Make all tables publicly accessible (no RLS restrictions)
    - Simplify the system to work without authentication

  2. Notes
    - This migration removes all authentication requirements
    - All data becomes accessible without login
    - Suitable for internal use or trusted environments
*/

-- Drop ALL policies from all tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Disable RLS on all tables
ALTER TABLE IF EXISTS academies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evaluators DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS kpi_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evaluation_scores DISABLE ROW LEVEL SECURITY;

-- Drop auth-related columns from evaluators with CASCADE
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'evaluators' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE evaluators DROP COLUMN user_id CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'evaluators' AND column_name = 'role'
  ) THEN
    ALTER TABLE evaluators DROP COLUMN role CASCADE;
  END IF;
END $$;

-- Drop the helper function if it exists
DROP FUNCTION IF EXISTS public.get_evaluator_role(uuid);
