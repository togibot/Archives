import { ensureGroup, getHouse, createHouse, renameHouse, contributeHouse, getHouseContributions, spendTokens } from '../database/index.js';
import { getPermissionLevel } from '../core/permissions.js';

export default {
  name: 'casa',
  aliases: ['house'],
  category: 'fun',
  description: 'Casa coletiva do grupo, construída por todos os membros.',
  async execute({ sock, chat, sender, args, isGroup, reply }) {
    if (!isGroup) return reply('🏠 A Casa do Grupo só funciona dentro de grupos.');
    ensureGroup(chat);
    const action = (args[0] || 'ver').toLowerCase();
    let house = getHouse(chat);

    if (action === 'criar') {
      if (house) return reply(`🏠 Este grupo já possui a casa *${house.name}*.`);
      const name = args.slice(1).join(' ').trim();
      if (!name) return reply('🏠 Use *.casa criar <nome da casa>*.');
      if (name.length > 40) return reply('❌ O nome da casa pode ter no máximo 40 caracteres.');
      house = createHouse(chat, name, sender);
      return reply(`🏡 *CASA CRIADA!*\n\nA casa do grupo agora se chama *${house.name}*.\n👥 Todos podem ajudar a evoluí-la!\n\nUse *.casa doar 100* para contribuir com 100 pontos.`);
    }

    if (!house) return reply('🏠 Este grupo ainda não possui uma casa.\n\nUse *.casa criar <nome>* para criar uma.');

    if (action === 'renomear') {
      if (await getPermissionLevel({ sock, chat, jid: sender }) < 3) return reply('❌ Apenas administradores podem renomear a casa.');
      const name = args.slice(1).join(' ').trim();
      if (!name) return reply('🏠 Use *.casa renomear <novo nome>*.');
      if (name.length > 40) return reply('❌ O nome da casa pode ter no máximo 40 caracteres.');
      house = renameHouse(chat, name);
      return reply(`🏡 Nome atualizado!\nA casa agora se chama *${house.name}*.`);
    }

    if (action === 'doar' || action === 'contribuir') {
      const amount = Math.trunc(Number(args[1]));
      if (!Number.isFinite(amount) || amount < 10 || amount > 5000) return reply('🏠 Escolha uma contribuição entre *10 e 5000 🪙*.\nEx.: *.casa doar 100*');
      if (!spendTokens(sender, amount)) return reply(`❌ Você não tem *${amount} 🪙* suficientes.`);
      house = contributeHouse(chat, sender, amount);
      return reply(`🏠 @${sender.split('@')[0]} contribuiu com *${amount} pontos*!\n⭐ Casa: *${house.name}*\n🏆 Nível: *${house.level}*\n📊 Pontos: *${house.points}*`, { mentions: [sender] });
    }

    if (action === 'top' || action === 'ranking') {
      const top = getHouseContributions(chat, 10);
      if (!top.length) return reply('🏠 Ainda não há contribuições.');
      return reply(`╭━━━〔 🏆 CASA — TOP 10 〕━━━╮\n${top.map((row, i) => `${i + 1}. @${row.user_jid.split('@')[0]} — ${row.points} pts`).join('\n')}\n╰━━━━━━━━━━━━━━━━━━━━━━╯`, { mentions: top.map(row => row.user_jid) });
    }

    const progress = house.points % 1000;
    const next = 1000 - progress;
    return reply(`╭━━━〔 🏠 𝐂𝐀𝐒𝐀 𝐃𝐎 𝐆𝐑𝐔𝐏𝐎 〕━━━╮\n┃ 🏡 *${house.name}*\n┃ ⭐ Nível: *${house.level}*\n┃ 🏆 Pontos: *${house.points}*\n┃ 📈 Próximo nível: *${next} pontos*\n┃\n┃ 🛋️ Sala: desbloqueada\n┃ 🎮 Sala de jogos: ${house.level >= 3 ? 'desbloqueada' : '🔒 nível 3'}\n┃ 🌳 Jardim: ${house.level >= 5 ? 'desbloqueado' : '🔒 nível 5'}\n┃ 🏆 Sala de troféus: ${house.level >= 8 ? 'desbloqueada' : '🔒 nível 8'}\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n👥 A casa é construída por todo o grupo!\nUse *.casa doar 100* ou *.casa top*.`);
  }
};
