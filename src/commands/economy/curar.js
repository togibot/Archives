import { getPet, updatePet } from '../../database/index.js';
export default { name:'curar', category:'pets', description:'Cura seu pet', async execute({sender,args,reply}) { const p=getPet(sender,args[0]||'1'); if(!p) return reply('❌ Escolha um pet válido.'); updatePet(p.id,{health:100}); return reply(`💚 ${p.name} foi curado!\n❤️ Saúde: 100/100`); } };
