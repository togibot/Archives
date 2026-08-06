function randomPair(list) {
  const first = Math.floor(Math.random() * list.length);
  let second = Math.floor(Math.random() * list.length);
  while (second === first && list.length > 1) second = Math.floor(Math.random() * list.length);
  return [list[first], list[second]];
}

export default {
  name: 'ship',
  aliases: ['casal'],
  category: 'social',
  description: 'Calcula uma compatibilidade divertida entre duas pessoas',
  async execute({ sock, message, chat, text, reply }) {
    const isCasal = text.slice(1).trim().split(/\s+/)[0].toLowerCase() === 'casal';

    if (isCasal) {
      if (!chat?.endsWith('@g.us')) return reply('💞 O comando *.casal* funciona apenas em grupos.');

      const metadata = await sock.groupMetadata(chat);
      const participants = (metadata.participants || []).filter(p => p.id && !p.id.includes('-'));
      if (participants.length < 2) return reply('💞 Preciso de pelo menos 2 participantes para formar um casal.');

      const [a, b] = randomPair(participants);
      const score = Math.floor(Math.random() * 101);
      const hearts = Math.round(score / 10);
      const bar = '❤️'.repeat(hearts) + '🖤'.repeat(10 - hearts);
      const mentions = [a.id, b.id];

      return reply(
        `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  💞 𝙲𝙰𝚂𝙰𝙻 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n💘 O casal sorteado foi:\n\n👤 @${a.id.split('@')[0]}\n💞 +\n👤 @${b.id.split('@')[0]}\n\n${bar}\n❤️ Compatibilidade: *${score}%*\n\n🎲 Casal escolhido aleatoriamente!`,
        { mentions }
      );
    }

    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) return reply('💞 Marque alguém para usar o comando. Ex.: *.ship @pessoa*');

    const first = message.key.participant || message.key.remoteJid;
    const second = mentioned[0];
    const score = Math.floor(Math.random() * 101);
    const hearts = Math.round(score / 10);
    const bar = '❤️'.repeat(hearts) + '🖤'.repeat(10 - hearts);

    return reply(
      `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃  💞 𝚂𝙷𝙸𝙿 • 𝚃𝙾𝙶𝙸\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n💘 @${first.split('@')[0]} + @${second.split('@')[0]}\n\n${bar}\n❤️ Compatibilidade: *${score}%*\n\n✨ Resultado aleatório e feito só pela diversão!`,
      { mentions: [first, second] }
    );
  }
};
