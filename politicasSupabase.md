-- =========================================
-- CONFIGURACIÓN COMPLETA DE BASE DE DATOS
-- COPIAR Y PEGAR TODO EN SQL EDITOR
-- =========================================

-- 1. CREAR TABLAS (si no existen ya)
-- =========================================

-- Tabla de usuarios (sincronizada con Clerk)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id VARCHAR UNIQUE NOT NULL,
    email VARCHAR NOT NULL,
    display_name VARCHAR,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de notebooks
CREATE TABLE IF NOT EXISTS notebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_color VARCHAR(7) DEFAULT '#6D28D9',
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de páginas de notebook (canvas data)
CREATE TABLE IF NOT EXISTS notebook_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL DEFAULT 1,
    canvas_data JSONB DEFAULT '{"paths": [], "textElements": []}',
    thumbnail_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(notebook_id, page_number)
);

-- 2. HABILITAR ROW LEVEL SECURITY
-- =========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_pages ENABLE ROW LEVEL SECURITY;

-- 3. ELIMINAR POLÍTICAS EXISTENTES (si las hay)
-- =========================================

DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "notebooks_select_own" ON notebooks;
DROP POLICY IF EXISTS "notebooks_insert_own" ON notebooks;
DROP POLICY IF EXISTS "notebooks_update_own" ON notebooks;
DROP POLICY IF EXISTS "notebooks_delete_own" ON notebooks;
DROP POLICY IF EXISTS "pages_select_own" ON notebook_pages;
DROP POLICY IF EXISTS "pages_insert_own" ON notebook_pages;
DROP POLICY IF EXISTS "pages_update_own" ON notebook_pages;
DROP POLICY IF EXISTS "pages_delete_own" ON notebook_pages;

-- 4. CREAR FUNCIÓN AUXILIAR
-- =========================================

CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM users 
        WHERE clerk_user_id = auth.jwt() ->> 'sub'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. POLÍTICAS PARA TABLA USERS
-- =========================================

-- Permitir ver perfil propio
CREATE POLICY "users_select_own" ON users FOR SELECT 
USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Permitir crear perfil propio
CREATE POLICY "users_insert_own" ON users FOR INSERT 
WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

-- Permitir actualizar perfil propio
CREATE POLICY "users_update_own" ON users FOR UPDATE 
USING (clerk_user_id = auth.jwt() ->> 'sub')
WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

-- 6. POLÍTICAS PARA TABLA NOTEBOOKS
-- =========================================

-- Permitir ver notebooks propios
CREATE POLICY "notebooks_select_own" ON notebooks FOR SELECT 
USING (user_id = get_current_user_id());

-- Permitir crear notebooks propios
CREATE POLICY "notebooks_insert_own" ON notebooks FOR INSERT 
WITH CHECK (user_id = get_current_user_id());

-- Permitir actualizar notebooks propios
CREATE POLICY "notebooks_update_own" ON notebooks FOR UPDATE 
USING (user_id = get_current_user_id())
WITH CHECK (user_id = get_current_user_id());

-- Permitir eliminar notebooks propios
CREATE POLICY "notebooks_delete_own" ON notebooks FOR DELETE 
USING (user_id = get_current_user_id());

-- 7. POLÍTICAS PARA TABLA NOTEBOOK_PAGES
-- =========================================

-- Permitir ver páginas de notebooks propios
CREATE POLICY "pages_select_own" ON notebook_pages FOR SELECT 
USING (notebook_id IN (
    SELECT id FROM notebooks WHERE user_id = get_current_user_id()
));

-- Permitir crear páginas en notebooks propios
CREATE POLICY "pages_insert_own" ON notebook_pages FOR INSERT 
WITH CHECK (notebook_id IN (
    SELECT id FROM notebooks WHERE user_id = get_current_user_id()
));

-- Permitir actualizar páginas de notebooks propios
CREATE POLICY "pages_update_own" ON notebook_pages FOR UPDATE 
USING (notebook_id IN (
    SELECT id FROM notebooks WHERE user_id = get_current_user_id()
))
WITH CHECK (notebook_id IN (
    SELECT id FROM notebooks WHERE user_id = get_current_user_id()
));

-- Permitir eliminar páginas de notebooks propios
CREATE POLICY "pages_delete_own" ON notebook_pages FOR DELETE 
USING (notebook_id IN (
    SELECT id FROM notebooks WHERE user_id = get_current_user_id()
));

-- 8. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- =========================================

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_notebook_id ON notebook_pages(notebook_id);

-- =========================================
-- FIN DEL SCRIPT
-- ¡EJECUTAR TODO JUNTO!
-- =========================================