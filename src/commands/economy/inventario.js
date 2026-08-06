import { getInventory } from '../../database/index.js';
import { shopItems } from '../../data/catalog.js';

export default {
  name: 'inventario',
  aliases: ['inv'],
  async execute({ sender, reply }) {
    const items = getInventory(sender);
    if (!items.length) return reply('🎒 Seu inventário está vazio.\nUse .loja para comprar itens.');
    const text = items.map(item => `${shopItems[item.item_id]?.name || item.item_id} ×${item.quantity}`).join('\n');
    await reply(`🎒 INVENTÁRIO\n\n${text}`);
  }
};
