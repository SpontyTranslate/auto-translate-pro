<template>
  <div class="home">
    <h1>AutoTranslate Pro</h1>
    <p>Traduci i sottotitoli dei tuoi video YouTube preferiti per €1 per video</p>
    
    <VideoInput />
  </div>
</template>

<script>
import VideoInput from '@/components/VideoInput.vue'

export default {
  name: 'HomeView',
  components: {
    VideoInput
  }
}
</script>

<style scoped>
.home {
  text-align: center;
  padding: 20px;
}

h1 {
  margin-bottom: 10px;
}

p {
  color: #666;
  margin-bottom: 30px;
}
</style>