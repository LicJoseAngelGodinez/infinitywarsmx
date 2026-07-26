-- =============================================================
-- INFINITYWARSMX — Rediseño de member_details
-- Ejecutar una sola vez en el SQL Editor de Supabase.
--
-- La tabla member_details YA EXISTÍA en schema.sql (una de las 9 tablas
-- originales) pero con diseño histórico acumulativo (PK
-- (snapshot_date, tag), sin campos de mazo/carta favorita) -- nunca se
-- pobló, nunca corrió ningún cron contra ella. Se decidió (2026-07-26)
-- guardar solo el estado MÁS RECIENTE de cada jugador (UPSERT por tag),
-- no historial diario -- hoy solo hace falta mostrar el perfil actual,
-- no una gráfica de evolución. Como está vacía, se tira y se rehace
-- con el shape real de clean-player.json.
--
-- ⚠️ DROP + CREATE en Postgres genera un objeto nuevo -- los GRANTs
-- del `GRANT ALL ON ALL TABLES ... TO service_role` original (que sí
-- cubría esta tabla cuando existía con el diseño viejo) NO se heredan.
-- Hay que re-otorgarlos aquí, igual que con cualquier tabla nueva.
--
-- iconUrls de cada carta se guarda tal cual llega del API (JSONB,
-- sin desestructurar a llaves específicas) -- no sabemos qué variantes
-- puede traer cada carta (medium/evolutionMedium/heroMedium/etc).
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- Reemplazo del diseño anterior (nunca se pobló)
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS member_details;


-- ─────────────────────────────────────────────────────────────
-- Tabla
-- ─────────────────────────────────────────────────────────────
CREATE TABLE member_details (
  tag                        TEXT        PRIMARY KEY,
  name                       TEXT        NOT NULL,
  exp_level                  INTEGER     NOT NULL DEFAULT 0,
  trophies                   INTEGER     NOT NULL DEFAULT 0,
  best_trophies              INTEGER     NOT NULL DEFAULT 0,
  wins                       INTEGER     NOT NULL DEFAULT 0,
  losses                     INTEGER     NOT NULL DEFAULT 0,
  battle_count               INTEGER     NOT NULL DEFAULT 0,
  three_crown_wins           INTEGER     NOT NULL DEFAULT 0,
  role                       TEXT        NOT NULL DEFAULT 'member',
  total_donations            INTEGER     NOT NULL DEFAULT 0,
  war_day_wins               INTEGER     NOT NULL DEFAULT 0,
  current_deck               JSONB       NOT NULL DEFAULT '[]'::jsonb,
  current_deck_support_cards JSONB       NOT NULL DEFAULT '[]'::jsonb,
  current_favourite_card     JSONB,
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE member_details ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────
-- RLS
--   Lectura pública (mismo criterio que member_snapshots -- es data
--   del API de Clash, no contenido del panel admin).
--   Escritura solo desde el service role (cron member-details).
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "member_details_select_public"
  ON member_details FOR SELECT
  USING (true);


-- ─────────────────────────────────────────────────────────────
-- Grants (re-otorgar -- ver aviso arriba sobre DROP + CREATE)
-- ─────────────────────────────────────────────────────────────
GRANT SELECT ON member_details TO anon;
GRANT ALL ON member_details TO service_role;
