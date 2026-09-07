export default {
  name: 'adm',
  aliases: ['menuadm', 'adminmenu'],
  category: 'admin',
  description: 'Menu de administração V2',
  async execute({ chat, isGroup, reply }) {
    if (!isGroup) return reply('❌ O Menu ADM só pode ser usado em grupos.');

    const text = `╭━━━〔 🛡️💜 𝐓𝐎𝐆𝐈 𝐀𝐃𝐌 𝐕𝟐 〕━━━╮
┃ ⚙️ *MENU DE ADMINISTRAÇÃO*
┃ 🔐 Controle e proteção do grupo
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

🚨 *MODERAÇÃO*
┃ 👢 .kick @membro — remove membro
┃ 🗑️ .d — apaga mensagem + comando
┃ ⚠️ .aviso @membro [motivo] — adiciona aviso
┃ 📋 .aviso ver @membro — vê os avisos
┃ ➖ .aviso remover @membro — remove 1 aviso
┃ 🧹 .aviso limpar @membro — zera os avisos

🛡️ *PROTEÇÕES*
┃ 🚫 .antipalavrao — liga/desliga o anti-palavrão
┃ 🔗 .antilink on/off — anti-link
┃ 📝 .antipalavras palavra1, palavra2 — filtro personalizado

🧪 *ANTI-PALAVRÃO — TESTE*
┃ 🗑️ Detectou palavrão → apaga a mensagem
┃ 🔁 .antipalavrao novamente → desativa
┃ 👥 A regra vale para membros e administradores
┃ ⏸️ Avisos e remoção automática estão pausados
┃ ⚠️ O Togi precisa ser administrador do grupo

⚙️ *CONFIGURAÇÕES*
┃ 🛡️ Apenas administradores configuram
┃ 💜 Menu ADM V2 em expansão

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃ 👑 *TOGI BOT V2* • Painel ADM
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

    await reply(text);
  }
};
