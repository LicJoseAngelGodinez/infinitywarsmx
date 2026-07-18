-- =============================================================
-- INFINITYWARSMX — Registro para la comunidad de WhatsApp
-- Ejecutar una sola vez en el SQL Editor de Supabase.
--
-- Formulario público en la página de Reglas: el visitante elige su
-- jugador, pone teléfono (y opcionalmente su nombre real), y al
-- enviar queda registrado y se le redirige al link de WhatsApp.
--
-- Seguridad: cualquiera puede INSERT (es un formulario sin login), pero
-- NADIE puede leer la tabla desde el cliente (ni con la key pública) —
-- los teléfonos solo se ven desde el Table Editor de Supabase (tu
-- sesión de owner no pasa por RLS).
--
-- ⚠️ El cliente hace un INSERT plano (sin ON CONFLICT) y, si truena por
-- llave duplicada (código 23505 = ya se había registrado), lo trata
-- como éxito en el código y redirige igual. NO usar `.upsert()` aquí
-- (ni con `ignoreDuplicates: true`) — cualquier variante de
-- `ON CONFLICT` (DO UPDATE **o** DO NOTHING) requiere permiso de
-- SELECT sobre la tabla en Postgres para poder resolver el conflicto,
-- y dárselo a `anon` permitiría que cualquiera lea todos los teléfonos
-- vía un GET directo a la API. Pasó dos veces en producción el
-- 2026-07-17 ("permission denied for table whatsapp_registrations" /
-- "... for table profiles", ambos con el hint de Supabase sugiriendo
-- exactamente ese GRANT peligroso) antes de llegar al INSERT plano
-- como solución. Si se necesita permitir que alguien actualice su
-- propio registro más adelante, usar un `.update().eq('tag', tag)`
-- directo (no upsert) -- eso sí solo requiere UPDATE + la política de
-- UPDATE, sin el problema de ON CONFLICT.
-- =============================================================


-- ─────────────────────────────────────────────────────────────
-- Tabla
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS whatsapp_registrations (
  tag           TEXT        PRIMARY KEY,  -- tag del jugador elegido en el selector
  name          TEXT        NOT NULL,     -- nombre del jugador (snapshot, del selector)
  real_name     TEXT,                     -- nombre real, opcional
  phone         TEXT        NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE whatsapp_registrations ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────
-- RLS
--   INSERT/UPDATE público (formulario sin login).
--   Sin política de SELECT por ahora -- con RLS activo y ninguna
--   política de SELECT, nadie puede leer vía la API (ni anon ni
--   authenticated). El owner sigue viendo todo desde el Table
--   Editor de Supabase, que no pasa por RLS. Ver aviso arriba antes
--   de agregar lectura para admins.
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "whatsapp_registrations_insert_public"
  ON whatsapp_registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "whatsapp_registrations_update_public"
  ON whatsapp_registrations FOR UPDATE
  USING (true)
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────
-- Grants
-- ─────────────────────────────────────────────────────────────
GRANT INSERT, UPDATE ON whatsapp_registrations TO anon;


-- ─────────────────────────────────────────────────────────────
-- Link de la comunidad en app_settings (mismo patrón que
-- min_donations) — se puede actualizar después con un UPDATE,
-- sin necesidad de tocar código.
-- ─────────────────────────────────────────────────────────────
INSERT INTO app_settings (key, value)
VALUES ('whatsapp_link', 'https://chat.whatsapp.com/FUCgTa0WKIa7Ftq1vIx28G')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
