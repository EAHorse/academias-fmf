/*
  # Add Admin Role System
  
  1. Changes
    - Add role column to evaluators table (admin, evaluator)
    - Create default admin user capability
    - Update RLS policies to respect roles
  
  2. Security
    - Admins can manage KPIs, categories, academies, and evaluators
    - Evaluators can only create and view evaluations
    - RLS policies enforce role-based access
*/

-- Add role column to evaluators
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'evaluators' AND column_name = 'role'
  ) THEN
    ALTER TABLE evaluators ADD COLUMN role text DEFAULT 'evaluator' CHECK (role IN ('admin', 'evaluator'));
  END IF;
END $$;

-- Update existing evaluators to have evaluator role
UPDATE evaluators SET role = 'evaluator' WHERE role IS NULL;

-- RLS Policies for KPI Categories (Admin only)
DROP POLICY IF EXISTS "Anyone can view kpi categories" ON kpi_categories;
DROP POLICY IF EXISTS "Admins can manage kpi categories" ON kpi_categories;

CREATE POLICY "Anyone can view kpi categories"
  ON kpi_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert kpi categories"
  ON kpi_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role = 'admin'
    )
  );

CREATE POLICY "Admins can update kpi categories"
  ON kpi_categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete kpi categories"
  ON kpi_categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role = 'admin'
    )
  );

-- RLS Policies for KPIs (Admin only)
DROP POLICY IF EXISTS "Anyone can view kpis" ON kpis;
DROP POLICY IF EXISTS "Admins can manage kpis" ON kpis;

CREATE POLICY "Anyone can view kpis"
  ON kpis FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert kpis"
  ON kpis FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role = 'admin'
    )
  );

CREATE POLICY "Admins can update kpis"
  ON kpis FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete kpis"
  ON kpis FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role = 'admin'
    )
  );

-- RLS Policies for Academies (Admin only)
DROP POLICY IF EXISTS "Anyone can view academies" ON academies;
DROP POLICY IF EXISTS "Anyone can manage academies" ON academies;

CREATE POLICY "Anyone can view academies"
  ON academies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert academies"
  ON academies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role = 'admin'
    )
  );

CREATE POLICY "Admins can update academies"
  ON academies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete academies"
  ON academies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role = 'admin'
    )
  );

-- RLS Policies for Evaluators (Admin only can manage)
DROP POLICY IF EXISTS "Anyone can view evaluators" ON evaluators;
DROP POLICY IF EXISTS "Anyone can manage evaluators" ON evaluators;

CREATE POLICY "Evaluators can view themselves"
  ON evaluators FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM evaluators e
    WHERE e.user_id = auth.uid() AND e.role = 'admin'
  ));

CREATE POLICY "Admins can insert evaluators"
  ON evaluators FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role = 'admin'
    )
  );

CREATE POLICY "Admins can update evaluators"
  ON evaluators FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete evaluators"
  ON evaluators FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role = 'admin'
    )
  );
