import { createCipheriv, createHash, createHmac, hkdfSync, randomBytes } from 'node:crypto';
import { proto } from '@whiskeysockets/baileys';
import sharp from 'sharp';

const MAX_STICKERS = 60;
const MAX_STICKER_BYTES = 1024 * 1024;
const MAX_PACK_BYTES = 25 * 1024 * 1024;
const ORIGIN = 'https://web.whatsapp.com';

function clean(value, fallback = '') {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest();
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function zipDosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const time =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((Math.floor(date.getSeconds() / 2)) & 0x1f);
  const day =
    (((year - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (date.getDate() & 0x1f);

  return { time, day };
}

function createStoredZip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  const { time, day } = zipDosDateTime();

  for (const [name, rawValue] of Object.entries(entries)) {
    const raw = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    const data = Buffer.from(raw);
    const fileName = Buffer.from(name, 'utf8');
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(fileName.length, 26);
    local.writeUInt16LE(0, 28);

    locals.push(local, fileName, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(day, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(fileName.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);

    centrals.push(central, fileName);
    offset += local.length + fileName.length + data.length;
  }

  const centralBuffer = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  const count = Math.floor(centrals.length / 2);

  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(count, 8);
  end.writeUInt16LE(count, 10);
  end.writeUInt32LE(centralBuffer.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...locals, centralBuffer, end]);
}


function isWebP(buffer) {
  return Buffer.isBuffer(buffer) &&
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP';
}

function isAnimatedWebP(buffer) {
  if (!isWebP(buffer)) return false;

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);

    if (type === 'VP8X' && offset + 9 <= buffer.length && (buffer[offset + 8] & 0x02) !== 0) {
      return true;
    }
    if (type === 'ANIM' || type === 'ANMF') return true;

    offset += 8 + size + (size % 2);
  }

  return false;
}

async function normalizeSticker(input) {
  let buffer = Buffer.from(input);
  const animated = isAnimatedWebP(buffer);

  let metadata = null;
  try {
    metadata = await sharp(buffer, animated ? { animated: true } : undefined).metadata();
  } catch {}

  const width = Number(metadata?.width || 0);
  const frameHeight = Number(metadata?.pageHeight || metadata?.height || 0);
  const alreadyValid = isWebP(buffer) &&
    width === 512 &&
    frameHeight === 512 &&
    buffer.length <= MAX_STICKER_BYTES;

  if (alreadyValid) {
    return { buffer, isAnimated: animated };
  }

  const qualities = [82, 72, 62, 52, 42];
  let last = null;

  for (const quality of qualities) {
    last = await sharp(buffer, animated ? { animated: true } : undefined)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality })
      .toBuffer();

    if (last.length <= MAX_STICKER_BYTES) {
      return {
        buffer: last,
        isAnimated: isAnimatedWebP(last)
      };
    }
  }

  throw new Error('Uma FIG do pack ficou acima de 1 MB mesmo após otimização.');
}

async function makeTrayIcon(input) {
  return sharp(input, { animated: false })
    .resize(96, 96, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();
}

async function makeThumbnail(input) {
  return sharp(input, { animated: false })
    .resize(252, 252, {
      fit: 'cover'
    })
    .jpeg({ quality: 82 })
    .toBuffer();
}

function deriveMediaKeys(mediaKey, label) {
  const expanded = Buffer.from(
    hkdfSync(
      'sha256',
      mediaKey,
      Buffer.alloc(0),
      Buffer.from(`WhatsApp ${label} Keys`, 'utf8'),
      112
    )
  );

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
    hash.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '')
  );
}

async function uploadEncrypted(sock, encrypted, fileEncSha256, mediaType) {
  if (typeof sock?.refreshMediaConn !== 'function') {
    throw new Error('Socket sem refreshMediaConn.');
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
      if (Number(host.maxContentLengthBytes || 0) > 0 &&
          encrypted.length > Number(host.maxContentLengthBytes)) {
        continue;
      }

      const url = `https://${host.hostname}${mediaPath}/${token}?auth=${encodeURIComponent(mediaConn.auth || '')}&token=${token}`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            Origin: ORIGIN
          },
          body: encrypted,
          redirect: 'manual',
          signal: AbortSignal.timeout(30000)
        });

        const raw = await response.text();
        let data = {};
        try { data = JSON.parse(raw); } catch {}

        const directPath = data?.direct_path || data?.directPath;
        if (response.ok && directPath) {
          return { directPath, url: data?.url || '' };
        }

        lastError = new Error(
          `Upload ${mediaType} recusado (HTTP ${response.status}): ${raw.slice(0, 180)}`
        );
      } catch (error) {
        lastError = error;
      }
    }
  }

  throw new Error(
    `Falha no upload do pack nativo: ${lastError?.message || 'nenhum host aceitou a mídia'}`
  );
}

function safePackId(value, part) {
  const raw = clean(value, `togi-${Date.now()}`)
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .slice(0, 80);
  return `${raw || 'togi-pack'}-${part}`;
}

async function buildNativePack(sock, pack, items, part, totalParts) {
  if (!items.length) throw new Error('O pack está vazio.');

  const baseName = clean(pack?.name, 'Togi Pack');
  const name = totalParts > 1 ? `${baseName} • ${part}/${totalParts}` : baseName;
  const publisher = clean(pack?.publisher || pack?.author, 'Togi Bot');
  const description = clean(pack?.description, 'Pack enviado pelo Togi Bot');
  const stickerPackId = safePackId(pack?.id || pack?.packId || baseName, part);

  const zipEntries = {};
  const stickers = [];
  let firstSticker = null;

  for (let index = 0; index < items.length; index++) {
    const source = items[index]?.sticker ?? items[index]?.data ?? items[index];
    if (!source) continue;

    const normalized = await normalizeSticker(Buffer.from(source));
    if (!firstSticker) firstSticker = normalized.buffer;

    const fileName = `${sha256(normalized.buffer).toString('base64').replace(/\//g, '-')}.webp`;
    if (!zipEntries[fileName]) {
      zipEntries[fileName] = [new Uint8Array(normalized.buffer), { level: 0 }];
    }

    stickers.push({
      fileName,
      mimetype: 'image/webp',
      isAnimated: normalized.isAnimated,
      isLottie: false,
      emojis: Array.isArray(items[index]?.emojis) ? items[index].emojis : ['✨'],
      accessibilityLabel: clean(items[index]?.accessibilityLabel, `${baseName} #${index + 1}`)
    });
  }

  if (!stickers.length || !firstSticker) {
    throw new Error('O pack não possui FIGs válidas.');
  }

  const rawCover = pack?.cover ? Buffer.from(pack.cover) : firstSticker;
  const trayIcon = await makeTrayIcon(rawCover);
  const trayIconFileName = `${stickerPackId}.png`;
  zipEntries[trayIconFileName] = [new Uint8Array(trayIcon), { level: 0 }];

  const zipBuffer = createStoredZip(zipEntries);
  if (zipBuffer.length > MAX_PACK_BYTES) {
    throw new Error('O pack ficou grande demais para o envio nativo.');
  }

  const packEncrypted = encryptMedia(zipBuffer, 'Sticker Pack');
  const packUpload = await uploadEncrypted(
    sock,
    packEncrypted.encrypted,
    packEncrypted.fileEncSha256,
    'sticker-pack'
  );

  const thumbnail = await makeThumbnail(rawCover);
  const thumbEncrypted = encryptMedia(
    thumbnail,
    'Sticker Pack Thumbnail',
    packEncrypted.mediaKey
  );
  const thumbUpload = await uploadEncrypted(
    sock,
    thumbEncrypted.encrypted,
    thumbEncrypted.fileEncSha256,
    'thumbnail-sticker-pack'
  );

  return proto.Message.StickerPackMessage.fromObject({
    name,
    publisher,
    stickerPackId,
    packDescription: description,
    stickerPackOrigin: proto.Message.StickerPackMessage.StickerPackOrigin.USER_CREATED,
    stickerPackSize: zipBuffer.length,
    stickers,

    fileSha256: packEncrypted.fileSha256,
    fileEncSha256: packEncrypted.fileEncSha256,
    mediaKey: packEncrypted.mediaKey,
    directPath: packUpload.directPath,
    fileLength: packEncrypted.fileLength,
    mediaKeyTimestamp: Math.floor(Date.now() / 1000),

    trayIconFileName,

    thumbnailDirectPath: thumbUpload.directPath,
    thumbnailSha256: thumbEncrypted.fileSha256,
    thumbnailEncSha256: thumbEncrypted.fileEncSha256,
    thumbnailHeight: 252,
    thumbnailWidth: 252,
    imageDataHash: sha256(thumbnail).toString('base64')
  });
}

export async function sendNativeStickerPack(sock, chat, pack, items) {
  if (!sock?.relayMessage) throw new Error('Socket sem suporte a relayMessage.');
  if (!Array.isArray(items) || !items.length) throw new Error('O pack está vazio.');

  const chunks = [];
  for (let i = 0; i < items.length; i += MAX_STICKERS) {
    chunks.push(items.slice(i, i + MAX_STICKERS));
  }

  const messageIds = [];

  for (let index = 0; index < chunks.length; index++) {
    const stickerPackMessage = await buildNativePack(
      sock,
      pack,
      chunks[index],
      index + 1,
      chunks.length
    );

    const messageId = await sock.relayMessage(
      chat,
      { stickerPackMessage },
      {}
    );

    if (messageId) messageIds.push(messageId);
  }

  return {
    parts: chunks.length,
    messageIds
  };
}
