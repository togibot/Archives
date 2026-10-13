import { ensureGroup } from '../database/index.js';

function defaultRules() {
  return [
    '1. Respeite os outros membros.',
    '2. Não faça spam ou flood.',
    '3. Respeite os administradores.',
    '4. Não envie conteúdo proibido.',
    '5. Divirta-se e mantenha o grupo organizado. 💜'
  ].join('\n');
}

function formatRules(subject, memberCount, rules) {
  return [
    '┏┉✯┉━═『 TOGI 』═━┉✯┉┓',
    '║      📜 REGRAS DO GRUPO',
    '┗┉✯┉━═『 TOGI 』═━┉✯┉┛',
    '*💫NOME⧽* ' + (subject || 'ESTE GRUPO'),
    '*👥MEMBROS⧽* ' + memberCount,
    '',
    '[Regras]',
    '',
    rules
  ].join('\n');
}

export default {
  name: 'regras',
  aliases: ['regra'],
  category: 'admin',
  description: 'Mostra as regras configuradas do grupo.',
  async execute({ sock, chat, message, isGroup, reply }) {
    if (!isGroup) return reply('❌ Use o .regras em um grupo.');

    const metadata = await sock.groupMetadata(chat).catch(() => null);
    const subject = metadata?.subject || 'ESTE GRUPO';
    const memberCount = Array.isArray(metadata?.participants)
      ? metadata.participants.length
      : 0;

    const group = ensureGroup(chat, subject);
    const custom = String(group?.rules_text || '').trim();
    const caption = formatRules(
      group?.subject || subject,
      memberCount,
      custom || defaultRules()
    );

    try {
      const pictureUrl = await sock.profilePictureUrl(chat, 'image');
      if (pictureUrl) {
        return await sock.sendMessage(
          chat,
          {
            image: { url: pictureUrl },
            caption
          },
          { quoted: message }
        );
      }
    } catch (error) {
      console.warn('[TOGI REGRAS] Foto do grupo indisponível:', error?.message || error);
    }

    return reply(caption);
  }
};
