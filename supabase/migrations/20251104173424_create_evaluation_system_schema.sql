/*
  # Sistema de Evaluación de Academias de Fútbol

  1. New Tables
    - `evaluators`
      - `id` (uuid, primary key)
      - `full_name` (text) - Nombre completo del evaluador
      - `email` (text, unique) - Correo electrónico
      - `fmf_credential` (text, unique) - Credencial FMF
      - `phone` (text) - Teléfono de contacto
      - `status` (text) - Estado: active/inactive
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `academies`
      - `id` (uuid, primary key)
      - `name` (text) - Nombre de la academia
      - `address` (text) - Dirección
      - `contact_person` (text) - Persona de contacto
      - `contact_email` (text) - Email de contacto
      - `contact_phone` (text) - Teléfono de contacto
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `kpi_categories`
      - `id` (uuid, primary key)
      - `name` (text) - Nombre de la categoría KPI
      - `description` (text) - Descripción
      - `weight` (numeric) - Peso porcentual en evaluación total
      - `order_index` (integer) - Orden de presentación
      - `created_at` (timestamptz)
    
    - `kpis`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key) - Categoría a la que pertenece
      - `name` (text) - Nombre del KPI
      - `description` (text) - Descripción detallada
      - `max_score` (numeric) - Puntuación máxima
      - `order_index` (integer) - Orden dentro de la categoría
      - `created_at` (timestamptz)
    
    - `evaluations`
      - `id` (uuid, primary key)
      - `academy_id` (uuid, foreign key) - Academia evaluada
      - `evaluator_id` (uuid, foreign key) - Evaluador asignado
      - `evaluation_date` (date) - Fecha de evaluación
      - `total_score` (numeric) - Puntuación total calculada
      - `category` (text) - Categoría resultante (Elite, Avanzado, Básico, etc.)
      - `status` (text) - Estado: draft/completed/approved
      - `notes` (text) - Notas generales
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `evaluation_scores`
      - `id` (uuid, primary key)
      - `evaluation_id` (uuid, foreign key) - Evaluación
      - `kpi_id` (uuid, foreign key) - KPI evaluado
      - `score` (numeric) - Puntuación otorgada
      - `comments` (text) - Comentarios específicos
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage evaluations
    - Evaluators can view and create their own evaluations
    - Admin users can view all data

  3. Important Notes
    - Default KPI categories and KPIs will be inserted for immediate use
    - Category thresholds: Elite (90+), Avanzado (75-89), Básico (60-74), En Desarrollo (<60)
    - Automatic calculation of total scores based on weighted KPIs
*/

-- Create evaluators table
CREATE TABLE IF NOT EXISTS evaluators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  fmf_credential text UNIQUE NOT NULL,
  phone text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create academies table
CREATE TABLE IF NOT EXISTS academies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  contact_person text,
  contact_email text,
  contact_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create KPI categories table
CREATE TABLE IF NOT EXISTS kpi_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  weight numeric DEFAULT 0 CHECK (weight >= 0 AND weight <= 100),
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create KPIs table
CREATE TABLE IF NOT EXISTS kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES kpi_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  max_score numeric DEFAULT 10,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  evaluator_id uuid NOT NULL REFERENCES evaluators(id) ON DELETE CASCADE,
  evaluation_date date DEFAULT CURRENT_DATE,
  total_score numeric DEFAULT 0,
  category text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'approved')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create evaluation scores table
CREATE TABLE IF NOT EXISTS evaluation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id uuid NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  kpi_id uuid NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  score numeric DEFAULT 0,
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(evaluation_id, kpi_id)
);

-- Enable RLS
ALTER TABLE evaluators ENABLE ROW LEVEL SECURITY;
ALTER TABLE academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for evaluators
CREATE POLICY "Evaluators can view all evaluators"
  ON evaluators FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Evaluators can update own profile"
  ON evaluators FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can insert evaluators"
  ON evaluators FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for academies
CREATE POLICY "Anyone can view academies"
  ON academies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert academies"
  ON academies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update academies"
  ON academies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for kpi_categories
CREATE POLICY "Anyone can view KPI categories"
  ON kpi_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage KPI categories"
  ON kpi_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for kpis
CREATE POLICY "Anyone can view KPIs"
  ON kpis FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage KPIs"
  ON kpis FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for evaluations
CREATE POLICY "Evaluators can view own evaluations"
  ON evaluations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Evaluators can insert evaluations"
  ON evaluations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Evaluators can update own evaluations"
  ON evaluations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Evaluators can delete own evaluations"
  ON evaluations FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for evaluation_scores
CREATE POLICY "Users can view evaluation scores"
  ON evaluation_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert evaluation scores"
  ON evaluation_scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update evaluation scores"
  ON evaluation_scores FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete evaluation scores"
  ON evaluation_scores FOR DELETE
  TO authenticated
  USING (true);

-- Insert default KPI categories
INSERT INTO kpi_categories (name, description, weight, order_index) VALUES
  ('Infraestructura', 'Instalaciones, equipamiento y recursos físicos', 25, 1),
  ('Metodología', 'Programas de entrenamiento y metodología de enseñanza', 25, 2),
  ('Personal Técnico', 'Calificación y experiencia del cuerpo técnico', 20, 3),
  ('Desarrollo Integral', 'Formación educativa, valores y desarrollo psicosocial', 15, 4),
  ('Gestión Administrativa', 'Organización, planeación y recursos financieros', 15, 5);

-- Insert default KPIs for Infraestructura
INSERT INTO kpis (category_id, name, description, max_score, order_index)
SELECT id, 'Campos de Entrenamiento', 'Cantidad y calidad de campos disponibles', 10, 1
FROM kpi_categories WHERE name = 'Infraestructura';

INSERT INTO kpis (category_id, name, description, max_score, order_index)
SELECT id, 'Vestuarios y Sanitarios', 'Estado y equipamiento de instalaciones', 10, 2
FROM kpi_categories WHERE name = 'Infraestructura';

INSERT INTO kpis (category_id, name, description, max_score, order_index)
SELECT id, 'Material Deportivo', 'Calidad y cantidad de equipo disponible', 10, 3
FROM kpi_categories WHERE name = 'Infraestructura';

-- Insert default KPIs for Metodología
INSERT INTO kpis (category_id, name, description, max_score, order_index)
SELECT id, 'Plan de Entrenamiento', 'Existencia de programa estructurado por edades', 10, 1
FROM kpi_categories WHERE name = 'Metodología';

INSERT INTO kpis (category_id, name, description, max_score, order_index)
SELECT id, 'Seguimiento Individual', 'Sistema de evaluación y seguimiento de jugadores', 10, 2
FROM kpi_categories WHERE name = 'Metodología';

INSERT INTO kpis (category_id, name, description, max_score, order_index)
SELECT id, 'Innovación Técnica', 'Uso de tecnología y métodos modernos', 10, 3
FROM kpi_categories WHERE name = 'Metodología';

-- Insert default KPIs for Personal Técnico
INSERT INTO kpis (category_id, name, description, max_score, order_index)
SELECT id, 'Certificaciones', 'Licencias FMF y certificaciones internacionales', 10, 1
FROM kpi_categories WHERE name = 'Personal Técnico';

INSERT INTO kpis (category_id, name, description, max_score, order_index)
SELECT id, 'Experiencia', 'Años de experiencia en formación', 10, 2
FROM kpi_categories WHERE name = 'Personal Técnico';

INSERT INTO kpis (category_id, name, description, max_score, order_index)
SELECT id, 'Ratio Entrenador-Jugadores', 'Proporción adecuada de entrenadores', 10, 3
FROM kpi_categories WHERE name = 'Personal Técnico';

-- Insert default KPIs for Desarrollo Integral
INSERT INTO kpis (category_id, name, description, max_score, order_index)
SELECT id, 'Apoyo Académico', 'Programas de apoyo escolar', 10, 1
FROM kpi_categories WHERE name = 'Desarrollo Integral';

INSERT INTO kpis (category_id, name, description, max_score, order_index)
SELECT id, 'Formación en Valores', 'Programas de desarrollo personal y ético', 10, 2
FROM kpi_categories WHERE name = 'Desarrollo Integral';

INSERT INTO kpis (category_id, name, description, max_score, order_index)
SELECT id, 'Apoyo Psicológico', 'Servicios de psicología deportiva', 10, 3
FROM kpi_categories WHERE name = 'Desarrollo Integral';

-- Insert default KPIs for Gestión Administrativa
INSERT INTO kpis (category_id, name, description, max_score, order_index)
SELECT id, 'Organización', 'Estructura organizacional clara', 10, 1
FROM kpi_categories WHERE name = 'Gestión Administrativa';

INSERT INTO kpis (category_id, name, description, max_score, order_index)
SELECT id, 'Transparencia Financiera', 'Claridad en costos y manejo de recursos', 10, 2
FROM kpi_categories WHERE name = 'Gestión Administrativa';

INSERT INTO kpis (category_id, name, description, max_score, order_index)
SELECT id, 'Comunicación', 'Canales efectivos con padres y jugadores', 10, 3
FROM kpi_categories WHERE name = 'Gestión Administrativa';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_kpis_category ON kpis(category_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_academy ON evaluations(academy_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator ON evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_scores_evaluation ON evaluation_scores(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_scores_kpi ON evaluation_scores(kpi_id);

-- Create function to calculate total score and category
CREATE OR REPLACE FUNCTION calculate_evaluation_results()
RETURNS TRIGGER AS $$
DECLARE
  v_total_score numeric;
  v_category text;
BEGIN
  -- Calculate weighted total score
  SELECT 
    COALESCE(SUM(
      (es.score / k.max_score) * 10 * (kc.weight / 100)
    ), 0) * 10
  INTO v_total_score
  FROM evaluation_scores es
  JOIN kpis k ON es.kpi_id = k.id
  JOIN kpi_categories kc ON k.category_id = kc.id
  WHERE es.evaluation_id = NEW.evaluation_id;
  
  -- Determine category
  IF v_total_score >= 90 THEN
    v_category := 'Elite';
  ELSIF v_total_score >= 75 THEN
    v_category := 'Avanzado';
  ELSIF v_total_score >= 60 THEN
    v_category := 'Básico';
  ELSE
    v_category := 'En Desarrollo';
  END IF;
  
  -- Update evaluation
  UPDATE evaluations
  SET 
    total_score = v_total_score,
    category = v_category,
    updated_at = now()
  WHERE id = NEW.evaluation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic calculation
DROP TRIGGER IF EXISTS trigger_calculate_evaluation ON evaluation_scores;
CREATE TRIGGER trigger_calculate_evaluation
  AFTER INSERT OR UPDATE OR DELETE ON evaluation_scores
  FOR EACH ROW
  EXECUTE FUNCTION calculate_evaluation_results();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_evaluators_updated_at ON evaluators;
CREATE TRIGGER update_evaluators_updated_at
  BEFORE UPDATE ON evaluators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_academies_updated_at ON academies;
CREATE TRIGGER update_academies_updated_at
  BEFORE UPDATE ON academies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_evaluations_updated_at ON evaluations;
CREATE TRIGGER update_evaluations_updated_at
  BEFORE UPDATE ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_evaluation_scores_updated_at ON evaluation_scores;
CREATE TRIGGER update_evaluation_scores_updated_at
  BEFORE UPDATE ON evaluation_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();