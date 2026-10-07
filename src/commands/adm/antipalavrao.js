import { getPermissionLevel } from '../../core/permissions.js';
import { getGroup, ensureGroup } from '../../database/index.js';
import { setAntiProfanity, isAntiProfanityEnabled } from '../../services/anti-palavrao.js';
import { configureSecurity, parseSecurityDuration } from '../../services/group-security.js';

export default {
  name: 'antipalavrao',
  aliases: [],
  category: 'admin',
  description: 'Liga, desliga e configura o anti-palavrão.',
  async execute({ sock, chat, isGroup, sender, message, args, reply }) {
    if (!isGroup) return reply('❌ Use este comando em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem configurar o anti-palavrão.');
    }

    ensureGroup(chat);
    const sub = String(args?.[0] || '').toLowerCase();

    if (sub === 'on' || sub === 'off') {
      setAntiProfanity(chat, sub === 'on');
      return reply('🤬 Anti-palavrão: *' + (sub === 'on' ? 'ATIVADO ✅' : 'DESATIVADO ❌') + '*');
    }

    if (sub === 'modo') {
      const mode=String(args?.[1]||'').toLowerCase();
      if(!['aviso','mute'].includes(mode)) return reply('⚙️ Use *.antipalavrao modo aviso* ou *.antipalavrao modo mute*');
      configureSecurity(chat,'profanity',{action:mode === 'mute' ? 'mute' : 'warn'});
      return reply('⚙️ Anti-palavrão em modo: *' + mode.toUpperCase() + '*');
    }

    if (sub === 'aviso') {
      const amount=Math.max(1,Math.min(100,Math.trunc(Number(args?.[1])||0)));
      if(!amount) return reply('⚙️ Use *.antipalavrao aviso 5*');
      configureSecurity(chat,'profanity',{warnAfter:amount});
      return reply('⚠️ Aviso do anti-palavrão após *' + amount + ' exclusões*.');
    }

    if (sub === 'mute') {
      const amount=Math.max(1,Math.min(100,Math.trunc(Number(args?.[1])||0)));
      const seconds=parseSecurityDuration(args?.[2]);
      if(!amount || !seconds) return reply('⚙️ Use *.antipalavrao mute 3 10:00*');
      configureSecurity(chat,'profanity',{action:'mute',muteAfter:amount,muteSeconds:seconds});
      return reply('🔇 Anti-palavrão: *' + amount + ' mute(s)* por aviso, duração de *' + Math.ceil(seconds/60) + ' min*.');
    }

    const group=getGroup(chat);
    return reply(
      '🤬 *ANTI-PALAVRÃO*\\n\\n' +
      'Status: *' + (isAntiProfanityEnabled(chat) ? 'ATIVADO ✅' : 'DESATIVADO ❌') + '*\\n' +
      'Modo: *' + String(group?.profanity_action || 'warn').toUpperCase() + '*\\n' +
      'Aviso após: *' + Number(group?.profanity_warn_after || 5) + '* exclusões\\n' +
      'Mute após: *' + Number(group?.profanity_mute_after || 3) + '* mutes\\n' +
      'Tempo de mute: *' + Math.round(Number(group?.profanity_mute_seconds || 600)/60) + ' min*\\n\\n' +
      'Use *.antipalavrao on/off*, *.antipalavrao modo aviso/mute*, *.antipalavrao aviso 5* ou *.antipalavrao mute 3 10:00*.'
    );
  }
};