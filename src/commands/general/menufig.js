export default {
  name: 'menufig',
  aliases: ['figmenu'],
  category: 'geral',
  description: 'Menu de figurinhas V2',
  async execute({ reply }) {
    return reply(`╭━━━〔 🎨💜 𝐓𝐎𝐆𝐈 𝐅𝐈𝐆 𝐕𝟐 〕━━━╮
┃
┃ 🖼️ *CRIAR*
┃ • .s / .sticker — imagem ou vídeo curto
┃ • .brat — texto estilo Brat
┃
┃ 🏷️ *PERSONALIZAR*
┃ • .nick <nome> — seu nome nas figs
┃ • .take — renomear uma fig respondida
┃ • .perfilfig — seu perfil de figs
┃
┃ 📦 *PACKS*
┃ • .packs — central de packs
┃
┃ 💜 Sem nick: *💜✨ 𝐅𝐢𝐠 𝐝𝐨 𝐓𝐨𝐠𝐢 ✨💜*
┃ ✨ Com .take: usa somente seu nick configurado
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`);
  }
};
