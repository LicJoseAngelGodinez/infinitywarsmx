-- Corrige los warnings del Security Advisor de Supabase (2026-07-04).
-- Correr en el SQL Editor de Supabase, una sola vez.

-- ─────────────────────────────────────────────────────────────
-- 1. Extension in Public — pg_net.
--    INTENTADO y DESCARTADO: Postgres confirmó que pg_net no es
--    "relocatable" (ERROR 0A000: extension "pg_net" does not support
--    SET SCHEMA). Moverlo requeriría DROP + CREATE EXTENSION, lo cual
--    puede interrumpir las requests en vuelo de pg_net usadas por
--    supabase/cron.sql. Se deja el warning aceptado: es informativo,
--    no representa un riesgo real (pg_net solo expone funciones propias
--    en su schema `net`, no contamina `public` con nada explotable).
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────
-- 2. Public/Signed-In Can Execute SECURITY DEFINER Function
--    handle_new_user() — trigger que crea el perfil al registrarse.
--    Solo se dispara vía trigger (AFTER INSERT ON auth.users), no necesita
--    EXECUTE de ningún rol para eso, así que revocamos el acceso directo
--    por RPC. Confirmado sin argumentos (Database → Functions).
-- ─────────────────────────────────────────────────────────────
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- 3. rls_auto_enable() — event trigger interno del dashboard de Supabase
--    (fuerza RLS on en tablas nuevas creadas desde el Table Editor).
--    Se dispara solo vía event trigger DDL, no por RPC. Confirmado sin
--    argumentos (Database → Functions).
-- ─────────────────────────────────────────────────────────────
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- Para confirmar que los cambios quedaron aplicados:
-- select routine_name, grantee, privilege_type
-- from information_schema.routine_privileges
-- where routine_name in ('handle_new_user', 'rls_auto_enable');
-- ─────────────────────────────────────────────────────────────
