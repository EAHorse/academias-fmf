/*
  # Fix RLS with Security Definer Function
  
  1. Problem
    - Cannot create function in auth schema
    - Need to bypass RLS when checking roles
  
  2. Solution
    - Create function in public schema with SECURITY DEFINER
    - This function bypasses RLS to check user role
    - Rewrite all policies to use this function
  
  3. Security
    - Function is SECURITY DEFINER so it runs with elevated privileges
    - Only returns the role of the calling user (auth.uid())
    - Safe because it doesn't accept user input
*/

-- Create a function to get the role of the current user
-- SECURITY DEFINER means it bypasses RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role
  FROM evaluators
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view evaluators" ON evaluators;
DROP POLICY IF EXISTS "Controlled evaluator creation" ON evaluators;
DROP POLICY IF EXISTS "Controlled evaluator updates" ON evaluators;
DROP POLICY IF EXISTS "Controlled evaluator deletion" ON evaluators;

-- SELECT: Users see themselves, admins see all
CREATE POLICY "Users can view evaluators"
  ON evaluators FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    public.get_my_role() IN ('admin', 'super_admin')
  );

-- INSERT: Super admins can create anyone, admins can only create evaluators
CREATE POLICY "Controlled evaluator creation"
  ON evaluators FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_my_role() = 'super_admin'
    OR
    (
      public.get_my_role() = 'admin'
      AND role = 'evaluator'
    )
  );

-- UPDATE: Super admins update anyone, admins update only evaluators, users update themselves
CREATE POLICY "Controlled evaluator updates"
  ON evaluators FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    public.get_my_role() = 'super_admin'
    OR
    (
      public.get_my_role() = 'admin'
      AND role = 'evaluator'
    )
  )
  WITH CHECK (
    public.get_my_role() = 'super_admin'
    OR
    (
      public.get_my_role() = 'admin'
      AND role = 'evaluator'
    )
    OR
    (
      user_id = auth.uid()
      AND role = public.get_my_role()
    )
  );

-- DELETE: Super admins delete anyone, admins delete only evaluators
CREATE POLICY "Controlled evaluator deletion"
  ON evaluators FOR DELETE
  TO authenticated
  USING (
    public.get_my_role() = 'super_admin'
    OR
    (
      public.get_my_role() = 'admin'
      AND role = 'evaluator'
    )
  );
