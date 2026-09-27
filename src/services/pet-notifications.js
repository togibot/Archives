import { getPetSettings } from '../database/index.js';
import { getPetDefinition } from '../data/pets.js';

function mention(jid) {
  return '@' + String(jid || '').split('@')[0];
}

function formatTokens(amount) {
  return Number(amount || 0).toLocaleString('pt-BR');
}

function itemName(itemId) {
  const names = { food: '🍖 Comida', water: '💧 Água', lucky: '🍀 Sorte' };
  return names[String(itemId || '')] || ('📦 ' + String(itemId || 'item'));
}

export function buildPetNotification(event) {
  const pet = event?.pet;
  const result = event?.result;
  const details = event?.details;
  if (!pet || !result || !details) return null;

  const def = getPetDefinition(pet.species);
  const emoji = def?.emoji || '🐾';
  const petName = pet.name || def?.name || 'seu Pet';
  const owner = mention(event.ownerJid);
  const lines = [
    `${emoji} ${owner}, seu ${petName} ativou **${def?.abilityName || 'uma habilidade'}**!`
  ];

  switch (details.type) {
    case 'tokens':
      lines.push(`💰 Você recebeu **+${formatTokens(details.amount)} TOKENS**!`);
      break;
    case 'pet_steal':
      lines.push(`🦊 Seu Pet furtou **+${formatTokens(details.amount)} TOKENS** de ${mention(details.targetJid)}!`);
      break;
    case 'item':
      lines.push(`📦 Encontrou ${details.quantity}x ${itemName(details.itemId)}!`);
      break;
    case 'rebirth':
      lines.push(`🔥 Os atributos do Pet foram restaurados em até **+${details.restore}** pontos.`);
      if (details.reward > 0) lines.push(`🎁 Bônus: **+${formatTokens(details.reward)} TOKENS**!`);
      break;
    case 'buff':
      lines.push(`🌙 Bônus de **+${Math.round(details.value * 100)}%** nas recompensas por ${Math.max(1, Math.ceil(details.durationMs / 3600000))}h.`);
      break;
    default:
      lines.push(`✨ ${details.text || 'A habilidade foi ativada com sucesso.'}`);
      break;
  }

  const levelsGained = Number(result.xp?.levelsGained || 0);
  if (levelsGained > 0) lines.push(`🎚️ Seu Pet subiu ${levelsGained} nível(is)!`);
  lines.push('🐾 Pets Alive');
  return { text: lines.join('\n'), mentions: details.targetJid ? [event.ownerJid, details.targetJid] : [event.ownerJid] };
}

export async function notifyPetEvent(sock, event, logger = console) {
  const settings = getPetSettings(event.ownerJid);
  if (!Number(settings?.notifications_enabled)) return { sent: false, reason: 'disabled' };

  const payload = buildPetNotification(event);
  if (!payload) return { sent: false, reason: 'invalid_event' };

  try {
    await sock.sendMessage(event.ownerJid, { text: payload.text, mentions: payload.mentions });
    return { sent: true };
  } catch (error) {
    logger?.debug?.({ err: error, ownerJid: event.ownerJid }, 'Não foi possível enviar notificação do Pet.');
    return { sent: false, reason: 'send_failed' };
  }
}
