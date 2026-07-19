// Endpoint público minimo: solo expone qué tags ya se registraron a la
// comunidad de WhatsApp, para que el selector del formulario público los
// excluya. Usa la key secreta (bypasea RLS) porque whatsapp_registrations
// no tiene ningun GRANT de SELECT para anon -- a proposito, para que
// nadie pueda leer telefonos/nombres desde el cliente. Esta funcion nunca
// debe devolver mas que la lista de tags.
const SUPABASE = process.env.SUPABASE_URL;
const SUPA_SECRET = process.env.SUPABASE_SECRET_KEY;

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const tagsRes = await fetch(`${SUPABASE}/rest/v1/whatsapp_registrations?select=tag`, {
      headers: { apikey: SUPA_SECRET, Authorization: `Bearer ${SUPA_SECRET}` },
    });
    const rows = await tagsRes.json();

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    res.status(200).json({ tags: rows.map(r => r.tag) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
