-- Senado Press - Esquema inicial
-- Ejecutar en el SQL Editor de Supabase

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipos enumerados
CREATE TYPE user_role AS ENUM ('journalist', 'admin');
CREATE TYPE post_tag AS ENUM ('debate', 'pregunta', 'critica', 'observacion', 'sesion');
CREATE TYPE post_status AS ENUM ('pending', 'approved', 'rejected', 'blocked');
CREATE TYPE reaction_type AS ENUM ('like', 'dislike');

-- Periodistas y administradores
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'journalist',
  media_outlet VARCHAR(100),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Senadores (lista Colombia 2022-2026)
CREATE TABLE senators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(150) NOT NULL,
  party VARCHAR(100) NOT NULL,
  caucus VARCHAR(100),
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estado dinámico del Senado (editable por admin)
CREATE TABLE senate_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  live_topic TEXT NOT NULL DEFAULT 'Sesión en preparación',
  is_live BOOLEAN DEFAULT false,
  active_projects INTEGER DEFAULT 0,
  active_dispatches INTEGER DEFAULT 0,
  open_questions INTEGER DEFAULT 0,
  active_debates INTEGER DEFAULT 0,
  next_session_at TIMESTAMPTZ,
  session_duration_minutes INTEGER DEFAULT 120,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Despachos / publicaciones de periodistas
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  tag post_tag NOT NULL DEFAULT 'observacion',
  image_url TEXT,
  target_senator_id UUID REFERENCES senators(id) ON DELETE SET NULL,
  target_journalist_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status post_status NOT NULL DEFAULT 'pending',
  moderation_note TEXT,
  moderated_by UUID REFERENCES profiles(id),
  moderated_at TIMESTAMPTZ,
  likes_count INTEGER DEFAULT 0,
  dislikes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reacciones
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type reaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Índices
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_tag ON posts(tag);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_reactions_post ON reactions(post_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Función para actualizar contadores de reacciones
CREATE OR REPLACE FUNCTION update_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'like' THEN
      UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE posts SET dislikes_count = dislikes_count + 1 WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'like' THEN
      UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    ELSE
      UPDATE posts SET dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.type = 'like' THEN
      UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    ELSE
      UPDATE posts SET dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = OLD.post_id;
    END IF;
    IF NEW.type = 'like' THEN
      UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE posts SET dislikes_count = dislikes_count + 1 WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reaction_counts
  AFTER INSERT OR UPDATE OR DELETE ON reactions
  FOR EACH ROW EXECUTE FUNCTION update_reaction_counts();

-- Estado inicial del senado
INSERT INTO senate_state (live_topic, is_live, active_projects, active_dispatches, open_questions, active_debates)
VALUES ('Reforma a la educación — Primer debate', true, 3, 12, 5, 2);

-- Bucket de storage para imágenes (crear manualmente en Supabase Dashboard si no existe)
-- Nombre: post-images, público: true