import {
  getCommunitySettings,
  getGroupSchedule,
  getGroup,
  setGroupSchedule,
  updateCommunitySettings
} from '../database/index.js';

const AUTOMATION_INTERVAL_MS = 30 * 1000;
const DEFAULT_TIME_ZONE = process.env.CM_TIMEZONE || 'America/Sao_Paulo';

function normalizeJid(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.includes('@')) return raw.split(':')[0];
  return raw.split(':')[0] + '@s.whatsapp.net';
}

function participantJids(participant) {
  return [
    participant?.id,
    participant?.jid,
    participant?.lid,
    participant?.phoneNumber
  ].filter(Boolean).map(normalizeJid);
}

export async function isBotGroupAdmin(sock, groupJid) {
  try {
    const metadata = await sock.groupMetadata(groupJid);
    const self = normalizeJid(sock?.user?.id || sock?.user?.jid);
    const me = metadata?.participants?.find(p => participantJids(p).includes(self));
    return Boolean(me?.admin);
  } catch {
    return false;
  }
}

function formatTime(value) {
  return /^\d{2}:\d{2}$/.test(String(value || '')) ? value : '--:--';
}

export function parseScheduleTime(value) {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return String(hour).padStart(2,'0') + ':' + String(minute).padStart(2,'0');
}

function currentTimeHHMM(timeZone = DEFAULT_TIME_ZONE) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).format(new Date());
}

function timeToMinutes(value) {
  const [hour,minute] = String(value).split(':').map(Number);
  return hour * 60 + minute;
}

export function shouldGroupBeClosed(currentHHMM, openTime, closeTime) {
  const now = timeToMinutes(currentHHMM);
  const open = timeToMinutes(openTime);
  const close = timeToMinutes(closeTime);
  if (open === close) return false;
  if (close < open) return now >= close && now < open;
  return now >= close || now < open;
}

export function getScheduleDescription(schedule) {
  if (!schedule?.enabled) return 'desativado';
  return 'fecha às ' + formatTime(schedule.closeTime) + ' • abre às ' + formatTime(schedule.openTime);
}

export async function configureGroupSchedule(sock, groupJid, openTime, closeTime) {
  const open = parseScheduleTime(openTime);
  const close = parseScheduleTime(closeTime);
  if (!open || !close) return { ok:false, reason:'invalid_time' };
  if (open === close) return { ok:false, reason:'same_time' };
  if (!(await isBotGroupAdmin(sock, groupJid))) return { ok:false, reason:'bot_not_admin' };
  const schedule = setGroupSchedule(groupJid, { enabled:true, openTime:open, closeTime:close });
  return { ok:true, schedule };
}

export function removeGroupSchedule(groupJid) {
  return setGroupSchedule(groupJid, { enabled:false, openTime:'', closeTime:'' });
}

export async function applyGroupSchedule(sock, groupJid, logger = console, timeZone = DEFAULT_TIME_ZONE) {
  const schedule = getGroupSchedule(groupJid);
  if (!schedule.enabled || !schedule.openTime || !schedule.closeTime) return { changed:false, skipped:true, reason:'disabled' };

  const current = currentTimeHHMM(timeZone);
  const shouldClose = shouldGroupBeClosed(current, schedule.openTime, schedule.closeTime);

  try {
    const metadata = await sock.groupMetadata(groupJid);
    const currentlyClosed = Boolean(metadata?.announce);
    if (currentlyClosed === shouldClose) return { changed:false, closed:currentlyClosed };

    if (!(await isBotGroupAdmin(sock, groupJid))) {
      return { changed:false, skipped:true, reason:'bot_not_admin' };
    }

    await sock.groupSettingUpdate(groupJid, shouldClose ? 'announcement' : 'not_announcement');
    logger?.info?.({ groupJid, current, openTime:schedule.openTime, closeTime:schedule.closeTime, closed:shouldClose }, '⏰ Horário do grupo aplicado');
    return { changed:true, closed:shouldClose };
  } catch (error) {
    logger?.debug?.({ err:error, groupJid }, 'Não foi possível aplicar o horário automático do grupo.');
    return { changed:false, skipped:true, reason:'update_failed' };
  }
}

export async function runCommunityAutomationCycle(sock, logger = console, timeZone = DEFAULT_TIME_ZONE) {
  const groups = await sock.groupFetchAllParticipating().catch(() => ({}));
  const entries = Object.values(groups || {});
  const results = [];
  for (const group of entries) {
    const groupJid = String(group?.id || '').trim();
    if (!groupJid.endsWith('@g.us')) continue;
    const result = await applyGroupSchedule(sock, groupJid, logger, timeZone);
    if (result.changed) results.push({ groupJid, ...result });
  }
  return results;
}

export function startCommunityAutomationLoop(sock, logger = console, timeZone = DEFAULT_TIME_ZONE) {
  let stopped = false;
  let running = false;

  const cycle = async () => {
    if (stopped || running) return;
    running = true;
    try {
      await runCommunityAutomationCycle(sock, logger, timeZone);
    } finally {
      running = false;
      if (!stopped) {
        const timer = setTimeout(cycle, AUTOMATION_INTERVAL_MS);
        timer.unref?.();
      }
    }
  };

  void cycle();
  return () => { stopped = true; };
}

function substituteTemplate(template, { participant, groupName, action }) {
  const number = String(participant || '').split('@')[0];
  const greeting = action === 'add' ? 'Bem-vindo(a)' : 'Até mais';
  return String(template || '')
    .replace(/\\{user\\}/gi, '@' + number)
    .replace(/\\{grupo\\}/gi, groupName || 'grupo')
    .replace(/\\{acao\\}/gi, greeting);
}

export async function handleCommunityParticipantUpdate(sock, event, logger = console) {
  const sourceGroupJid = String(event?.id || '').trim();
  const action = String(event?.action || '');
  if (!sourceGroupJid.endsWith('@g.us') || !['add','remove'].includes(action)) return { sent:0, skipped:true };

  const settingsCommunity = await getCommunitySettingsForGroup(sock, sourceGroupJid);
  if (!settingsCommunity) return { sent:0, skipped:true, reason:'no_community_config' };

  const { communityJid, settings } = settingsCommunity;
  const destinationJid = action === 'add' ? settings.welcome_group_jid : settings.goodbye_group_jid;
  if (!destinationJid) return { sent:0, skipped:true, reason:'no_destination' };

  const destinationMeta = await sock.groupMetadata(destinationJid).catch(() => null);
  if (!destinationMeta) return { sent:0, skipped:true, reason:'destination_unavailable' };

  const template = action === 'add' ? settings.welcome_message : settings.goodbye_message;
  let sent = 0;
  for (const participant of event.participants || []) {
    const jid = normalizeJid(participant);
    if (!jid) continue;
    const body = '╭━━━〔 ' + (action === 'add' ? '👋 𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎' : '👋 𝐃𝐄𝐒𝐏𝐄𝐃𝐈𝐃𝐀') + ' 〕━━━╮\n' +
      substituteTemplate(template, { participant:jid, groupName:destinationMeta.subject || '', action }) +
      '\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯';
    try {
      await sock.sendMessage(destinationJid, {
        text: body,
        mentions: [jid]
      });
      sent += 1;
    } catch (error) {
      logger?.debug?.({ err:error, destinationJid, participant:jid }, 'Falha ao enviar mensagem de comunidade.');
    }
  }

  logger?.info?.({ communityJid, sourceGroupJid, destinationJid, action, sent }, '👋 Automação de comunidade processada');
  return { sent };
}

async function getCommunitySettingsForGroup(sock, sourceGroupJid) {
  const metadata = await sock.groupMetadata(sourceGroupJid).catch(() => null);
  if (!metadata) return null;
  const communityJid = String(metadata?.linkedParent || '').trim() || sourceGroupJid;
  const settings = getCommunitySettings(communityJid);
  // Para configurações antigas salvas no próprio grupo, também aceitamos o JID do grupo como comunidade.
  const fallback = !settings?.welcome_group_jid && !settings?.goodbye_group_jid && communityJid !== sourceGroupJid
    ? getCommunitySettings(sourceGroupJid)
    : null;
  return { communityJid, settings: fallback || settings };
}

export const COMMUNITY_AUTOMATION_INTERVAL_MS = AUTOMATION_INTERVAL_MS;
export const COMMUNITY_AUTOMATION_TIME_ZONE = DEFAULT_TIME_ZONE;
