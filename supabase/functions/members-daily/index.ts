// Cron diario ~9:00 UTC — captura el roster completo del clan
// y lo inserta en member_snapshots (una fila por jugador por día).
// También detecta entradas/salidas comparando contra el último
// snapshot guardado, y mantiene membership_periods: INSERT de un
// periodo nuevo cuando alguien entra, UPDATE (cierra left_date) del
// periodo abierto cuando alguien sale.
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

async function supabaseSelect(path: string) {
  const res = await fetch(`${SUPABASE}/rest/v1/${path}`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase select ${path} → ${res.status}: ${await res.text()}`);
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

async function supabasePatch(path: string, body: unknown) {
  const res = await fetch(`${SUPABASE}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Supabase patch ${path} → ${res.status}: ${await res.text()}`);
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

    // ── Detectar entradas/salidas comparando contra el último snapshot ──
    // Se compara contra la fecha anterior más reciente (no necesariamente
    // "ayer" si algún día falló el cron). Si no hay snapshot previo (primera
    // corrida), no se tocan periodos -- para eso está el backfill único.
    const joined: { tag: string; name: string }[] = [];
    const left: { tag: string; name: string }[] = [];

    const prevDateRows = await supabaseSelect(
      `member_snapshots?select=snapshot_date&snapshot_date=lt.${today}&order=snapshot_date.desc&limit=1`,
    );

    if (prevDateRows.length) {
      const prevDate = prevDateRows[0].snapshot_date;
      const prevRows: { tag: string; name: string }[] = await supabaseSelect(
        `member_snapshots?select=tag,name&snapshot_date=eq.${prevDate}`,
      );

      const prevTags  = new Set(prevRows.map((r) => r.tag));
      const todayTags = new Set(items.map((m: any) => m.tag));

      for (const m of items) {
        if (!prevTags.has(m.tag)) joined.push({ tag: m.tag, name: m.name });
      }
      for (const r of prevRows) {
        if (!todayTags.has(r.tag)) left.push({ tag: r.tag, name: r.name });
      }
    }

    await supabaseInsert('member_snapshots', rows);

    // Nuevo periodo por cada reingreso/alta.
    if (joined.length) {
      await supabaseInsert(
        'membership_periods',
        joined.map((j) => ({ tag: j.tag, name: j.name, joined_date: today, left_date: null })),
        'return=minimal',
      );
    }

    // Cierra el periodo abierto (left_date IS NULL) de cada baja.
    for (const l of left) {
      await supabasePatch(
        `membership_periods?tag=eq.${encodeURIComponent(l.tag)}&left_date=is.null`,
        { left_date: today },
      );
    }

    const summary = `✅ member_snapshots: ${rows.length} filas para ${today}`
      + (joined.length ? ` | altas: ${joined.map((j) => j.name).join(', ')}` : '')
      + (left.length ? ` | bajas: ${left.map((l) => l.name).join(', ')}` : '');
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
