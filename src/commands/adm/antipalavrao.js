const settings = new Map();
const banned = ['palavrao1','palavrao2'];
export default { name:'antipalavrao', aliases:['antipalavrao'], category:'admin', description:'Configura bloqueio de palavrões', async execute({text,reply}) { const value=text.trim().toLowerCase(); if(!['on','off','ativar','desativar'].includes(value)) return reply('🛡️ Use *.antipalavrao on* ou *.antipalavrao off*.\n⚙️ A lista pode ser personalizada no código do bot.'); const enabled=value==='on'||value==='ativar'; settings.set('global',enabled); return reply(`🛡️ Anti-palavrão: *${enabled?'ATIVADO ✅':'DESATIVADO ❌'}*`); }};
