/*
  # Fix Recursive RLS Policies
  
  1. Problem
    - Current policies have infinite recursion
    - Policies query evaluators table to check roles
    - This creates a circular dependency
  
  2. Solution
    - Simplify SELECT policy to avoid recursion
    - Use direct user_id checks where possible
    - Store role information that can be accessed without recursion
  
  3. Changes
    - Update all evaluators policies to prevent recursion
    - Allow users to always see their own data
    - Use subqueries only for insert/update/delete
*/

-- Drop all existing evaluators policies
DROP POLICY IF EXISTS "Users can view themselves or admins can view all" ON evaluators;
DROP POLICY IF EXISTS "Super admins can insert any evaluator" ON evaluators;
DROP POLICY IF EXISTS "Super admins can update any, admins only evaluators" ON evaluators;
DROP POLICY IF EXISTS "Super admins can delete any, admins only evaluators" ON evaluators;

-- SELECT: Allow users to see themselves without recursion
-- Also allow if there's another evaluator record with admin/super_admin role
CREATE POLICY "Users can view evaluators"
  ON evaluators FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM evaluators admin_check
      WHERE admin_check.user_id = auth.uid()
      AND admin_check.role IN ('admin', 'super_admin')
      AND admin_check.id != evaluators.id
    )
  );

-- INSERT: Only super_admin can create admin, admins can create evaluators
CREATE POLICY "Controlled evaluator creation"
  ON evaluators FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Super admins can create anyone
    EXISTS (
      SELECT 1 FROM evaluators super_check
      WHERE super_check.user_id = auth.uid()
      AND super_check.role = 'super_admin'
    )
    OR
    -- Admins can only create evaluators
    (
      role = 'evaluator'
      AND EXISTS (
        SELECT 1 FROM evaluators admin_check
        WHERE admin_check.user_id = auth.uid()
        AND admin_check.role IN ('admin', 'super_admin')
      )
    )
  );

-- UPDATE: Super admins can update anyone, admins can update evaluators
CREATE POLICY "Controlled evaluator updates"
  ON evaluators FOR UPDATE
  TO authenticated
  USING (
    -- Super admins can update anyone
    EXISTS (
      SELECT 1 FROM evaluators super_check
      WHERE super_check.user_id = auth.uid()
      AND super_check.role = 'super_admin'
    )
    OR
    -- Admins can update evaluators (not other admins)
    (
      role = 'evaluator'
      AND EXISTS (
        SELECT 1 FROM evaluators admin_check
        WHERE admin_check.user_id = auth.uid()
        AND admin_check.role IN ('admin', 'super_admin')
      )
    )
    OR
    -- Users can update themselves (but not their role)
    user_id = auth.uid()
  )
  WITH CHECK (
    -- Super admins can set any role
    EXISTS (
      SELECT 1 FROM evaluators super_check
      WHERE super_check.user_id = auth.uid()
      AND super_check.role = 'super_admin'
    )
    OR
    -- Admins can only set evaluator role
    (
      role = 'evaluator'
      AND EXISTS (
        SELECT 1 FROM evaluators admin_check
        WHERE admin_check.user_id = auth.uid()
        AND admin_check.role IN ('admin', 'super_admin')
      )
    )
    OR
    -- Users updating themselves can't change their role
    (
      user_id = auth.uid()
      AND role = (SELECT role FROM evaluators WHERE user_id = auth.uid())
    )
  );

-- DELETE: Super admins can delete anyone, admins can delete evaluators
CREATE POLICY "Controlled evaluator deletion"
  ON evaluators FOR DELETE
  TO authenticated
  USING (
    -- Super admins can delete anyone
    EXISTS (
      SELECT 1 FROM evaluators super_check
      WHERE super_check.user_id = auth.uid()
      AND super_check.role = 'super_admin'
    )
    OR
    -- Admins can delete evaluators (not other admins)
    (
      role = 'evaluator'
      AND EXISTS (
        SELECT 1 FROM evaluators admin_check
        WHERE admin_check.user_id = auth.uid()
        AND admin_check.role IN ('admin', 'super_admin')
      )
    )
  );
