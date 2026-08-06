export default {
  name: 'groupinfo',
  aliases: ['gcinfo'],
  category: 'grupo',
  description: 'Mostra informações do grupo',
  async execute({ sock, chat, isGroup, reply }) {
    if (!isGroup) return reply('❌ Este comando só pode ser usado em grupos.');
    const metadata = await sock.groupMetadata(chat);
    const admins = metadata.participants.filter(p => p.admin).length;
    return reply(`👥 *INFORMAÇÕES DO GRUPO*\n\n🏷️ Nome: *${metadata.subject}*\n👤 Membros: *${metadata.participants.length}*\n🛡️ Administradores: *${admins}*\n🆔 ID: ${metadata.id}`);
  }
};
