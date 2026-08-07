export const CARD_RARITIES = {
  comum: { label: 'COMUM', emoji: '⚪', weight: 55 },
  incomum: { label: 'INCOMUM', emoji: '🟢', weight: 23 },
  rara: { label: 'RARA', emoji: '🔵', weight: 12 },
  epica: { label: 'ÉPICA', emoji: '🟣', weight: 6 },
  lendaria: { label: 'LENDÁRIA', emoji: '🟠', weight: 2.7 },
  mitica: { label: 'MÍTICA', emoji: '🔴', weight: 1.1 },
  secreta: { label: 'SECRETA', emoji: '🌈', weight: 0.2 }
};

// OG é um status especial, não uma raridade e não sai em Packs normais.
export const CARDS = [
  { id: 'lz-og', name: 'LZ', rarity: null, status: 'OG', description: 'Criador e dono do Togi Bot.' },
  { id: 'lkz-og', name: 'Lkz', rarity: null, status: 'OG', description: 'Um dos OGs do universo Togi.' },
  { id: 'togi-01', name: 'Togi', rarity: 'mitica', description: 'A IA oficial do Togi Bot.' },
  { id: 'meguka-01', name: 'Meguka', rarity: 'mitica', description: 'Uma personagem misteriosa do universo Togi. :3' },
  { id: 'void-01', name: 'Void', rarity: 'mitica', description: 'Uma presença silenciosa cercada de mistérios.' },
  { id: 'nexus-01', name: 'Nexus', rarity: 'lendaria', description: 'Conecta diferentes partes do universo Togi.' },
  { id: 'nova-01', name: 'Nova', rarity: 'lendaria', description: 'Uma personagem energética que nunca fica parada.' },
  { id: 'eclipse-01', name: 'Eclipse', rarity: 'lendaria', description: 'A sombra que aparece quando tudo fica quieto.' },
  { id: 'phantom-01', name: 'Phantom', rarity: 'lendaria', description: 'Especialista em aparecer e desaparecer.' },
  { id: 'luna-01', name: 'Luna', rarity: 'epica', description: 'Uma personagem ligada às noites do universo Togi.' },
  { id: 'pixel-01', name: 'Pixel', rarity: 'epica', description: 'Ama tecnologia, jogos e pixels.' },
  { id: 'astro-01', name: 'Astro', rarity: 'epica', description: 'Explorador das áreas desconhecidas.' },
  { id: 'kiro-01', name: 'Kiro', rarity: 'epica', description: 'Sempre aparece quando começa uma aventura.' },
  { id: 'max-01', name: 'Max', rarity: 'rara', description: 'Competitivo e cheio de energia.' },
  { id: 'mimi-01', name: 'Mimi', rarity: 'rara', description: 'Pequena, esperta e impossível de ignorar.' },
  { id: 'neo-01', name: 'Neo', rarity: 'rara', description: 'Curioso sobre tudo que existe no Togi.' },
  { id: 'riko-01', name: 'Riko', rarity: 'rara', description: 'Adora desafios e partidas rápidas.' },
  { id: 'toby-01', name: 'Toby', rarity: 'incomum', description: 'Um dos moradores mais tranquilos do universo.' },
  { id: 'nox-01', name: 'Nox', rarity: 'incomum', description: 'Aparece principalmente depois da meia-noite.' },
  { id: 'kira-01', name: 'Kira', rarity: 'incomum', description: 'Sempre pronta para ajudar a equipe.' },
  { id: 'zed-01', name: 'Zed', rarity: 'incomum', description: 'Gosta de transformar tudo em competição.' },
  { id: 'botinho-01', name: 'Botinho', rarity: 'comum', description: 'O menor ajudante do Togi.' },
  { id: 'cubo-01', name: 'Cubo', rarity: 'comum', description: 'Quadrado, simples e clássico.' },
  { id: 'rookie-01', name: 'Rookie', rarity: 'comum', description: 'Ainda está começando sua jornada.' },
  { id: 'mini-togi-01', name: 'Mini Togi', rarity: 'comum', description: 'Uma versão pequenininha do Togi.' },
  { id: 'aether-01', name: 'Aether', rarity: 'secreta', description: 'Uma figura rara que quase ninguém viu.' },
  { id: 'glitch-01', name: 'Glitch', rarity: 'secreta', description: 'Uma falha que ganhou forma dentro do universo.' }
];

export function getCard(id) {
  return CARDS.find(card => card.id === id) || null;
}

export function findCard(input) {
  const value = String(input || '').trim().toLowerCase();
  if (!value) return null;
  return CARDS.find(card => card.id.toLowerCase() === value || card.name.toLowerCase() === value) || null;
}

export function getCardsByRarity(rarity) {
  return CARDS.filter(card => card.rarity === rarity && card.status !== 'OG');
}

export function drawCard(random = Math.random) {
  const total = Object.values(CARD_RARITIES).reduce((sum, rarity) => sum + rarity.weight, 0);
  let roll = random() * total;
  let selectedRarity = 'comum';
  for (const [key, rarity] of Object.entries(CARD_RARITIES)) {
    roll -= rarity.weight;
    if (roll <= 0) { selectedRarity = key; break; }
  }
  const pool = getCardsByRarity(selectedRarity);
  return pool[Math.floor(random() * pool.length)];
}
