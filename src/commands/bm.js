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

function getTarget(m) {
  return m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
    || m.message?.extendedTextMessage?.contextInfo?.participant;
}

export default {
  command: 'tapa',
  aliases: ['chute', 'soco', 'empurrar'],
  category: 'fun',
  async run(m, { sock, command }) {
    const jid = m.key.remoteJid;
    const target = getTarget(m);
    const action = actions[command];

    if (!target || !action) {
      await sock.sendMessage(jid, {
        text: `⚔️ Use *.${command} @pessoa* para fazer uma ação de Battle Mode!`
      }, { quoted: m });
      return;
    }

    const actor = m.key.participant || m.key.remoteJid;
    await sock.sendMessage(jid, {
      text: `${action.emoji} @${actor.split('@')[0]} ${action.verb} @${target.split('@')[0]}!\n\n🎮 *Battle Mode* • RP fictício`,
      mentions: [actor, target]
    }, { quoted: m });
  }
};
