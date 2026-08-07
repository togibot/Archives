import sharp from 'sharp';

function escapeXml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function wrapText(text, maxChars = 20) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    // Divide palavras gigantes para nunca ficarem fora da imagem.
    if (word.length > maxChars) {
      if (line) { lines.push(line); line = ''; }
      for (let i = 0; i < word.length; i += maxChars) lines.push(word.slice(i, i + maxChars));
      continue;
    }
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 7);
}

export default {
  name: 'brat',
  aliases: [],
  category: 'sticker',
  description: 'Cria uma figurinha de texto com fundo branco',
  async execute({ sock, chat, args, message, reply }) {
    const text = args.join(' ').trim();
    if (!text) return reply('✍️ Informe um texto. Ex.: *.brat Togi Bot*');

    const lines = wrapText(text.slice(0, 140));
    const fontSize = lines.length >= 6 ? 34 : lines.length >= 4 ? 42 : lines.length >= 2 ? 50 : 58;
    const lineHeight = fontSize * 1.12;
    const startY = 256 - ((lines.length - 1) * lineHeight) / 2;

    const textSvg = lines.map((line, index) => {
      const y = Math.round(startY + index * lineHeight);
      return `<text x="256" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="DejaVu Sans, sans-serif" font-size="${fontSize}px" font-weight="700" fill="#111111">${escapeXml(line)}</text>`;
    }).join('');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">` +
      `<rect x="0" y="0" width="512" height="512" fill="#ffffff"/>` +
      `<g transform="rotate(-2 256 256)">${textSvg}</g>` +
      `</svg>`;

    const webp = await sharp(Buffer.from(svg, 'utf8'), { density: 144 })
      .resize(512, 512, { fit: 'fill' })
      .webp({ quality: 95 })
      .toBuffer();

    await sock.sendMessage(chat, { sticker: webp }, { quoted: message });
  }
};
