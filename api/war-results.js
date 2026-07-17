const SUPABASE = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

function supaFetch(path) {
  return fetch(`${SUPABASE}/rest/v1/${path}`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
}

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Todas las filas ordenadas de más reciente a más antiguo
    const resultsRes = await supaFetch('war_results?order=season_id.desc,section_index.desc');
    const rows       = await resultsRes.json();

    // Agrupar por temporada + semana (season_id + section_index)
    const grouped = new Map();
    rows.forEach(r => {
      const key = `${r.season_id}|${r.section_index}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          season_id:     r.season_id,
          section_index: r.section_index,
          clan_rank:     r.clan_rank,
          participants:  [],
        });
      }
      grouped.get(key).participants.push({
        tag:         r.tag,
        name:        r.name,
        role:        r.role,
        decksUsed:   r.decks_used,
        fame:        r.fame,
        boatAttacks: r.boat_attacks,
      });
    });

    // Cache 1 hora — solo se actualiza los lunes
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json({ items: [...grouped.values()] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
