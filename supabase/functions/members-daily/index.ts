// Cron diario ~9:00 UTC — captura el roster completo del clan
// y lo inserta en member_snapshots (una fila por jugador por día).
// Puerto de .github/scripts/members-daily.js a Supabase Edge Function (Deno).

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

async function supabaseInsert(table: string, rows: unknown[], prefer = 'resolution=merge-duplicates') {
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

Deno.serve(async (_req) => {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const { items } = await clashFetch(`/clans/${CLAN_TAG}/members`);

    const rows = items.map((m: any) => ({
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

    const summary = `✅ member_snapshots: ${rows.length} filas para ${today}`;
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
