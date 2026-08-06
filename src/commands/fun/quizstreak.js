import { getQuizStats } from '../../database/index.js';
export default { name:'quizstreak', aliases:['streak'], category:'quiz', description:'Mostra sua sequência', async execute({sender,reply}) { const s=getQuizStats(sender); return reply(`🔥 Sua sequência atual é *${s.streak}*\n🏆 Melhor sequência: *${s.best_streak}*`); } };
