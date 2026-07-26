// Endpoint público: detalle de un jugador (nivel, stats, mazo actual,
// carta favorita) desde member_details -- key pública, RLS ya restringe
// a solo SELECT. Mismo patrón que api/members.js.
const SUPABASE = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { tag } = req.query;
  if (!tag) return res.status(400).json({ error: 'Falta el parámetro tag' });

  try {
    const detailRes = await fetch(
      `${SUPABASE}/rest/v1/member_details?select=*&tag=eq.${encodeURIComponent(tag)}`,
      { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } },
    );
    const rows = await detailRes.json();

    if (!detailRes.ok) {
      throw new Error(`Supabase member_details → ${detailRes.status}: ${JSON.stringify(rows)}`);
    }

    if (!rows.length) {
      return res.status(404).json({ error: 'Sin datos para este jugador todavía' });
    }

    const d = rows[0];

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=30');
    res.status(200).json({
      tag: d.tag,
      name: d.name,
      expLevel: d.exp_level,
      trophies: d.trophies,
      bestTrophies: d.best_trophies,
      wins: d.wins,
      losses: d.losses,
      battleCount: d.battle_count,
      threeCrownWins: d.three_crown_wins,
      role: d.role,
      totalDonations: d.total_donations,
      warDayWins: d.war_day_wins,
      currentDeck: d.current_deck,
      currentDeckSupportCards: d.current_deck_support_cards,
      currentFavouriteCard: d.current_favourite_card,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
