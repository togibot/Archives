import sharp from 'sharp';

await sharp({
  create: {
    width: 2,
    height: 2,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  }
}).webp().toBuffer();

const baileys = await import('@whiskeysockets/baileys');

if (typeof baileys.default !== 'function' && typeof baileys.makeWASocket !== 'function') {
  throw new Error('Baileys não exportou makeWASocket.');
}

if (!baileys.proto?.Message?.StickerPackMessage) {
  throw new Error('Baileys instalado não possui StickerPackMessage.');
}

await import('../src/services/sticker-pack-native.js');
await import('../src/commands/packs.js');

console.log('✅ Runtime do Togi OK: Sharp + Baileys + StickerPack carregaram.');
