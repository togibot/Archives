import ytSearch from 'yt-search';

function clean(value, fallback = '') {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function mapVideo(video) {
  if (!video?.url || !video?.title) return null;
  return {
    title: clean(video.title),
    artist: clean(video.author?.name || video.author?.channelName, 'Artista desconhecido'),
    videoId: clean(video.videoId),
    duration: Number(video.seconds || 0),
    views: Number(video.views || 0),
    ago: clean(video.ago, 'Não informado'),
    description: clean(video.description, 'Sem descrição'),
    url: clean(video.url),
    thumbnail: clean(video.thumbnail),
    source: 'YouTube'
  };
}

export async function searchYouTubeTracks(query, maxResults = 5) {
  const text = String(query || '').trim();
  if (!text) return [];

  const result = await ytSearch(text);
  return (result?.videos || [])
    .slice(0, Math.min(Math.max(Number(maxResults) || 5, 1), 10))
    .map(mapVideo)
    .filter(Boolean);
}

export async function searchYouTubeTrack(query) {
  const results = await searchYouTubeTracks(query, 1);
  return results[0] || null;
}
