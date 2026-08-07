const MENU_CATEGORIES = {
  // Menu principal e aliases
  menu: 'waifu',
  help: 'waifu',
  ajuda: 'waifu',
  m: 'waifu',

  // Economia / vida / pets
  menueconomia: 'money',
  menuvida: 'work',
  menupets: 'animal',
  menuquiz: 'megumin',

  // Social / diversão / Battle Mode
  menusocial: 'smile',
  menubm: 'kick',
  menudiversao: 'dance',
  menuranking: 'happy',
  menueventos: 'smile',

  // Relacionamentos / RP
  menurelacionamento: 'hug',
  menurpg: 'waifu',

  // Criativo / mídia
  menucriativo: 'happy',
  menufig: 'happy',
  menuimagem: 'happy',
  menuvideo: 'dance',
  menuaudio: 'dance',
  menumusica: 'dance',
  menudown: 'wave',

  // IA / ferramentas
  menuia: 'shinobu',
  menutools: 'nerd',
  menuferramentas: 'nerd',

  // VIP / administração
  menuvip: 'waifu',
  menugrupo: 'smile',
  menuadm: 'smug',
  menudono: 'smug',
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
