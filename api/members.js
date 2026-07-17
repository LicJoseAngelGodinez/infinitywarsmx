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
    // 1. Fecha del snapshot más reciente
    const dateRes  = await supaFetch('member_snapshots?select=snapshot_date&order=snapshot_date.desc&limit=1');
    const dateRows = await dateRes.json();
    if (!dateRows.length) return res.status(200).json({ items: [], snapshot_date: null });
    const { snapshot_date } = dateRows[0];

    // 2. Todos los miembros de ese día, ordenados por rank
    const membersRes = await supaFetch(`member_snapshots?snapshot_date=eq.${snapshot_date}&order=clan_rank.asc`);
    const members    = await membersRes.json();

    // 3. Timestamp de última actualización del roster
    const tsRes  = await supaFetch('app_settings?key=eq.members_snapshot_ts&select=value');
    const tsRows = await tsRes.json();
    const members_snapshot_ts = tsRows[0]?.value ?? null;

    // 4. Estado de guerra en vivo para cruzar datos de participación
    const warRes  = await supaFetch('war_live?select=tag,decks_used,decks_used_today,boat_attacks,fame');
    const warRows = await warRes.json();
    const warByTag = {};
    warRows.forEach(p => { warByTag[p.tag] = p; });

    // 4. Ensamblar — forma compatible con lo que index.html ya consume
    const items = members.map(m => ({
      tag:               m.tag,
      name:              m.name,
      role:              m.role,
      trophies:          m.trophies,
      arena:             m.arena ? { name: m.arena } : null,
      clanRank:          m.clan_rank,
      donations:         m.donations,
      donationsReceived: m.donations_received,
      lastSeen:          m.last_seen,
      decksUsed:         warByTag[m.tag]?.decks_used      ?? 0,
      decksUsedToday:    warByTag[m.tag]?.decks_used_today ?? 0,
      fame:              warByTag[m.tag]?.fame             ?? 0,
      boatAttacks:       warByTag[m.tag]?.boat_attacks     ?? 0,
    }));

    // Cache 5 min en Vercel edge; stale-while-revalidate acotado a 30s para evitar servir datos muy viejos
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=30');
    res.status(200).json({ snapshot_date, members_snapshot_ts, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
