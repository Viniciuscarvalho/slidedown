// Feature 4: Image Auto-Download and Embedding
// Detecta URLs remotas em imagens e marca para download/embedding

function processRemoteImages(markdown) {
  const imagePattern = /!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g;
  
  let processed = markdown;
  let imageCount = 0;
  const remoteImages = [];
  
  processed = processed.replace(imagePattern, (match, alt, url) => {
    // Detectar se é URL remota
    if (url.startsWith('http://') || url.startsWith('https://')) {
      imageCount++;
      remoteImages.push({
        id: imageCount,
        url,
        alt
      });
      return `[IMAGE_REMOTE_${imageCount}:${alt}|${url}]`;
    }
    return match;
  });
  
  return {
    processed,
    remoteImages,
    imageCount
  };
}

module.exports = { processRemoteImages };
