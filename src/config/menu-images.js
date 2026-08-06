const MENU_CATEGORIES = {
  menu: 'waifu',
  help: 'waifu',
  ajuda: 'waifu',
  m: 'waifu',
  menueconomia: 'waifu',
  menupets: 'neko',
  menuquiz: 'megumin',
  menurpg: 'waifu',
  menusocial: 'hug',
  menugrupo: 'smile',
  menuadm: 'smug',
  menufig: 'happy',
  menudiversao: 'dance',
  menuranking: 'happy',
  menueventos: 'smile',
  menumusica: 'dance',
  menuia: 'shinobu',
  menuvip: 'waifu',
  menubot: 'wave'
};

const cache = new Map();
const CACHE_MS = 5 * 60 * 1000;

export async function getMenuImageUrl(commandName) {
  const category = MENU_CATEGORIES[String(commandName || '').toLowerCase()];
  if (!category) return null;

  const cached = cache.get(category);
  if (cached && Date.now() - cached.time < CACHE_MS) return cached.url;

  try {
    const response = await fetch(`https://api.waifu.pics/sfw/${category}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data?.url) return null;

    cache.set(category, { url: data.url, time: Date.now() });
    return data.url;
  } catch {
    return null;
  }
}
