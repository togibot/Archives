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
┃ • .nick <nome> — nome padrão das suas figs
┃ • .take <nome> — usa exatamente o nome enviado
┃ • .perfilfig — seu perfil de figs
┃
┃ 📦 *PACKS PERSONALIZADOS*
┃ • .packs — lista e central de packs
┃ • .packs criar <nome> — criar pack
┃ • .packs add <nome> — adicionar FIG respondida
┃ • .packs ver <nome> — ver conteúdo
┃ • .packs enviar <nome> — enviar pack completo
┃ • .packs remover <nome> <n> — remover FIG
┃ • .packs renomear <antigo> | <novo>
┃ • .packs apagar <nome> — excluir pack
┃
┃ 💜 Sem .take: nome padrão do Togi ou seu .nick
┃ ✨ Com .take LZ: o nome fica *LZ*, exatamente assim
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`);
  }
};
