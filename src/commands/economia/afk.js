const afkUsers = new Map();
export const getAfk = user => afkUsers.get(user);
export const clearAfk = user => afkUsers.delete(user);
export default { name:'afk', aliases:['ausente'], category:'social', description:'Ativa o modo AFK', async execute({sender,text,reply}) { const reason=text.trim()||'sem motivo informado'; afkUsers.set(sender,{since:Date.now(),reason}); return reply(`💤 *AFK ativado!*\n📝 Motivo: ${reason}\n\nEnvie uma mensagem normalmente para voltar.`); }};
