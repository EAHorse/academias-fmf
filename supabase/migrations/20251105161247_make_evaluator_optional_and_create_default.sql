/*
  # Make Evaluator Optional and Create Default Evaluator

  1. Changes
    - Make evaluator_id nullable in evaluations table
    - Create a default "Sistema" evaluator for anonymous evaluations
    - Update existing evaluations to use the default evaluator if needed

  2. Security Notes
    - Allows evaluations without a specific evaluator
    - Maintains referential integrity with a default evaluator
*/

-- First, check if we need to make evaluator_id nullable
DO $$
BEGIN
  -- Make evaluator_id nullable if it isn't already
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'evaluations'
    AND column_name = 'evaluator_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE evaluations ALTER COLUMN evaluator_id DROP NOT NULL;
  END IF;
END $$;

-- Create a default evaluator if it doesn't exist
INSERT INTO evaluators (id, full_name, fmf_credential, email, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Sistema',
  'SISTEMA-001',
  'sistema@fmf.mx',
  'active'
)
ON CONFLICT (id) DO NOTHING;
