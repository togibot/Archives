export default {
  name: 'menufig',
  aliases: ['figmenu'],
  category: 'geral',
  description: 'Menu de figurinhas V3',
  async execute({ reply }) {
    return reply(`╭━━━〔 🎨💜 TOGI FIG V3 〕━━━╮
┃
┃ 🖼️ *CRIAR*
┃ • .s — imagem, vídeo, GIF ou FIG
┃ • .brat — texto estilo Brat
┃
┃ 🏷️ *PERSONALIZAR*
┃ • .nick <nome> — nome das suas FIGs
┃ • .take — renomeia uma FIG com seu .nick
┃ • .perfilfig — seu perfil
┃
┃ 🔎 *DESCOBRIR PACKS*
┃ • .pp <tema> — pesquisa packs online
┃ • .pesquisarpack <tema>
┃
┃ 📦 *PACKS*
┃ • .packs — central de packs
┃ • .packs criar <nome>
┃ • .packs usar <nome>
┃ • .packs add — adiciona ao pack ativo
┃ • .packs capa — define a capa
┃ • .packs autor <nome>
┃ • .packs descricao <texto>
┃ • .packs ver
┃ • .packs enviar — pack nativo
┃ • .packs sequencia — fallback
┃ • .packs remover <n>
┃ • .packs renomear <antigo> | <novo>
┃ • .packs apagar <nome>
┃
┃ 💡 Depois de ativar um pack, não precisa repetir o nome.
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`);
  }
};
