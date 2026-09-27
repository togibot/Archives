import { getAllUserJids, getEquippedPets } from '../database/index.js';
import { refreshAllPets } from './pets.js';
import { tryAutomaticPetAbility } from './pet-abilities.js';

export const PET_EVENT_INTERVAL_MS = 5 * 60 * 1000;

const EVENT_NAMES = Object.freeze({
  token_finder: 'encontrou Tokens',
  token_hunt: 'caçou uma recompensa',
  special_hunt: 'encontrou uma recompensa especial',
  ancient_treasure: 'encontrou um Tesouro Ancestral',
  abyss_treasure: 'encontrou um tesouro do Abismo',
  pet_steal: 'realizou um furto',
  item_finder: 'encontrou um item',
  rebirth: 'ativou o Renascimento',
  moon_blessing: 'ativou a bênção da Lua'
});

function unique(values) {
  return [...new Set(values.map(String).filter(Boolean))];
}

export function describePetEvent(result) {
  if (!result?.activated) return null;

  switch (result.effect) {
    case 'token_finder':
    case 'token_hunt':
    case 'special_hunt':
    case 'ancient_treasure':
    case 'abyss_treasure':
      return { type: 'tokens', amount: Number(result.amount || 0), text: EVENT_NAMES[result.effect] || 'gerou uma recompensa' };
    case 'pet_steal':
      return { type: 'pet_steal', amount: Number(result.amount || 0), targetJid: result.targetJid, text: EVENT_NAMES[result.effect] };
    case 'item_finder':
      return { type: 'item', itemId: result.itemId, quantity: Number(result.quantity || 1), text: EVENT_NAMES[result.effect] };
    case 'rebirth':
      return { type: 'rebirth', restore: Number(result.restore || 0), reward: Number(result.reward || 0), text: EVENT_NAMES[result.effect] };
    case 'moon_blessing':
      return { type: 'buff', value: Number(result.value || 0), durationMs: Number(result.durationMs || 0), text: EVENT_NAMES[result.effect] };
    default:
      return { type: result.effect || 'ability', text: result.description || 'ativou uma habilidade' };
  }
}

export async function runPetEventCycle({ onEvent, logger = console } = {}) {
  // Atualiza necessidades antes de selecionar Pets vivos/equipados.
  refreshAllPets();

  const users = getAllUserJids();
  if (!users.length) return { checked: 0, activated: 0 };

  let checked = 0;
  let activated = 0;

  const owners = unique(users);
  for (const ownerJid of owners) {
    const equipped = getEquippedPets(ownerJid);
    for (const pet of equipped) {
      const result = await tryAutomaticPetAbility(pet, { targetJids: users });
      checked += 1;
      if (!result.activated) continue;

      activated += 1;
      const event = {
        ownerJid,
        pet,
        result,
        details: describePetEvent(result),
        createdAt: Date.now()
      };

      try {
        await onEvent?.(event);
      } catch (error) {
        logger?.error?.('❌ Falha ao processar evento automático de Pet:', error);
      }
    }
  }

  return { checked, activated };
}

export function startPetEventLoop({ onEvent, logger = console, intervalMs = PET_EVENT_INTERVAL_MS } = {}) {
  let stopped = false;
  let running = false;
  const delay = Math.max(60 * 1000, Number(intervalMs) || PET_EVENT_INTERVAL_MS);

  const cycle = async () => {
    if (stopped || running) return;
    running = true;
    try {
      const result = await runPetEventCycle({ onEvent, logger });
      if (result.activated) {
        logger?.info?.(`🐾 Pets Alive: ${result.activated} habilidade(s) automática(s) ativada(s).`);
      }
    } catch (error) {
      logger?.error?.('❌ Erro no ciclo automático dos Pets:', error);
    } finally {
      running = false;
      if (!stopped) timer = setTimeout(cycle, delay);
      timer?.unref?.();
    }
  };

  let timer = null;
  void cycle();

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    timer = null;
  };
}
