import { ensureGroup } from '../database/index.js';

function defaultRules(subject) {
  return (
    '╭━━━━━━〔 📜 𝚁𝙴𝙶𝚁𝙰𝚂 〕━━━━━━╮\\n\\n' +
    '『 ' + (subject || 'ESTE GRUPO') + ' 』\\n\\n' +
    '1. Respeite os outros membros.\\n' +
    '2. Não faça spam ou flood.\\n' +
    '3. Respeite os administradores.\\n' +
    '4. Não envie conteúdo proibido.\\n' +
    '5. Divirta-se e mantenha o grupo organizado. 💜\\n\\n' +
    '╰━━━━━━━━━━━━━━━━━━━━━━━━╯'
  );
}

export default {
  name:'regras',
  aliases:['regra'],
  category:'admin',
  description:'Mostra as regras configuradas do grupo.',
  async execute({ sock, chat, isGroup, reply }) {
    if (!isGroup) return reply('❌ Use o .regras em um grupo.');
    const metadata=await sock.groupMetadata(chat).catch(()=>null);
    const group=ensureGroup(chat, metadata?.subject || '');
    const custom=String(group?.rules_text||'').trim();
    if (!custom) return reply(defaultRules(group?.subject || metadata?.subject || 'ESTE GRUPO'));
    return reply(
      '╭━━━━━━〔 📜 𝚁𝙴𝙶𝚁𝙰𝚂 〕━━━━━━╮\\n\\n' +
      '『 ' + (group?.subject || metadata?.subject || 'ESTE GRUPO') + ' 』\\n\\n' +
      custom +
      '\\n\\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯'
    );
  }
};