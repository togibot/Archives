import { getPermissionLevel } from '../../core/permissions.js';

export default {
  name: 'menuadm',
  aliases: ['menuadmin'],
  category: 'geral',
  description: 'Menu exclusivo para administradores do grupo.',
  async execute({ sock, chat, sender, message, isGroup, reply }) {
    if (!isGroup) return reply('❌ O .menuadm só pode ser usado em grupos.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores deste grupo podem usar o .menuadm.');
    }

    return reply(
      '╭━━━〔 🛡️💜 𝐌𝐄𝐍𝐔 𝐀𝐃𝐌 〕━━━╮\n' +
      '┃ ⚙️ Controle e proteção do grupo\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
      '🚨 *MODERAÇÃO*\n' +
      '┃ 👢 .kick @user — remove membro\n' +
      '┃ ⚠️ .warn @user [motivo] — aplica aviso\n' +
      '┃ 📋 .warn ver @user — consulta avisos\n' +
      '┃ ➖ .warn remover @user — remove 1 aviso\n' +
      '┃ 🧹 .warn limpar @user — zera avisos\n' +
      '┃ 🔢 .warnconfig <quantia> — define limite de avisos\n' +
      '┃ ⏳ .warntempo <tempo> — define validade dos avisos\n' +
      '┃ 🔇 .mute @user — apaga mensagens do membro\n' +
      '┃ 🔊 .desmute @user — libera o membro\n' +
      '┃ 🗑️ .d — apaga mensagem respondida\n\n' +
      '🛡️ *PROTEÇÕES*\n' +
      '┃ 🚫 .antipalavrao — liga/desliga\n' +
      '┃ 📝 .antipalavras palavra1, palavra2 — filtro personalizado\n' +
      '┃ 🔗 .antilink on/off — anti-link\n\n' +
      '🔐 *RESTRIÇÃO DO BOT*\n' +
      '┃ 👑 .soadm — somente ADMs podem usar comandos\n\n' +
      '💡 Padrões: 3 avisos e sem expiração.\n' +
      '💜 As configurações valem somente para este grupo.'
    );
  }
};
