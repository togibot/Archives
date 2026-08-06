const actions = {
  tapa: {
    emoji: '🫳',
    verb: 'deu um tapa de brincadeira em'
  },
  chute: {
    emoji: '🦵',
    verb: 'deu um chute de brincadeira em'
  },
  soco: {
    emoji: '👊',
    verb: 'mandou um soco de brincadeira em'
  },
  empurrar: {
    emoji: '💨',
    verb: 'empurrou de brincadeira'
  }
};

function getTarget(message) {
  const context = message?.message?.extendedTextMessage?.contextInfo;
  return context?.mentionedJid?.[0] || context?.participant;
}

export default {
  name: 'tapa',
  aliases: ['chute', 'soco', 'empurrar'],
  category: 'fun',
  description: 'Ações fictícias de Battle Mode',
  async execute({ message, sock, commandName, reply }) {
    const jid = message.key.remoteJid;
    const target = getTarget(message);
    const action = actions[String(commandName || 'tapa').toLowerCase()];

    if (!target || !action) {
      return reply(`⚔️ Use *.${commandName || 'tapa'} @pessoa* para fazer uma ação de Battle Mode!`);
    }

    const actor = message.key.participant || message.key.remoteJid;
    const actorNumber = String(actor).split('@')[0];
    const targetNumber = String(target).split('@')[0];

    await sock.sendMessage(jid, {
      text: `${action.emoji} @${actorNumber} ${action.verb} @${targetNumber}!\n\n⚔️ *BATTLE MODE*\n🎮 RP fictício • sem dano real`,
      mentions: [actor, target]
    }, { quoted: message });
  }
};
