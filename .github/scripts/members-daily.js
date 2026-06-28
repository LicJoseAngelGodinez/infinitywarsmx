// Cron diario ~9:00 UTC — captura el roster completo del clan
// y lo inserta en member_snapshots (una fila por jugador por día).

const CLAN_TAG    = '%23228PYJ08';
const SUPABASE    = process.env.SUPABASE_URL;
const SUPA_KEY    = process.env.SUPABASE_SECRET_KEY;
const CLASH_KEY   = process.env.CLASH_API_KEY;

async function clashFetch(path) {
  const res = await fetch(`https://proxy.royaleapi.dev/v1${path}`, {
    headers: { Authorization: `Bearer ${CLASH_KEY}` },
  });
  if (!res.ok) throw new Error(`Clash API ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function supabaseInsert(table, rows, prefer = 'resolution=merge-duplicates') {
  const res = await fetch(`${SUPABASE}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
      Prefer: prefer,
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`Supabase ${table} → ${res.status}: ${await res.text()}`);
}

async function run() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { items } = await clashFetch(`/clans/${CLAN_TAG}/members`);

  const rows = items.map(m => ({
    snapshot_date:      today,
    tag:                m.tag,
    name:               m.name,
    role:               m.role,
    trophies:           m.trophies           ?? 0,
    arena:              m.arena?.name        ?? null,
    clan_rank:          m.clanRank           ?? 0,
    donations:          m.donations          ?? 0,
    donations_received: m.donationsReceived  ?? 0,
    last_seen:          m.lastSeen           ?? null,
  }));

  await supabaseInsert('member_snapshots', rows);
  console.log(`✅ member_snapshots: ${rows.length} filas para ${today}`);
}

run().catch(err => { console.error('❌', err.message); process.exit(1); });
