const SUPABASE = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

function supaFetch(path) {
  return fetch(`${SUPABASE}/rest/v1/${path}`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 1. Participantes de la guerra en curso
    const participantsRes = await supaFetch('war_live?order=fame.desc');
    const participants    = await participantsRes.json();

    // 2. Metadatos del clan (periodType, sectionIndex, fame, etc.)
    const metaRes  = await supaFetch('app_settings?key=eq.war_clan_meta&select=value,updated_at');
    const metaRows = await metaRes.json();
    if (!metaRows.length) return res.status(200).json({ clan: { participants: [] } });
    const meta = JSON.parse(metaRows[0].value);

    // 3. Ensamblar — forma similar a /currentriverrace para minimizar cambios en index.html
    const response = {
      periodType:   meta.period_type,
      sectionIndex: meta.section_index,
      snapshot_ts:  metaRows[0].updated_at,   // cuándo se actualizó por última vez
      clan: {
        fame:         meta.clan_fame,
        periodPoints: meta.period_points,
        clanScore:    meta.clan_score,
        participants: participants.map(p => ({
          tag:            p.tag,
          name:           p.name,
          role:           p.role,
          decksUsed:      p.decks_used,
          decksUsedToday: p.decks_used_today,
          fame:           p.fame,
          boatAttacks:    p.boat_attacks,
        })),
      },
    };

    // Cache 2 min — el cron actualiza cada 2 h, pero un poco de frescura no duele
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate');
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
