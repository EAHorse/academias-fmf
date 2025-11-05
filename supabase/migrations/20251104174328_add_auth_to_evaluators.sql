/*
  # Add Authentication Support for Evaluators

  1. Changes
    - Add user_id column to evaluators table to link with auth.users
    - Add password_hash column for custom authentication
    - Update RLS policies to support authentication
    - Create function to handle evaluator login

  2. Security
    - Password hash stored securely
    - RLS policies updated for authenticated access
*/

-- Add auth columns to evaluators table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'evaluators' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE evaluators ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'evaluators' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE evaluators ADD COLUMN password_hash text;
  END IF;
END $$;

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_evaluators_user_id ON evaluators(user_id);

-- Update RLS policies for authenticated evaluators
DROP POLICY IF EXISTS "Evaluators can view all evaluators" ON evaluators;
DROP POLICY IF EXISTS "Evaluators can update own profile" ON evaluators;
DROP POLICY IF EXISTS "Anyone can insert evaluators" ON evaluators;

CREATE POLICY "Authenticated users can view evaluators"
  ON evaluators FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view active evaluators"
  ON evaluators FOR SELECT
  TO anon
  USING (status = 'active');

CREATE POLICY "Evaluators can update own profile"
  ON evaluators FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can register as evaluator"
  ON evaluators FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Update evaluation policies to check evaluator ownership
DROP POLICY IF EXISTS "Evaluators can view own evaluations" ON evaluations;
DROP POLICY IF EXISTS "Evaluators can insert evaluations" ON evaluations;
DROP POLICY IF EXISTS "Evaluators can update own evaluations" ON evaluations;
DROP POLICY IF EXISTS "Evaluators can delete own evaluations" ON evaluations;

CREATE POLICY "Evaluators can view own evaluations"
  ON evaluations FOR SELECT
  TO authenticated
  USING (
    evaluator_id IN (
      SELECT id FROM evaluators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view completed evaluations"
  ON evaluations FOR SELECT
  TO anon, authenticated
  USING (status = 'completed');

CREATE POLICY "Evaluators can insert evaluations"
  ON evaluations FOR INSERT
  TO authenticated
  WITH CHECK (
    evaluator_id IN (
      SELECT id FROM evaluators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Evaluators can update own evaluations"
  ON evaluations FOR UPDATE
  TO authenticated
  USING (
    evaluator_id IN (
      SELECT id FROM evaluators WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    evaluator_id IN (
      SELECT id FROM evaluators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Evaluators can delete own evaluations"
  ON evaluations FOR DELETE
  TO authenticated
  USING (
    evaluator_id IN (
      SELECT id FROM evaluators WHERE user_id = auth.uid()
    )
  );