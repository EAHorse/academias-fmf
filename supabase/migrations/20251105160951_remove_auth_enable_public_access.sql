/*
  # Remove Authentication and Enable Public Access

  1. Changes
    - Drop all existing restrictive RLS policies on evaluations, evaluation_scores, academies, evaluators, and kpis tables
    - Create new permissive policies to allow anonymous/public access for all operations
    - This allows the application to function without authentication

  2. Security Notes
    - This migration removes authentication requirements
    - All users can now perform all operations
    - Suitable for internal/trusted network deployment only
*/

-- Drop existing policies on evaluations table
DROP POLICY IF EXISTS "Evaluators can view own evaluations" ON evaluations;
DROP POLICY IF EXISTS "Public can view completed evaluations" ON evaluations;
DROP POLICY IF EXISTS "Evaluators can insert evaluations" ON evaluations;
DROP POLICY IF EXISTS "Evaluators can update own evaluations" ON evaluations;
DROP POLICY IF EXISTS "Evaluators can delete own evaluations" ON evaluations;

-- Drop existing policies on evaluation_scores table
DROP POLICY IF EXISTS "Evaluators can view own evaluation scores" ON evaluation_scores;
DROP POLICY IF EXISTS "Public can view completed evaluation scores" ON evaluation_scores;
DROP POLICY IF EXISTS "Evaluators can insert evaluation scores" ON evaluation_scores;
DROP POLICY IF EXISTS "Evaluators can update own evaluation scores" ON evaluation_scores;
DROP POLICY IF EXISTS "Evaluators can delete own evaluation scores" ON evaluation_scores;

-- Drop existing policies on academies table
DROP POLICY IF EXISTS "Anyone can view academies" ON academies;
DROP POLICY IF EXISTS "Admins can insert academies" ON academies;
DROP POLICY IF EXISTS "Admins can update academies" ON academies;
DROP POLICY IF EXISTS "Admins can delete academies" ON academies;

-- Drop existing policies on evaluators table
DROP POLICY IF EXISTS "Public can view active evaluators" ON evaluators;
DROP POLICY IF EXISTS "Evaluators can view own data" ON evaluators;
DROP POLICY IF EXISTS "Admins can insert evaluators" ON evaluators;
DROP POLICY IF EXISTS "Admins can update evaluators" ON evaluators;
DROP POLICY IF EXISTS "Evaluators can update own profile" ON evaluators;

-- Drop existing policies on kpis and kpi_categories tables
DROP POLICY IF EXISTS "Anyone can view KPI categories" ON kpi_categories;
DROP POLICY IF EXISTS "Admins can manage KPI categories" ON kpi_categories;
DROP POLICY IF EXISTS "Anyone can view KPIs" ON kpis;
DROP POLICY IF EXISTS "Admins can manage KPIs" ON kpis;

-- Create new permissive policies for evaluations
CREATE POLICY "Allow all operations on evaluations"
  ON evaluations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new permissive policies for evaluation_scores
CREATE POLICY "Allow all operations on evaluation_scores"
  ON evaluation_scores
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new permissive policies for academies
CREATE POLICY "Allow all operations on academies"
  ON academies
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new permissive policies for evaluators
CREATE POLICY "Allow all operations on evaluators"
  ON evaluators
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new permissive policies for kpi_categories
CREATE POLICY "Allow all operations on kpi_categories"
  ON kpi_categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new permissive policies for kpis
CREATE POLICY "Allow all operations on kpis"
  ON kpis
  FOR ALL
  USING (true)
  WITH CHECK (true);
