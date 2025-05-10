// api/subtitles.js - Versione semplificata che non richiede youtube-transcript

module.exports = async (req, res) => {
  // Imposta header CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Gestisci preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Ottieni videoId dalla query
  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ 
      error: 'Parametro videoId mancante',
      success: false
    });
  }

  // Genera sottotitoli di esempio per iniziare
  // In futuro implementeremo l'estrazione reale
  const subtitles = [
    { start: 0, end: 5, text: "Questi sono sottotitoli di esempio." },
    { start: 6, end: 10, text: "Verranno sostituiti con l'estrazione reale." },
    { start: 11, end: 15, text: `Questo è il video con ID: ${videoId}` },
    { start: 16, end: 20, text: "Grazie per aver provato AutoTranslate Pro!" }
  ];

  // Ritorna i sottotitoli di esempio
  res.status(200).json({
    success: true,
    subtitles
  });
};
