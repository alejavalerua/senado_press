-- Migración 002: Registro con email, respuestas y gestión admin
-- Ejecutar en SQL Editor de Supabase

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS parent_post_id UUID REFERENCES posts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Actualizar emails de usuarios seed existentes (opcional)
UPDATE profiles SET email = username || '@institucion.edu.co' WHERE email IS NULL AND role = 'journalist';
UPDATE profiles SET email = 'samuel.lugo@senado.bimun' WHERE username = 'samuel' AND email IS NULL;