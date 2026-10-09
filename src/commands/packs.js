import { ensureUser } from '../database/index.js';
import { getName } from '../utils/message.js';
import { applyStickerMetadata } from '../services/stickers.js';
import { getStickerMedia, mediaToStickerWebp, stickerCoverWebp } from '../services/sticker-media.js';
import {
  createPack,
  listPacks,
  resolvePack,
  setActivePack,
  updatePackMeta,
  setPackCover,
  addSticker,
  getStickers,
  removeSticker,
  renamePack,
  deletePack,
  getStickerPackLimit
} from '../services/sticker-packs.js';
import { sendNativeStickerPack } from '../services/sticker-pack-native.js';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function clean(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function help() {
  return `╭━━━〔 📦 *TOGI PACKS V3* 〕━━━╮
┃ .packs — seus packs
┃ .packs criar <nome>
┃ .packs usar <nome> — deixa ativo
┃ .packs add [nome] — responde mídia
┃ .packs capa [nome] — responde mídia
┃ .packs autor <autor>
┃ .packs descricao <texto>
┃ .packs ver [nome]
┃ .packs enviar [nome] — pack nativo
┃ .packs sequencia [nome] — FIGs separadas
┃ .packs remover [nome] <número>
┃ .packs renomear <antigo> | <novo>
┃ .packs apagar <nome>
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

💡 Depois de criar/usar um pack, você pode omitir o nome.
🖼️ *add* aceita imagem, vídeo, GIF ou FIG.
📦 Limite: ${getStickerPackLimit()} FIGs por pack.`;
}

async function getGroupName(sock, chat) {
  if (!chat?.endsWith?.('@g.us')) return 'Privado';
  try {
    return (await sock.groupMetadata(chat))?.subject || 'Grupo';
  } catch {
    return 'Grupo';
  }
}

function splitMetaArgs(rest) {
  const value = rest.join(' ').trim();
  if (!value.includes('|')) return { packName: '', value };
  const [packName, ...parts] = value.split('|');
  return { packName: clean(packName), value: clean(parts.join('|')) };
}

function packOrError(sender, name) {
  const pack = resolvePack(sender, name);
  return pack || null;
}

export default {
  name: 'packs',
  aliases: ['packfig', 'figpacks'],
  category: 'sticker',
  description: 'Cria, organiza e envia packs nativos de figurinhas.',
  async execute({ sock, chat, message, sender, args, reply }) {
    const action = String(args[0] || '').toLowerCase();
    const rest = args.slice(1);

    if (!action || action === 'ajuda' || action === 'help' || action === 'lista' || action === 'list') {
      const packs = listPacks(sender);
      if (!packs.length) return reply(`${help()}\n\n📭 Você ainda não criou nenhum pack.`);

      const lines = packs.map((pack, index) =>
        `${index + 1}. ${pack.is_active ? '🟣' : '⚪'} *${pack.name}* — ${pack.count}/${getStickerPackLimit()} FIGs`
      );
      return reply(`${help()}\n\n📚 *SEUS PACKS*\n${lines.join('\n')}\n\n🟣 = pack ativo`);
    }

    if (['criar', 'create', 'novo'].includes(action)) {
      const name = rest.join(' ');
      const user = ensureUser(sender, getName(message));
      const publisher = clean(user?.sticker_nick || message?.pushName || 'Togi Bot');
      const result = createPack(sender, name, {
        publisher,
        description: 'Pack criado no Togi Bot'
      });

      if (result?.error === 'name') return reply('❌ Informe o nome. Ex.: *.packs criar Memes LZ*');
      if (result?.error === 'length') return reply('❌ O nome pode ter no máximo 40 caracteres.');
      if (result?.error === 'exists') return reply('⚠️ Você já possui um pack com esse nome. Use *.packs usar <nome>*.');

      return reply(`✅ Pack *${result.name}* criado e ativado.\n\nAgora responda uma imagem/FIG com *.packs add*.`);
    }

    if (['usar', 'use', 'ativar', 'active'].includes(action)) {
      const name = rest.join(' ').trim();
      if (!name) return reply('❌ Use: *.packs usar <nome>*');
      const result = setActivePack(sender, name);
      if (result?.error === 'not_found') return reply('❌ Pack não encontrado.');
      return reply(`🟣 Pack ativo: *${result.name}*\nAgora *.packs add*, *.packs ver* e *.packs enviar* usam ele automaticamente.`);
    }

    if (['add', 'adicionar'].includes(action)) {
      const pack = packOrError(sender, rest.join(' '));
      if (!pack) return reply('❌ Pack não encontrado. Crie um com *.packs criar <nome>* ou ative um com *.packs usar <nome>*.');

      const source = getStickerMedia(message);
      if (!source) return reply('🖼️ Responda uma *imagem, vídeo, GIF ou figurinha* com *.packs add*.');

      try {
        const baseWebp = await mediaToStickerWebp(source);
        const requester = message?.pushName || sender?.split('@')[0] || 'Usuário';
        const finalWebp = await applyStickerMetadata(
          baseWebp,
          pack.name,
          requester,
          await getGroupName(sock, chat),
          {
            mode: 'pack',
            publisher: pack.publisher,
            description: pack.description,
            packId: `com.togi.pack.${pack.id}`
          }
        );

        const result = addSticker(sender, pack.name, finalWebp);
        if (result?.error === 'limit') return reply(`❌ *${pack.name}* já chegou ao limite de ${getStickerPackLimit()} FIGs.`);
        if (result?.error === 'duplicate') return reply(`⚠️ Essa FIG já está no pack *${pack.name}* na posição #${result.position}.`);
        if (result?.error) return reply('❌ Não consegui adicionar essa FIG ao pack.');

        return reply(`✅ Adicionada em *${pack.name}* • #${result.position} • ${result.pack.count}/${getStickerPackLimit()}`);
      } catch (error) {
        return reply(`❌ Não consegui adicionar a FIG.\n${error?.message || 'Erro desconhecido'}`);
      }
    }

    if (['capa', 'cover'].includes(action)) {
      const pack = packOrError(sender, rest.join(' '));
      if (!pack) return reply('❌ Pack não encontrado ou nenhum pack está ativo.');
      const source = getStickerMedia(message);
      if (!source) return reply('🖼️ Responda uma imagem ou FIG com *.packs capa*.');

      try {
        const webp = await mediaToStickerWebp(source);
        const cover = await stickerCoverWebp(webp);
        const result = setPackCover(sender, pack.name, cover);
        if (result?.error) return reply('❌ Não consegui definir a capa desse pack.');
        return reply(`🖼️ Capa de *${pack.name}* atualizada.`);
      } catch (error) {
        return reply(`❌ Não consegui preparar a capa.\n${error?.message || 'Erro desconhecido'}`);
      }
    }

    if (['autor', 'author', 'publisher'].includes(action)) {
      const parsed = splitMetaArgs(rest);
      if (!parsed.value) return reply('❌ Use *.packs autor <autor>* no pack ativo\nou *.packs autor <pack> | <autor>*.');
      const result = updatePackMeta(sender, parsed.packName, { publisher: parsed.value });
      if (result?.error === 'not_found') return reply('❌ Pack não encontrado ou nenhum pack está ativo.');
      if (result?.error === 'publisher_length') return reply('❌ O autor pode ter no máximo 50 caracteres.');
      if (result?.error) return reply('❌ Autor inválido.');
      return reply(`🏷️ Autor de *${result.name}*: *${result.publisher}*`);
    }

    if (['descricao', 'descrição', 'desc'].includes(action)) {
      const parsed = splitMetaArgs(rest);
      const result = updatePackMeta(sender, parsed.packName, { description: parsed.value });
      if (result?.error === 'not_found') return reply('❌ Pack não encontrado ou nenhum pack está ativo.');
      if (result?.error === 'description_length') return reply('❌ A descrição pode ter no máximo 120 caracteres.');
      return reply(`📝 Descrição de *${result.name}* atualizada.`);
    }

    if (['ver', 'view', 'info'].includes(action)) {
      const pack = packOrError(sender, rest.join(' '));
      if (!pack) return reply('❌ Pack não encontrado ou nenhum pack está ativo.');
      const items = getStickers(sender, pack.name) || [];
      const preview = items.slice(0, 20).map(item => `┃ ${item.position}. FIG`).join('\n');
      const remaining = items.length > 20 ? `\n┃ … +${items.length - 20} FIGs` : '';

      return reply(`╭━━〔 📦 *${pack.name}* 〕━━╮
┃ ${pack.is_active ? '🟣 Ativo' : '⚪ Inativo'}
┃ 🏷️ Autor: ${clean(pack.publisher, 'Togi Bot')}
┃ 📝 ${clean(pack.description, 'Sem descrição')}
┃ 🖼️ Capa: ${pack.cover ? 'personalizada' : 'automática'}
┃ 🎨 FIGs: *${items.length}/${getStickerPackLimit()}*
${preview || '┃ 📭 Pack vazio'}${remaining}
╰━━━━━━━━━━━━━━━━━━━━╯`);
    }

    if (['enviar', 'send'].includes(action)) {
      const pack = packOrError(sender, rest.join(' '));
      if (!pack) return reply('❌ Pack não encontrado ou nenhum pack está ativo.');
      const items = getStickers(sender, pack.name) || [];
      if (!items.length) return reply('📭 Esse pack está vazio.');

      await reply(`📦 Preparando *${pack.name}* como pack nativo…`);
      try {
        const sent = await sendNativeStickerPack(sock, chat, pack, items);
        return reply(`✅ *${pack.name}* enviado como pack nativo${sent.parts > 1 ? ` em ${sent.parts} partes` : ''}.`);
      } catch (error) {
        console.error('[TOGI STICKER PACK NATIVE]', error);
        return reply(`⚠️ O WhatsApp recusou o pack nativo agora. Suas FIGs continuam salvas.\n\nUse *.packs sequencia${rest.length ? ` ${rest.join(' ')}` : ''}* como fallback.\n${error?.message || ''}`.trim());
      }
    }

    if (['sequencia', 'sequence', 'individual'].includes(action)) {
      const pack = packOrError(sender, rest.join(' '));
      if (!pack) return reply('❌ Pack não encontrado ou nenhum pack está ativo.');
      const items = getStickers(sender, pack.name) || [];
      if (!items.length) return reply('📭 Esse pack está vazio.');

      await reply(`🎨 Enviando *${pack.name}* em sequência • ${items.length} FIGs`);
      try {
        for (const item of items) {
          await sock.sendMessage(chat, { sticker: Buffer.from(item.sticker) });
          await wait(160);
        }
      } catch (error) {
        return reply(`❌ O envio em sequência falhou.\n${error?.message || 'Erro desconhecido'}`);
      }
      return;
    }

    if (['remover', 'remove', 'del'].includes(action)) {
      const position = Number(rest.at(-1));
      const packName = rest.slice(0, -1).join(' ').trim();
      if (!Number.isInteger(position) || position < 1) return reply('❌ Use *.packs remover <número>* ou *.packs remover <nome> <número>*.');
      const result = removeSticker(sender, packName, position);
      if (result?.error === 'not_found') return reply('❌ Pack não encontrado ou nenhum pack está ativo.');
      if (result?.error === 'item') return reply('❌ Não existe FIG nessa posição.');
      return reply(`🗑️ FIG #${position} removida de *${result.pack.name}*.`);
    }

    if (['renomear', 'rename'].includes(action)) {
      const value = rest.join(' ');
      const separator = value.split('|');
      if (separator.length !== 2) return reply('❌ Use: *.packs renomear <antigo> | <novo>*');
      const result = renamePack(sender, separator[0], separator.slice(1).join('|'));
      if (result?.error === 'not_found') return reply('❌ Pack não encontrado.');
      if (result?.error === 'name') return reply('❌ Informe o novo nome.');
      if (result?.error === 'length') return reply('❌ O novo nome pode ter no máximo 40 caracteres.');
      if (result?.error === 'exists') return reply('⚠️ Você já possui um pack com esse nome.');
      return reply(`✅ Pack renomeado para *${result.name}*.`);
    }

    if (['apagar', 'delete', 'deletar'].includes(action)) {
      const name = rest.join(' ').trim();
      if (!name) return reply('❌ Informe o nome do pack que deseja apagar.');
      if (!deletePack(sender, name)) return reply('❌ Pack não encontrado.');
      return reply(`🗑️ Pack *${name}* apagado com todas as FIGs.`);
    }

    return reply(help());
  }
};
