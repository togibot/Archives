export default {
  command: 'esquivar',
  category: 'fun',
  async run(m, { sock }) {
    const jid = m.key.remoteJid;
    const sucesso = Math.random() >= 0.35;
    await sock.sendMessage(jid, {
      text: sucesso
        ? '💨 *Esquiva perfeita!* Você desviou da ação no último segundo.\n\n🎮 Battle Mode • RP fictício'
        : '😵 *Quase!* A esquiva falhou dessa vez.\n\n🎮 Battle Mode • RP fictício'
    }, { quoted: m });
  }
};
