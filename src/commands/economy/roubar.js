import { addItem, addTokens, getItemQuantity, getUser, updateUser } from '../../database/index.js';
import { getMentionedJid, cleanMention } from '../../utils/targets.js';

const COOLDOWN = 60 * 60 * 1000;

export default {
  name: 'roubar',
  aliases: ['steal'],
  async execute({ sender, message, args, reply }) {
    const target = getMentionedJid(message) || (args[0]?.includes('@') ? args[0] : null);
    if (!target) return reply('🥷 Marque alguém para tentar roubar.\nEx.: .roubar @usuario');
    if (target === sender) return reply('😂 Você não pode roubar a si mesmo.');
    const victim = getUser(target);
    const thief = getUser(sender);
    if (!victim) return reply('❌ Essa pessoa ainda não possui um perfil no Togi Bot.');
    if (Date.now() - thief.last_steal < COOLDOWN) {
      const left = Math.ceil((COOLDOWN - (Date.now() - thief.last_steal)) / 60000);
      return reply(`⏳ Calma, ladrão! Espere aproximadamente ${left} min para tentar novamente.`);
    }
    updateUser(sender, { last_steal: Date.now() });
    if (getItemQuantity(target, 'shield') > 0) {
      addItem(target, 'shield', -1);
      return reply(`🛡️ ROUBO BLOQUEADO!\n\n${cleanMention(target)} usou um Escudo e protegeu seus Tokens.`);
    }
    if (victim.tokens <= 0) return reply(`🥷 O alvo não tem Tokens para roubar.`);
    if (Math.random() < 0.45) return reply(`🥷 ROUBO FALHOU!\n\n${cleanMention(target)} escapou da tentativa.`);
    const amount = Math.max(1, Math.min(victim.tokens, Math.floor(victim.tokens * (0.08 + Math.random() * 0.12))));
    addTokens(target, -amount);
    addTokens(sender, amount);
    await reply(`🥷 ROUBO BEM-SUCEDIDO!\n\nVocê roubou 🪙 ${amount} Tokens de ${cleanMention(target)}!`);
  }
};
