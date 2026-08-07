export default {
  command: 'encontro',
  aliases: ['date'],
  category: 'social',
  async run(m, { sock }) {
    const jid = m.key.remoteJid;
    const actor = m.key.participant || jid;
    const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (!target || target === actor) {
      await sock.sendMessage(jid, { text: '🌟 Use *.encontro @pessoa* para criar um encontro virtual divertido!' }, { quoted: m });
      return;
    }

    const places = [
      '🍦 uma sorveteria',
      '🎬 o cinema',
      '🌳 um parque',
      '🎮 uma arena de jogos',
      '🍕 uma pizzaria',
      '🎡 um parque de diversões'
    ];
    const place = places[Math.floor(Math.random() * places.length)];

    await sock.sendMessage(jid, {
      text: `🌟 ENCONTRO VIRTUAL\n\n👤 @${actor.split('@')[0]} + @${target.split('@')[0]}\n📍 Destino: ${place}\n\n✨ Boa diversão para vocês! 💜`,
      mentions: [actor, target]
    }, { quoted: m });
  }
};
