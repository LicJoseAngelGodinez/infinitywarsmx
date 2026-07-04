// Cron cada 30 minutos — actualiza el estado en vivo de la guerra.
// UPSERT en war_live (~50 filas) y actualiza war_clan_meta en app_settings.
// Puerto de .github/scripts/war-live.js a Supabase Edge Function (Deno).

const CLAN_TAG  = '%23228PYJ08';
const SUPABASE  = Deno.env.get('SUPABASE_URL')!;
const SUPA_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CLASH_KEY = Deno.env.get('CLASH_API_KEY')!;

async function clashFetch(path: string) {
  const res = await fetch(`https://proxy.royaleapi.dev/v1${path}`, {
    headers: { Authorization: `Bearer ${CLASH_KEY}` },
  });
  if (!res.ok) throw new Error(`Clash API ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function supabaseUpsert(table: string, rows: unknown[]) {
  const res = await fetch(`${SUPABASE}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`Supabase ${table} → ${res.status}: ${await res.text()}`);
}

Deno.serve(async (_req) => {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // 1. Fetch members para tener el mapa tag → role y actualizar snapshot del día
    const membersData = await clashFetch(`/clans/${CLAN_TAG}/members`);
    const roleByTag: Record<string, string> = {};
    (membersData.items ?? []).forEach((m: any) => { roleByTag[m.tag] = m.role; });

    const memberRows = (membersData.items ?? []).map((m: any) => ({
      snapshot_date:      today,
      tag:                m.tag,
      name:               m.name,
      role:               m.role,
      trophies:           m.trophies          ?? 0,
      arena:              m.arena?.name       ?? null,
      clan_rank:          m.clanRank          ?? 0,
      donations:          m.donations         ?? 0,
      donations_received: m.donationsReceived ?? 0,
      last_seen:          m.lastSeen          ?? null,
    }));

    // Pausa Dom 23:00 UTC → Lun 09:30 UTC para proteger el snapshot final
    // de la semana antes del reset semanal de Clash.
    const nowUTC = new Date();
    const day  = nowUTC.getUTCDay();    // 0=Dom, 1=Lun
    const mins = nowUTC.getUTCHours() * 60 + nowUTC.getUTCMinutes();
    const inBlackout = (day === 0 && mins >= 23 * 60) ||
                       (day === 1 && mins <   9 * 60 + 30);

    if (inBlackout) {
      console.log('⏸️ member_snapshots pausado: ventana de corte semanal (Dom 23:00–Lun 09:30 UTC)');
    } else {
      await supabaseUpsert('member_snapshots', memberRows);
      await supabaseUpsert('app_settings', [{
        key:        'members_snapshot_ts',
        value:      nowUTC.toISOString(),
        updated_at: nowUTC.toISOString(),
      }]);
      console.log(`✅ member_snapshots: ${memberRows.length} filas actualizadas para ${today}`);
    }

    // 2. Fetch guerra en curso
    const war = await clashFetch(`/clans/${CLAN_TAG}/currentriverrace`);

    // 3. Participantes de nuestro clan
    const participants = war.clan?.participants ?? [];
    const now = new Date().toISOString();

    const rows = participants.map((p: any) => ({
      tag:              p.tag,
      name:             p.name,
      role:             roleByTag[p.tag] ?? null,
      decks_used:       p.decksUsed      ?? 0,
      decks_used_today: p.decksUsedToday ?? 0,
      fame:             p.fame           ?? 0,
      boat_attacks:     p.boatAttacks    ?? 0,
      snapshot_ts:      now,
    }));

    await supabaseUpsert('war_live', rows);

    // 4. Actualizar metadatos del clan en app_settings
    const meta = {
      clan_fame:     war.clan?.fame         ?? 0,
      period_points: war.clan?.periodPoints ?? 0,
      clan_score:    war.clan?.clanScore    ?? 0,
      period_type:   war.periodType         ?? 'training',
      section_index: war.sectionIndex       ?? 0,
    };

    await supabaseUpsert('app_settings', [{
      key:        'war_clan_meta',
      value:      JSON.stringify(meta),
      updated_at: now,
    }]);

    const summary = `✅ war_live: ${rows.length} participantes | periodType: ${war.periodType} | semana: ${(war.sectionIndex ?? 0) + 1}`;
    console.log(summary);

    return new Response(JSON.stringify({ ok: true, summary }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('❌', (err as Error).message);
    return new Response(JSON.stringify({ ok: false, error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
