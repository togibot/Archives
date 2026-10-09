import { createCipheriv, createHash, createHmac, hkdfSync, randomBytes } from 'node:crypto';
import { proto, generateMessageIDV2 } from '@whiskeysockets/baileys';
import { zipSync } from 'fflate';
import sharp from 'sharp';

const MAX_NATIVE_STICKERS = Math.max(3, Math.min(30, Number(process.env.STICKER_PACK_NATIVE_BATCH || 30)));
const MAX_NATIVE_PACK_BYTES = Number(process.env.STICKER_PACK_NATIVE_MAX_BYTES || 25 * 1024 * 1024);
const ORIGIN = 'https://web.whatsapp.com';

function clean(value, fallback = '') {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest();
}

function isAnimatedWebP(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 21) return false;
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return false;

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (type === 'VP8X' && offset + 9 <= buffer.length) return (buffer[offset + 8] & 0x02) !== 0;
    offset += 8 + size + (size % 2);
  }
  return false;
}

function deriveMediaKeys(mediaKey, label) {
  const info = Buffer.from(`WhatsApp ${label} Keys`, 'utf8');
  const expanded = Buffer.from(hkdfSync('sha256', mediaKey, Buffer.alloc(0), info, 112));
  return {
    iv: expanded.subarray(0, 16),
    cipherKey: expanded.subarray(16, 48),
    macKey: expanded.subarray(48, 80)
  };
}

function encryptMedia(plain, label, mediaKey = randomBytes(32)) {
  const { iv, cipherKey, macKey } = deriveMediaKeys(mediaKey, label);
  const cipher = createCipheriv('aes-256-cbc', cipherKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  const mac = createHmac('sha256', macKey)
    .update(iv)
    .update(ciphertext)
    .digest()
    .subarray(0, 10);
  const encrypted = Buffer.concat([ciphertext, mac]);

  return {
    mediaKey,
    encrypted,
    fileLength: plain.length,
    fileSha256: sha256(plain),
    fileEncSha256: sha256(encrypted)
  };
}

function uploadToken(hash) {
  return encodeURIComponent(
    hash.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  );
}

async function uploadEncrypted(sock, encrypted, fileEncSha256, mediaType) {
  if (typeof sock?.refreshMediaConn !== 'function') {
    throw new Error('Esta versão do socket não expõe refreshMediaConn.');
  }

  const mediaPath = mediaType === 'thumbnail-sticker-pack'
    ? '/mms/thumbnail-sticker-pack'
    : '/mms/sticker-pack';
  const token = uploadToken(fileEncSha256);
  let lastError = null;

  for (const force of [false, true]) {
    let mediaConn;
    try {
      mediaConn = await sock.refreshMediaConn(force);
    } catch (error) {
      lastError = error;
      continue;
    }

    for (const host of mediaConn?.hosts || []) {
      if (!host?.hostname) continue;
      if (Number(host.maxContentLengthBytes || 0) > 0 && encrypted.length > Number(host.maxContentLengthBytes)) continue;

      const url = `https://${host.hostname}${mediaPath}/${token}?auth=${encodeURIComponent(mediaConn.auth || '')}&token=${token}`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            Origin: ORIGIN
          },
          body: encrypted,
          redirect: 'manual'
        });

        const raw = await response.text();
        let data = {};
        try { data = JSON.parse(raw); } catch {}

        const directPath = data?.direct_path || data?.directPath;
        if (response.ok && directPath) return { directPath, url: data?.url || '' };
        lastError = new Error(`Upload ${mediaType} recusado (HTTP ${response.status}).`);
      } catch (error) {
        lastError = error;
      }
    }
  }

  throw new Error(`Falha no upload do pack nativo: ${lastError?.message || 'nenhum host aceitou a mídia'}`);
}

async function makeStaticCover(buffer) {
  return sharp(buffer, { animated: false })
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .webp({ quality: 88 })
    .toBuffer();
}

async function buildNativePack(sock, pack, items, part, totalParts) {
  if (!items.length) throw new Error('O pack está vazio.');

  const baseName = clean(pack?.name, 'Togi Pack');
  const name = totalParts > 1 ? `${baseName} • ${part}/${totalParts}` : baseName;
  const publisher = clean(pack?.publisher, 'Togi Bot');
  const description = clean(pack?.description, `Pack ${baseName} criado no Togi Bot`);
  const stickerPackId = `togi.${pack?.id || 'pack'}.${part}.${Date.now().toString(36)}`;
  const entries = {};
  const stickers = [];

  for (const item of items) {
    const buffer = Buffer.from(item.sticker);
    const fileName = `${sha256(buffer).toString('base64url')}.webp`;
    if (!entries[fileName]) entries[fileName] = new Uint8Array(buffer);
    stickers.push({
      fileName,
      isAnimated: isAnimatedWebP(buffer),
      emojis: ['✨'],
      accessibilityLabel: `${baseName} #${item.position}`,
      isLottie: false,
      mimetype: 'image/webp'
    });
  }

  const rawCover = pack?.cover ? Buffer.from(pack.cover) : Buffer.from(items[0].sticker);
  const cover = await makeStaticCover(rawCover);
  const trayIconFileName = `${stickerPackId}.webp`;
  entries[trayIconFileName] = new Uint8Array(cover);

  const zipBuffer = Buffer.from(zipSync(entries, { level: 0 }));
  if (zipBuffer.length > MAX_NATIVE_PACK_BYTES) {
    throw new Error('Este bloco do pack ficou grande demais para envio nativo. Reduza a quantidade de FIGs.');
  }

  const packEncrypted = encryptMedia(zipBuffer, 'Sticker Pack');
  const packUpload = await uploadEncrypted(
    sock,
    packEncrypted.encrypted,
    packEncrypted.fileEncSha256,
    'sticker-pack'
  );

  const thumbnail = await sharp(cover)
    .resize(252, 252, { fit: 'cover' })
    .jpeg({ quality: 82 })
    .toBuffer();
  const thumbEncrypted = encryptMedia(thumbnail, 'Sticker Pack Thumbnail', packEncrypted.mediaKey);
  const thumbUpload = await uploadEncrypted(
    sock,
    thumbEncrypted.encrypted,
    thumbEncrypted.fileEncSha256,
    'thumbnail-sticker-pack'
  );

  return proto.Message.StickerPackMessage.fromObject({
    stickerPackId,
    name,
    publisher,
    stickers,
    fileLength: packEncrypted.fileLength,
    fileSha256: packEncrypted.fileSha256,
    fileEncSha256: packEncrypted.fileEncSha256,
    mediaKey: packEncrypted.mediaKey,
    directPath: packUpload.directPath,
    caption: `${name} • ${stickers.length} figurinha${stickers.length === 1 ? '' : 's'}`,
    packDescription: description,
    mediaKeyTimestamp: Math.floor(Date.now() / 1000),
    trayIconFileName,
    thumbnailDirectPath: thumbUpload.directPath,
    thumbnailSha256: thumbEncrypted.fileSha256,
    thumbnailEncSha256: thumbEncrypted.fileEncSha256,
    thumbnailHeight: 252,
    thumbnailWidth: 252,
    imageDataHash: sha256(thumbnail).toString('base64'),
    stickerPackSize: zipBuffer.length,
    stickerPackOrigin: proto.Message.StickerPackMessage.StickerPackOrigin.USER_CREATED
  });
}

export async function sendNativeStickerPack(sock, chat, pack, items) {
  if (!sock?.relayMessage) throw new Error('Socket sem suporte a relayMessage.');
  if (!Array.isArray(items) || !items.length) throw new Error('O pack está vazio.');

  const chunks = [];
  for (let i = 0; i < items.length; i += MAX_NATIVE_STICKERS) {
    chunks.push(items.slice(i, i + MAX_NATIVE_STICKERS));
  }

  const ids = [];
  for (let i = 0; i < chunks.length; i++) {
    const stickerPackMessage = await buildNativePack(sock, pack, chunks[i], i + 1, chunks.length);
    const messageId = generateMessageIDV2(sock.user?.id);

    await sock.relayMessage(
      chat,
      { stickerPackMessage },
      {
        messageId,
        additionalAttributes: {
          type: 'media',
          mediatype: 'sticker_pack'
        }
      }
    );
    ids.push(messageId);
  }

  return { parts: chunks.length, messageIds: ids };
}
