-- =============================================================
-- INFINITYWARSMX — Row Level Security
-- Ejecutar después de schema.sql.
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- Habilitar RLS en todas las tablas
-- ─────────────────────────────────────────────────────────────
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE war_live         ENABLE ROW LEVEL SECURITY;
ALTER TABLE war_results      ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_notes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE clan_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_details   ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────
-- profiles
--   Cada usuario solo puede ver y editar su propio perfil.
--   El INSERT lo hace el trigger handle_new_user con SECURITY
--   DEFINER, por lo que no necesita política de INSERT aquí.
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ─────────────────────────────────────────────────────────────
-- member_snapshots
--   Lectura pública (cualquiera puede ver el roster).
--   Escritura solo desde el service role (GitHub Actions).
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "member_snapshots_select_public"
  ON member_snapshots FOR SELECT
  USING (true);


-- ─────────────────────────────────────────────────────────────
-- war_live
--   Lectura pública.
--   Escritura solo desde el service role (GitHub Actions).
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "war_live_select_public"
  ON war_live FOR SELECT
  USING (true);


-- ─────────────────────────────────────────────────────────────
-- war_results
--   Lectura pública.
--   Escritura solo desde el service role (GitHub Actions).
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "war_results_select_public"
  ON war_results FOR SELECT
  USING (true);


-- ─────────────────────────────────────────────────────────────
-- app_settings
--   Lectura pública (el cliente necesita min_donations,
--   war_clan_meta, etc. sin autenticarse).
--   Escritura solo para usuarios autenticados con app_role admin.
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "app_settings_select_public"
  ON app_settings FOR SELECT
  USING (true);

CREATE POLICY "app_settings_write_admin"
  ON app_settings FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE app_role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE app_role = 'admin'
    )
  );


-- ─────────────────────────────────────────────────────────────
-- member_notes
--   Lectura pública (las notas se muestran en el dashboard).
--   Escritura solo para admins autenticados.
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "member_notes_select_public"
  ON member_notes FOR SELECT
  USING (true);

CREATE POLICY "member_notes_write_admin"
  ON member_notes FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE app_role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE app_role = 'admin'
    )
  );


-- ─────────────────────────────────────────────────────────────
-- clan_events
--   Lectura pública (los miembros pueden ver los eventos).
--   Escritura solo para admins autenticados.
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "clan_events_select_public"
  ON clan_events FOR SELECT
  USING (true);

CREATE POLICY "clan_events_write_admin"
  ON clan_events FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE app_role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE app_role = 'admin'
    )
  );


-- ─────────────────────────────────────────────────────────────
-- prizes
--   Lectura pública.
--   Escritura solo para admins autenticados.
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "prizes_select_public"
  ON prizes FOR SELECT
  USING (true);

CREATE POLICY "prizes_write_admin"
  ON prizes FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE app_role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE app_role = 'admin'
    )
  );


-- ─────────────────────────────────────────────────────────────
-- member_details
--   Lectura pública.
--   Escritura solo desde el service role (GitHub Actions).
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "member_details_select_public"
  ON member_details FOR SELECT
  USING (true);
