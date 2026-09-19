import { addItem, addTokens, consumeStealAttempt, getItemQuantity, getUser, addTogiLog } from '../../database/index.js';
import { getMentionedJid } from '../../utils/targets.js';

function formatTokens(amount) {
  return Number(amount || 0).toLocaleString('pt-BR');
}

function formatRemaining(resetAt) {
  const minutes = Math.max(1, Math.ceil((resetAt - Date.now()) / 60000));
  return minutes === 1 ? '1 minuto' : `${minutes} minutos`;
}

export default {
  name: 'roubar',
  aliases: ['steal'],
  async execute({ sender, message, args, reply, chat, isGroup, sock }) {
    const target = getMentionedJid(message) || (args[0]?.includes('@') ? args[0] : null);
    if (!target) return reply('🥷 Marque alguém para tentar roubar.\nEx.: .roubar @usuario');
    if (target === sender) return reply('😂 Você não pode roubar a si mesmo.');
    const victim = getUser(target);
    const thief = getUser(sender);
    if (!victim) return reply('❌ Essa pessoa ainda não possui um perfil no Togi Bot.');

    const attempt = consumeStealAttempt(sender);
    if (!attempt.allowed) return reply(`⏳ *LADRÃO, CALMA!*\n\nVocê já usou suas *3 tentativas* desta hora.\n🕐 Tente novamente em aproximadamente *${formatRemaining(attempt.resetAt)}*.`);

    if (getItemQuantity(target, 'shield') > 0) {
      addItem(target, 'shield', -1);
      return reply(`🛡️ *ROUBO BLOQUEADO!*\n\n@${victim.name || 'Usuário'} usou um Escudo e protegeu seus Tokens.`, { mentions: [target] });
    }

    if (victim.tokens <= 0) return reply(`🥷 @${victim.name || 'Usuário'} não tem Tokens para roubar.`, { mentions: [target] });

    if (Math.random() < 0.40) {
      return reply(`🥷 *ROUBO FALHOU!*\n\n@${victim.name || 'Usuário'} escapou da tentativa.\n🎯 Tentativas restantes: *${attempt.remaining}/3*`, { mentions: [target] });
    }

    const percentage = 0.20 + Math.random() * 0.30;
    const amount = Math.max(1, Math.min(victim.tokens, Math.floor(victim.tokens * percentage)));
    addTokens(target, -amount);
    addTokens(sender, amount);

    let groupName = 'Conversa privada';
    if (isGroup && sock && chat) {
      try {
        const metadata = await sock.groupMetadata(chat);
        groupName = metadata?.subject || chat;
      } catch {}
    }

    addTogiLog({ actorJid: sender, actorName: thief?.name || 'Usuário', targetJid: target, targetName: victim?.name || 'Usuário', groupJid: isGroup ? chat : null, groupName, action: 'roubo', amount });

    return reply(`🥷 *ROUBO BEM-SUCEDIDO!*\n\n💰 Você roubou *🪙 ${formatTokens(amount)} Tokens* de @${victim.name || 'Usuário'}!\n🎯 Tentativas restantes: *${attempt.remaining}/3*`, { mentions: [target] });
  }
};