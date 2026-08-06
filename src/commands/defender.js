export default {
  command: 'defender',
  category: 'fun',
  async run(m, { sock }) {
    const jid = m.key.remoteJid;
    await sock.sendMessage(jid, {
      text: '🛡️ *Modo Defesa ativado!*\n\nVocê se preparou para a próxima ação.\n🎮 Battle Mode • RP fictício'
    }, { quoted: m });
  }
};
