import sharp from 'sharp';

export default {
  name: 'brat',
  aliases: [],
  category: 'sticker',
  description: 'Cria uma figurinha de texto no estilo Brat',
  async execute({ sock, chat, args, message, reply }) {
    const text = args.join(' ').trim();
    if (!text) return reply('✍️ Informe um texto. Ex.: *.brat Togi Bot*');
    const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 80);
    const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#b7ff4a"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="54" fill="#111" transform="rotate(-4 256 256)">${safe}</text></svg>`;
    const webp = await sharp(Buffer.from(svg)).webp({ quality: 82 }).toBuffer();
    await sock.sendMessage(chat, { sticker: webp }, { quoted: message });
  }
};
