import { isOwnerMessage } from '../core/permissions.js';

function extractBody(rawText, commandName) {
  const raw = String(rawText || '').trim();
  const match = raw.match(new RegExp('^\\.' + commandName + '\\s*', 'i'));
  return match ? raw.slice(match[0].length).trim() : '';
}

function decorate(lines) {
  const items = lines.map(line => line.trim()).filter(Boolean);
  if (!items.length) return '';
  return (
    '╭━━━━━━━━〔 📰 𝙽𝙾𝚃Í𝙲𝙸𝙰𝚂 〕━━━━━━━━╮\n\n' +
    '— *_NOTICIAS📰🗞️_*\n\n' +
    items.map((line, index) => (index + 1) + '️⃣ ✦ ' + line).join('\n') +
    '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '💜 𝚃𝚘𝚐𝚒 𝙱𝚘𝚝\n' +
    '╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯'
  );
}

export default {
  name: 'ondt',
  aliases: ['noticiasorg', 'noticiaorg'],
  category: 'owner',
  description: 'Organiza e envia uma notícia para todos os grupos.',
  async execute({ sock, sender, message, rawText, args, reply }) {
    if (!isOwnerMessage(message, sender)) return reply('❌ Apenas o dono do Togi pode usar este comando.');

    const body = extractBody(rawText, 'ondt') || args.join(' ').trim();
    if (!body) return reply('❌ Use *.ONDT* e coloque cada item da notícia em uma linha.');

    const lines = body.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const announcement = decorate(lines);

    try {
      const groups = await sock.groupFetchAllParticipating();
      const entries = Object.values(groups || {});
      const groupJids = [...new Set(entries.map(group => group?.id || group?.jid).filter(jid => String(jid).endsWith('@g.us')))];

      if (!groupJids.length) return reply('❌ O Togi não está em nenhum grupo.');

      let sent = 0;
      let failed = 0;
      for (const jid of groupJids) {
        try { await sock.sendMessage(jid, { text: announcement }); sent += 1; } catch { failed += 1; }
      }

      return reply('📰 *ONDT ENVIADO*\\n\\n✅ Grupos enviados: *' + sent + '*\\n❌ Falhas: *' + failed + '*');
    } catch (error) {
      return reply('❌ ' + (error?.message || 'Não foi possível enviar a notícia.'));
    }
  }
};