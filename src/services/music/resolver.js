import { searchMusic } from './search.js';

export async function resolveMusic(query) {
  const result = await searchMusic(query);
  if (result.identified?.url) {
    return {
      ...result.identified,
      source: 'YouTube',
      name: result.identified.title,
      artist_name: result.identified.artist
    };
  }

  if (!result.playable) return null;
  return {
    ...result.playable,
    identifiedBy: result.identified?.source || null,
    identifiedTitle: result.identified?.title || null,
    identifiedArtist: result.identified?.artist || null
  };
}
