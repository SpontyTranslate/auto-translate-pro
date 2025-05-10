/**
 * Servizio per estrazione sottotitoli (versione con dati di esempio)
 */

export default {
  /**
   * Ottiene i sottotitoli per un video
   * @param {string} videoId - ID del video YouTube
   * @returns {Promise<Array>} - Array di oggetti sottotitolo
   */
  async getSubtitlesForVideo(videoId) {
    try {
      // Simula una chiamata di rete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Per ora, restituisci sottotitoli di esempio
      return [
        { start: 0, end: 5, text: "Questi sono sottotitoli di esempio." },
        { start: 6, end: 10, text: "Nella versione finale verranno estratti dal video." },
        { start: 11, end: 15, text: `Questo è il video con ID: ${videoId}` },
        { start: 16, end: 20, text: "Grazie per aver provato AutoTranslate Pro!" }
      ];
    } catch (error) {
      console.error('Errore durante l\'estrazione sottotitoli:', error);
      throw error;
    }
  }
};
