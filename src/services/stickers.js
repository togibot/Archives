import WebP from 'node-webpmux';

const DEFAULT_NAME = '💜✨ 𝐅𝐢𝐠 𝐝𝐨 𝐓𝐨𝐠𝐢 ✨💜';
const OWNER = 'LZ';

function buildExif(packName, requester, groupName = 'Privado') {
  const payload = JSON.stringify({
    'sticker-pack-id': 'com.togi.sticker',
    'sticker-pack-name': packName,
    'sticker-pack-publisher': `${requester} • ${groupName} • ${OWNER}`,
    emojis: ['💜', '✨']
  });

  const json = Buffer.from(payload, 'utf8');

  // EXIF container compatible with WhatsApp stickers.
  // Keep this exact TIFF structure; malformed offsets can make WhatsApp
  // reject an otherwise valid WebP with "não foi possível abrir a FIG".
  const header = Buffer.from([
    0x49, 0x49, 0x2A, 0x00,
    0x08, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x41, 0x57, 0x07, 0x00,
    0x00, 0x00, 0x00,
    0x00, 0x16, 0x00, 0x00, 0x00
  ]);

  const exif = Buffer.concat([header, json]);
  exif.writeUIntLE(json.length, 14, 4);
  return exif;
}

export async function applyStickerMetadata(webpBuffer, packName, requester, groupName) {
  const image = new WebP.Image();
  await image.load(webpBuffer);
  image.exif = buildExif(
    packName || DEFAULT_NAME,
    requester || 'Usuário',
    groupName || 'Privado'
  );
  return image.save(null);
}

export function getDefaultStickerName() {
  return DEFAULT_NAME;
}
