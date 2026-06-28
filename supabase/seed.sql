-- =============================================================
-- INFINITYWARSMX — Seed
-- Ejecutar después de schema.sql y rls.sql.
-- Valores iniciales para app_settings.
-- ON CONFLICT DO NOTHING: seguro de ejecutar varias veces.
-- =============================================================

INSERT INTO app_settings (key, value, updated_at)
VALUES
  -- Umbral de donaciones bajas (resaltado visual en el roster).
  ('min_donations', '150', NOW()),

  -- Semana actual de guerra (1-4 ó 1-5 según el mes).
  -- Actualizar manualmente cada lunes hasta confirmar
  -- el comportamiento de sectionIndex en la API.
  ('current_week_number', '1', NOW()),

  -- Metadatos del clan en la guerra actual.
  -- El cron de war-live actualiza este valor cada 2 horas.
  -- Formato: {
  --   "clan_fame":     número,
  --   "period_points": número,
  --   "clan_score":    número,
  --   "period_type":   "training" | "warDay",
  --   "section_index": número (0-based, semana dentro de la temporada)
  -- }
  ('war_clan_meta', '{"clan_fame":0,"period_points":0,"clan_score":0,"period_type":"training","section_index":0}', NOW())

ON CONFLICT (key) DO NOTHING;
