import { ensureUser, getUser, spendTokens, createPet } from '../database/index.js';
import { getPetDefinition } from '../data/pets.js';

function normalize(value) { return String(value || '').trim().toLowerCase(); }

export default {
  name: 'comprarpet',
  aliases: ['adotar'],
  category: 'pets',
  description: 'Compra/adota um Pet no Pet Shop.',
  async execute({ sender, args, reply }) {
    ensureUser(sender);
    const query = normalize(args.join(' '));
    if (!query) return reply('🐾 Informe o ID ou nome do Pet.\n💡 Ex.: .comprarpet gato');
    const pet = getPetDefinition(query);
    if (!pet) return reply('❌ Pet não encontrado.\n🛒 Use .petshop para ver os Pets disponíveis.');
    const user = getUser(sender);
    const shopLevel = Math.max(1, Number(user.pet_shop_level || 1));
    if (pet.shopLevel > shopLevel) {
      return reply('🔒 ' + pet.emoji + ' ' + pet.name + ' ainda está bloqueado.\n🏪 Nível necessário da Pet Shop: ' + pet.shopLevel + '\n📊 Seu nível: ' + shopLevel);
    }
    const balance = Number(user.tokens || 0);
    if (balance < pet.price) {
      return reply('❌ Você não tem Tokens suficientes.\n💰 Preço: 🪙 ' + pet.price.toLocaleString('pt-BR') + '\n💳 Seu saldo: 🪙 ' + balance.toLocaleString('pt-BR'));
    }
    if (!spendTokens(sender, pet.price)) return reply('❌ Não foi possível concluir a compra. Seu saldo pode ter mudado, tente novamente.');
    const created = createPet(sender, pet.name, pet.id);
    return reply('╭━━━〔 🐾 𝐏𝐄𝐓 𝐀𝐃𝐎𝐓𝐀𝐃𝐎 〕━━━╮\n' +
      '┃ ' + pet.emoji + ' ' + pet.name + '\n' +
      '┃ ⭐ Raridade: ' + pet.rarity + '\n' +
      '┃ ⚡ Habilidade: ' + pet.abilityName + '\n' +
      '┃ 🪙 Pago: ' + pet.price.toLocaleString('pt-BR') + ' Tokens\n' +
      '┃ 🆔 ID do Pet: ' + created.id + '\n' +
      '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
      '❤️ Seu Pet começou com todos os status em 100. Use .petinfo ' + created.id + ' para consultar.');
  }
};