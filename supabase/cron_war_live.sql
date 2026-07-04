-- Habilita cron jobs dentro de Supabase (reemplaza a GitHub Actions para war-live).
-- Correr esto en el SQL Editor de Supabase, una sola vez.
--
-- ANTES DE CORRER: reemplaza el placeholder de abajo:
--   <SERVICE_ROLE_KEY>    → Settings → API → service_role key (NO la publishable/anon)
--
-- pg_cron guarda este job en la tabla cron.job de tu propia base de datos —
-- solo tú (con acceso al SQL Editor) puedes verlo, mismo nivel de acceso que
-- ya tienes sobre el resto del esquema.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'war-live',                -- nombre del job (único)
  '*/30 * * * *',            -- cada 30 minutos
  $$
  select net.http_post(
    url     := 'https://vpdovzarpadcunhiisxw.supabase.co/functions/v1/war-live',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>',
      'Content-Type',  'application/json'
    )
  );
  $$
);

-- Para verificar que el job quedó programado:
-- select * from cron.job;

-- Para ver el historial de ejecuciones (últimas 20):
-- select * from cron.job_run_details order by start_time desc limit 20;

-- Para eliminarlo si algo sale mal:
-- select cron.unschedule('war-live');
