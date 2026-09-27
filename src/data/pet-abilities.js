/**
 * Pets Alive — habilidades V2.3
 *
 * Os números abaixo são a configuração-base. O processamento automático
 * acontece no serviço de habilidades; os valores ficam centralizados aqui
 * para facilitar o balanceamento sem espalhar números pelos comandos.
 */

const HOUR = 60 * 60 * 1000;

export const PET_ABILITY_CONFIG = Object.freeze({
  cachorro: {
    trigger: 'passive',
    effect: 'activity_bonus',
    cooldownMs: 0,
    chance: 1,
    value: 0.05,
    levelValue: 0.01,
    description: 'Aumenta levemente os ganhos de atividades.'
  },
  gato: {
    trigger: 'automatic',
    effect: 'token_finder',
    cooldownMs: 6 * HOUR,
    chance: 0.20,
    levelChance: 0.01,
    minReward: 15,
    maxReward: 35,
    levelReward: 0.08,
    description: 'Encontra pequenas quantidades de TOKENS ocasionalmente.'
  },
  coelho: {
    trigger: 'reward',
    effect: 'reward_multiplier',
    cooldownMs: 0,
    chance: 0.08,
    levelChance: 0.01,
    value: 1.25,
    levelValue: 0.04,
    description: 'Pode multiplicar uma recompensa recebida.'
  },
  hamster: {
    trigger: 'passive',
    effect: 'needs_consumption_reduction',
    cooldownMs: 0,
    chance: 1,
    value: 0.05,
    levelValue: 0.01,
    description: 'Reduz o consumo de Fome e Sede.'
  },
  papagaio: {
    trigger: 'reward',
    effect: 'reward_echo',
    cooldownMs: 0,
    chance: 0.05,
    levelChance: 0.0075,
    value: 0.25,
    levelValue: 0.025,
    description: 'Pode repetir parcialmente uma recompensa.'
  },
  tartaruga: {
    trigger: 'passive',
    effect: 'loss_reduction',
    cooldownMs: 0,
    chance: 1,
    value: 0.08,
    levelValue: 0.01,
    description: 'Reduz perdas de TOKENS.'
  },

  peixe: {
    trigger: 'automatic',
    effect: 'token_finder',
    cooldownMs: 8 * HOUR,
    chance: 0.15,
    levelChance: 0.008,
    minReward: 8,
    maxReward: 22,
    levelReward: 0.07,
    description: 'Pode encontrar uma pequena recompensa em TOKENS.'
  },
  raposa: {
    trigger: 'automatic',
    effect: 'pet_steal',
    cooldownMs: 6 * HOUR,
    chance: 0.35,
    levelChance: 0.01,
    minPercent: 0.05,
    maxPercent: 0.10,
    levelPercent: 0.004,
    description: 'Tenta furtar uma pequena quantidade de TOKENS de outro jogador.'
  },
  lobo: {
    trigger: 'protection',
    effect: 'block_steal',
    cooldownMs: 12 * HOUR,
    chance: 0.20,
    levelChance: 0.025,
    description: 'Pode bloquear uma tentativa de roubo contra o dono.'
  },
  coruja: {
    trigger: 'passive',
    effect: 'quiz_bonus',
    cooldownMs: 0,
    chance: 1,
    value: 0.10,
    levelValue: 0.015,
    description: 'Aumenta recompensas de Quiz e atividades de conhecimento.'
  },
  pinguim: {
    trigger: 'passive',
    effect: 'cooldown_reduction',
    cooldownMs: 0,
    chance: 1,
    value: 0.08,
    levelValue: 0.01,
    description: 'Reduz cooldowns de algumas atividades.'
  },
  macaco: {
    trigger: 'automatic',
    effect: 'item_finder',
    cooldownMs: 12 * HOUR,
    chance: 0.20,
    levelChance: 0.01,
    items: ['food', 'water', 'lucky'],
    quantity: 1,
    levelQuantityChance: 0.03,
    description: 'Pode encontrar itens ou pequenos bônus aleatórios.'
  },
  cervo: {
    trigger: 'reward',
    effect: 'bonus_reward_chance',
    cooldownMs: 0,
    chance: 0.12,
    levelChance: 0.012,
    value: 1.20,
    levelValue: 0.03,
    description: 'Aumenta a chance de recompensas bônus.'
  },
  panda: {
    trigger: 'passive',
    effect: 'happiness_regen',
    cooldownMs: 0,
    chance: 1,
    value: 0.05,
    levelValue: 0.01,
    decayReduction: 0.25,
    levelDecayReduction: 0.02,
    description: 'Recupera Felicidade mais facilmente e reduz sua perda.'
  },

  leao: {
    trigger: 'passive',
    effect: 'activity_bonus',
    cooldownMs: 0,
    chance: 1,
    value: 0.15,
    levelValue: 0.015,
    description: 'Aumenta significativamente os ganhos de determinadas atividades.'
  },
  tigre: {
    trigger: 'automatic',
    effect: 'token_hunt',
    cooldownMs: 12 * HOUR,
    chance: 0.35,
    levelChance: 0.012,
    minReward: 80,
    maxReward: 180,
    levelReward: 0.09,
    description: 'Pode conseguir uma recompensa elevada periodicamente.'
  },
  urso: {
    trigger: 'passive',
    effect: 'risk_bonus',
    cooldownMs: 0,
    chance: 1,
    value: 0.20,
    levelValue: 0.015,
    lossReduction: 0.15,
    levelLossReduction: 0.01,
    description: 'Aumenta recompensas de risco e reduz parte das perdas.'
  },
  tubarao: {
    trigger: 'automatic',
    effect: 'special_hunt',
    cooldownMs: 18 * HOUR,
    chance: 0.18,
    levelChance: 0.012,
    minReward: 120,
    maxReward: 300,
    levelReward: 0.10,
    description: 'Pode capturar uma recompensa especial.'
  },
  gorila: {
    trigger: 'reward',
    effect: 'reward_upgrade',
    cooldownMs: 0,
    chance: 0.20,
    levelChance: 0.012,
    value: 1.50,
    levelValue: 0.05,
    description: 'Pode transformar uma recompensa comum em uma recompensa maior.'
  },

  dragao: {
    trigger: 'automatic',
    effect: 'ancient_treasure',
    cooldownMs: 18 * HOUR,
    chance: 0.30,
    levelChance: 0.015,
    minReward: 250,
    maxReward: 700,
    levelReward: 0.10,
    description: 'Encontra um Tesouro Ancestral com uma grande recompensa.'
  },
  fenix: {
    trigger: 'conditional',
    effect: 'rebirth',
    cooldownMs: 24 * HOUR,
    chance: 0.45,
    levelChance: 0.025,
    threshold: 20,
    restore: 30,
    levelRestore: 3,
    reward: 75,
    levelReward: 0.10,
    description: 'Quando os status ficam muito baixos, restaura parte deles e dá um bônus.'
  },
  kitsune: {
    trigger: 'reward',
    effect: 'illusion',
    cooldownMs: 0,
    chance: 0.25,
    levelChance: 0.015,
    value: 0.35,
    levelValue: 0.035,
    description: 'Pode ativar uma segunda recompensa parcial.'
  },
  dragao_negro: {
    trigger: 'automatic',
    effect: 'abyss_treasure',
    cooldownMs: 24 * HOUR,
    chance: 0.12,
    levelChance: 0.01,
    minReward: 500,
    maxReward: 1500,
    levelReward: 0.12,
    description: 'Possui uma chance baixa de conceder uma recompensa excepcional.'
  },
  lobo_lunar: {
    trigger: 'automatic',
    effect: 'moon_blessing',
    cooldownMs: 24 * HOUR,
    chance: 0.20,
    levelChance: 0.012,
    value: 0.30,
    durationMs: 2 * HOUR,
    levelDuration: 15 * 60 * 1000,
    description: 'Ativa um bônus de 30% nas recompensas por tempo limitado.'
  },

  guardiao: {
    trigger: 'protection',
    effect: 'absolute_block',
    cooldownMs: 18 * HOUR,
    chance: 0.70,
    levelChance: 0.025,
    description: 'Pode bloquear completamente uma tentativa de roubo.'
  },
  dragao_celestial: {
    trigger: 'reward',
    effect: 'celestial_blessing',
    cooldownMs: 0,
    chance: 0.30,
    levelChance: 0.015,
    value: 1.50,
    levelValue: 0.05,
    secondaryReward: 100,
    levelSecondaryReward: 15,
    description: 'Aumenta uma recompensa e pode adicionar um bônus secundário.'
  },
  raposa_astral: {
    trigger: 'reward',
    effect: 'astral_destiny',
    cooldownMs: 24 * HOUR,
    chance: 0.06,
    levelChance: 0.006,
    value: 3,
    levelValue: 0.10,
    description: 'Pode transformar uma recompensa normal em uma recompensa extraordinária.'
  }
});

export function getPetAbilityConfig(species) {
  return PET_ABILITY_CONFIG[String(species || '').trim().toLowerCase()] || null;
}

export function getAbilityChance(config, level = 1) {
  const base = Number(config?.chance ?? 0);
  const bonus = Number(config?.levelChance ?? 0) * Math.max(0, Number(level || 1) - 1);
  return Math.max(0, Math.min(1, base + bonus));
}

export function getAbilityValue(config, level = 1) {
  return Math.max(0, Number(config?.value ?? 0) + Number(config?.levelValue ?? 0) * Math.max(0, Number(level || 1) - 1));
}

export function getAbilityRewardRange(config, level = 1) {
  const factor = 1 + Number(config?.levelReward ?? 0) * Math.max(0, Number(level || 1) - 1);
  return {
    min: Math.max(1, Math.floor(Number(config?.minReward ?? 0) * factor)),
    max: Math.max(1, Math.floor(Number(config?.maxReward ?? 0) * factor))
  };
}
