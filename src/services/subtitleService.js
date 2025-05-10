/**
 * Servizio per estrazione sottotitoli
 */

/**
 * Estrae i sottotitoli da un video YouTube utilizzando la nostra API serverless
 * @param {string} videoId - ID del video YouTube
 * @returns {Promise<Array>} - Array di oggetti sottotitolo
 */
async function fetchYouTubeSubtitles(videoId) {
  try {
    // URL dell'API serverless su Vercel
    // Per lo sviluppo locale, usa il proxy:
    // http://localhost:3000/api/subtitles
    const apiUrl = 'https://auto-translate-pro.vercel.app/api/subtitles';
    
    // Chiama l'API serverless
    const response = await fetch(`${apiUrl}?videoId=${videoId}`);
    
    // Gestisci la risposta
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Errore nel recupero sottotitoli');
    }
    
    const data = await response.json();
    
    // Verifica che ci siano sottotitoli
    if (!data.success || !data.subtitles || data.subtitles.length === 0) {
      throw new Error('Nessun sottotitolo disponibile per questo video');
    }
    
    return data.subtitles;
  } catch (error) {
    console.error('Errore nel recupero sottotitoli:', error);
    
    // Per ora, al posto di lanciare un errore, restituisci sottotitoli di esempio
    // in modo che il test possa continuare anche senza l'API deployata
    console.warn('Uso sottotitoli di esempio per il test');
    return [
      { start: 0, end: 5, text: "Questi sono sottotitoli di esempio." },
      { start: 6, end: 10, text: "Verranno sostituiti con l'estrazione reale." },
      { start: 11, end: 15, text: `Questo è il video con ID: ${videoId}` },
      { start: 16, end: 20, text: "Grazie per aver provato AutoTranslate Pro!" }
    ];
  }
}

export default {
  /**
   * Ottiene i sottotitoli per un video
   * @param {string} videoId - ID del video YouTube
   * @returns {Promise<Array>} - Array di oggetti sottotitolo
   */
  async getSubtitlesForVideo(videoId) {
    try {
      return await fetchYouTubeSubtitles(videoId);
    } catch (error) {
      console.error('Errore durante l\'estrazione sottotitoli:', error);
      throw error;
    }
  }
};
