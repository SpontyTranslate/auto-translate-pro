/**
 * Servizio per la gestione del localStorage
 * Consente di salvare e recuperare i video tradotti localmente
 */

const VIDEOS_STORAGE_KEY = 'autotranslate_videos';
const PAYMENTS_STORAGE_KEY = 'autotranslate_payments';

export default {
  /**
   * Salva un video tradotto nel localStorage
   * @param {string} videoId - ID del video YouTube
   * @param {string} videoTitle - Titolo del video
   * @param {string} language - Lingua della traduzione
   * @param {Array} subtitles - Array di sottotitoli tradotti
   * @returns {boolean} - True se il salvataggio è riuscito
   */
  saveTranslatedVideo(videoId, videoTitle, language, subtitles) {
    try {
      // Recupera i video esistenti
      const savedVideos = this.getSavedVideos();
      
      // Crea la chiave univoca per questo video in questa lingua
      const videoKey = `${videoId}_${language}`;
      
      // Aggiungi o aggiorna il video
      savedVideos[videoKey] = {
        id: videoId,
        title: videoTitle || `Video ${videoId}`,
        language,
        subtitles,
        timestamp: new Date().toISOString()
      };
      
      // Salva nel localStorage
      localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(savedVideos));
      
      return true;
    } catch (error) {
      console.error('Errore nel salvataggio del video:', error);
      return false;
    }
  },
  
  /**
   * Recupera tutti i video salvati
   * @returns {Object} - Oggetto con tutti i video salvati
   */
  getSavedVideos() {
    try {
      const savedVideos = localStorage.getItem(VIDEOS_STORAGE_KEY);
      return savedVideos ? JSON.parse(savedVideos) : {};
    } catch (error) {
      console.error('Errore nel recupero dei video:', error);
      return {};
    }
  },
  
  /**
   * Verifica se un video è già stato tradotto in una specifica lingua
   * @param {string} videoId - ID del video YouTube
   * @param {string} language - Lingua della traduzione
   * @returns {boolean} - True se il video è già stato tradotto
   */
  isVideoTranslated(videoId, language) {
    const savedVideos = this.getSavedVideos();
    const videoKey = `${videoId}_${language}`;
    return !!savedVideos[videoKey];
  },
  
  /**
   * Recupera i sottotitoli tradotti per un video
   * @param {string} videoId - ID del video YouTube
   * @param {string} language - Lingua della traduzione
   * @returns {Array|null} - Array di sottotitoli tradotti o null se non trovato
   */
  getTranslatedSubtitles(videoId, language) {
    const savedVideos = this.getSavedVideos();
    const videoKey = `${videoId}_${language}`;
    return savedVideos[videoKey]?.subtitles || null;
  },
  
  /**
   * Registra il pagamento per un video
   * @param {string} videoId - ID del video YouTube
   * @param {string} paymentId - ID della transazione di pagamento
   * @param {number} amount - Importo pagato
   * @returns {boolean} - True se il salvataggio è riuscito
   */
  recordPayment(videoId, paymentId, amount) {
    try {
      // Recupera i pagamenti esistenti
      const payments = this.getPayments();
      
      // Aggiungi il nuovo pagamento
      payments.push({
        videoId,
        paymentId,
        amount,
        timestamp: new Date().toISOString()
      });
      
      // Salva nel localStorage
      localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
      
      return true;
    } catch (error) {
      console.error('Errore nella registrazione del pagamento:', error);
      return false;
    }
  },
  
  /**
   * Recupera tutti i pagamenti
   * @returns {Array} - Array con tutti i pagamenti
   */
  getPayments() {
    try {
      const payments = localStorage.getItem(PAYMENTS_STORAGE_KEY);
      return payments ? JSON.parse(payments) : [];
    } catch (error) {
      console.error('Errore nel recupero dei pagamenti:', error);
      return [];
    }
  },
  
  /**
   * Verifica se un video è stato pagato
   * @param {string} videoId - ID del video YouTube
   * @returns {boolean} - True se il video è stato pagato
   */
  isVideoPaid(videoId) {
    const payments = this.getPayments();
    return payments.some(payment => payment.videoId === videoId);
  },
  
  /**
   * Simula un pagamento per un video (solo per demo)
   * @param {string} videoId - ID del video YouTube
   * @returns {boolean} - True se il pagamento simulato è riuscito
   */
  simulatePayment(videoId) {
    return this.recordPayment(
      videoId, 
      'demo_' + Math.random().toString(36).substring(2, 15), 
      1
    );
  }
};
