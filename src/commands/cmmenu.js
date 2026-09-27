import { getGroupRules } from '../database/index.js';
import { getPermissionLevel } from '../core/permissions.js';
import {
  COMMUNITY_MENU_DEFS,
  blockCommand,
  blockMenu,
  formatCMTargetList,
  getCommunityId,
  listGroupBlocks,
  resolveMenuKey,
  unblockCommand,
  unblockMenu
} from '../services/community-manager.js';

function normalizeCommandTarget(value) {
  return String(value || '').trim().replace(/^\./, '').toLowerCase();
}

export default {
  name: 'cmmenu',
  aliases: ['cm'],
  category: 'admin',
  description: 'Abre o Community Manager do grupo.',
  async execute({ sock, chat, sender, message, isGroup, args, commands, reply }) {
    if (!isGroup) return reply('❌ O Community Manager só funciona em grupos.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem usar o Community Manager.');
    }

    const action = String(args?.[0] || 'menu').toLowerCase();
    const type = String(args?.[1] || '').toLowerCase();

    if (['menu','ajuda','help',''].includes(action)) {
      const blocks = formatCMTargetList(listGroupBlocks(chat));
      const community = getCommunityId(await sock.groupMetadata(chat), chat);
      return reply(
        '╭━━━〔 🛡️ 𝐂𝐎𝐌𝐌𝐔𝐍𝐈𝐓𝐘 𝐌𝐀𝐍𝐀𝐆𝐄𝐑 〕━━━╮\n' +
        '┃ ⚙️ Configuração e proteção do grupo\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
        '🔒 *BLOQUEIOS*\n' +
        '• .CMmenu bloquear comando <comando>\n' +
        '• .CMmenu desbloquear comando <comando>\n' +
        '• .CMmenu bloquear menu <menu>\n' +
        '• .CMmenu desbloquear menu <menu>\n' +
        '• .CMmenu lista\n\n' +
        '📜 *REGRAS*\n' +
        '• .setregras <texto>\n' +
        '• .regras\n\n' +
        '👋 *BOAS-VINDAS / DESPEDIDA*\n' +
        '• .setBV [mensagem]\n' +
        '• .setBD [mensagem]\n\n' +
        '📢 *COMUNICAÇÃO*\n' +
        '• .marcar\n\n' +
        '🧩 *MENUS DISPONÍVEIS*\n' +
        Object.entries(COMMUNITY_MENU_DEFS).map(([key,def]) => '• ' + key + ' — ' + def.label).join('\n') +
        '\n\n🌐 Comunidade vinculada: ' + community +
        '\n🔒 Comandos bloqueados: ' + blocks.commands.length +
        '\n🔒 Menus bloqueados: ' + blocks.menus.length
      );
    }

    if (['lista','list','status'].includes(action)) {
      const blocks = formatCMTargetList(listGroupBlocks(chat));
      return reply(
        '📋 *CONFIGURAÇÃO DE BLOQUEIOS*\n\n' +
        '⚙️ Comandos: ' + (blocks.commands.length ? blocks.commands.join(', ') : 'nenhum') + '\n' +
        '🧩 Menus: ' + (blocks.menus.length ? blocks.menus.join(', ') : 'nenhum')
      );
    }

    if (!['bloquear','block','desbloquear','unblock'].includes(action)) {
      return reply('❌ Ação inválida. Use .CMmenu para ver as opções.');
    }

    if (!['comando','command','cmd','menu'].includes(type)) {
      return reply('❌ Informe "comando" ou "menu". Ex.: .CMmenu bloquear comando play');
    }

    const target = normalizeCommandTarget(args.slice(2).join(' '));
    if (!target) return reply('❌ Informe o que deseja alterar.');

    if (type === 'menu') {
      const menuKey = resolveMenuKey(target);
      if (!menuKey) return reply('❌ Menu desconhecido: ' + target);
      if (action === 'bloquear' || action === 'block') {
        blockMenu(chat, menuKey);
        return reply('🔒 Menu *' + COMMUNITY_MENU_DEFS[menuKey].label + '* bloqueado neste grupo.');
      }
      unblockMenu(chat, menuKey);
      return reply('🔓 Menu *' + COMMUNITY_MENU_DEFS[menuKey].label + '* desbloqueado neste grupo.');
    }

    const command = commands?.get(target);
    if (!command) return reply('❌ Não encontrei o comando .' + target + '.');
    if (['cmmenu','cm'].includes(target) || command.name === 'cmmenu') {
      return reply('🛡️ O .CMmenu não pode ser bloqueado para evitar que o gerenciamento do grupo fique inacessível.');
    }

    if (action === 'bloquear' || action === 'block') {
      blockCommand(chat, command.name || target);
      return reply('🔒 Comando *.' + command.name + '* bloqueado neste grupo.');
    }
    unblockCommand(chat, command.name || target);
    return reply('🔓 Comando *.' + command.name + '* desbloqueado neste grupo.');
  }
};
