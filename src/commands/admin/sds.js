import { getPermissionLevel } from '../core/permissions.js';
import { ensureGroup, getGroup } from '../database/index.js';
import { configureSecurity, getSdsWords, isSdsEnabled, setSdsEnabled, setSdsWords, parseSecurityDuration } from '../services/group-security.js';

export default {
  name: 'sds',
  aliases: ['seguranca', 'segurança'],
  category: 'admin',
  description: 'Configura o Sistema de Defesa e Segurança.',
  async execute({ sock, chat, sender, message, isGroup, args, reply }) {
    if (!isGroup) return reply('❌ Use o .sds em um grupo.');
    if (await getPermissionLevel({ sock, chat, jid: sender, message }) < 3) {
      return reply('❌ Apenas administradores podem configurar o SDS.');
    }

    ensureGroup(chat);
    const sub = String(args?.[0] || '').toLowerCase();

    if (!sub || sub === 'status') {
      const group = getGroup(chat);
      const words = getSdsWords(chat);
      return reply(
        '🛡️ *SDS — SISTEMA DE DEFESA E SEGURANÇA*\\n\\n' +
        'Status: *' + (isSdsEnabled(chat) ? 'ATIVADO ✅' : 'DESATIVADO ❌') + '*\\n' +
        'Palavras: *' + words.length + '*\\n' +
        'Modo: *' + String(group?.sds_action || 'warn').toUpperCase() + '*\\n' +
        'Aviso após: *' + Number(group?.sds_warn_after || 5) + '* exclusões\\n' +
        'Mute após: *' + Number(group?.sds_mute_after || 3) + '* mutes\\n' +
        'Tempo de mute: *' + Math.round(Number(group?.sds_mute_seconds || 600) / 60) + ' min*'
      );
    }

    if (sub === 'on' || sub === 'off') {
      setSdsEnabled(chat, sub === 'on');
      return reply('🛡️ SDS: *' + (sub === 'on' ? 'ATIVADO ✅' : 'DESATIVADO ❌') + '*');
    }

    if (sub === 'palavras') {
      const value=args.slice(1).join(' ').trim();
      if (!value) return reply('📝 Use *.sds palavras palavra1, palavra2*');
      const words=setSdsWords(chat,value.split(','));
      return reply('✅ SDS atualizado: *' + words.length + '* palavra(s) configurada(s).');
    }

    if (sub === 'modo') {
      const mode=String(args?.[1] || '').toLowerCase();
      if (!['aviso','mute'].includes(mode)) return reply('⚙️ Use *.sds modo aviso* ou *.sds modo mute*');
      configureSecurity(chat,'sds',{action:mode === 'mute' ? 'mute' : 'warn'});
      return reply('⚙️ Modo SDS: *' + mode.toUpperCase() + '*');
    }

    if (sub === 'aviso') {
      const amount=Math.max(1,Math.min(100,Math.trunc(Number(args?.[1])||0)));
      if (!amount) return reply('⚙️ Use *.sds aviso 5*');
      configureSecurity(chat,'sds',{warnAfter:amount});
      return reply('⚠️ Aviso SDS configurado para *' + amount + ' exclusões*.');
    }

    if (sub === 'mute') {
      const amount=Math.max(1,Math.min(100,Math.trunc(Number(args?.[1])||0)));
      const seconds=parseSecurityDuration(args?.[2]);
      if (!amount || !seconds) return reply('⚙️ Use *.sds mute 3 10:00*');
      configureSecurity(chat,'sds',{action:'mute',muteAfter:amount,muteSeconds:seconds});
      return reply('🔇 SDS: *' + amount + ' mute(s)* por aviso, duração de *' + Math.ceil(seconds / 60) + ' min*.');
    }

    return reply('🛡️ Comandos SDS:\\n*.sds on/off*\\n*.sds palavras palavra1, palavra2*\\n*.sds modo aviso/mute*\\n*.sds aviso 5*\\n*.sds mute 3 10:00*\\n*.sds status*');
  }
};