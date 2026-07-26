-- Programa el cron de members-daily en Supabase (pg_cron + pg_net).
-- Correr esto en el SQL Editor de Supabase, una sola vez.
-- Requiere que pg_cron y pg_net ya estén habilitados (ver cron_war_live.sql).
--
-- ANTES DE CORRER: reemplaza el placeholder de abajo:
--   <SERVICE_ROLE_KEY>    → Settings → API → service_role key (legacy, NO la
--   secret key nueva -- ver gotcha en CLAUDE.md, probado 2026-07-26: la
--   secret key nueva da 401 al invocar Edge Functions, solo el JWT legacy
--   funciona para eso).

select cron.schedule(
  'members-daily',           -- nombre del job (único)
  '0 9 * * *',                -- diario 9:00 UTC (antes del corte de 9:45)
  $$
  select net.http_post(
    url     := 'https://vpdovzarpadcunhiisxw.supabase.co/functions/v1/members-daily',
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
-- select * from cron.job_run_details where jobname = 'members-daily' order by start_time desc limit 20;

-- Para eliminarlo si algo sale mal:
-- select cron.unschedule('members-daily');
