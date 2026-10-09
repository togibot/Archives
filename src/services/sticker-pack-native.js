const MAX_NATIVE_STICKERS = 60;

function clean(value, fallback = '') {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text || fallback;
}

function splitIntoChunks(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function sendNativeStickerPack(sock, chat, pack, items) {
  if (!sock?.sendMessage) throw new Error('Socket sem suporte a sendMessage.');
  if (!Array.isArray(items) || !items.length) throw new Error('O pack está vazio.');

  const chunks = splitIntoChunks(items, MAX_NATIVE_STICKERS);
  const messageIds = [];

  for (let index = 0; index < chunks.length; index++) {
    const chunk = chunks[index];
    const baseName = clean(pack?.name, 'Togi Pack');
    const name = chunks.length > 1
      ? `${baseName} • ${index + 1}/${chunks.length}`
      : baseName;

    const cover = pack?.cover
      ? Buffer.from(pack.cover)
      : Buffer.from(chunk[0].sticker);

    const result = await sock.sendMessage(chat, {
      stickerPack: {
        name,
        publisher: clean(pack?.publisher, 'Togi Bot'),
        description: clean(pack?.description, `Pack ${baseName} criado no Togi Bot`),
        packId: `togi-${pack?.id || 'pack'}-${index + 1}`,
        cover,
        stickers: chunk.map((item, itemIndex) => ({
          data: Buffer.from(item.sticker),
          emojis: ['✨'],
          accessibilityLabel: `${baseName} #${item?.position || itemIndex + 1}`
        }))
      }
    });

    if (result?.key?.id) messageIds.push(result.key.id);
  }

  return {
    parts: chunks.length,
    messageIds
  };
}
