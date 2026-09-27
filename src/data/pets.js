/**
 * Pets Alive — V2.3
 * Catálogo central de Pets.
 *
 * A Parte 1 mantém somente dados-base e regras estruturais.
 * Chances, cooldowns e valores monetários serão definidos nas etapas
 * de habilidades/balanceamento.
 */

export const PET_STAT_LIMIT = 100;
export const DEFAULT_PET_SLOTS = 1;
export const MAX_PET_SLOTS = 10;

export const PET_RARITY_ORDER = Object.freeze([
  'Comum',
  'Raro',
  'Épico',
  'Lendário',
  'Secreto'
]);

export const PET_STATUS = Object.freeze({
  ALIVE: 'vivo'
});

// Upgrades de slots são intencionalmente caros para controlar o poder de equipar vários Pets.
export const PET_SLOT_UPGRADES = Object.freeze({
  2: 10000,
  3: 25000,
  4: 50000,
  5: 100000,
  6: 200000,
  7: 400000,
  8: 800000,
  9: 1600000,
  10: 3200000
});

export const PETS = Object.freeze({
  cachorro: {
    emoji: '🐶',
    name: 'Cachorro',
    price: 2000,
    rarity: 'Comum',
    shopLevel: 1,
    abilityId: 'fiel_companheiro',
    abilityName: 'Fiel Companheiro',
    abilityCategory: 'economia',
    abilityDescription: 'Aumenta levemente os ganhos de atividades.'
  },
  gato: {
    emoji: '🐱',
    name: 'Gato',
    price: 2500,
    rarity: 'Comum',
    shopLevel: 1,
    abilityId: 'cacador_de_moedas',
    abilityName: 'Caçador de Moedas',
    abilityCategory: 'tokens',
    abilityDescription: 'Encontra pequenas quantidades de TOKENS ocasionalmente.'
  },
  coelho: {
    emoji: '🐰',
    name: 'Coelho',
    price: 3000,
    rarity: 'Comum',
    shopLevel: 1,
    abilityId: 'boa_sorte',
    abilityName: 'Boa Sorte',
    abilityCategory: 'recompensa',
    abilityDescription: 'Pequena chance de multiplicar uma recompensa.'
  },
  hamster: {
    emoji: '🐹',
    name: 'Hamster',
    price: 3200,
    rarity: 'Comum',
    shopLevel: 1,
    abilityId: 'energia',
    abilityName: 'Energia',
    abilityCategory: 'status',
    abilityDescription: 'Reduz o consumo de Fome e Sede.'
  },
  papagaio: {
    emoji: '🦜',
    name: 'Papagaio',
    price: 3500,
    rarity: 'Comum',
    shopLevel: 1,
    abilityId: 'eco',
    abilityName: 'Eco',
    abilityCategory: 'recompensa',
    abilityDescription: 'Pequena chance de repetir parcialmente uma recompensa.'
  },
  tartaruga: {
    emoji: '🐢',
    name: 'Tartaruga',
    price: 3800,
    rarity: 'Comum',
    shopLevel: 1,
    abilityId: 'casco',
    abilityName: 'Casco',
    abilityCategory: 'defesa',
    abilityDescription: 'Reduz perdas de TOKENS.'
  },
  peixe: {
    emoji: '🐟',
    name: 'Peixe',
    price: 1500,
    rarity: 'Comum',
    shopLevel: 1,
    abilityId: 'bolhas_de_sorte',
    abilityName: 'Bolhas de Sorte',
    abilityCategory: 'tokens',
    abilityDescription: 'Pequena chance de encontrar TOKENS.'
  },
  raposa: {
    emoji: '🦊',
    name: 'Raposa',
    price: 5000,
    rarity: 'Raro',
    shopLevel: 2,
    abilityId: 'furto',
    abilityName: 'Furto',
    abilityCategory: 'roubo',
    abilityDescription: 'Tenta roubar uma pequena quantidade de TOKENS de outro jogador.'
  },
  lobo: {
    emoji: '🐺',
    name: 'Lobo',
    price: 6500,
    rarity: 'Raro',
    shopLevel: 2,
    abilityId: 'guardiao',
    abilityName: 'Guardião',
    abilityCategory: 'defesa',
    abilityDescription: 'Pode bloquear uma tentativa de roubo contra o dono.'
  },
  coruja: {
    emoji: '🦉',
    name: 'Coruja',
    price: 7000,
    rarity: 'Raro',
    shopLevel: 2,
    abilityId: 'sabedoria',
    abilityName: 'Sabedoria',
    abilityCategory: 'quiz',
    abilityDescription: 'Melhora recompensas de Quiz e atividades de conhecimento.'
  },
  pinguim: {
    emoji: '🐧',
    name: 'Pinguim',
    price: 7500,
    rarity: 'Raro',
    shopLevel: 2,
    abilityId: 'frio_calculado',
    abilityName: 'Frio Calculado',
    abilityCategory: 'cooldown',
    abilityDescription: 'Reduz cooldowns de algumas atividades.'
  },
  macaco: {
    emoji: '🐒',
    name: 'Macaco',
    price: 8000,
    rarity: 'Raro',
    shopLevel: 2,
    abilityId: 'travessura',
    abilityName: 'Travessura',
    abilityCategory: 'itens',
    abilityDescription: 'Pode encontrar itens ou pequenos bônus aleatórios.'
  },
  cervo: {
    emoji: '🦌',
    name: 'Cervo',
    price: 8500,
    rarity: 'Raro',
    shopLevel: 2,
    abilityId: 'prosperidade',
    abilityName: 'Prosperidade',
    abilityCategory: 'recompensa',
    abilityDescription: 'Aumenta a chance de recompensas bônus.'
  },
  panda: {
    emoji: '🐼',
    name: 'Panda',
    price: 10000,
    rarity: 'Raro',
    shopLevel: 2,
    abilityId: 'tranquilidade',
    abilityName: 'Tranquilidade',
    abilityCategory: 'status',
    abilityDescription: 'Recupera Felicidade mais facilmente e reduz sua perda.'
  },
  leao: {
    emoji: '🦁',
    name: 'Leão',
    price: 15000,
    rarity: 'Épico',
    shopLevel: 3,
    abilityId: 'rei_da_selva',
    abilityName: 'Rei da Selva',
    abilityCategory: 'economia',
    abilityDescription: 'Aumenta significativamente ganhos de determinadas atividades.'
  },
  tigre: {
    emoji: '🐯',
    name: 'Tigre',
    price: 16000,
    rarity: 'Épico',
    shopLevel: 3,
    abilityId: 'cacada',
    abilityName: 'Caçada',
    abilityCategory: 'tokens',
    abilityDescription: 'Após um cooldown, pode conceder uma recompensa elevada.'
  },
  urso: {
    emoji: '🐻',
    name: 'Urso',
    price: 17000,
    rarity: 'Épico',
    shopLevel: 3,
    abilityId: 'forca_bruta',
    abilityName: 'Força Bruta',
    abilityCategory: 'risco',
    abilityDescription: 'Reduz perdas e aumenta recompensas em atividades de risco.'
  },
  tubarao: {
    emoji: '🦈',
    name: 'Tubarão',
    price: 18000,
    rarity: 'Épico',
    shopLevel: 3,
    abilityId: 'predador',
    abilityName: 'Predador',
    abilityCategory: 'especial',
    abilityDescription: 'Pode capturar uma recompensa especial de outro sistema.'
  },
  gorila: {
    emoji: '🦍',
    name: 'Gorila',
    price: 20000,
    rarity: 'Épico',
    shopLevel: 3,
    abilityId: 'impacto',
    abilityName: 'Impacto',
    abilityCategory: 'recompensa',
    abilityDescription: 'Chance de transformar uma recompensa comum em maior.'
  },
  dragao: {
    emoji: '🐉',
    name: 'Dragão',
    price: 30000,
    rarity: 'Lendário',
    shopLevel: 4,
    abilityId: 'tesouro_ancestral',
    abilityName: 'Tesouro Ancestral',
    abilityCategory: 'tokens',
    abilityDescription: 'Encontra uma grande quantidade de TOKENS periodicamente.'
  },
  fenix: {
    emoji: '🔥',
    name: 'Fênix',
    price: 35000,
    rarity: 'Lendário',
    shopLevel: 4,
    abilityId: 'renascimento',
    abilityName: 'Renascimento',
    abilityCategory: 'status',
    abilityDescription: 'Recupera status baixos e concede um bônus.'
  },
  kitsune: {
    emoji: '🦊',
    name: 'Kitsune',
    price: 40000,
    rarity: 'Lendário',
    shopLevel: 4,
    abilityId: 'ilusao',
    abilityName: 'Ilusão',
    abilityCategory: 'recompensa',
    abilityDescription: 'Pode ativar uma segunda recompensa parcial.'
  },
  dragao_negro: {
    emoji: '🐲',
    name: 'Dragão Negro',
    price: 50000,
    rarity: 'Lendário',
    shopLevel: 4,
    abilityId: 'abismo',
    abilityName: 'Abismo',
    abilityCategory: 'tokens',
    abilityDescription: 'Pequena chance de recompensa excepcional.'
  },
  lobo_lunar: {
    emoji: '🌙',
    name: 'Lobo Lunar',
    price: 45000,
    rarity: 'Lendário',
    shopLevel: 4,
    abilityId: 'lua_cheia',
    abilityName: 'Lua Cheia',
    abilityCategory: 'buff',
    abilityDescription: 'Ativa um poderoso bônus temporário em determinadas ocasiões.'
  },
  guardiao: {
    emoji: '🛡️',
    name: 'Guardião',
    price: 75000,
    rarity: 'Secreto',
    shopLevel: 5,
    abilityId: 'protecao_absoluta',
    abilityName: 'Proteção Absoluta',
    abilityCategory: 'defesa',
    abilityDescription: 'Pode bloquear completamente uma grande perda ou roubo.'
  },
  dragao_celestial: {
    emoji: '✨',
    name: 'Dragão Celestial',
    price: 100000,
    rarity: 'Secreto',
    shopLevel: 5,
    abilityId: 'bencao_celestial',
    abilityName: 'Bênção Celestial',
    abilityCategory: 'recompensa',
    abilityDescription: 'Aumenta uma recompensa e pode adicionar um bônus secundário.'
  },
  raposa_astral: {
    emoji: '🌌',
    name: 'Raposa Astral',
    price: 90000,
    rarity: 'Secreto',
    shopLevel: 5,
    abilityId: 'destino_astral',
    abilityName: 'Destino Astral',
    abilityCategory: 'especial',
    abilityDescription: 'Chance extremamente baixa de transformar uma recompensa normal em extraordinária.'
  }
});

export function getPetDefinition(species) {
  const key = String(species || '').trim().toLowerCase();
  return PETS[key] || null;
}

export function getPetsByRarity(rarity) {
  return Object.entries(PETS)
    .filter(([, pet]) => pet.rarity === rarity)
    .map(([id, pet]) => ({ id, ...pet }));
}

export function getAllPetDefinitions() {
  return Object.entries(PETS).map(([id, pet]) => ({ id, ...pet }));
}
