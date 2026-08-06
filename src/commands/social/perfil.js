import { getFamily, getRelationship, getUser } from '../../database/index.js';

export default {
  name: 'perfil',
  aliases: ['perfilrp', 'meuperfil'],
  category: 'social',
  description: 'Mostra o perfil social e RP',
  async execute({ sender, reply }) {
    const user = getUser(sender);
    const relationship = getRelationship(sender);
    const family = getFamily(sender);
    const partner = relationship ? (relationship.user_a === sender ? relationship.user_b : relationship.user_a) : null;

    return reply(`╭━━━〔 👤 𝐏𝐄𝐑𝐅𝐈𝐋 𝐑𝐏 〕━━━╮\n┃ 👤 Nome: *${user?.name || 'Usuário'}*\n┃ 🪙 Tokens: *${user?.tokens ?? 0}*\n┃ ⭐ Nível: *${user?.level ?? 1}*\n┃ 💞 Relação: ${partner ? `@${partner.split('@')[0]}` : 'Solteiro(a)'}\n┃ 👨‍👩‍👧 Família: *${family.length} relação(ões)*\n╰━━━━━━━━━━━━━━━━━━━━╯`, { mentions: partner ? [partner] : [] });
  }
};
