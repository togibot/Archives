export default {
  name: 'menuadm',
  aliases: ['adm', 'menuadmin', 'adminmenu'],
  category: 'geral',
  description: 'Menu de administração e proteção do grupo',
  async execute({ reply }) {
    return reply(`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  🛡️  𝙼𝙴𝙽𝚄 𝙰𝙳𝙼 • 𝚃𝙾𝙶𝙸
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

🔐 *PROTEÇÃO DO GRUPO*
• .antipalavrao — bloqueia palavrões
• .antipalavras — bloqueia palavras definidas
• .antilink — proteção contra links
• .antispam — proteção contra spam

👥 *ADMINISTRAÇÃO*
• .add — adicionar membro
• .kick — remover membro
• .promover — promover a admin
• .rebaixar — remover admin
• .grupo — abrir/fechar grupo

⚙️ *CONFIGURAÇÃO*
• .menuadm — este painel
• .botinfo — informações do bot

📌 Os recursos de proteção só podem ser configurados por administradores.`);
  }
};
