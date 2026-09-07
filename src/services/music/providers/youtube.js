const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

async function searchYouTube(query, maxResults = 5) {
  const apiKey = clean(process.env.YOUTUBE_API_KEY);
  if (!apiKey) return [];

  const params = new URLSearchParams({
    key: apiKey,
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: String(Math.min(Math.max(Number(maxResults) || 5, 1), 10)),
    videoCategoryId: '10'
  });

  const response = await fetch(`${YOUTUBE_BASE_URL}?${params}`);
  const data = await response.json().catch(() => ({}));

  if (response.status === 403 && data?.error?.errors?.some(error => error?.reason === 'quotaExceeded')) {
    const error = new Error('YOUTUBE_QUOTA_EXCEEDED');
    error.code = 'YOUTUBE_QUOTA_EXCEEDED';
    throw error;
  }

  if (!response.ok || !Array.isArray(data.items)) return [];

  return data.items
    .map(item => ({
      title: clean(item?.snippet?.title),
      artist: clean(item?.snippet?.channelTitle),
      videoId: clean(item?.id?.videoId),
      source: 'YouTube'
    }))
    .filter(item => item.title && item.videoId);
}

export async function searchYouTubeTracks(query, maxResults = 5) {
  return searchYouTube(query, maxResults);
}

export async function searchYouTubeTrack(query) {
  const results = await searchYouTube(query, 1);
  return results[0] || null;
}
