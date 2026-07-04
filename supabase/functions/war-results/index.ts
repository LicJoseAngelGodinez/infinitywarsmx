// Cron lunes 9:05 UTC — captura los resultados de la última guerra cerrada
// e inserta en war_results (una fila por jugador por semana).
// ON CONFLICT DO NOTHING: idempotente, seguro de re-ejecutar.
// Puerto de .github/scripts/war-results.js a Supabase Edge Function (Deno).

const CLAN_TAG  = '%23228PYJ08';
const OWN_TAG   = '#228PYJ08';
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

// Las fechas de Clash vienen en formato "20260627T093456.000Z"
function parseClashDate(str: string | undefined) {
  if (!str) return new Date();
  const m = str.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (!m) return new Date(str);
  return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`);
}

Deno.serve(async (_req) => {
  try {
    // 1. Fetch members para el mapa tag → role
    const membersData = await clashFetch(`/clans/${CLAN_TAG}/members`);
    const roleByTag: Record<string, string> = {};
    (membersData.items ?? []).forEach((m: any) => { roleByTag[m.tag] = m.role; });

    // 2. Fetch el log de guerras cerradas (solo la más reciente)
    const logData = await clashFetch(`/clans/${CLAN_TAG}/riverracelog?limit=1`);
    const latestWar = logData.items?.[0];
    if (!latestWar) throw new Error('No hay guerras cerradas en el log');

    // 3. Encontrar nuestro clan en standings
    const ownStanding = latestWar.standings?.find((s: any) => s.clan?.tag === OWN_TAG);
    if (!ownStanding) throw new Error(`Clan ${OWN_TAG} no encontrado en standings`);

    // 4. Derivar season_id ("YYYY-MM") desde createdDate del war item.
    // ownStanding.clan.finishTime siempre devuelve epoch (19691231T...) — no es útil.
    const finishDate = parseClashDate(latestWar.createdDate);
    const seasonId   = `${finishDate.getUTCFullYear()}-${String(finishDate.getUTCMonth() + 1).padStart(2, '0')}`;

    const sectionIndex  = latestWar.sectionIndex ?? 0;
    const clanRank      = ownStanding.rank        ?? 0;
    const snapshotDate  = new Date().toISOString().slice(0, 10);

    // 5. Construir filas de participantes
    const rows = (ownStanding.clan?.participants ?? []).map((p: any) => ({
      season_id:     seasonId,
      section_index: sectionIndex,
      tag:           p.tag,
      name:          p.name,
      role:          roleByTag[p.tag] ?? 'member',
      decks_used:    p.decksUsed     ?? 0,
      fame:          p.fame          ?? 0,
      boat_attacks:  p.boatAttacks   ?? 0,
      clan_rank:     clanRank,
      snapshot_date: snapshotDate,
    }));

    // 6. Insert (DO NOTHING en conflicto — idempotente)
    const res = await fetch(`${SUPABASE}/rest/v1/war_results`, {
      method: 'POST',
      headers: {
        apikey: SUPA_KEY,
        Authorization: `Bearer ${SUPA_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=ignore-duplicates',
      },
      body: JSON.stringify(rows),
    });
    if (!res.ok) throw new Error(`Supabase war_results → ${res.status}: ${await res.text()}`);

    const summary = `✅ war_results: temporada ${seasonId} semana ${sectionIndex + 1} | ${rows.length} participantes | rank ${clanRank}`;
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
