import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { createPack, listPacks, getPack, addSticker, getStickers, removeSticker, renamePack, deletePack } from '../services/sticker-packs.js';

async function toBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function unwrap(value) {
  let current = value;
  for (let i = 0; i < 5 && current; i++) {
    if (current.ephemeralMessage?.message) current = current.ephemeralMessage.message;
    else if (current.viewOnceMessage?.message) current = current.viewOnceMessage.message;
    else if (current.viewOnceMessageV2?.message) current = current.viewOnceMessageV2.message;
    else break;
  }
  return current;
}

function quotedSticker(message) {
  const current = unwrap(message.message);
  const quoted = unwrap(current?.extendedTextMessage?.contextInfo?.quotedMessage);
  return quoted?.stickerMessage || null;
}

function help() {
  return `╭━━━〔 🎨 *PACKS DE FIGURINHAS* 〕━━━╮
┃ .packs — lista seus packs
┃ .packs criar <nome>
┃ .packs add <nome> — responda uma FIG
┃ .packs ver <nome> — mostra as FIGs
┃ .packs enviar <nome> — envia o pack completo
┃ .packs remover <nome> <número>
┃ .packs renomear <antigo> | <novo>
┃ .packs apagar <nome>
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

💡 Cada usuário possui seus próprios packs.
📦 Limite: 100 FIGs por pack.`;
}

export default {
  name: 'packs',
  aliases: ['packfig', 'figpacks'],
  category: 'sticker',
  description: 'Cria e gerencia packs personalizados de figurinhas.',
  async execute({ sock, chat, message, sender, args, reply }) {
    const action = String(args[0] || '').toLowerCase();
    const rest = args.slice(1);

    if (!action || action === 'ajuda' || action === 'help') {
      const packs = listPacks(sender);
      if (!packs.length) return reply(`${help()}\n\n📭 Você ainda não criou nenhum pack.`);
      return reply(`${help()}\n\n📚 *SEUS PACKS*\n${packs.map((p, i) => `${i + 1}. 🎨 ${p.name}`).join('\n')}`);
    }

    if (action === 'criar' || action === 'create' || action === 'novo') {
      const result = createPack(sender, rest.join(' '));
      if (result?.error === 'name') return reply('❌ Informe o nome do pack.\nEx.: *.packs criar Memes LZ*');
      if (result?.error === 'length') return reply('❌ O nome do pack pode ter no máximo 40 caracteres.');
      if (result?.error === 'exists') return reply('⚠️ Você já possui um pack com esse nome.');
      return reply(`✅ *Pack criado!*\n\n🎨 ${result.name}\n\nAgora responda uma FIG com:\n*.packs add ${result.name}*`);
    }

    if (action === 'add' || action === 'adicionar') {
      const name = rest.join(' ').trim();
      if (!name) return reply('❌ Informe o nome do pack.');
      const sticker = quotedSticker(message);
      if (!sticker) return reply('🖼️ Responda a uma *figurinha* para adicioná-la ao pack.');
      try {
        const stream = await downloadContentFromMessage(sticker, 'sticker');
        const buffer = await toBuffer(stream);
        const result = addSticker(sender, name, buffer);
        if (result?.error === 'not_found') return reply('❌ Esse pack não existe.');
        if (result?.error === 'limit') return reply('❌ Esse pack já chegou ao limite de 100 FIGs.');
        return reply(`✅ FIG adicionada ao pack *${name}*!\n🎨 Posição: #${result.position}`);
      } catch (error) {
        return reply(`❌ Não consegui adicionar a FIG.\n${error?.message || 'Erro desconhecido'}`);
      }
    }

    if (action === 'ver' || action === 'view' || action === 'info') {
      const name = rest.join(' ').trim();
      const pack = getPack(sender, name);
      if (!pack) return reply('❌ Pack não encontrado.');
      const items = getStickers(sender, name) || [];
      return reply(`╭━━〔 🎨 *${pack.name}* 〕━━╮\n┃ 📦 FIGs: *${items.length}/100*\n${items.length ? items.map(item => `┃ ${item.position}. 🖼️ FIG`).join('\n') : '┃ 📭 Pack vazio'}\n╰━━━━━━━━━━━━━━━━━━━━╯`);
    }

    if (action === 'enviar' || action === 'send') {
      const name = rest.join(' ').trim();
      const items = getStickers(sender, name);
      if (items === null) return reply('❌ Pack não encontrado.');
      if (!items.length) return reply('📭 Esse pack está vazio.');
      try {
        await reply(`📦 *Enviando pack ${name}*\n🎨 ${items.length} FIGs...`);
        for (const item of items) {
          await sock.sendMessage(chat, { sticker: Buffer.from(item.sticker) });
          await new Promise(resolve => setTimeout(resolve, 180));
        }
      } catch (error) {
        return reply(`❌ Não consegui enviar o pack completo.\n${error?.message || 'Erro desconhecido'}`);
      }
      return;
    }

    if (action === 'remover' || action === 'remove' || action === 'del') {
      const position = Number(rest.pop());
      const name = rest.join(' ').trim();
      if (!name || !Number.isInteger(position) || position < 1) return reply('❌ Use: *.packs remover <nome> <número>*');
      const result = removeSticker(sender, name, position);
      if (result?.error === 'not_found') return reply('❌ Pack não encontrado.');
      if (result?.error === 'item') return reply('❌ Não existe FIG nessa posição.');
      return reply(`🗑️ FIG #${position} removida do pack *${name}*.`);
    }

    if (action === 'renomear' || action === 'rename') {
      const value = rest.join(' ');
      const separator = value.split('|');
      if (separator.length !== 2) return reply('❌ Use: *.packs renomear <antigo> | <novo>*');
      const result = renamePack(sender, separator[0], separator[1]);
      if (result?.error === 'not_found') return reply('❌ Pack não encontrado.');
      if (result?.error === 'name') return reply('❌ Informe o novo nome.');
      if (result?.error === 'length') return reply('❌ O novo nome pode ter no máximo 40 caracteres.');
      if (result?.error === 'exists') return reply('⚠️ Você já possui um pack com esse nome.');
      return reply(`✅ Pack renomeado para *${result.name}*.`);
    }

    if (action === 'apagar' || action === 'delete' || action === 'deletar') {
      const name = rest.join(' ').trim();
      if (!name) return reply('❌ Informe o nome do pack.');
      if (!deletePack(sender, name)) return reply('❌ Pack não encontrado.');
      return reply(`🗑️ Pack *${name}* apagado com todas as suas FIGs.`);
    }

    return reply(help());
  }
};
