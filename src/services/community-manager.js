import {
  addGroupBlock,
  getGroupBlocks,
  isGroupBlock,
  removeGroupBlock,
  updateCommunitySettings
} from '../database/index.js';

export const COMMUNITY_MENU_DEFS = Object.freeze({
  arcade: { label: '🎮 Diversão / Arcade', categories: ['arcade','games','game','diversao','diversão','fun','jogos'] },
  cards: { label: '🎴 Togi Cards', categories: ['cards','card','cartas'] },
  casa: { label: '🏠 Casa', categories: ['casa','houses','house'] },
  social: { label: '💞 Social / Relacionamento', categories: ['social','roleplay','relationship','relacionamento'] },
  status: { label: '💤 Status', categories: ['status'] },
  economy: { label: '🪙 Economia', categories: ['economy','economia','finance','financeiro'] },
  pets: { label: '🐾 Pets Alive', categories: ['pets','pet'] },
  ai: { label: '🤖 Togi AI', categories: ['ai','ia'] },
  groups: { label: '🛡️ Grupos / Moderação', categories: ['admin','adm','moderation','moderação','moderacao','group','groups','grupo'] },
  music: { label: '🎵 Música', categories: ['music','musica','música','audio'] },
  stickers: { label: '🎨 Figurinhas', categories: ['sticker','stickers','figurinhas'] },
  ranks: { label: '🏆 Ranks', categories: ['rank','ranks'] },
  quiz: { label: '🧠 Quiz', categories: ['quiz','knowledge','conhecimento'] }
});

export function normalizeCMTarget(value) {
  return String(value || '').trim().toLowerCase().replace(/^\./, '').replace(/\s+/g, '_');
}

export function resolveMenuKey(value) {
  const raw = normalizeCMTarget(value);
  if (!raw) return '';
  if (COMMUNITY_MENU_DEFS[raw]) return raw;
  for (const [key, def] of Object.entries(COMMUNITY_MENU_DEFS)) {
    if (def.categories.includes(raw) || def.label.toLowerCase().includes(raw.replaceAll('_',' '))) return key;
  }
  const compact = raw.replace(/[^a-z0-9]/g, '');
  for (const [key, def] of Object.entries(COMMUNITY_MENU_DEFS)) {
    if (key.replace(/[^a-z0-9]/g,'') === compact) return key;
  }
  return '';
}

export function commandBelongsToMenu(command, menuKey) {
  const def = COMMUNITY_MENU_DEFS[menuKey];
  if (!def || !command) return false;
  const category = normalizeCMTarget(command.category);
  if (def.categories.includes(category)) return true;
  const name = normalizeCMTarget(command.name);
  // Heurística de fallback para comandos antigos que não possuem category consistente.
  const prefixes = {
    pets: ['pet','alimentar','beber','brincar','dormir','curar','equip','unequip','upgradeequip'],
    cards: ['card','album','pack','abrirpack','vendercarta'],
    music: ['play','yta','yts','ytadoc'],
    stickers: ['sticker','brat','take','nick','packs'],
    quiz: ['quiz','streak'],
    economy: ['saldo','daily','weekly','trabalhar','loja','comprar','pagar','rank','perfil'],
    groups: ['adm','kick','mute','desmute','warn','aviso','antilink','soadm'],
    ai: ['togiai'],
    casa: ['casa']
  };
  return (prefixes[menuKey] || []).some(prefix => name === prefix || name.startsWith(prefix));
}

export function isCommandBlocked(groupJid, commandName, command) {
  const normalizedCommand = normalizeCMTarget(commandName);
  const canonical = normalizeCMTarget(command?.name);
  if (isGroupBlock(groupJid, 'command', normalizedCommand)) return { blocked: true, type: 'command', target: normalizedCommand };
  if (canonical && canonical !== normalizedCommand && isGroupBlock(groupJid, 'command', canonical)) return { blocked: true, type: 'command', target: canonical };
  const blocks = getGroupBlocks(groupJid).filter(row => row.block_type === 'menu');
  for (const row of blocks) {
    if (commandBelongsToMenu(command, row.target)) return { blocked: true, type: 'menu', target: row.target };
  }
  return { blocked: false };
}

export function blockCommand(groupJid, commandName) {
  return addGroupBlock(groupJid, 'command', normalizeCMTarget(commandName));
}
export function unblockCommand(groupJid, commandName) {
  return removeGroupBlock(groupJid, 'command', normalizeCMTarget(commandName));
}
export function blockMenu(groupJid, menuKey) {
  return addGroupBlock(groupJid, 'menu', resolveMenuKey(menuKey));
}
export function unblockMenu(groupJid, menuKey) {
  return removeGroupBlock(groupJid, 'menu', resolveMenuKey(menuKey));
}
export function listGroupBlocks(groupJid) {
  return getGroupBlocks(groupJid).filter(row => row.block_type === 'command' || row.block_type === 'menu');
}

export function getCommunityId(metadata, fallbackGroupJid) {
  return String(metadata?.linkedParent || fallbackGroupJid || '').trim();
}

export function configureWelcome(communityJid, groupJid, message = null) {
  const patch = { welcome_group_jid: groupJid };
  if (String(message || '').trim()) patch.welcome_message = String(message).trim();
  return updateCommunitySettings(communityJid, patch);
}
export function configureGoodbye(communityJid, groupJid, message = null) {
  const patch = { goodbye_group_jid: groupJid };
  if (String(message || '').trim()) patch.goodbye_message = String(message).trim();
  return updateCommunitySettings(communityJid, patch);
}

export function formatCMTargetList(blocks) {
  const commands = blocks.filter(row => row.block_type === 'command').map(row => '.' + row.target);
  const menus = blocks.filter(row => row.block_type === 'menu').map(row => COMMUNITY_MENU_DEFS[row.target]?.label || row.target);
  return { commands, menus };
}
