import { searchYouTubeTrack } from './providers/youtube.js';
import { searchLicensedTracks } from './providers/licensed.js';

export async function searchMusic(query) {
  const text = String(query || '').trim();
  if (!text) return { query: '', identified: null, playable: null };

  const identified = await searchYouTubeTrack(text).catch(() => null);
  const searchQuery = identified?.title
    ? [identified.title, identified.artist].filter(Boolean).join(' ')
    : text;

  const playable = await searchLicensedTracks(searchQuery, text);
  return { query: text, identified, playable };
}
