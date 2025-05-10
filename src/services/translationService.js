/**
 * Servizio di traduzione con LibreTranslate
 */

// Endpoint LibreTranslate API (versione gratuita)
// Abbiamo alcune opzioni:
// - https://libretranslate.de/translate (versione gestita in germania, può avere limiti di utilizzo)
// - https://translate.argosopentech.com/translate (altra istanza pubblica)
const LIBRE_TRANSLATE_API = 'https://translate.argosopentech.com/translate';

export default {
  /**
   * Traduce un testo in un'altra lingua
   * @param {string} text - Testo da tradurre
   * @param {string} targetLang - Codice lingua di destinazione
   * @param {string} sourceLang - Codice lingua di origine (auto per rilevamento automatico)
   * @returns {Promise<string>} - Testo tradotto
   */
  async translateText(text, targetLang, sourceLang = 'auto') {
    // Se la lingua target è uguale a quella source, o non abbiamo testo, non tradurre
    if (targetLang === sourceLang || !text || text.trim() === '') {
      return text;
    }
    
    try {
      // Chiamata reale a LibreTranslate API
      const response = await fetch(LIBRE_TRANSLATE_API, {
        method: 'POST',
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: "text"
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Errore API: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Restituisci il testo tradotto o quello originale in caso di errore
      return data.translatedText || text;
    } catch (error) {
      console.error('Errore durante la traduzione:', error);
      
      // In caso di errore, restituisci il testo originale
      return text;
    }
  },
  
  /**
   * Traduce un array di sottotitoli
   * @param {Array} subtitles - Array di oggetti sottotitolo
   * @param {string} targetLang - Codice lingua di destinazione
   * @param {string} sourceLang - Codice lingua di origine
   * @returns {Promise<Array>} - Array di sottotitoli tradotti
   */
  async translateSubtitles(subtitles, targetLang, sourceLang = 'auto') {
    // Se non ci sono sottotitoli, restituisci un array vuoto
    if (!subtitles || subtitles.length === 0) {
      return [];
    }
    
    // Crea una copia dei sottotitoli originali
    const translatedSubtitles = JSON.parse(JSON.stringify(subtitles));
    
    try {
      // Prepara tutti i testi in un array
      const texts = subtitles.map(subtitle => subtitle.text);
      
      // Traduci i sottotitoli in batch di 5 per evitare sovraccarichi
      for (let i = 0; i < translatedSubtitles.length; i++) {
        // Traduci il testo di questo sottotitolo
        const translatedText = await this.translateText(
          translatedSubtitles[i].text,
          targetLang,
          sourceLang
        );
        
        // Aggiorna il sottotitolo con il testo tradotto
        translatedSubtitles[i].text = translatedText;
        
        // Aggiungi una piccola pausa ogni 5 sottotitoli
        if (i % 5 === 4) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      return translatedSubtitles;
    } catch (error) {
      console.error('Errore nella traduzione dei sottotitoli:', error);
      
      // In caso di errore, restituisci i sottotitoli originali
      return subtitles;
    }
  }
};
