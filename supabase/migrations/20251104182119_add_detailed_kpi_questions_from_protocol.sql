/*
  # Add Detailed KPI Questions from FMF Protocol
  
  1. New Items
    - KPI 1: Filosofía Futbolística (10 sub-items)
      * Documento formal de metodología
      * Alineación con SNC
      * Conocimiento del personal técnico
      * Progresión metodológica por edades
      * Adaptación a categorías infantiles
      * Desarrollo fútbol femenino
      * Cuaderno de ejercicios
      * Ejercicios reflejan metodología
      * Progresión adecuada por edades
      * Enfoque desarrollo vs resultados
    
    - KPI 2: Estructura Organizacional (13 sub-items)
      * Director técnico licencia
      * Experiencia en formación
      * Formación en salvaguardia
      * Reuniones técnicas regulares
      * Entrenadores Sub-13, Sub-15, Sub-17, Sub-19 con licencias
      * Coordinador administrativo
      * Personal médico/fisioterapeuta
    
    - KPI 3: Infraestructura (11 sub-items)
      * Número de campos
      * Superficie de campos
      * Dimensiones campos
      * Estado de conservación
      * Iluminación nocturna
      * Vestidores por género
      * Estado vestidores
      * Sala primeros auxilios
      * Acceso ambulancias
      * Estacionamiento
      * Área espera padres
  
  2. Notes
    - Each KPI max_score = 10 points per question
    - Total per KPI will be normalized to 100 points in evaluation
*/

-- Get category IDs
DO $$
DECLARE
  kpi1_id uuid;
  kpi2_id uuid;
  kpi3_id uuid;
BEGIN
  SELECT id INTO kpi1_id FROM kpi_categories WHERE name LIKE 'KPI 1:%' LIMIT 1;
  SELECT id INTO kpi2_id FROM kpi_categories WHERE name LIKE 'KPI 2:%' LIMIT 1;
  SELECT id INTO kpi3_id FROM kpi_categories WHERE name LIKE 'KPI 3:%' LIMIT 1;

  -- KPI 1: Filosofía Futbolística y DNA del Club
  INSERT INTO kpis (category_id, name, description, max_score, order_index) VALUES
    (kpi1_id, 'Documento formal de metodología futbolística', '¿Existe un documento formal de metodología futbolística?', 10, 1),
    (kpi1_id, 'Alineación con metodología SNC', '¿Se alinea con la metodología implementada por SNC?', 10, 2),
    (kpi1_id, 'Conocimiento del personal técnico', '¿Conocen el personal técnico la filosofía?', 10, 3),
    (kpi1_id, 'Progresión metodológica por edades', '¿Existe progresión metodológica por edades?', 10, 4),
    (kpi1_id, 'Adaptación a categorías infantiles', '¿Se adapta a las categorías infantiles?', 10, 5),
    (kpi1_id, 'Desarrollo fútbol femenino', '¿Incluye desarrollo del fútbol femenino?', 10, 6),
    (kpi1_id, 'Cuaderno de ejercicios basado en metodología', '¿Existe cuaderno de ejercicios basado en la metodología?', 10, 7),
    (kpi1_id, 'Ejercicios reflejan metodología', '¿Los ejercicios reflejan la metodología declarada?', 10, 8),
    (kpi1_id, 'Progresión adecuada por edades observada', '¿Hay progresión adecuada por edades en entrenamientos?', 10, 9),
    (kpi1_id, 'Enfoque desarrollo vs resultados', 'Enfoque en desarrollo vs. resultados', 10, 10);

  -- KPI 2: Estructura Organizacional y Liderazgo
  INSERT INTO kpis (category_id, name, description, max_score, order_index) VALUES
    (kpi2_id, 'Licencia técnica Director/Academy Manager', 'Licencia técnica del director técnico (Pro=10, A=8, B=6, C=4, Sin=0)', 10, 1),
    (kpi2_id, 'Experiencia en formación', 'Años de experiencia en formación (5+=10, 3-5=7, 1-3=5)', 10, 2),
    (kpi2_id, 'Formación en salvaguardia', '¿Tiene formación en salvaguardia? (Certificado=10, En proceso=5, No=0)', 10, 3),
    (kpi2_id, 'Frecuencia reuniones técnicas', 'Reuniones técnicas regulares (Semanales=10, Mensuales=7, Trimestrales=4, No=0)', 10, 4),
    (kpi2_id, 'Entrenador Sub-13 con licencia', 'Entrenador Sub-13: Licencia técnica (A=10, B=7, C=5, Sin=0)', 10, 5),
    (kpi2_id, 'Entrenador Sub-15 con licencia', 'Entrenador Sub-15: Licencia técnica (A=10, B=7, C=5, Sin=0)', 10, 6),
    (kpi2_id, 'Entrenador Sub-17 con licencia', 'Entrenador Sub-17: Licencia técnica (A=10, B=7, C=5, Sin=0)', 10, 7),
    (kpi2_id, 'Entrenador Sub-19 con licencia', 'Entrenador Sub-19: Licencia técnica (A=10, B=7, C=5, Sin=0)', 10, 8),
    (kpi2_id, 'Coordinador administrativo', 'Personal administrativo (Tiempo completo=10, Medio tiempo=6, No=0)', 10, 9),
    (kpi2_id, 'Personal médico/fisioterapeuta', 'Personal médico (En sitio=10, Por horas=7, Externo=4, No=0)', 10, 10);

  -- KPI 3: Infraestructura y Instalaciones
  INSERT INTO kpis (category_id, name, description, max_score, order_index) VALUES
    (kpi3_id, 'Número total de campos', 'Número total de campos (4+=10, 3=8, 2=6, 1=3)', 10, 1),
    (kpi3_id, 'Superficie de campos', 'Superficie de campos (Artificial=10, Natural bueno=8, Natural regular=5, Mixto=7)', 10, 2),
    (kpi3_id, 'Dimensiones de campos', 'Campos con dimensiones reglamentarias 7v7/9v9/11v11 (Todos=10, Mayoría=7, Algunos=4)', 10, 3),
    (kpi3_id, 'Estado de conservación campos', 'Estado de conservación (Excelente=10, Bueno=7, Regular=4, Deficiente=0)', 10, 4),
    (kpi3_id, 'Iluminación nocturna', 'Iluminación nocturna (Todos=10, Algunos=6, Ninguno=0)', 10, 5),
    (kpi3_id, 'Vestidores separados por género', 'Vestidores separados por género (Sí=10, No=0)', 10, 6),
    (kpi3_id, 'Estado de vestidores', 'Estado de vestidores (Excelente=10, Bueno=7, Regular=4, Deficiente=0)', 10, 7),
    (kpi3_id, 'Sala de primeros auxilios', 'Sala de primeros auxilios (Equipada=10, Básica=6, No=0)', 10, 8),
    (kpi3_id, 'Acceso para ambulancias', 'Acceso para ambulancias (Directo=10, Limitado=5, No=0)', 10, 9),
    (kpi3_id, 'Estacionamiento', 'Estacionamiento (Suficiente=10, Limitado=5, No=0)', 10, 10),
    (kpi3_id, 'Área de espera para padres', 'Área de espera para padres (Techada=10, Descubierta=5, No=0)', 10, 11);
END $$;
