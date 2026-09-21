import config from '../config.js';

function normalizeNumber(value) {
  return String(value || '').split('@')[0].replace(/\D/g, '');
}

function isOwner(...values) {
  const allowedNumbers = config.owner.numbers.map(normalizeNumber).filter(Boolean);
  return values
    .flatMap(value => Array.isArray(value) ? value : [value])
    .map(normalizeNumber)
    .filter(Boolean)
    .some(number => allowedNumbers.includes(number));
}

export default {
  name: 'menudono',
  aliases: ['donomeu', 'paineldono'],
  category: 'owner',
  description: 'Mostra o menu secreto do dono do Togi.',
  async execute({ sender, message, reply }) {
    const key = message?.key || {};

    const candidates = [
      sender,
      key.participant,
      key.participantAlt,
      key.participantPn,
      key.senderPn,
      key.remoteJid,
      key.remoteJidAlt,
      message?.participant,
      message?.participantAlt,
      message?.senderPn,
      message?.sender?.id,
      message?.sender?.phoneNumber
    ];

    if (!isOwner(candidates)) return;

    await reply(
      '╭━━━〔 👑 𝐓𝐎𝐆𝐈 — 𝐌𝐄𝐍𝐔 𝐃𝐎𝐍𝐎 〕━━━╮\n' +
      '┃ 💜 Painel exclusivo do proprietário\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
      '💰 *ECONOMIA*\n' +
      '┃ 🔐 .atnc <quantia> — adiciona Tokens\n' +
      '┃ 🏦 .Depdono — consulta o fundo do dono\n' +
      '┃ 💸 .Depdono sacar — transfere o fundo para seu saldo\n\n' +
      '📋 *AUDITORIA*\n' +
      '┃ 🧾 .logTogi — últimos registros administrativos\n\n' +
      '🛡️ *ADMINISTRAÇÃO*\n' +
      '┃ ⚙️ .adm — painel de administração do grupo\n\n' +
      '🎵 *MÚSICA*\n' +
      '┃ 🎧 .play <música> — pesquisa e envia áudio\n' +
      '┃ 🎵 .yta <música> — áudio\n' +
      '┃ 📄 .ytadoc <música> — áudio como documento\n\n' +
      '⚙️ *SISTEMAS*\n' +
      '┃ 💜 Área do dono em expansão\n\n' +
      '╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n' +
      '┃ 👑 *TOGI BOT V2*\n' +
      '┃ 🔒 Acesso restrito\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯'
    );
  }
};
