import {
  addItem,
  addTokens,
  getActivePetBuffValue,
  getEquippedPets,
  getUser,
  setPetBuff,
  updatePet
} from '../database/index.js';
import { getPetAbilityConfig, getAbilityChance, getAbilityRewardRange, getAbilityValue } from '../data/pet-abilities.js';
import { getPetDefinition } from '../data/pets.js';

const RARITY_ORDER = Object.freeze({
  Comum: 1,
  Raro: 2,
  Épico: 3,
  Lendário: 4,
  Secreto: 5
});

function randomBetween(min, max, random = Math.random()) {
  const low = Math.min(Number(min), Number(max));
  const high = Math.max(Number(min), Number(max));
  return Math.floor(low + random * (high - low + 1));
}

function normalizeLevel(value) {
  return Math.max(1, Math.min(100, Math.trunc(Number(value) || 1)));
}

function xpNeededForNextLevel(level) {
  const current = normalizeLevel(level);
  return 100 + (current - 1) * 75;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('pt-BR');
}

export function isPetAbilityReady(pet, now = Date.now()) {
  const config = getPetAbilityConfig(pet?.species);
  if (!config || !config.cooldownMs) return true;
  const last = Number(pet.last_ability_at || 0);
  return now - last >= Number(config.cooldownMs);
}

export function getPetAbilityCooldownRemaining(pet, now = Date.now()) {
  const config = getPetAbilityConfig(pet?.species);
  if (!config?.cooldownMs) return 0;
  const remaining = Number(config.cooldownMs) - (now - Number(pet.last_ability_at || 0));
  return Math.max(0, remaining);
}

export function markPetAbilityUsed(pet, now = Date.now()) {
  return updatePet(pet.id, { last_ability_at: now });
}

export function addPetExperience(pet, amount = 0) {
  const gain = Math.max(0, Math.trunc(Number(amount) || 0));
  let level = normalizeLevel(pet.level);
  let xp = Math.max(0, Math.trunc(Number(pet.xp) || 0)) + gain;
  let levelsGained = 0;

  while (level < 100 && xp >= xpNeededForNextLevel(level)) {
    xp -= xpNeededForNextLevel(level);
    level += 1;
    levelsGained += 1;
  }

  const updated = updatePet(pet.id, { level, xp });
  return { pet: updated, level, xp, levelsGained, gained: gain };
}

export function getPetLevelProgress(pet) {
  const level = normalizeLevel(pet?.level);
  const xp = Math.max(0, Math.trunc(Number(pet?.xp) || 0));
  if (level >= 100) return { level, xp, needed: 0, percent: 100 };
  const needed = xpNeededForNextLevel(level);
  return { level, xp, needed, percent: Math.min(100, Math.floor((xp / needed) * 100)) };
}

export function getPetPassiveModifiers(pets = []) {
  const modifiers = {
    activityBonus: 0,
    needsConsumptionReduction: 0,
    lossReduction: 0,
    quizBonus: 0,
    cooldownReduction: 0,
    happinessRegen: 0,
    happinessDecayReduction: 0,
    riskBonus: 0,
    riskLossReduction: 0
  };

  for (const pet of pets) {
    const config = getPetAbilityConfig(pet?.species);
    if (!config || config.trigger !== 'passive') continue;
    const value = getAbilityValue(config, normalizeLevel(pet.level));
    switch (config.effect) {
      case 'activity_bonus':
        modifiers.activityBonus += value;
        break;
      case 'needs_consumption_reduction':
        modifiers.needsConsumptionReduction += value;
        break;
      case 'loss_reduction':
        modifiers.lossReduction += value;
        break;
      case 'quiz_bonus':
        modifiers.quizBonus += value;
        break;
      case 'cooldown_reduction':
        modifiers.cooldownReduction += value;
        break;
      case 'happiness_regen':
        modifiers.happinessRegen += value;
        modifiers.happinessDecayReduction += Math.max(0, Number(config.decayReduction || 0) + Number(config.levelDecayReduction || 0) * Math.max(0, normalizeLevel(pet.level) - 1));
        break;
      case 'risk_bonus':
        modifiers.riskBonus += value;
        modifiers.riskLossReduction += Math.max(0, Number(config.lossReduction || 0) + Number(config.levelLossReduction || 0) * Math.max(0, normalizeLevel(pet.level) - 1));
        break;
    }
  }

  return modifiers;
}

export function getPetLossReduction(ownerJid, activity = 'generic') {
  const equipped = getEquippedPets(ownerJid);
  const modifiers = getPetPassiveModifiers(equipped);
  if (activity === 'risk') return Math.min(0.75, Math.max(0, modifiers.lossReduction + modifiers.riskLossReduction));
  return Math.min(0.75, Math.max(0, modifiers.lossReduction));
}

export function getPetCooldownReduction(ownerJid) {
  const equipped = getEquippedPets(ownerJid);
  return Math.min(0.50, Math.max(0, getPetPassiveModifiers(equipped).cooldownReduction));
}

export function applyPetReward(ownerJid, baseAmount, activity = 'generic', random = Math.random()) {
  const base = Math.max(0, Math.trunc(Number(baseAmount) || 0));
  if (!base) return { amount: 0, base, bonuses: [], pets: [] };

  const equipped = getEquippedPets(ownerJid);
  const bonuses = [];
  let amount = base;

  const passives = getPetPassiveModifiers(equipped);
  if (passives.activityBonus > 0) {
    const gain = Math.floor(amount * passives.activityBonus);
    amount += gain;
    bonuses.push({ type: 'activity_bonus', amount: gain });
  }

  if (activity === 'quiz' && passives.quizBonus > 0) {
    const gain = Math.floor(amount * passives.quizBonus);
    amount += gain;
    bonuses.push({ type: 'quiz_bonus', amount: gain });
  }

  const activeBuff = getActivePetBuffValue(ownerJid, 'moon_blessing');
  if (activeBuff > 0) {
    const gain = Math.floor(amount * activeBuff);
    amount += gain;
    bonuses.push({ type: 'moon_blessing', amount: gain });
  }

  for (const pet of equipped) {
    const config = getPetAbilityConfig(pet.species);
    if (!config) continue;
    const level = normalizeLevel(pet.level);

    if (config.effect === 'reward_multiplier' || config.effect === 'reward_upgrade' || config.effect === 'celestial_blessing' || config.effect === 'astral_destiny') {
      if (random >= getAbilityChance(config, level)) continue;
      const multiplier = getAbilityValue(config, level);
      const gain = Math.max(0, Math.floor(amount * (multiplier - 1)));
      amount += gain;
      bonuses.push({ type: config.effect, amount: gain, multiplier });
    } else if (config.effect === 'reward_echo' || config.effect === 'illusion') {
      if (random >= getAbilityChance(config, level)) continue;
      const extra = Math.max(1, Math.floor(base * getAbilityValue(config, level)));
      amount += extra;
      bonuses.push({ type: config.effect, amount: extra });
    } else if (config.effect === 'bonus_reward_chance') {
      if (random >= getAbilityChance(config, level)) continue;
      const multiplier = getAbilityValue(config, level);
      const gain = Math.max(0, Math.floor(amount * (multiplier - 1)));
      amount += gain;
      bonuses.push({ type: config.effect, amount: gain, multiplier });
    }
  }

  const returnValue = Math.max(base, amount);
  return { amount: returnValue, base, bonuses, pets: equipped.map(p => p.id) };
}

export async function tryAutomaticPetAbility(pet, { targetJids = [], random = Math.random() } = {}) {
  const config = getPetAbilityConfig(pet?.species);
  if (!config || (config.trigger !== 'automatic' && config.trigger !== 'conditional')) {
    return { activated: false, reason: 'not_automatic' };
  }
  if (!isPetAbilityReady(pet)) return { activated: false, reason: 'cooldown' };

  const level = normalizeLevel(pet.level);
  if (config.trigger === 'conditional') {
    const threshold = Number(config.threshold || 0);
    const low = [pet.health, pet.hunger, pet.thirst, pet.happiness].some(value => Number(value) <= threshold);
    if (!low) return { activated: false, reason: 'condition_not_met' };
  }

  if (random >= getAbilityChance(config, level)) return { activated: false, reason: 'chance_failed' };

  if (config.effect === 'pet_steal') {
    const candidates = targetJids.filter(jid => String(jid) && String(jid) !== String(pet.owner_jid));
    if (!candidates.length) return { activated: false, reason: 'no_target' };
    const targetJid = candidates[Math.floor(random * candidates.length) % candidates.length];
    const target = getUser(targetJid);
    if (!target || Number(target.tokens || 0) <= 0) return { activated: false, reason: 'target_empty' };

    const minPercent = Math.max(0, Number(config.minPercent || 0));
    const maxPercent = Math.max(minPercent, Number(config.maxPercent || minPercent));
    const levelBonus = Number(config.levelPercent || 0) * Math.max(0, level - 1);
    const percent = Math.min(0.25, minPercent + random * (maxPercent - minPercent) + levelBonus);
    const amount = Math.max(1, Math.min(Number(target.tokens || 0), Math.floor(Number(target.tokens || 0) * percent)));
    addTokens(targetJid, -amount);
    addTokens(pet.owner_jid, amount);
    markPetAbilityUsed(pet);
    const xp = addPetExperience(pet, 20);
    return { activated: true, effect: config.effect, amount, targetJid, xp, description: 'Pet realizou um furto automático.' };
  }

  if (config.effect === 'item_finder') {
    const items = Array.isArray(config.items) ? config.items : [];
    if (!items.length) return { activated: false, reason: 'no_items' };
    const itemId = items[Math.floor(random * items.length) % items.length];
    addItem(pet.owner_jid, itemId, Number(config.quantity || 1));
    markPetAbilityUsed(pet);
    const xp = addPetExperience(pet, 12);
    return { activated: true, effect: config.effect, itemId, quantity: Number(config.quantity || 1), xp };
  }

  if (config.effect === 'rebirth') {
    const restore = Math.max(1, Number(config.restore || 1) + Number(config.levelRestore || 0) * Math.max(0, level - 1));
    const health = Math.min(100, Number(pet.health || 0) + restore);
    const hunger = Math.min(100, Number(pet.hunger || 0) + restore);
    const thirst = Math.min(100, Number(pet.thirst || 0) + restore);
    const happiness = Math.min(100, Number(pet.happiness || 0) + restore);
    updatePet(pet.id, { health, hunger, thirst, happiness, status: 'vivo', last_ability_at: Date.now() });
    const reward = Math.max(0, Math.floor(Number(config.reward || 0) * (1 + Number(config.levelReward || 0) * Math.max(0, level - 1))));
    if (reward) addTokens(pet.owner_jid, reward);
    const xp = addPetExperience(pet, 25);
    return { activated: true, effect: config.effect, restore, reward, xp };
  }

  if (config.effect === 'moon_blessing') {
    const value = getAbilityValue(config, level);
    const duration = Math.max(15 * 60 * 1000, Number(config.durationMs || 0) + Number(config.levelDuration || 0) * Math.max(0, level - 1));
    const expiresAt = Date.now() + duration;
    setPetBuff(pet.owner_jid, pet.id, 'moon_blessing', value, expiresAt);
    markPetAbilityUsed(pet);
    const xp = addPetExperience(pet, 25);
    return { activated: true, effect: config.effect, value, durationMs: duration, expiresAt, xp };
  }

  const range = getAbilityRewardRange(config, level);
  const reward = randomBetween(range.min, range.max, random);
  if (reward > 0) addTokens(pet.owner_jid, reward);
  markPetAbilityUsed(pet);
  const xp = addPetExperience(pet, 18);
  return { activated: true, effect: config.effect, amount: reward, xp, formattedAmount: formatNumber(reward) };
}

export function tryPetProtection(ownerJid, { random = Math.random() } = {}) {
  const equipped = getEquippedPets(ownerJid)
    .filter(pet => ['block_steal', 'absolute_block'].includes(getPetAbilityConfig(pet.species)?.effect))
    .sort((a, b) => (RARITY_ORDER[getPetDefinition(b.species)?.rarity] || 0) - (RARITY_ORDER[getPetDefinition(a.species)?.rarity] || 0));

  for (const pet of equipped) {
    const config = getPetAbilityConfig(pet.species);
    if (!isPetAbilityReady(pet)) continue;
    const chance = getAbilityChance(config, normalizeLevel(pet.level));
    if (random >= chance) continue;
    markPetAbilityUsed(pet);
    const xp = addPetExperience(pet, config.effect === 'absolute_block' ? 30 : 20);
    return {
      blocked: true,
      pet,
      effect: config.effect,
      xp
    };
  }

  return { blocked: false };
}
