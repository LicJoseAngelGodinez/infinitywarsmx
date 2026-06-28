-- =============================================================
-- INFINITYWARSMX — Grants
-- Ejecutar después de schema.sql y rls.sql.
-- Necesario cuando se crea el proyecto con
-- "Automatically expose new tables" desactivado.
--
-- RLS controla qué FILAS puede ver/modificar cada rol.
-- Los GRANTs controlan qué TABLAS puede tocar cada rol.
-- Ambos son necesarios — sin GRANT, RLS ni se evalúa.
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- service_role
--   Usado por GitHub Actions (crons). Bypasea RLS pero aún
--   necesita permisos de tabla a nivel PostgreSQL.
-- ─────────────────────────────────────────────────────────────
GRANT ALL ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;


-- ─────────────────────────────────────────────────────────────
-- anon
--   Usuarios sin autenticar. Solo lectura en tablas públicas.
--   RLS ya restringe a SELECT — aquí se habilita el acceso base.
-- ─────────────────────────────────────────────────────────────
GRANT SELECT ON
  member_snapshots,
  war_live,
  war_results,
  app_settings,
  member_notes,
  clan_events,
  prizes,
  member_details
TO anon;


-- ─────────────────────────────────────────────────────────────
-- authenticated
--   Usuarios con sesión activa (owner + esposa).
--   Lectura en todas las tablas de datos.
--   Escritura en tablas de contenido — RLS restringe a admins.
-- ─────────────────────────────────────────────────────────────
GRANT SELECT ON
  member_snapshots,
  war_live,
  war_results,
  app_settings,
  member_notes,
  clan_events,
  prizes,
  member_details,
  profiles
TO authenticated;

GRANT INSERT, UPDATE, DELETE ON
  app_settings,
  member_notes,
  clan_events,
  prizes
TO authenticated;

GRANT UPDATE ON profiles TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
