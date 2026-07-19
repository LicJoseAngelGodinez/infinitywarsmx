-- =============================================================
-- INFINITYWARSMX — Panel Admin: sección Usuarios
-- Ejecutar una sola vez en el SQL Editor de Supabase.
--
-- 1. Extiende member_notes (ya existía, nunca se había usado) con
--    los campos del panel: PTO/descanso con fecha de inicio y fin,
--    frase, e imagen (para el selector de imágenes que se construirá
--    más adelante — por ahora solo guarda la URL/ruta como texto).
-- 2. Crea is_admin(): función SECURITY DEFINER que verifica si quien
--    llama es admin, sin que el rol que invoca necesite permiso
--    directo sobre `profiles`. Evita el mismo problema que rompió
--    el registro público de WhatsApp dos veces (ver
--    supabase/whatsapp_registrations.sql) — ahí una política de
--    SELECT con subquery directa a `profiles` tronaba porque `anon`
--    no tenía GRANT sobre esa tabla.
-- 3. Agrega políticas de SELECT y DELETE en whatsapp_registrations
--    para admins autenticados, usando is_admin(). El INSERT público
--    (formulario sin login) no se toca — sigue funcionando igual.
-- 4. Cierra la lectura pública de member_notes. Regla general del
--    proyecto: solo es público lo que NO vive en el dashboard admin.
--    member_notes es puramente contenido del panel, así que pasa a
--    ser 100% admin-only (lectura y escritura). La Black List no se
--    ve afectada por esto -- se arma en el frontend a partir de datos
--    que ya son públicos por otro lado (member_snapshots + war_live),
--    no expone nada nuevo.
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. Extender member_notes
-- ─────────────────────────────────────────────────────────────
ALTER TABLE member_notes
  ADD COLUMN IF NOT EXISTS pto_start DATE,
  ADD COLUMN IF NOT EXISTS pto_end   DATE,
  ADD COLUMN IF NOT EXISTS phrase    TEXT,
  ADD COLUMN IF NOT EXISTS img_url   TEXT;


-- ─────────────────────────────────────────────────────────────
-- 2. Función is_admin()
--    SECURITY DEFINER = corre con los privilegios de quien la creó
--    (el owner del proyecto), no con los del rol que la invoca —
--    por eso puede leer `profiles` aunque `authenticated` no tenga
--    GRANT directo sobre esa tabla.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND app_role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;


-- ─────────────────────────────────────────────────────────────
-- 3. Políticas de admin en whatsapp_registrations
--    anon NO recibe GRANT de SELECT/DELETE aquí, así que ni
--    siquiera llega a evaluar is_admin() — sigue sin poder leer
--    la tabla, igual que hoy.
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "whatsapp_registrations_select_admin"
  ON whatsapp_registrations FOR SELECT
  USING (is_admin());

CREATE POLICY "whatsapp_registrations_delete_admin"
  ON whatsapp_registrations FOR DELETE
  USING (is_admin());

GRANT SELECT, DELETE ON whatsapp_registrations TO authenticated;


-- ─────────────────────────────────────────────────────────────
-- 4. member_notes deja de ser público
--    La política "member_notes_write_admin" (FOR ALL, ya existía)
--    cubre SELECT/INSERT/UPDATE/DELETE para admins -- al quitar la
--    política pública de SELECT, esa es la única que queda.
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "member_notes_select_public" ON member_notes;
REVOKE SELECT ON member_notes FROM anon;
