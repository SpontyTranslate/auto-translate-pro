// api/subtitles.js - Funzione serverless per estrarre sottotitoli da YouTube
// Da deployare su Vercel

// Nota: Questo file dovrebbe essere posizionato nella cartella 'api' nella root del progetto

// Per test locali, dobbiamo installare queste dipendenze:
// npm install youtube-transcript cors

const YoutubeTranscript = require('youtube-transcript');
const cors = require('cors');

// Funzione helper per gestire CORS
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// Configurazione CORS
const corsHandler = cors({
  methods: ['GET', 'HEAD', 'OPTIONS'],
  origin: '*',
});

module.exports = async (req, res) => {
  // Gestisci CORS
  await runMiddleware(req, res, corsHandler);

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

  try {
    // Ottieni i sottotitoli
    const transcriptItems = await YoutubeTranscript.default.fetchTranscript(videoId);

    // Formatta i sottotitoli in un formato più usabile
    const subtitles = transcriptItems.map(item => ({
      start: item.offset / 1000, // Converti da ms a secondi
      end: (item.offset + item.duration) / 1000,
      text: item.text
    }));

    // Ritorna i sottotitoli
    res.status(200).json({
      success: true,
      subtitles
    });
  } catch (error) {
    console.error(`Errore nell'estrazione sottotitoli per ${videoId}:`, error);

    // Se non sono disponibili sottotitoli, restituisci un errore specifico
    if (error.message && error.message.includes('Could not find any transcripts')) {
      return res.status(404).json({
        success: false,
        error: 'Nessun sottotitolo disponibile per questo video',
        details: error.message
      });
    }

    // Per qualsiasi altro errore
    res.status(500).json({
      success: false,
      error: 'Errore durante l\'estrazione dei sottotitoli',
      details: error.message || 'Unknown error'
    });
  }
};
