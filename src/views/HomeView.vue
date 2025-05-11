<template>
  <div class="home">
    <h2>Traduci i sottotitoli dei tuoi video YouTube</h2>
    <div class="input-container">
      <input 
        type="text" 
        v-model="videoUrl" 
        placeholder="Incolla l'URL di un video YouTube" 
        @keyup.enter="processVideo"
      />
      <button @click="processVideo" :disabled="loading">
        {{ loading ? 'Elaborazione...' : 'Traduci' }}
      </button>
    </div>
    
    <div v-if="error" class="error">{{ error }}</div>
    
    <!-- Player YouTube -->
    <div v-if="videoId" class="video-container">
      <h3>Video</h3>
      <iframe 
        :src="'https://www.youtube.com/embed/' + videoId" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
      ></iframe>
      
      <!-- Menu di selezione lingua -->
      <div class="language-selector">
        <label for="language">Lingua di traduzione:</label>
        <select id="language" v-model="targetLanguage" @change="changeLanguage">
          <option value="it">Italiano</option>
          <option value="en">Inglese</option>
          <option value="es">Spagnolo</option>
          <option value="fr">Francese</option>
          <option value="de">Tedesco</option>
        </select>
      </div>
      
      <!-- Area sottotitoli -->
      <div class="subtitles-container">
        <h3>Sottotitoli {{ subtitles.length ? '- ' + languages[targetLanguage] : '' }}</h3>
        
        <div v-if="subtitlesLoading" class="loading">
          <p>Elaborazione sottotitoli...</p>
          <div class="loading-spinner"></div>
        </div>
        
        <div v-else-if="!originalSubtitles.length" class="cta-container">
          <p>Per visualizzare i sottotitoli di questo video</p>
          <button @click="extractSubtitles" :disabled="extractingSubtitles">
            {{ extractingSubtitles ? 'Estrazione in corso...' : 'Estrai sottotitoli' }}
          </button>
        </div>
        
        <div v-else-if="translatedSubtitles.length" class="subtitles-list">
          <div v-if="isExample" class="example-note">
            <p>Nota: Questi sono sottotitoli di esempio. L'estrazione dei sottotitoli reali sarà disponibile presto.</p>
          </div>
          
          <!-- Mostriamo i sottotitoli originali e tradotti -->
          <div v-for="(subtitle, index) in translatedSubtitles" :key="index" class="subtitle-item">
            <div class="subtitle-time">{{ formatTime(subtitle.start) }} - {{ formatTime(subtitle.end) }}</div>
            <div v-if="targetLanguage !== sourceLanguage" class="subtitle-original">{{ originalSubtitles[index]?.text }}</div>
            <div class="subtitle-translated">{{ subtitle.text }}</div>
          </div>
          
          <div class="download-container">
            <button class="download-button" @click="downloadSubtitles">
              Scarica sottotitoli in formato SRT
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import subtitlesService from '@/services/subtitlesService';

export default {
  name: 'HomeView',
  data() {
    return {
      videoUrl: '',
      videoId: null,
      error: null,
      loading: false,
      subtitlesLoading: false,
      extractingSubtitles: false,
      originalSubtitles: [],
      translatedSubtitles: [],
      subtitles: [],
      targetLanguage: 'it', // Default: italiano
      sourceLanguage: 'auto', // Sarà aggiornato quando estraiamo i sottotitoli
      isExample: false, // Indica se stiamo mostrando sottotitoli di esempio
      languages: {
        'en': 'Inglese',
        'es': 'Spagnolo',
        'it': 'Italiano',
        'fr': 'Francese',
        'de': 'Tedesco',
        'auto': 'Rilevato'
      },
      // Traduzioni predefinite
      translationMap: {
        'en': {
          "Questi sono sottotitoli di esempio.": "These are example subtitles.",
          "Nella versione finale verranno estratti dal video.": "In the final version they will be extracted from the video.",
          "Grazie per aver provato AutoTranslate Pro!": "Thank you for trying AutoTranslate Pro!",
          "Questo è il video con ID:": "This is the video with ID:"
        },
        'es': {
          "Questi sono sottotitoli di esempio.": "Estos son subtítulos de ejemplo.",
          "Nella versione finale verranno estratti dal video.": "En la versión final se extraerán del video.",
          "Grazie per aver provato AutoTranslate Pro!": "¡Gracias por probar AutoTranslate Pro!",
          "Questo è il video con ID:": "Este es el video con ID:"
        },
        'fr': {
          "Questi sono sottotitoli di esempio.": "Ce sont des sous-titres d'exemple.",
          "Nella versione finale verranno estratti dal video.": "Dans la version finale, ils seront extraits de la vidéo.",
          "Grazie per aver provato AutoTranslate Pro!": "Merci d'avoir essayé AutoTranslate Pro!",
          "Questo è il video con ID:": "C'est la vidéo avec l'ID:"
        },
        'de': {
          "Questi sono sottotitoli di esempio.": "Dies sind Beispiel-Untertitel.",
          "Nella versione finale verranno estratti dal video.": "In der finalen Version werden sie aus dem Video extrahiert.",
          "Grazie per aver provato AutoTranslate Pro!": "Vielen Dank, dass Sie AutoTranslate Pro ausprobiert haben!",
          "Questo è il video con ID:": "Dies ist das Video mit der ID:"
        }
      }
    }
  },
  methods: {
    // Estrae l'ID video da un URL di YouTube
    getVideoIdFromUrl(url) {
      if (!url) return null;
      
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      
      return (match && match[2].length === 11) ? match[2] : null;
    },
    
    // Processa l'URL del video
    processVideo() {
      this.error = null;
      
      const videoId = this.getVideoIdFromUrl(this.videoUrl);
      if (!videoId) {
        this.error = 'Per favore inserisci un URL YouTube valido';
        return;
      }
      
      this.videoId = videoId;
      this.originalSubtitles = [];
      this.translatedSubtitles = [];
      this.subtitles = [];
    },
    
    // Estrae i sottotitoli dal video
    async extractSubtitles() {
      this.extractingSubtitles = true;
      this.subtitlesLoading = true;
      this.error = null;
      
      try {
        // Chiamiamo il servizio di estrazione sottotitoli
        const result = await subtitlesService.fetchSubtitles(this.videoId);
        
        // Salviamo i sottotitoli originali
        this.originalSubtitles = [...result.subtitles];
        this.sourceLanguage = result.language;
        this.isExample = result.isExample;
        
        // Traduciamo i sottotitoli se necessario
        if (this.targetLanguage !== this.sourceLanguage) {
          this.translatedSubtitles = this.translateSubtitles(result.subtitles, this.targetLanguage);
        } else {
          this.translatedSubtitles = [...result.subtitles];
        }
        
        this.subtitles = this.translatedSubtitles;
      } catch (err) {
        this.error = 'Errore nell\'estrazione sottotitoli: ' + err.message;
        this.originalSubtitles = [];
        this.translatedSubtitles = [];
      } finally {
        this.extractingSubtitles = false;
        this.subtitlesLoading = false;
      }
    },
    
    // Cambia la lingua dei sottotitoli
    changeLanguage() {
      if (this.originalSubtitles.length > 0) {
        this.subtitlesLoading = true;
        
        setTimeout(() => {
          if (this.targetLanguage === this.sourceLanguage) {
            // Se la lingua target è uguale alla lingua source, usa i sottotitoli originali
            this.translatedSubtitles = [...this.originalSubtitles];
          } else {
            // Altrimenti, traduci
            this.translatedSubtitles = this.translateSubtitles(this.originalSubtitles, this.targetLanguage);
          }
          
          this.subtitles = this.translatedSubtitles;
          this.subtitlesLoading = false;
        }, 300);
      }
    },
    
    // Traduce i sottotitoli
    translateSubtitles(subtitles, targetLang) {
      // Per ora, usiamo le traduzioni predefinite per i sottotitoli di esempio
      // In una versione futura, integreremo un servizio di traduzione reale
      if (this.isExample) {
        return this.translateExampleSubtitles(subtitles, targetLang);
      }
      
      // Per i sottotitoli reali, facciamo una copia e aggiungiamo un prefisso per simulare la traduzione
      // In una versione futura, questo sarà sostituito da un servizio di traduzione reale
      const translated = JSON.parse(JSON.stringify(subtitles));
      
      // Prefisso per simulare la traduzione
      const prefixes = {
        'en': '[EN] ',
        'es': '[ES] ',
        'fr': '[FR] ',
        'de': '[DE] ',
      };
      
      // Aggiungi il prefisso a ciascun sottotitolo
      translated.forEach(sub => {
        sub.text = prefixes[targetLang] + sub.text;
      });
      
      return translated;
    },
    
    // Traduce sottotitoli di esempio usando il dizionario predefinito
    translateExampleSubtitles(subtitles, targetLang) {
      const translated = JSON.parse(JSON.stringify(subtitles));
      
      for (let i = 0; i < translated.length; i++) {
        const originalText = translated[i].text;
        
        // Per il sottotitolo con l'ID video, gestisce un caso speciale
        if (originalText.includes("Questo è il video con ID:")) {
          const prefix = this.translationMap[targetLang]["Questo è il video con ID:"];
          translated[i].text = `${prefix} ${this.videoId}`;
        } 
        // Per gli altri sottotitoli, cerca nel dizionario di traduzione
        else if (this.translationMap[targetLang][originalText]) {
          translated[i].text = this.translationMap[targetLang][originalText];
        }
      }
      
      return translated;
    },
    
    // Formatta il tempo in formato hh:mm:ss
    formatTime(seconds) {
      const date = new Date(0);
      date.setSeconds(seconds);
      return date.toISOString().substr(11, 8);
    },
    
    // Scarica i sottotitoli in formato SRT
    downloadSubtitles() {
      if (!this.translatedSubtitles.length) return;
      
      let content = '';
      this.translatedSubtitles.forEach((subtitle, index) => {
        content += `${index + 1}\n`;
        content += `${this.formatTime(subtitle.start)} --> ${this.formatTime(subtitle.end)}\n`;
        content += `${subtitle.text}\n\n`;
      });
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sottotitoli_${this.videoId}_${this.targetLanguage}.srt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
}
</script>

<style scoped>
.home {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.input-container {
  display: flex;
  margin: 20px 0;
}

input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
}

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error {
  color: red;
  margin: 10px 0;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
}

.video-container {
  margin-top: 30px;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 4px;
}

iframe {
  width: 100%;
  height: 450px;
  margin: 15px 0;
}

.language-selector {
  margin: 15px 0;
  text-align: left;
}

.language-selector select {
  padding: 8px;
  border-radius: 4px;
  margin-left: 10px;
}

.subtitles-container {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
  text-align: left;
}

.loading {
  text-align: center;
  padding: 20px;
}

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4CAF50;
  animation: spin 1s ease-in-out infinite;
  margin: 10px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.subtitle-item {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

.subtitle-time {
  font-size: 0.8em;
  color: #666;
  margin-bottom: 5px;
}

.subtitle-original {
  margin-bottom: 5px;
  font-style: italic;
  color: #666;
}

.subtitle-translated {
  font-weight: bold;
}

.download-container {
  margin-top: 20px;
  text-align: center;
}

.download-button {
  background-color: #2196F3;
  border-radius: 4px;
}

.cta-container {
  text-align: center;
  padding: 20px;
}

.example-note {
  background-color: #fffde7;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  border-left: 3px solid #fbc02d;
}
</style>
