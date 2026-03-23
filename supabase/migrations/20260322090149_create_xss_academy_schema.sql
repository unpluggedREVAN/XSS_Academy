/*
  # XSS Academy - Schema de Base de Datos

  1. Nuevas Tablas
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, referencia a auth.users)
      - `lab_id` (text, identificador del laboratorio)
      - `completed` (boolean, si completó el lab)
      - `attempts` (integer, número de intentos)
      - `hints_used` (integer, hints utilizados)
      - `completed_at` (timestamptz, fecha de completado)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `stored_comments`
      - `id` (uuid, primary key)
      - `lab_id` (text, identificador del laboratorio)
      - `author` (text, nombre del autor)
      - `content` (text, contenido del comentario - puede contener XSS)
      - `created_at` (timestamptz)
    
    - `saved_payloads`
      - `id` (uuid, primary key)
      - `user_id` (uuid, referencia a auth.users opcional)
      - `name` (text, nombre del payload)
      - `payload` (text, el payload XSS)
      - `context` (text, contexto: html, attribute, javascript, url, css)
      - `description` (text, descripción opcional)
      - `created_at` (timestamptz)
  
  2. Seguridad
    - Enable RLS en todas las tablas
    - Políticas para user_progress: usuarios autenticados pueden ver/modificar su propio progreso
    - Políticas para stored_comments: lectura pública, escritura pública (para simular vulnerabilidad)
    - Políticas para saved_payloads: usuarios pueden ver/modificar sus propios payloads
  
  3. Índices
    - Índice en user_progress(user_id, lab_id) para queries rápidas
    - Índice en stored_comments(lab_id) para filtrar por laboratorio
    - Índice en saved_payloads(user_id) para queries de usuario
*/

-- Crear tabla de progreso de usuario
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id text NOT NULL,
  completed boolean DEFAULT false,
  attempts integer DEFAULT 0,
  hints_used integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lab_id)
);

-- Crear tabla de comentarios almacenados (para labs de Stored XSS)
CREATE TABLE IF NOT EXISTS stored_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id text NOT NULL,
  author text NOT NULL DEFAULT 'Anonymous',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de payloads guardados
CREATE TABLE IF NOT EXISTS saved_payloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  payload text NOT NULL,
  context text NOT NULL CHECK (context IN ('html', 'attribute', 'javascript', 'url', 'css', 'other')),
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_lab ON user_progress(user_id, lab_id);
CREATE INDEX IF NOT EXISTS idx_stored_comments_lab ON stored_comments(lab_id);
CREATE INDEX IF NOT EXISTS idx_saved_payloads_user ON saved_payloads(user_id);

-- Enable Row Level Security
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE stored_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_payloads ENABLE ROW LEVEL SECURITY;

-- Políticas para user_progress
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para stored_comments (públicas para simular vulnerabilidad)
CREATE POLICY "Anyone can view comments"
  ON stored_comments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert comments"
  ON stored_comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can delete comments"
  ON stored_comments FOR DELETE
  TO anon, authenticated
  USING (true);

-- Políticas para saved_payloads
CREATE POLICY "Users can view own payloads"
  ON saved_payloads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payloads"
  ON saved_payloads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payloads"
  ON saved_payloads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payloads"
  ON saved_payloads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para user_progress
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos comentarios de ejemplo para labs de Stored XSS
INSERT INTO stored_comments (lab_id, author, content) VALUES
  ('stored-xss-basic', 'Alice', '¡Gran laboratorio! Aprendí mucho sobre XSS.'),
  ('stored-xss-basic', 'Bob', 'Interesante cómo funcionan estos ataques.'),
  ('stored-xss-filter', 'Charlie', 'Los filtros pueden ser bypass fácilmente si no están bien implementados.')
ON CONFLICT DO NOTHING;