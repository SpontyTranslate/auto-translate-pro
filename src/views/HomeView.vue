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
      <button @click="processVideo" :disabled="!isValidUrl || loading">
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
        <select id="language" v-model="targetLanguage" @change="languageChanged">
          <option value="en">Inglese</option>
          <option value="es">Spagnolo</option>
          <option value="it">Italiano</option>
          <option value="fr">Francese</option>
          <option value="de">Tedesco</option>
        </select>
      </div>
      
      <!-- Area sottotitoli -->
      <div class="subtitles-container">
        <h3>Sottotitoli {{ originalSubtitles.length ? '- ' + languages[targetLanguage] : '' }}</h3>
        
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
          <!-- Mostriamo i sottotitoli originali e tradotti -->
          <div v-for="(subtitle, index) in translatedSubtitles" :key="index" class="subtitle-item">
            <div class="subtitle-time">{{ formatTime(subtitle.start) }} - {{ formatTime(subtitle.end) }}</div>
            <div class="subtitle-original">{{ originalSubtitles[index]?.text }}</div>
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
    
    <!-- Libreria dei video salvati -->
    <div v-if="Object.keys(savedVideos).length > 0" class="saved-videos">
      <h3>I tuoi video tradotti</h3>
      <div class="videos-grid">
        <div v-for="(video, key) in savedVideos" :key="key" class="saved-video-item">
          <div class="video-thumbnail">
            <img :src="`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`" :alt="video.title">
          </div>
          <div class="video-info">
            <h4>{{ video.title }}</h4>
            <p>Lingua: {{ languages[video.language] }}</p>
            <button @click="loadSavedVideo(video.id, video.language)">
              Visualizza
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import youtubeService from '@/services/youtubeService';
import subtitleService from '@/services/subtitleService';
import translationService from '@/services/translationService';
import localStorageService from '@/services/localStorageService';

export default {
  name: 'HomeView',
  data() {
    return {
      videoUrl: '',
      videoId: null,
      videoTitle: '',
      error: null,
      loading: false,
      subtitlesLoading: false,
      extractingSubtitles: false,
      originalSubtitles: [],
      translatedSubtitles: [],
      targetLanguage: 'en', // Default: inglese
      languages: {
        'en': 'Inglese',
        'es': 'Spagnolo',
        'it': 'Italiano',
        'fr': 'Francese',
        'de': 'Tedesco'
      },
      savedVideos: {}
    }
  },
  computed: {
    isValidUrl() {
      return !!this.videoUrl && youtubeService.getVideoIdFromUrl(this.videoUrl) !== null;
    }
  },
  methods: {
    async processVideo() {
      if (!this.isValidUrl) {
        this.error = 'Per favore inserisci un URL YouTube valido';
        return;
      }
      
      this.error = null;
      this.loading = true;
      
      try {
        // Estrai ID video
        const videoId = youtubeService.getVideoIdFromUrl(this.videoUrl);
        
        // Verifica se abbiamo già tradotto questo video
        if (localStorageService.isVideoTranslated(videoId, this.targetLanguage)) {
          // Carica i sottotitoli salvati
          this.loadSavedVideo(videoId, this.targetLanguage);
        } else {
          // Inizializza per nuova traduzione
          this.videoId = videoId;
          this.originalSubtitles = [];
          this.translatedSubtitles = [];
          
          // Avvia automaticamente l'estrazione dei sottotitoli
          await this.extractSubtitles();
        }
      } catch (err) {
        this.error = 'Si è verificato un errore: ' + err.message;
      } finally {
        this.loading = false;
      }
    },
    
    async extractSubtitles() {
      this.extractingSubtitles = true;
      this.subtitlesLoading = true;
      this.error = null;
      
      try {
        const subtitles = await subtitleService.getSubtitlesForVideo(this.videoId);
        
        if (!subtitles || subtitles.length === 0) {
          throw new Error('Nessun sottotitolo disponibile per questo video');
        }
        
        this.originalSubtitles = [...subtitles];
        await this.translateSubtitles();
        
        // Simula che il video è stato "pagato" (per la demo)
        // In una versione reale, questo avverrebbe dopo il pagamento
        localStorageService.simulatePayment(this.videoId);
        
        // Salva i sottotitoli tradotti
        this.saveTranslatedSubtitles();
        
        // Aggiorna la lista dei video salvati
        this.loadSavedVideos();
      } catch (err) {
        this.error = 'Errore nell\'estrazione sottotitoli: ' + err.message;
      } finally {
        this.extractingSubtitles = false;
        this.subtitlesLoading = false;
      }
    },
    
    async translateSubtitles() {
      if (!this.originalSubtitles.length) return;
      
      this.subtitlesLoading = true;
      this.error = null;
      
      try {
        const translated = await translationService.translateSubtitles(
          this.originalSubtitles, 
          this.targetLanguage
        );
        
        this.translatedSubtitles = translated;
      } catch (err) {
        this.error = 'Errore nella traduzione: ' + err.message;
      } finally {
        this.subtitlesLoading = false;
      }
    },
    
    async languageChanged() {
      // Verifica se abbiamo già tradotto questo video in questa lingua
      if (this.videoId && localStorageService.isVideoTranslated(this.videoId, this.targetLanguage)) {
        // Carica i sottotitoli salvati
        this.loadSavedVideo(this.videoId, this.targetLanguage);
      } else if (this.originalSubtitles.length > 0) {
        // Traduci i sottotitoli nella nuova lingua
        await this.translateSubtitles();
        
        // Salva i nuovi sottotitoli tradotti
        this.saveTranslatedSubtitles();
      }
    },
    
    formatTime(seconds) {
      const date = new Date(0);
      date.setSeconds(seconds);
      return date.toISOString().substr(11, 8);
    },
    
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
    },
    
    saveTranslatedSubtitles() {
      if (!this.videoId || !this.translatedSubtitles.length) return;
      
      // Ottieni il titolo del video (usiamo un mock per ora)
      const videoTitle = this.videoTitle || `Video ${this.videoId}`;
      
      // Salva i sottotitoli tradotti
      localStorageService.saveTranslatedVideo(
        this.videoId,
        videoTitle,
        this.targetLanguage,
        this.translatedSubtitles
      );
    },
    
    loadSavedVideos() {
      this.savedVideos = localStorageService.getSavedVideos();
    },
    
    loadSavedVideo(videoId, language) {
      try {
        // Imposta l'ID video
        this.videoId = videoId;
        
        // Imposta la lingua
        this.targetLanguage = language;
        
        // Carica i sottotitoli originali e tradotti
        const savedSubtitles = localStorageService.getTranslatedSubtitles(videoId, language);
        
        if (savedSubtitles) {
          // Assumiamo che i sottotitoli originali siano gli stessi
          // In una versione reale, avresti i sottotitoli originali salvati separatamente
          this.originalSubtitles = savedSubtitles.map(subtitle => ({
            ...subtitle,
            text: subtitle.text // Per ora, usiamo lo stesso testo (per semplicità)
          }));
          
          this.translatedSubtitles = savedSubtitles;
        }
      } catch (error) {
        console.error('Errore nel caricamento del video salvato:', error);
        this.error = 'Impossibile caricare il video salvato';
      }
    }
  },
  mounted() {
    // Carica i video salvati all'avvio
    this.loadSavedVideos();
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

/* Stili per i video salvati */
.saved-videos {
  margin-top: 40px;
  border-top: 1px solid #ddd;
  padding-top: 20px;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.saved-video-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.video-thumbnail img {
  width: 100%;
  height: auto;
  display: block;
}

.video-info {
  padding: 10px;
}

.video-info h4 {
  margin: 0 0 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-info p {
  margin: 0 0 10px;
  font-size: 0.9em;
  color: #666;
}

.video-info button {
  width: 100%;
  border-radius: 4px;
}

.cta-container {
  text-align: center;
  padding: 20px;
}
</style>
