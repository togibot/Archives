export default {
  name: 'adm',
  aliases: ['menuadm', 'adminmenu'],
  category: 'admin',
  description: 'Menu de administração V2',
  async execute({ sock, chat, isGroup, sender, reply }) {
    if (!isGroup) return reply('❌ O Menu ADM só pode ser usado em grupos.');

    const text = `╭━━━〔 🛡️💜 𝐓𝐎𝐆𝐈 𝐀𝐃𝐌 𝐕𝟐 〕━━━╮
┃ ⚙️ *MENU DE ADMINISTRAÇÃO*
┃ 🔐 Ferramentas para moderar o grupo
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

👮 *MODERAÇÃO*
┃ 👢 .kick @membro — remove membro
┃ 🗑️ .d — apaga mensagem respondida
┃ ⚠️ .aviso @membro [motivo] — aplica aviso
┃ 📋 .aviso ver @membro — consulta avisos
┃ ➖ .aviso remover @membro — remove 1 aviso
┃ 🧹 .aviso limpar @membro — zera avisos

🛡️ *PROTEÇÕES*
┃ 🔗 .antilink on/off — bloqueio de links
┃ 🚫 .antipalavrao on/off — bloqueio de palavrões
┃ ⚠️ Anti-palavrão apaga a mensagem e registra aviso
┃ 🚨 3 avisos por palavrão → remoção automática

💜 *TOGI ADM V2*
┃ 🔒 Apenas administradores podem usar estas ferramentas
┃ 🧩 Novos sistemas de moderação serão adicionados aqui

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃ 👑 *TOGI BOT V2* • Painel ADM
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

    await reply(text);
  }
};
