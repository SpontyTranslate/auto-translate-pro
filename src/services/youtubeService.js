// Per ora utilizziamo un'API key fissa
// In produzione, sarà meglio gestirla lato server
const API_KEY = 'TUA_YOUTUBE_API_KEY'; // Lascia vuota per ora se non l'hai ancora

export default {
  /**
   * Estrae l'ID video da un URL di YouTube
   */
  getVideoIdFromUrl(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  },
  
  /**
   * Recupera le informazioni di un video da YouTube API
   */
  async getVideoInfo(videoId) {
    if (!API_KEY) {
      console.warn('YouTube API Key non configurata');
      // Restituisci dati di esempio per ora
      return {
        title: 'Video di esempio',
        thumbnail: 'https://via.placeholder.com/480x360',
        channelTitle: 'Canale di esempio'
      };
    }
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`
      );
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const videoInfo = data.items[0].snippet;
        return {
          title: videoInfo.title,
          thumbnail: videoInfo.thumbnails.medium.url,
          channelTitle: videoInfo.channelTitle
        };
      }
      return null;
    } catch (error) {
      console.error('Errore nel recupero info video:', error);
      throw error;
    }
  }
}