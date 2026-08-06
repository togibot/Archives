import { getAllLivingPets, getPet, updatePet } from '../database/index.js';

const NEED_TICK_MS = 20 * 60 * 1000;
const HUNGER_DECAY = 5;
const THIRST_DECAY = 7;
const HEALTH_DAMAGE_WHEN_NEGLECTED = 5;

function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function refreshPet(pet) {
  if (!pet || pet.status === 'morto') return pet;
  const now = Date.now();
  const last = Number(pet.last_needs_update || pet.created_at || now);
  const ticks = Math.floor(Math.max(0, now - last) / NEED_TICK_MS);
  if (ticks < 1) return pet;

  const hunger = Math.max(0, pet.hunger - (HUNGER_DECAY * ticks));
  const thirst = Math.max(0, pet.thirst - (THIRST_DECAY * ticks));
  let health = pet.health;

  const neglectedTicks = Math.max(0, ticks - Math.min(Math.floor(pet.hunger / HUNGER_DECAY), Math.floor(pet.thirst / THIRST_DECAY)));
  if (hunger === 0 || thirst === 0) health = Math.max(0, health - (HEALTH_DAMAGE_WHEN_NEGLECTED * neglectedTicks));

  const status = health <= 0 ? 'morto' : 'vivo';
  return updatePet(pet.id, {
    hunger,
    thirst,
    health,
    status,
    last_needs_update: last + (ticks * NEED_TICK_MS)
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

export const PET_RULES = {
  maxWalksPerDay: 4,
  needTickMs: NEED_TICK_MS,
  hungerDecayPerTick: HUNGER_DECAY,
  thirstDecayPerTick: THIRST_DECAY,
  healthDamageWhenNeglectedPerTick: HEALTH_DAMAGE_WHEN_NEGLECTED
};
