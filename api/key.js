module.exports = (req, res) => {
  const apiKey = process.env.CLASH_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: 'CLASH_API_KEY no está configurada en Vercel.' });
    return;
  }

  res.status(200).json({ apiKey });
};
