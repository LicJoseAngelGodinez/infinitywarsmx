-- =============================================================
-- INFINITYWARSMX — Schema
-- Ejecutar en Supabase SQL Editor en este orden:
--   1. schema.sql  (este archivo)
--   2. rls.sql
--   3. seed.sql
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES
--    Extiende auth.users con el rol dentro de la app.
--    Supabase gestiona auth.users; esta tabla solo añade
--    los campos propios de la aplicación.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT        NOT NULL,
  app_role     TEXT        NOT NULL DEFAULT 'viewer'
               CHECK (app_role IN ('admin', 'viewer')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crea el perfil automáticamente cuando se registra un usuario en Supabase Auth.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ─────────────────────────────────────────────────────────────
-- 2. MEMBER_SNAPSHOTS
--    Snapshot diario del roster del clan (~9:00 UTC).
--    Una fila por jugador por día.
--    Fuente: GET /clans/{tag}/members
--
--    Relación futura con member_details:
--    member_details(snapshot_date, tag) → member_snapshots(snapshot_date, tag)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS member_snapshots (
  snapshot_date      DATE        NOT NULL,
  tag                TEXT        NOT NULL,
  name               TEXT        NOT NULL,
  role               TEXT        NOT NULL,
  trophies           INTEGER     NOT NULL DEFAULT 0,
  arena              TEXT,
  clan_rank          INTEGER     NOT NULL DEFAULT 0,
  donations          INTEGER     NOT NULL DEFAULT 0,
  donations_received INTEGER     NOT NULL DEFAULT 0,
  last_seen          TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (snapshot_date, tag)
);

CREATE INDEX IF NOT EXISTS idx_member_snapshots_tag
  ON member_snapshots(tag);

CREATE INDEX IF NOT EXISTS idx_member_snapshots_date
  ON member_snapshots(snapshot_date DESC);


-- ─────────────────────────────────────────────────────────────
-- 3. WAR_LIVE
--    Estado actual de la guerra. UPSERT cada 2 horas.
--    Siempre ~50 filas (una por participante).
--    Fuente: GET /clans/{tag}/currentriverrace
--
--    Los metadatos a nivel clan (fame total, period_points,
--    clan_score, period_type, section_index) se guardan en
--    app_settings bajo la clave 'war_clan_meta' porque no
--    pertenecen a ningún participante en particular.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS war_live (
  tag              TEXT        PRIMARY KEY,
  name             TEXT        NOT NULL,
  role             TEXT,
  decks_used       INTEGER     NOT NULL DEFAULT 0,
  decks_used_today INTEGER     NOT NULL DEFAULT 0,
  fame             INTEGER     NOT NULL DEFAULT 0,
  boat_attacks     INTEGER     NOT NULL DEFAULT 0,
  snapshot_ts      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────────────────────
-- 4. WAR_RESULTS
--    Resultados finales de guerras cerradas.
--    Una fila por jugador por semana de guerra.
--    Fuente: GET /clans/{tag}/riverracelog
--
--    season_id: formato "YYYY-MM" del mes en que ocurrió la guerra.
--    Ejemplo: todas las semanas de julio 2026 → '2026-07'.
--    El cron lo deriva del campo finishTime del riverracelog.
--    No viene de la API — se calcula en el script de GH Actions.
--
--    El rol se captura en el mismo cron que obtiene /members,
--    antes del reset del lunes, para reflejar el rol real
--    del jugador durante esa semana (no el rol actual).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS war_results (
  season_id     TEXT        NOT NULL, -- Formato: 'YYYY-MM' (ej. '2026-07')
  section_index INTEGER     NOT NULL,
  tag           TEXT        NOT NULL,
  name          TEXT        NOT NULL,
  role          TEXT        NOT NULL,
  decks_used    INTEGER     NOT NULL DEFAULT 0,
  fame          INTEGER     NOT NULL DEFAULT 0,
  boat_attacks  INTEGER     NOT NULL DEFAULT 0,
  clan_rank     INTEGER     NOT NULL DEFAULT 0,
  snapshot_date DATE        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (season_id, section_index, tag)
);

CREATE INDEX IF NOT EXISTS idx_war_results_tag
  ON war_results(tag);

CREATE INDEX IF NOT EXISTS idx_war_results_season
  ON war_results(season_id, section_index);


-- ─────────────────────────────────────────────────────────────
-- 5. APP_SETTINGS
--    Solo configuración escalar de la app y metadatos
--    automáticos (actualizados por crons).
--    Lectura pública (anon key + RLS). Escritura solo admins.
--
--    Claves (ver seed.sql):
--      min_donations       → umbral visual de donaciones bajas
--      current_week_number → semana manual hasta confirmar sectionIndex
--      war_clan_meta       → JSON blob actualizado por el cron de war-live
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT        PRIMARY KEY,
  value      TEXT        NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────────────────────
-- 6. MEMBER_NOTES
--    Notas y flags manuales por jugador. Una fila por tag.
--    Gestionadas desde el dashboard (admin).
--    El tag nunca cambia aunque el jugador cambie de nombre,
--    por eso es la PK correcta.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS member_notes (
  tag        TEXT        PRIMARY KEY,
  note       TEXT,
  flagged    BOOLEAN     NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────────────────────
-- 7. CLAN_EVENTS
--    Eventos, torneos internos o links relevantes de la semana.
--    Gestionados desde el dashboard (admin).
--    Historial acumulativo — no se sobreescriben.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clan_events (
  id         BIGSERIAL   PRIMARY KEY,
  event_date DATE        NOT NULL,  -- semana o fecha del evento
  title      TEXT        NOT NULL,
  url        TEXT,                  -- link opcional (stream, bracket, etc.)
  notes      TEXT,                  -- descripción libre
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clan_events_date
  ON clan_events(event_date DESC);


-- ─────────────────────────────────────────────────────────────
-- 8. PRIZES
--    Historial de premios. Cubre dos casos:
--      - Premio de clan (tag IS NULL): ej. "1er lugar julio 2026"
--      - Premio individual (tag NOT NULL): ej. "MVP Donaciones"
--    Gestionados desde el dashboard (admin).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prizes (
  id           BIGSERIAL   PRIMARY KEY,
  season_id    TEXT,                  -- '2026-07', opcional (puede no estar ligado a una guerra)
  awarded_date DATE        NOT NULL,
  tag          TEXT,                  -- NULL = premio de todo el clan
  title        TEXT        NOT NULL,  -- ej. "MVP Donaciones", "1er lugar semana 3"
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prizes_season
  ON prizes(season_id);

CREATE INDEX IF NOT EXISTS idx_prizes_tag
  ON prizes(tag);


-- ─────────────────────────────────────────────────────────────
-- 9. MEMBER_DETAILS  (preparada, aún no poblada)
--    Datos detallados por jugador obtenidos de la API individual.
--    Una fila por jugador por día de captura.
--    Fuente futura: GET /players/{tag}  (~50 llamadas/día)
--
--    Comparte (snapshot_date, tag) con member_snapshots,
--    lo que permite hacer JOIN directo entre ambas tablas
--    para enriquecer el roster con estadísticas de carrera.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS member_details (
  snapshot_date      DATE        NOT NULL,
  tag                TEXT        NOT NULL,
  name               TEXT        NOT NULL,
  exp_level          INTEGER     NOT NULL DEFAULT 0,
  trophies           INTEGER     NOT NULL DEFAULT 0,
  best_trophies      INTEGER     NOT NULL DEFAULT 0,
  wins               INTEGER     NOT NULL DEFAULT 0,
  losses             INTEGER     NOT NULL DEFAULT 0,
  battle_count       INTEGER     NOT NULL DEFAULT 0,
  donations          INTEGER     NOT NULL DEFAULT 0,
  donations_received INTEGER     NOT NULL DEFAULT 0,
  clan_rank          INTEGER,
  arena              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (snapshot_date, tag)
);

CREATE INDEX IF NOT EXISTS idx_member_details_tag
  ON member_details(tag);

CREATE INDEX IF NOT EXISTS idx_member_details_date
  ON member_details(snapshot_date DESC);
