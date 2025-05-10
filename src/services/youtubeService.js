/**
 * Servizio per interazione con YouTube API
 */

export default {
  /**
   * Estrae l'ID video da un URL di YouTube
   * @param {string} url - URL del video YouTube
   * @returns {string|null} - ID del video o null se non trovato
   */
  getVideoIdFromUrl(url) {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  },
  
  /**
   * Recupera le informazioni di un video da YouTube API
   * Nota: per ora è una versione di esempio, da implementare con API key
   * @param {string} videoId - ID del video YouTube
   * @returns {Promise<Object>} - Informazioni sul video
   */
  async getVideoInfo(videoId) {
    try {
      // In una versione completa, qui si userebbe l'API YouTube con una chiave API
      // Per ora, simuliamo una risposta
      return {
        title: `Video ${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        channelTitle: "Canale YouTube"
      };
    } catch (error) {
      console.error('Errore nel recupero info video:', error);
      throw error;
    }
  }
};
