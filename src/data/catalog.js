export const shopItems = {
  shield: { name: '🛡️ Escudo', price: 1200, description: 'Bloqueia uma tentativa de roubo.' },
  lucky: { name: '🍀 Amuleto da Sorte', price: 900, description: 'Item de sorte para sistemas futuros.' },
  food: { name: '🍖 Comida', price: 150, description: 'Alimenta um pet.' },
  water: { name: '💧 Água', price: 100, description: 'Mata a sede de um pet.' },
  ticket: { name: '🎟️ Ticket', price: 500, description: 'Ticket para eventos futuros.' }
};

// Pet Shop por níveis. O usuário começa no nível 1 e desbloqueia novos pets
// melhorando sua própria Pet Shop com Tokens.
export const pets = {
  cachorro: { emoji: '🐶', name: 'Cachorro', price: 2000, tier: 'Comum', shopLevel: 1 },
  gato: { emoji: '🐱', name: 'Gato', price: 2500, tier: 'Comum', shopLevel: 1 },
  coelho: { emoji: '🐰', name: 'Coelho', price: 3000, tier: 'Comum', shopLevel: 1 },
  hamster: { emoji: '🐹', name: 'Hamster', price: 3200, tier: 'Comum', shopLevel: 1 },
  papagaio: { emoji: '🦜', name: 'Papagaio', price: 3500, tier: 'Comum', shopLevel: 1 },
  tartaruga: { emoji: '🐢', name: 'Tartaruga', price: 3800, tier: 'Comum', shopLevel: 1 },
  peixe: { emoji: '🐟', name: 'Peixe', price: 1500, tier: 'Comum', shopLevel: 1 },

  raposa: { emoji: '🦊', name: 'Raposa', price: 5000, tier: 'Raro', shopLevel: 2 },
  lobo: { emoji: '🐺', name: 'Lobo', price: 6500, tier: 'Raro', shopLevel: 2 },
  coruja: { emoji: '🦉', name: 'Coruja', price: 7000, tier: 'Raro', shopLevel: 2 },
  pinguim: { emoji: '🐧', name: 'Pinguim', price: 7500, tier: 'Raro', shopLevel: 2 },
  macaco: { emoji: '🐒', name: 'Macaco', price: 8000, tier: 'Raro', shopLevel: 2 },
  cervo: { emoji: '🦌', name: 'Cervo', price: 8500, tier: 'Raro', shopLevel: 2 },
  panda: { emoji: '🐼', name: 'Panda', price: 10000, tier: 'Raro', shopLevel: 2 },

  leao: { emoji: '🦁', name: 'Leão', price: 15000, tier: 'Épico', shopLevel: 3 },
  tigre: { emoji: '🐯', name: 'Tigre', price: 16000, tier: 'Épico', shopLevel: 3 },
  urso: { emoji: '🐻', name: 'Urso', price: 17000, tier: 'Épico', shopLevel: 3 },
  tubarao: { emoji: '🦈', name: 'Tubarão', price: 18000, tier: 'Épico', shopLevel: 3 },
  gorila: { emoji: '🦍', name: 'Gorila', price: 20000, tier: 'Épico', shopLevel: 3 },

  dragao: { emoji: '🐉', name: 'Dragão', price: 30000, tier: 'Lendário', shopLevel: 4 },
  fenix: { emoji: '🔥', name: 'Fênix', price: 35000, tier: 'Lendário', shopLevel: 4 },
  kitsune: { emoji: '🦊', name: 'Kitsune', price: 40000, tier: 'Lendário', shopLevel: 4 },
  dragao_negro: { emoji: '🐲', name: 'Dragão Negro', price: 50000, tier: 'Lendário', shopLevel: 4 },
  lobo_lunar: { emoji: '🌙', name: 'Lobo Lunar', price: 45000, tier: 'Lendário', shopLevel: 4 },

  guardiao: { emoji: '🛡️', name: 'Guardião', price: 75000, tier: 'Secreto', shopLevel: 5 },
  dragao_celestial: { emoji: '✨', name: 'Dragão Celestial', price: 100000, tier: 'Secreto', shopLevel: 5 },
  raposa_astral: { emoji: '🌌', name: 'Raposa Astral', price: 90000, tier: 'Secreto', shopLevel: 5 }
};

export const petShopUpgrades = {
  2: { price: 10000, unlocks: 'Pets Raros' },
  3: { price: 25000, unlocks: 'Pets Épicos' },
  4: { price: 50000, unlocks: 'Pets Lendários' },
  5: { price: 100000, unlocks: 'Pets Secretos' }
};

export const quizQuestions = [
  { q: 'Qual é a capital do Brasil?', a: ['São Paulo', 'Brasília', 'Rio de Janeiro', 'Salvador'], correct: 2 },
  { q: 'Qual planeta é conhecido como Planeta Vermelho?', a: ['Vênus', 'Júpiter', 'Marte', 'Mercúrio'], correct: 3 },
  { q: 'Quanto é 9 × 7?', a: ['56', '63', '72', '49'], correct: 2 },
  { q: 'Qual é o maior oceano da Terra?', a: ['Atlântico', 'Índico', 'Ártico', 'Pacífico'], correct: 4 },
  { q: 'Qual linguagem é usada principalmente para estilizar páginas web?', a: ['CSS', 'SQL', 'Python', 'C++'], correct: 1 }
];
