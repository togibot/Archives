import { searchYouTubeTrack } from './providers/youtube.js';
import { searchLicensedTracks } from './providers/licensed.js';

export async function searchMusic(query) {
  const text = String(query || '').trim();
  if (!text) return { query: '', identified: null, playable: null };

  const identified = await searchYouTubeTrack(text).catch(() => null);
  if (identified) {
    return {
      query: text,
      identified,
      playable: identified
    };
  }

  const playable = await searchLicensedTracks(text, text);
  return { query: text, identified: null, playable };
}
