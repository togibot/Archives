import { searchMusic } from './search.js';

export async function resolveMusic(query) {
  const result = await searchMusic(query);
  if (!result.playable) return null;
  return {
    ...result.playable,
    identifiedBy: result.identified?.source || null,
    identifiedTitle: result.identified?.title || null,
    identifiedArtist: result.identified?.artist || null
  };
}
