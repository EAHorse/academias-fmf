/*
  # Update KPI Categories to Match FMF Protocol
  
  1. Changes
    - Remove existing generic categories
    - Add 3 specific categories from FMF document:
      * KPI 1: Filosofía Futbolística y DNA del Club (15%)
      * KPI 2: Estructura Organizacional y Liderazgo (15%)
      * KPI 3: Infraestructura y Instalaciones (15%)
    - Each KPI worth 100 points
    - Total system: 1000 points (3 KPIs shown here = 300 points)
  
  2. Security
    - No changes to RLS policies
*/

-- Clear existing data
DELETE FROM evaluation_scores;
DELETE FROM evaluations;
DELETE FROM kpis;
DELETE FROM kpi_categories;

-- Insert the 3 main KPI categories from the protocol
INSERT INTO kpi_categories (id, name, description, weight, order_index) VALUES
  (gen_random_uuid(), 'KPI 1: Filosofía Futbolística y DNA del Club', 'Identidad y coherencia metodológica. Tiempo estimado: 45 minutos', 15, 1),
  (gen_random_uuid(), 'KPI 2: Estructura Organizacional y Liderazgo', 'Liderazgo y gestión técnica. Tiempo estimado: 40 minutos', 15, 2),
  (gen_random_uuid(), 'KPI 3: Infraestructura y Instalaciones', 'Condiciones para el desarrollo. Tiempo estimado: 60 minutos', 15, 3);
