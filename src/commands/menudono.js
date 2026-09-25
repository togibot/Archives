import { isOwnerMessage } from '../core/permissions.js';

export default {
  name: 'menudono',
  aliases: ['donomeu','paineldono'],
  category: 'owner',
  description: 'Mostra o menu secreto do dono do Togi.',
  async execute({ sender, message, reply }) {
    if (!isOwnerMessage(message, sender)) return reply('❌ Apenas o dono do Togi pode usar este comando.');
    return reply(
      '╭━━━〔 👑 𝐓𝐎𝐆𝐈 — 𝐌𝐄𝐍𝐔 𝐃𝐎𝐍𝐎 〕━━━╮\n' +
      '┃ 💜 Painel exclusivo do proprietário\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
      '💰 *ECONOMIA / CONTAS*\n' +
      '┃ 🔐 .atnc <quantia> — adiciona Tokens a si mesmo\n' +
      '┃ ➕ .adtk @user <quantia> — adiciona Tokens a alguém\n' +
      '┃ ➖ .rtnc @user <quantia> — remove Tokens de alguém\n' +
      '┃ ⚙️ .settk <quantia> — define seus Tokens\n' +
      '┃ 👤 .settk @user <quantia> — define os Tokens de alguém\n' +
      '┃ 💳 .csaldo @user — consulta o saldo da pessoa\n' +
      '┃ ♻️ .resetuser @user tokens — zera somente os Tokens\n' +
      '┃ ♻️ .resetuser @user tudo — reseta a conta completa\n\n' +
      '🏦 *DEPÓSITO DO DONO*\n┃ 📊 .Depdono — fundo + últimos gastos\n┃ 💸 .sacardep <quantia> — saca parte do fundo\n\n' +
      '📜 *AUDITORIA*\n┃ 🧾 .logTogi [quantia] — últimos registros internos\n\n' +
      '🛡️ *ADMINISTRAÇÃO*\n┃ ⚙️ .adm — painel de administração do grupo\n┃ 📢 .Ann <mensagem> — comunicado em todos os grupos\n\n' +
      '🎵 *MÚSICA*\n┃ 🎧 .play <música> — pesquisa e envia áudio\n┃ 🎵 .yta <música> — áudio\n┃ 📄 .ytadoc <música> — áudio como documento\n\n' +
      '╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃ 👑 *TOGI BOT V2*\n┃ 🔒 Área exclusiva do dono\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯'
    );
  }
};
