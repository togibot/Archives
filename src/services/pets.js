import { getAllLivingPets, getEquippedPets, getPet, updatePet } from '../database/index.js';
import { getPetPassiveModifiers } from './pet-abilities.js';

const NEED_TICK_MS = 20 * 60 * 1000;
const HUNGER_DECAY = 5;
const THIRST_DECAY = 7;
const HAPPINESS_DECAY = 2;
const HEALTH_DAMAGE_WHEN_NEGLECTED = 5;

function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.trunc(Number(value) || 0)));
}

export function refreshPet(pet) {
  if (!pet || pet.status === 'morto') return pet;

  const now = Date.now();
  const last = Number(pet.last_needs_update || pet.created_at || now);
  const elapsed = Math.max(0, now - last);
  const ticks = Math.floor(elapsed / NEED_TICK_MS);
  if (ticks < 1) return pet;

  const startHunger = clamp(pet.hunger);
  const startThirst = clamp(pet.thirst);
  const startHappiness = clamp(pet.happiness);
  const passives = getPetPassiveModifiers(getEquippedPets(pet.owner_jid));
  const needReduction = Math.min(0.50, Math.max(0, passives.needsConsumptionReduction));
  const happinessDecayReduction = Math.min(0.50, Math.max(0, passives.happinessDecayReduction));

  const hunger = clamp(startHunger - HUNGER_DECAY * (1 - needReduction) * ticks);
  const thirst = clamp(startThirst - THIRST_DECAY * (1 - needReduction) * ticks);
  const happiness = clamp(startHappiness - HAPPINESS_DECAY * (1 - happinessDecayReduction) * ticks);

  // Dano de vida começa somente depois que Fome ou Sede já chegou a zero.
  const hungerZeroTick = startHunger === 0 ? 0 : Math.ceil(startHunger / HUNGER_DECAY);
  const thirstZeroTick = startThirst === 0 ? 0 : Math.ceil(startThirst / THIRST_DECAY);
  const firstNeglectedTick = Math.min(hungerZeroTick, thirstZeroTick);
  const neglectedTicks = Math.max(0, ticks - firstNeglectedTick);

  const health = clamp(Number(pet.health) - HEALTH_DAMAGE_WHEN_NEGLECTED * neglectedTicks);
  const status = health <= 0 ? 'morto' : 'vivo';

  return updatePet(pet.id, {
    hunger,
    thirst,
    happiness,
    health,
    status,
    last_needs_update: last + ticks * NEED_TICK_MS
  });
}

export function refreshAllPets() {
  return getAllLivingPets().map(refreshPet);
}

export function getFreshPet(ownerJid, petIdOrName) {
  return refreshPet(getPet(ownerJid, petIdOrName));
}

export function getWalkInfo(pet) {
  const today = todayKey();
  if (pet.walk_date !== today) return { count: 0, date: today };
  return { count: Number(pet.walk_count || 0), date: today };
}

export function registerWalk(pet) {
  const info = getWalkInfo(pet);
  const count = info.count + 1;
  return updatePet(pet.id, { walk_count: count, walk_date: info.date });
}

export function getTodayKey() {
  return todayKey();
}

export const PET_RULES = Object.freeze({
  maxWalksPerDay: 4,
  needTickMs: NEED_TICK_MS,
  hungerDecayPerTick: HUNGER_DECAY,
  thirstDecayPerTick: THIRST_DECAY,
  happinessDecayPerTick: HAPPINESS_DECAY,
  healthDamageWhenNeglectedPerTick: HEALTH_DAMAGE_WHEN_NEGLECTED,
  maxStat: 100,
  minStat: 0
});
