// api/get-subtitles.js - Funzione serverless per Vercel
const fetch = require('node-fetch');

// Funzione principale che gestisce la richiesta
module.exports = async (req, res) => {
  // Imposta header CORS per permettere chiamate cross-origin
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Gestisci le richieste preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Verifica che sia presente l'ID del video
  const { videoId } = req.query;
  if (!videoId) {
    return res.status(400).json({ 
      error: 'Parametro videoId mancante',
      success: false
    });
  }

  try {
    // Utilizziamo un'API pubblica per ottenere i sottotitoli
    const response = await fetch(`https://yt-subtitle-api.herokuapp.com/subtitles/${videoId}`);
    
    if (!response.ok) {
      throw new Error(`Errore API: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Verifica che ci siano sottotitoli
    if (!data || !data.subtitles || data.subtitles.length === 0) {
      throw new Error('Nessun sottotitolo disponibile per questo video');
    }
    
    // Formatta i sottotitoli nel formato che ci serve
    const subtitles = data.subtitles.map(item => ({
      start: parseFloat(item.start),
      end: parseFloat(item.end),
      text: item.text
    }));
    
    // Ritorna i sottotitoli
    return res.status(200).json({
      success: true,
      subtitles,
      language: data.language || 'auto'
    });
  } catch (error) {
    console.error(`Errore nell'estrazione sottotitoli per ${videoId}:`, error);
    
    // In caso di errore, restituiamo sottotitoli di esempio
    const exampleSubtitles = [
      { start: 0, end: 5, text: "Questi sono sottotitoli di esempio." },
      { start: 6, end: 10, text: "Non è stato possibile estrarre i sottotitoli reali." },
      { start: 11, end: 15, text: `Video ID: ${videoId}` },
      { start: 16, end: 20, text: "Prova con un altro video YouTube." }
    ];
    
    return res.status(200).json({
      success: true,
      subtitles: exampleSubtitles,
      language: 'it',
      isExample: true
    });
  }
};
