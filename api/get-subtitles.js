// api/get-subtitles.js - Versione migliorata
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Imposta header CORS
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
    // Tenta di estrarre i sottotitoli usando un servizio pubblico
    // Nota: questo è un servizio di esempio e potrebbe non funzionare per tutti i video
    const apiUrl = `https://subtitles-for-youtube.p.rapidapi.com/subtitles/${videoId}?lang=it,en,auto`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'da649e8b6dmsh36910395c760476p1e7a0ejsnb4c0c70367a4', // Chiave demo, limitata
        'X-RapidAPI-Host': 'subtitles-for-youtube.p.rapidapi.com'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Formatta i sottotitoli nel formato richiesto
        const subtitles = data.map(item => ({
          start: parseFloat(item.start),
          end: parseFloat(item.end || item.start + 5),
          text: item.text
        }));
        
        return res.status(200).json({
          success: true,
          subtitles,
          language: 'auto',
          isExample: false
        });
      }
    }
    
    // Se non è stato possibile estrarre i sottotitoli, restituisci sottotitoli di esempio
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
    
  } catch (error) {
    console.error(`Errore nell'estrazione sottotitoli per ${videoId}:`, error);
    
    // In caso di errore, restituisci sottotitoli di esempio
    const exampleSubtitles = [
      { start: 0, end: 5, text: "Questi sono sottotitoli di esempio." },
      { start: 6, end: 10, text: "Si è verificato un errore durante l'estrazione." },
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