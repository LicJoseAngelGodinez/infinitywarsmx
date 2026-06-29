// Cron cada 2 horas (06–22 UTC) — actualiza el estado en vivo de la guerra.
// UPSERT en war_live (~50 filas) y actualiza war_clan_meta en app_settings.

const CLAN_TAG  = '%23228PYJ08';
const OWN_TAG   = '#228PYJ08';
const SUPABASE  = process.env.SUPABASE_URL;
const SUPA_KEY  = process.env.SUPABASE_SECRET_KEY;
const CLASH_KEY = process.env.CLASH_API_KEY;

async function clashFetch(path) {
  const res = await fetch(`https://proxy.royaleapi.dev/v1${path}`, {
    headers: { Authorization: `Bearer ${CLASH_KEY}` },
  });
  if (!res.ok) throw new Error(`Clash API ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function supabaseUpsert(table, rows) {
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

async function run() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // 1. Fetch members para tener el mapa tag → role y actualizar snapshot del día
  const membersData = await clashFetch(`/clans/${CLAN_TAG}/members`);
  const roleByTag = {};
  (membersData.items ?? []).forEach(m => { roleByTag[m.tag] = m.role; });

  const memberRows = (membersData.items ?? []).map(m => ({
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
  // Pausa Dom 23:00 UTC (18:00 Cancún) → Lun 09:30 UTC para proteger el
  // snapshot final de la semana antes del reset semanal de Clash (~23:00–00:00 UTC).
  // El último UPSERT válido es el de las 22:30 UTC (17:30 Cancún).
  const nowUTC = new Date();
  const day = nowUTC.getUTCDay();    // 0=Dom, 1=Lun
  const mins = nowUTC.getUTCHours() * 60 + nowUTC.getUTCMinutes();
  const inBlackout = (day === 0 && mins >= 23 * 60) ||
                     (day === 1 && mins <   9 * 60 + 30);

  if (inBlackout) {
    console.log('⏸️ member_snapshots pausado: ventana de corte semanal (Dom 22:30–Lun 09:30 UTC)');
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

  const rows = participants.map(p => ({
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

  console.log(`✅ member_snapshots: ${memberRows.length} filas actualizadas para ${today}`);
  console.log(`✅ war_live: ${rows.length} participantes | periodType: ${war.periodType} | semana: ${(war.sectionIndex ?? 0) + 1}`);
}

run().catch(err => { console.error('❌', err.message); process.exit(1); });
