/**
 * Servizio per l'estrazione e gestione dei sottotitoli
 */

/**
 * Estrae i sottotitoli per un video YouTube
 * @param {string} videoId - ID del video YouTube
 * @returns {Promise<Array>} - Array di oggetti sottotitolo {start, end, text}
 */
async function fetchSubtitles(videoId) {
  try {
    // URL della tua funzione API su Vercel
    // Quando è in locale, usa un URL relativo
    let apiUrl = `/api/get-subtitles?videoId=${videoId}`;
    
    // Quando è in produzione, usa l'URL completo del tuo sito Vercel
    if (process.env.NODE_ENV === 'production') {
      apiUrl = `https://auto-translate-pro.vercel.app/api/get-subtitles?videoId=${videoId}`;
    }
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Errore API: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.subtitles || data.subtitles.length === 0) {
      throw new Error('Nessun sottotitolo disponibile per questo video');
    }
    
    return {
      subtitles: data.subtitles,
      language: data.language || 'auto',
      isExample: data.isExample || false
    };
  } catch (error) {
    console.error('Errore nell\'estrazione dei sottotitoli:', error);
    
    // In caso di errore, restituisci sottotitoli di esempio
    return {
      subtitles: getExampleSubtitles(videoId),
      language: 'it',
      isExample: true
    };
  }
}

/**
 * Restituisce sottotitoli di esempio
 * @param {string} videoId - ID del video YouTube
 * @returns {Array} - Array di oggetti sottotitolo
 */
function getExampleSubtitles(videoId) {
  return [
    { start: 0, end: 5, text: "Questi sono sottotitoli di esempio." },
    { start: 6, end: 10, text: "Nella versione finale verranno estratti dal video." },
    { start: 11, end: 15, text: `Questo è il video con ID: ${videoId}` },
    { start: 16, end: 20, text: "Grazie per aver provato AutoTranslate Pro!" }
  ];
}

export default {
  fetchSubtitles,
  getExampleSubtitles
};
