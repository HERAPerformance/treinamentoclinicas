-- ============================================================
-- SCHEMA: Portal de Treinamento - Cirurgia Plástica
-- Rodar no Supabase SQL Editor
-- ============================================================

-- Tabela de usuários/atendentes
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'atendente', -- 'atendente' | 'admin'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Progresso por módulo
CREATE TABLE IF NOT EXISTS module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  module_index INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  time_spent INTEGER DEFAULT 0, -- segundos
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, module_index)
);

-- Tentativas de avaliação
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL, -- 0-100
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_spent INTEGER NOT NULL, -- segundos
  answers JSONB NOT NULL, -- {questionIndex: answerIndex}
  passed BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Políticas: atendente vê só os próprios dados
CREATE POLICY "users_self" ON users FOR SELECT USING (id::text = current_setting('app.user_id', true));
CREATE POLICY "progress_self_select" ON module_progress FOR SELECT USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY "progress_self_insert" ON module_progress FOR INSERT WITH CHECK (user_id::text = current_setting('app.user_id', true));
CREATE POLICY "progress_self_update" ON module_progress FOR UPDATE USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY "quiz_self_select" ON quiz_attempts FOR SELECT USING (user_id::text = current_setting('app.user_id', true));
CREATE POLICY "quiz_self_insert" ON quiz_attempts FOR INSERT WITH CHECK (user_id::text = current_setting('app.user_id', true));

-- Service role bypassa RLS (usado nas API routes)
-- Não precisa criar política para service_role

-- ============================================================
-- DADOS INICIAIS
-- ============================================================

-- Admin
INSERT INTO users (email, name, role) VALUES
  ('admin@clinica.com', 'Administrador', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Atendentes de exemplo
INSERT INTO users (email, name, role) VALUES
  ('atendente@clinica.com', 'Ana Clara', 'atendente'),
  ('atendente2@clinica.com', 'Juliana Mendes', 'atendente')
ON CONFLICT (email) DO NOTHING;
