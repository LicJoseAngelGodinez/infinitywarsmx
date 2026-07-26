// Endpoint público mínimo: solo expone la frase configurada en member_notes
// para un tag (nunca note/pto/img_url, que son contenido admin-only del
// panel CRM). Usa la key secreta porque member_notes no tiene GRANT de
// SELECT para anon (ver supabase/admin_users_panel.sql) -- a propósito,
// para no exponer el resto del panel.
const SUPABASE = process.env.SUPABASE_URL;
const SUPA_SECRET = process.env.SUPABASE_SECRET_KEY;

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { tag } = req.query;
  if (!tag) return res.status(400).json({ error: 'Falta el parámetro tag' });

  try {
    const notesRes = await fetch(
      `${SUPABASE}/rest/v1/member_notes?select=phrase&tag=eq.${encodeURIComponent(tag)}`,
      { headers: { apikey: SUPA_SECRET, Authorization: `Bearer ${SUPA_SECRET}` } },
    );
    const rows = await notesRes.json();

    if (!notesRes.ok) {
      throw new Error(`Supabase member_notes → ${notesRes.status}: ${JSON.stringify(rows)}`);
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    res.status(200).json({ phrase: rows[0]?.phrase ?? null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
