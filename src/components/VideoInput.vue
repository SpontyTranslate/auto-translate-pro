<template>
  <div class="video-input">
    <h2>Traduci i sottotitoli di un video YouTube</h2>
    
    <div class="input-container">
      <input 
        type="text" 
        v-model="videoUrl" 
        placeholder="Incolla l'URL di un video YouTube"
        @keyup.enter="processVideo"
      />
      <button @click="processVideo" :disabled="!isValidUrl">
        Traduci
      </button>
    </div>
    
    <p v-if="error" class="error">{{ error }}</p>
    
    <div v-if="videoInfo" class="video-preview">
      <h3>{{ videoInfo.title }}</h3>
      <img :src="videoInfo.thumbnail" :alt="videoInfo.title" />
      <p>Canale: {{ videoInfo.channelTitle }}</p>
    </div>
  </div>
</template>

<script>
import youtubeService from '@/services/youtubeService';

export default {
  name: 'VideoInput',
  data() {
    return {
      videoUrl: '',
      videoInfo: null,
      error: null,
      loading: false
    };
  },
  computed: {
    isValidUrl() {
      return youtubeService.getVideoIdFromUrl(this.videoUrl) !== null;
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
        const videoId = youtubeService.getVideoIdFromUrl(this.videoUrl);
        const info = await youtubeService.getVideoInfo(videoId);
        
        if (info) {
          this.videoInfo = info;
          // Qui più avanti aggiungeremo il codice per passare alla pagina di elaborazione
        } else {
          this.error = 'Non è stato possibile recuperare le informazioni del video';
        }
      } catch (err) {
        this.error = 'Si è verificato un errore: ' + err.message;
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.video-input {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.input-container {
  display: flex;
  margin-bottom: 20px;
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
  margin-top: 10px;
}

.video-preview {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

img {
  max-width: 100%;
  height: auto;
  margin: 10px 0;
}
</style>