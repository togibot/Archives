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
    '┏┉✯┉━═『アカメ』═━┉✯┉┓',
    '║ が斬る REGRAS/GRUPO が斬る',
    '┗┉✯┉━═『アカメ』═━┉✯┉┛',
    '*💫NOME⧽* ' + (subject || 'ESTE GRUPO'),
    '*👥MEMBROS⧽* ' + memberCount,
    '',
    '[Regras]',
    '',
    rules
  ].join('\n');
}

export default {
  name:'regras',
  aliases:['regra'],
  category:'admin',
  description:'Mostra as regras configuradas do grupo.',
  async execute({ sock, chat, isGroup, reply }) {
    if (!isGroup) return reply('❌ Use o .regras em um grupo.');
    const metadata=await sock.groupMetadata(chat).catch(()=>null);
    const subject = metadata?.subject || 'ESTE GRUPO';
    const memberCount = Array.isArray(metadata?.participants) ? metadata.participants.length : 0;
    const group = ensureGroup(chat, subject);
    const custom = String(group?.rules_text || '').trim();
    return reply(formatRules(
      group?.subject || subject,
      memberCount,
      custom || defaultRules()
    ));
  }
};