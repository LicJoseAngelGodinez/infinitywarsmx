// Cron diario (~9:10 UTC, después de members-daily) — llama a
// /players/{tag} para cada miembro del roster actual y guarda solo el
// estado MÁS RECIENTE de cada uno (UPSERT por tag) en member_details.
// Ver supabase/member_details.sql para el porqué del diseño.
//
// Secuencial con una pequeña pausa entre llamadas (no Promise.all) para
// no bombardear proxy.royaleapi.dev con ~50 requests de golpe. Si un
// jugador falla (ej. cuenta rara, timeout puntual) se salta y se
// continúa con el resto -- no se aborta todo el cron por un jugador.

const CLAN_TAG  = '%23228PYJ08';
const SUPABASE  = Deno.env.get('SUPABASE_URL')!;
const SUPA_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CLASH_KEY = Deno.env.get('CLASH_API_KEY')!;

const REQUEST_DELAY_MS = 200;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

// iconUrls se pasa tal cual (sin desestructurar) -- no sabemos qué
// variantes trae cada carta.
function mapCard(c: any) {
  return {
    name: c?.name ?? null,
    id: c?.id ?? null,
    elixirCost: c?.elixirCost ?? null,
    iconUrls: c?.iconUrls ?? {},
  };
}

Deno.serve(async (_req) => {
  try {
    const { items: roster } = await clashFetch(`/clans/${CLAN_TAG}/members`);

    const rows: unknown[] = [];
    const failed: string[] = [];

    for (const m of roster) {
      try {
        const p = await clashFetch(`/players/${encodeURIComponent(m.tag)}`);

        rows.push({
          tag: p.tag,
          name: p.name ?? m.name,
          exp_level: p.expLevel ?? 0,
          trophies: p.trophies ?? 0,
          best_trophies: p.bestTrophies ?? 0,
          wins: p.wins ?? 0,
          losses: p.losses ?? 0,
          battle_count: p.battleCount ?? 0,
          three_crown_wins: p.threeCrownWins ?? 0,
          role: p.role ?? m.role ?? 'member',
          total_donations: p.totalDonations ?? 0,
          war_day_wins: p.warDayWins ?? 0,
          current_deck: (p.currentDeck ?? []).map(mapCard),
          current_deck_support_cards: (p.currentDeckSupportCards ?? []).map(mapCard),
          current_favourite_card: p.currentFavouriteCard
            ? {
                name: p.currentFavouriteCard.name ?? null,
                iconUrls: p.currentFavouriteCard.iconUrls ?? {},
                rarity: p.currentFavouriteCard.rarity ?? null,
              }
            : null,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        failed.push(m.tag);
        console.error(`⚠️ ${m.tag} (${m.name}):`, (err as Error).message);
      }

      await sleep(REQUEST_DELAY_MS);
    }

    if (rows.length) {
      await supabaseUpsert('member_details', rows);
    }

    const summary = `✅ member_details: ${rows.length}/${roster.length} jugadores actualizados`
      + (failed.length ? ` | fallaron: ${failed.join(', ')}` : '');
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
