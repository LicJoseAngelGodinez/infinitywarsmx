-- =============================================================
-- INFINITYWARSMX — Historial de entradas/salidas del clan
-- Ejecutar una sola vez en el SQL Editor de Supabase.
-- Requiere que supabase/admin_users_panel.sql ya se haya corrido
-- (usa la función is_admin() creada ahí).
--
-- ⚠️ Reemplaza el diseño anterior (membership_events, un log de
-- eventos sueltos "joined"/"left"). Se cambió a un modelo de
-- "periodos": UNA fila por cada estancia continua de un tag en el
-- clan, con joined_date y left_date (left_date NULL = sigue en el
-- clan hoy). Motivo del cambio: con el log de eventos, cada
-- reingreso quedaba como dos filas sueltas sin relación directa
-- entre sí -- con periodos, un jugador que entró, salió y volvió a
-- entrar simplemente tiene 2 filas (o más), y "¿ya había estado
-- antes?" es un COUNT(*) por tag, sin necesidad de emparejar filas.
-- membership_events nunca llegó a usarse desde el frontend, así que
-- no hay nada que migrar -- se tira y se rehace desde cero.
--
-- Tabla membership_periods: una fila = una estancia continua en el
-- clan. Se llena de dos formas:
--   1. Aquí mismo, con un backfill ÚNICO a partir del historial ya
--      guardado en member_snapshots (aproximado — ver aviso abajo).
--   2. De aquí en adelante, automáticamente por el cron
--      members-daily (supabase/functions/members-daily/index.ts):
--        - Si un tag aparece hoy y no estaba ayer → INSERT de un
--          periodo nuevo (joined_date = hoy, left_date = NULL).
--        - Si un tag estaba ayer y ya no aparece hoy → UPDATE del
--          periodo abierto de ese tag (left_date = hoy).
--      A propósito NO se agregó esta lógica a war-live (corre cada
--      30 min — generaría ruido varias veces el mismo día).
--
-- Por qué el backfill es aproximado: member_snapshots no tiene un
-- registro perfecto día por día — si el cron falló algún día (ya
-- nos ha pasado por bugs de deploy), un hueco en las fechas de un
-- tag puede verse como "salió y volvió" sin que en realidad haya
-- pasado. Se aceptó ese riesgo a propósito para tener un punto de
-- partida — los periodos que se registren de aquí en adelante (vía
-- el cron) sí van a ser precisos.
--
-- "¿Es reincidente?" (se unió más de una vez) NO se guarda como
-- columna -- se calcula al momento de consultar con
-- COUNT(*) FROM membership_periods WHERE tag = X. Guardarlo como
-- columna aparte obligaría a mantenerlo sincronizado en cada INSERT
-- (y es exactamente el tipo de estado derivado que se desincroniza
-- solo con el tiempo) -- un COUNT no tiene ese riesgo.
--
-- 100% admin-only (RLS con is_admin()) — igual que member_notes,
-- esto vive en el dashboard, no es público.
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- Reemplazo de la tabla anterior (nunca se usó desde el frontend)
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS membership_events;


-- ─────────────────────────────────────────────────────────────
-- Tabla
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membership_periods (
  id          BIGSERIAL   PRIMARY KEY,
  tag         TEXT        NOT NULL,
  name        TEXT        NOT NULL,   -- nombre visto al iniciar el periodo
  joined_date DATE        NOT NULL,
  left_date   DATE,                   -- NULL = sigue en el clan hoy
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (left_date IS NULL OR left_date >= joined_date)
);

CREATE INDEX IF NOT EXISTS idx_membership_periods_tag
  ON membership_periods(tag);

-- Para encontrar rápido "el periodo abierto de este tag" (UPDATE del cron)
-- y para el listado de "quién sigue activo" sin escanear toda la tabla.
CREATE INDEX IF NOT EXISTS idx_membership_periods_open
  ON membership_periods(tag) WHERE left_date IS NULL;

ALTER TABLE membership_periods ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "membership_periods_admin_only"
  ON membership_periods FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());


-- ─────────────────────────────────────────────────────────────
-- Grants
--   service_role la necesita para INSERT (joined) y UPDATE (left)
--   desde el cron members-daily.
-- ─────────────────────────────────────────────────────────────
GRANT SELECT ON membership_periods TO authenticated;
GRANT ALL ON membership_periods TO service_role;


-- ─────────────────────────────────────────────────────────────
-- Backfill ÚNICO -- correr solo una vez.
-- Agrupa fechas consecutivas de member_snapshots por tag en
-- "rachas" (streaks, el clásico problema de islands-and-gaps en
-- SQL). Cada racha = un periodo: joined_date = inicio de la racha,
-- left_date = día después del fin -- o NULL si la racha sigue
-- activa hoy (es decir, el tag sigue actualmente en el clan).
-- ─────────────────────────────────────────────────────────────
WITH latest AS (
  SELECT MAX(snapshot_date) AS max_date FROM member_snapshots
),
dated AS (
  SELECT DISTINCT tag, snapshot_date
  FROM member_snapshots
),
grouped AS (
  SELECT
    tag,
    snapshot_date,
    snapshot_date - (ROW_NUMBER() OVER (PARTITION BY tag ORDER BY snapshot_date))::integer AS grp
  FROM dated
),
streaks AS (
  SELECT tag, grp, MIN(snapshot_date) AS streak_start, MAX(snapshot_date) AS streak_end
  FROM grouped
  GROUP BY tag, grp
),
streaks_named AS (
  SELECT
    s.tag,
    s.streak_start,
    s.streak_end,
    (SELECT name FROM member_snapshots ms
       WHERE ms.tag = s.tag AND ms.snapshot_date = s.streak_start LIMIT 1) AS start_name
  FROM streaks s
)
INSERT INTO membership_periods (tag, name, joined_date, left_date)
SELECT
  sn.tag,
  sn.start_name,
  sn.streak_start,
  CASE WHEN sn.streak_end < latest.max_date THEN sn.streak_end + 1 ELSE NULL END
FROM streaks_named sn, latest;
