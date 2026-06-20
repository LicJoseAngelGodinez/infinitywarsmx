module.exports = (req, res) => {
  // Se llama cross-origin desde www.angel-godinez.com/gaming (rewrite que no
  // cambia el origen del navegador), así que necesita el header CORS.
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.CLASH_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: 'CLASH_API_KEY no está configurada en Vercel.' });
    return;
  }

  res.status(200).json({ apiKey });
};
