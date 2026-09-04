const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export async function searchYouTubeTrack(query) {
  const apiKey = clean(process.env.YOUTUBE_API_KEY);
  if (!apiKey) return null;

  const params = new URLSearchParams({
    key: apiKey,
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: '5',
    videoCategoryId: '10'
  });

  const response = await fetch(`${YOUTUBE_BASE_URL}?${params}`);
  const data = await response.json().catch(() => ({}));

  if (response.status === 403 && data?.error?.errors?.some(error => error?.reason === 'quotaExceeded')) {
    const error = new Error('YOUTUBE_QUOTA_EXCEEDED');
    error.code = 'YOUTUBE_QUOTA_EXCEEDED';
    throw error;
  }

  if (!response.ok || !Array.isArray(data.items)) return null;
  const item = data.items[0];
  if (!item?.snippet) return null;

  return {
    title: clean(item.snippet.title),
    artist: clean(item.snippet.channelTitle),
    videoId: clean(item.id?.videoId),
    source: 'YouTube'
  };
}
