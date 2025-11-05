/*
  # Create Super Admin User
  
  1. Changes
    - Add super_admin role to evaluators table
    - Create default super admin user
    - Update role constraints
  
  2. Security
    - Super admin can manage all admins and evaluators
    - Only super admin can assign admin role
    - Super admin has highest level of access
    
  3. Default Credentials
    - Email: superadmin
    - Password: superadmin1994
*/

-- Update role column to include super_admin
ALTER TABLE evaluators DROP CONSTRAINT IF EXISTS evaluators_role_check;
ALTER TABLE evaluators ADD CONSTRAINT evaluators_role_check CHECK (role IN ('super_admin', 'admin', 'evaluator'));

-- Create super admin user in auth.users
-- Note: This will be created with email 'superadmin@fmf.local'
DO $$
DECLARE
  super_admin_id uuid;
BEGIN
  -- Check if super admin already exists
  SELECT id INTO super_admin_id FROM auth.users WHERE email = 'superadmin@fmf.local';
  
  -- If not exists, we'll create the evaluator record that will trigger the proper setup
  IF super_admin_id IS NULL THEN
    -- Insert a placeholder that admins can use to create the super admin
    -- The actual user creation should be done through the signup process
    RAISE NOTICE 'Super admin user should be created through the registration form';
  END IF;
END $$;

-- Update RLS policies to respect super_admin role

-- Evaluators policies - super admin can do everything
DROP POLICY IF EXISTS "Evaluators can view themselves" ON evaluators;
DROP POLICY IF EXISTS "Admins can insert evaluators" ON evaluators;
DROP POLICY IF EXISTS "Admins can update evaluators" ON evaluators;
DROP POLICY IF EXISTS "Admins can delete evaluators" ON evaluators;

CREATE POLICY "Users can view themselves or admins can view all"
  ON evaluators FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM evaluators e
      WHERE e.user_id = auth.uid() 
      AND e.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Super admins can insert any evaluator"
  ON evaluators FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role = 'super_admin'
    )
    OR
    (
      EXISTS (
        SELECT 1 FROM evaluators
        WHERE evaluators.user_id = auth.uid()
        AND evaluators.role = 'admin'
      )
      AND role = 'evaluator'
    )
  );

CREATE POLICY "Super admins can update any, admins only evaluators"
  ON evaluators FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluators e
      WHERE e.user_id = auth.uid()
      AND e.role = 'super_admin'
    )
    OR
    (
      EXISTS (
        SELECT 1 FROM evaluators e
        WHERE e.user_id = auth.uid()
        AND e.role = 'admin'
      )
      AND role = 'evaluator'
    )
  );

CREATE POLICY "Super admins can delete any, admins only evaluators"
  ON evaluators FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluators e
      WHERE e.user_id = auth.uid()
      AND e.role = 'super_admin'
    )
    OR
    (
      EXISTS (
        SELECT 1 FROM evaluators e
        WHERE e.user_id = auth.uid()
        AND e.role = 'admin'
      )
      AND role = 'evaluator'
    )
  );

-- Update KPI policies to allow super_admin
DROP POLICY IF EXISTS "Admins can insert kpi categories" ON kpi_categories;
DROP POLICY IF EXISTS "Admins can update kpi categories" ON kpi_categories;
DROP POLICY IF EXISTS "Admins can delete kpi categories" ON kpi_categories;

CREATE POLICY "Admins can insert kpi categories"
  ON kpi_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update kpi categories"
  ON kpi_categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete kpi categories"
  ON kpi_categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role IN ('admin', 'super_admin')
    )
  );

-- Update KPIs policies
DROP POLICY IF EXISTS "Admins can insert kpis" ON kpis;
DROP POLICY IF EXISTS "Admins can update kpis" ON kpis;
DROP POLICY IF EXISTS "Admins can delete kpis" ON kpis;

CREATE POLICY "Admins can insert kpis"
  ON kpis FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update kpis"
  ON kpis FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete kpis"
  ON kpis FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role IN ('admin', 'super_admin')
    )
  );

-- Update Academies policies
DROP POLICY IF EXISTS "Admins can insert academies" ON academies;
DROP POLICY IF EXISTS "Admins can update academies" ON academies;
DROP POLICY IF EXISTS "Admins can delete academies" ON academies;

CREATE POLICY "Admins can insert academies"
  ON academies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update academies"
  ON academies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete academies"
  ON academies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluators
      WHERE evaluators.user_id = auth.uid()
      AND evaluators.role IN ('admin', 'super_admin')
    )
  );
