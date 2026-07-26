-- Programa el cron de member-details en Supabase (pg_cron + pg_net).
-- Correr esto en el SQL Editor de Supabase, una sola vez.
-- Requiere que pg_cron y pg_net ya estén habilitados (ver cron_war_live.sql).
--
-- ANTES DE CORRER: reemplaza el placeholder de abajo:
--   <SERVICE_ROLE_KEY>    → Settings → API → service_role key (legacy, NO la
--   secret key nueva -- probado 2026-07-26: invocar una Edge Function via
--   /functions/v1/ pasa por un gateway que solo valida JWTs legacy de Auth;
--   la secret key nueva (sb_secret_...) da 401 "Invalid API key" ahí, aunque
--   sí funciona bien para llamadas REST normales a /rest/v1/ (lo que ya usan
--   api/player-detail.js, api/whatsapp-tags.js, etc).

select cron.schedule(
  'member-details',           -- nombre del job (único)
  '10 9 * * *',               -- diario 9:10 UTC (después de members-daily, 9:00)
  $$
  select net.http_post(
    url     := 'https://vpdovzarpadcunhiisxw.supabase.co/functions/v1/member-details',
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
-- select * from cron.job_run_details where jobname = 'member-details' order by start_time desc limit 20;

-- Para eliminarlo si algo sale mal:
-- select cron.unschedule('member-details');
