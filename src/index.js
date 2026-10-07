import 'dotenv/config';
import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } from '@whiskeysockets/baileys';
import P from 'pino';
import fs from 'node:fs/promises';
import config from './config.js';
import { loadCommands } from './core/command-loader.js';
import { ensureUser, ensureGroup, isGroupMuted, isSoAdmEnabled, updateGroup, clearExpiredMutes } from './database/index.js';
import { getText, getSender, getName } from './utils/message.js';
import { askTogi, isTogiActive } from './services/togi-ai.js';
import { getAfk, clearAfk } from './services/afk-store.js';
import { moderateProfanity, isAntiProfanityEnabled } from './services/anti-palavrao.js';
import { getCommandReaction } from './config/reactions.js';
import { getPermissionLevel } from './core/permissions.js';

function isTerminalWriteError(error) { const code = String(error?.code || '').toUpperCase(); const errno = Number(error?.errno); return code === 'EPIPE' || code === 'EDQUOT' || errno === -32 || errno === -122; }
function handleStdIOError(error) { if (isTerminalWriteError(error)) return; try { process.stderr.write(`[STDIO] ${error?.message || 'erro de escrita'}\n`); } catch {} }
process.stdout?.on?.('error', handleStdIOError);
process.stderr?.on?.('error', handleStdIOError);
process.on('uncaughtException', error => { if (isTerminalWriteError(error)) return; try { process.stderr.write(`[FATAL] ${error?.stack || error?.message || error}\n`); } catch {} process.exitCode = 1; });
process.on('unhandledRejection', error => { if (isTerminalWriteError(error)) return; try { process.stderr.write(`[UNHANDLED] ${error?.stack || error?.message || error}\n`); } catch {} });

const logger = P({ level: process.env.LOG_LEVEL || 'info' });
let commands = new Map();
let restarting = false;
const separator = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
function logInfo(title, details = []) { console.log(`\n${separator}`); console.log(title); for (const detail of details) console.log(detail); console.log(separator); }
function logError(title, details = []) { console.error(`\n${separator}`); console.error(title); for (const detail of details) console.error(detail); console.error(separator); }
function displayJid(jid) { return String(jid || '').split('@')[0] || 'desconhecido'; }
function displayChat(chat, isGroup) { return isGroup ? chat : 'Conversa privada'; }
function normalizePhone(value) { return String(value || '').replace(/\D/g, ''); }
function normalizeJid(value) { const raw = String(value || '').trim(); if (!raw) return ''; if (raw.includes('@')) return raw.split(':')[0]; return raw.split(':')[0] + '@s.whatsapp.net'; }
function jidNumber(value) { return normalizePhone(String(value || '').split('@')[0].split(':')[0]); }
function getSelfJids(sock, pairingPhone) { const values = [sock?.user?.id, sock?.user?.jid, pairingPhone ? `${pairingPhone}@s.whatsapp.net` : '']; return [...new Set(values.map(normalizeJid).filter(Boolean))]; }
function isSelfMessage(message, sock, pairingPhone) { if (message?.key?.fromMe) return true; const selfNumbers = new Set(getSelfJids(sock, pairingPhone).map(jidNumber).filter(Boolean)); if (!selfNumbers.size) return false; const candidates = [message?.key?.participantPn, message?.key?.senderPn, message?.key?.participant, message?.key?.remoteJidAlt, message?.key?.remoteJid].map(jidNumber).filter(Boolean); return candidates.some(number => selfNumbers.has(number)); }
async function withTimeout(promise, timeoutMs, label) { let timer; try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label} excedeu ${timeoutMs}ms`)), timeoutMs); timer.unref?.(); })]); } finally { clearTimeout(timer); } }
async function reactToCommand(sock, message, command) { const emoji = getCommandReaction(command); if (!emoji) return; try { await withTimeout(sock.sendMessage(message.key.remoteJid, { react: { text: emoji, key: message.key } }), 10000, 'Reação'); } catch (error) { logger.debug({ err: error }, 'Não foi possível reagir ao comando.'); } }
function getMentionedJids(message) { const context = message?.message?.extendedTextMessage?.contextInfo || message?.message?.imageMessage?.contextInfo || message?.message?.videoMessage?.contextInfo || message?.message?.documentMessage?.contextInfo; return Array.isArray(context?.mentionedJid) ? context.mentionedJid : []; }
function formatAfkDuration(since) { const elapsedMs = Math.max(0, Date.now() - since); const minutes = Math.floor(elapsedMs / 60000); if (minutes < 1) return 'menos de 1 minuto'; if (minutes === 1) return '1 minuto'; if (minutes < 60) return `${minutes} minutos`; const hours = Math.floor(minutes / 60), remaining = minutes % 60; if (remaining === 0) return hours === 1 ? '1 hora' : `${hours} horas`; return `${hours}h ${remaining}min`; }
function getAfkKeys({ effectiveSender, sender, pairingPhone, sock }) { const keys = [effectiveSender, sender, sock?.user?.id, pairingPhone ? `${pairingPhone}@s.whatsapp.net` : ''].filter(Boolean); return [...new Set(keys)]; }

function findAfkEntry(keys) { for (const key of keys) { const entry = getAfk(key); if (entry) return { key, entry }; } return null; }

function saoPauloClock() {
  const now = new Date();
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
  return { date, time };
}

function replaceCommunityVariables(template, name, subject) {
  return String(template || '')
    .replaceAll('{nome}', name || 'Usuário')
    .replaceAll('{grupo}', subject || 'este grupo');
}

async function fetchProfileImage(sock, jid) {
  try {
    if (typeof sock.profilePictureUrl !== 'function') return null;
    const url = await sock.profilePictureUrl(jid, 'image');
    const response = await fetch(url, {
      headers: { 'user-agent': 'Mozilla/5.0 WhatsApp Togi Bot' },
      redirect: 'follow'
    });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.length && buffer.length <= 8 * 1024 * 1024 ? buffer : null;
  } catch {
    return null;
  }
}

function defaultCommunityMessage(action, name, subject) {
  const group = subject || 'este grupo';
  if (action === 'add') {
    return [
      '╭━━━━━━〔 👋 𝙱𝙴𝙼-𝚅𝙸𝙽𝙳𝙾 〕━━━━━━╮',
      '',
      '💜 Olá, @' + String(name || 'Usuário').replace(/^@/, '') + '!',
      '',
      'Você entrou no',
      '『 ' + group + ' 』',
      '',
      'É um prazer ter você aqui! 💜',
      '',
      '╰━━━━━━━━━━━━━━━━━━━━━━━━╯'
    ].join('\n');
  }

  return [
    '╭━━━━━━〔 👋 𝙰𝚃É 𝙼𝙰𝙸𝚂 〕━━━━━━╮',
    '',
    '👋 Até mais, @' + String(name || 'Usuário').replace(/^@/, '') + '!',
    '',
    'Você saiu do',
    '『 ' + group + ' 』',
    '',
    'Obrigado por participar do grupo. 💜',
    '',
    '╰━━━━━━━━━━━━━━━━━━━━━━━━╯'
  ].join('\n');
}

async function sendCommunityEvent(sock, update) {
  const chat = update?.id;
  if (!chat?.endsWith('@g.us')) return;
  if (!['add', 'remove'].includes(update?.action)) return;

  const metadata = await sock.groupMetadata(chat).catch(() => null);
  const subject = metadata?.subject || chat;
  const group = ensureGroup(chat, subject);

  const enabledKey = update.action === 'add' ? 'welcome_enabled' : 'goodbye_enabled';
  const messageKey = update.action === 'add' ? 'welcome_message' : 'goodbye_message';
  if (Number(group?.[enabledKey] ?? 1) === 0) return;

  for (const jid of update.participants || []) {
    const display = String(jid || '').split('@')[0].split(':')[0];
    const custom = String(group?.[messageKey] || '').trim();
    const base = defaultCommunityMessage(update.action, display, subject);
    const extra = custom
      ? '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n📝 *Mensagem do ADM:*\n' +
        replaceCommunityVariables(custom, display, subject)
      : '';

    const text = base + extra;
    const image = await fetchProfileImage(sock, jid);

    try {
      const payload = image
        ? { image, mimetype: 'image/jpeg', caption: text, mentions: [jid] }
        : { text, mentions: [jid] };
      await sock.sendMessage(chat, payload);
    } catch (error) {
      console.log('⚠️ Falha no Community Manager:', error?.message || 'erro desconhecido');
    }
  }
}

async function processGroupSchedules(sock) {
  try {
    const groups = await sock.groupFetchAllParticipating();
    const clock = saoPauloClock();

    for (const group of Object.values(groups || {})) {
      const chat = group?.id || group?.jid;
      if (!String(chat).endsWith('@g.us')) continue;

      const settings = ensureGroup(chat, group?.subject || '');
      if (Number(settings?.schedule_enabled || 0) !== 1) continue;

      const last = String(settings?.schedule_last_action || '');
      if (clock.time === settings.close_time && last !== clock.date + '|close') {
        try {
          await sock.groupSettingUpdate(chat, 'announcement');
          updateGroup(chat, { schedule_last_action: clock.date + '|close' });
          console.log('🔒 Horário automático: grupo fechado', chat);
        } catch (error) {
          console.log('⚠️ Não consegui fechar automaticamente ' + chat + ':', error?.message || 'erro desconhecido');
        }
      } else if (clock.time === settings.open_time && last !== clock.date + '|open') {
        try {
          await sock.groupSettingUpdate(chat, 'not_announcement');
          updateGroup(chat, { schedule_last_action: clock.date + '|open' });
          console.log('🔓 Horário automático: grupo aberto', chat);
        } catch (error) {
          console.log('⚠️ Não consegui abrir automaticamente ' + chat + ':', error?.message || 'erro desconhecido');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ Falha no agendador de grupos:', error?.message || 'erro desconhecido');
  } finally {
    try { clearExpiredMutes(); } catch {}
  }
}

async function handleAfk(sock, message, effectiveSender, sender, pairingPhone, isGroup, reply, autoDisable = true) { if (autoDisable && !isSelfMessage(message, sock, pairingPhone)) { const ownAfk = findAfkEntry(getAfkKeys({ effectiveSender, sender, pairingPhone, sock })); if (ownAfk) { clearAfk(ownAfk.key); await reply(`👋 @${effectiveSender.split('@')[0]} saiu do AFK!\n⏱️ Tempo ausente: ${formatAfkDuration(ownAfk.entry.since)}\n📝 Motivo: ${ownAfk.entry.reason}`, { mentions: [effectiveSender] }); } } if (!isGroup) return; const mentioned = [...new Set(getMentionedJids(message))]; if (!mentioned.length) return; const notices = [], mentions = []; for (const jid of mentioned) { const entry = getAfk(jid); if (!entry) continue; notices.push(`💤 @${jid.split('@')[0]} está AFK.\n📝 Motivo: ${entry.reason}\n⏱️ Ausente há ${formatAfkDuration(entry.since)}`); mentions.push(jid); } if (notices.length) await reply(`╭━━━〔 💤 𝐀𝐅𝐊 〕━━━╮\n${notices.join('\n\n')}\n╰━━━━━━━━━━━━━━━━━━╯`, { mentions }); }

async function startBot() {
  restarting = false;
  await fs.mkdir(config.connection.authDir, { recursive: true });
  commands = await loadCommands();
  const { state, saveCreds } = await useMultiFileAuthState(config.connection.authDir);
  const { version } = await fetchLatestBaileysVersion();
  const messageCache = new Map();
  const mutedFloodState = new Map();
  let scheduleTimer = null;
  const sock = makeWASocket({ version, auth: state, logger, printQRInTerminal: false, browser: Browsers.ubuntu('Chrome'), markOnlineOnConnect: false, emitOwnEvents: false, syncFullHistory: false, shouldSyncHistoryMessage: () => false, getMessage: async key => messageCache.get(key.id)?.message || undefined });
  sock.ev.on('creds.update', saveCreds);
  const pairingPhone = normalizePhone(config.connection.pairingPhone);
  let pairingRequested = false;
  logInfo(`🚀 ${config.bot.name} iniciando`, [`📦 ${commands.size} comandos carregados`, `🗃️ Banco: ${process.env.DATABASE_PATH || './data/togi.sqlite'}`, '🛡️ Anti-palavrão: DESATIVADO']);
  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (!state.creds.registered && pairingPhone && !pairingRequested && qr) { pairingRequested = true; try { const code = await sock.requestPairingCode(pairingPhone); logInfo('🔐 TOGI BOT — PAIRING CODE', [`📱 Número: +${pairingPhone}`, `🔑 Código: ${code}`, '💡 No WhatsApp, abra Dispositivos conectados e use a opção de conectar por código.']); } catch (error) { pairingRequested = false; logError('❌ FALHA AO GERAR PAIRING CODE', [`💥 ${error?.message || 'Erro desconhecido'}`]); } }
    if (connection === 'open') { restarting = false; logInfo('🟢 TOGI CONECTADO', [`🤖 ${config.bot.name}`, `📦 ${commands.size} comandos disponíveis`]); if (!scheduleTimer) { scheduleTimer = setInterval(() => processGroupSchedules(sock), 30000); scheduleTimer.unref?.(); processGroupSchedules(sock).catch(() => {}); } }
    if (connection === 'close') { if (scheduleTimer) { clearInterval(scheduleTimer); scheduleTimer = null; } const statusCode = lastDisconnect?.error?.output?.statusCode; const shouldReconnect = statusCode !== DisconnectReason.loggedOut; logError('🔌 CONEXÃO ENCERRADA', [`📡 Código: ${statusCode ?? 'desconhecido'}`, `🔁 Reconectar: ${shouldReconnect ? 'SIM' : 'NÃO'}`]); if (shouldReconnect && !restarting) { restarting = true; setTimeout(() => startBot().catch(error => { restarting = false; logError('❌ FALHA AO REINICIAR O TOGI', [`💥 ${error?.message || 'Erro desconhecido'}`]); }), 3000); } }
    if (connection === 'close') { const statusCode = lastDisconnect?.error?.output?.statusCode; const shouldReconnect = statusCode !== DisconnectReason.loggedOut; logError('🔌 CONEXÃO ENCERRADA', [`📡 Código: ${statusCode ?? 'desconhecido'}`, `🔁 Reconectar: ${shouldReconnect ? 'SIM' : 'NÃO'}`]); if (shouldReconnect && !restarting) { restarting = true; setTimeout(() => startBot().catch(error => { restarting = false; logError('❌ FALHA AO REINICIAR O TOGI', [`💥 ${error?.message || 'Erro desconhecido'}`]); }), 3000); } }
  });
  if (!state.creds.registered && !pairingPhone) console.log('⚠️ PAIRING_PHONE não configurado.'); else if (state.creds.registered) console.log('🔑 Sessão existente encontrada.');
  sock.ev.on('group-participants.update', async update => { try { await sendCommunityEvent(sock, update); } catch (error) { console.log('⚠️ Erro no Community Manager:', error?.message || 'erro desconhecido'); } });
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const message of messages || []) {
      if (!message?.message) continue;
      messageCache.set(message.key.id, message);
      if (messageCache.size > 200) messageCache.delete(messageCache.keys().next().value);
      const text = getText(message).trim(), sender = getSender(message), chat = message.key.remoteJid, isGroup = chat?.endsWith('@g.us'), userName = getName(message), selfJids = getSelfJids(sock, pairingPhone), effectiveSender = isSelfMessage(message, sock, pairingPhone) ? (selfJids[0] || normalizeJid(sender)) : normalizeJid(sender);
      if (isSelfMessage(message, sock, pairingPhone)) continue;
      ensureUser(effectiveSender, userName); if (isGroup) ensureGroup(chat);
      logInfo('💬 NOVA MENSAGEM', [`👤 Usuário: ${userName || 'desconhecido'} (${displayJid(effectiveSender)})`, `👥 Grupo: ${displayChat(chat, isGroup)}`, `📝 Mensagem: ${text || '[sem texto]'}`]);
      const reply = async (content, options = {}) => { const payload = { text: String(content), ...options }; try { if (message.key.fromMe) return await withTimeout(sock.sendMessage(chat, payload), 30000, 'Envio da mensagem'); return await withTimeout(sock.sendMessage(chat, payload, { quoted: message }), 30000, 'Envio da mensagem'); } catch (error) { logError('❌ FALHA AO ENVIAR RESPOSTA', [`👥 Grupo: ${displayChat(chat, isGroup)}`, `💥 ${error?.message || 'Erro desconhecido'}`]); return null; } };
      let parsedCommandName = ''; if (text.startsWith(config.bot.prefix)) { const body = text.slice(config.bot.prefix.length).trim(); parsedCommandName = body.split(/\s+/)[0]?.toLowerCase() || ''; }
      const isAfkToggle = parsedCommandName === 'afk' || parsedCommandName === 'ausente';
      if (isGroup && isGroupMuted(chat, effectiveSender)) { try { await sock.sendMessage(chat, { delete: message.key }); } catch (error) { logger.debug({ err: error }, 'Não foi possível apagar mensagem de usuário mutado.'); } const now = Date.now(); const key = chat + '::' + effectiveSender; const previous = mutedFloodState.get(key) || { lastNotice: 0, attempts: 0 }; previous.attempts += 1; if (now - previous.lastNotice >= 15000) { previous.lastNotice = now; try { await sock.sendMessage(chat, { text: '🔇 @' + effectiveSender.split('@')[0] + ' está em castigo/mute e não pode enviar mensagens agora. Pare de floodar o grupo.', mentions: [effectiveSender] }); } catch {} } mutedFloodState.set(key, previous); continue; }
      if (isGroup && isSoAdmEnabled(chat) && parsedCommandName && parsedCommandName !== 'soadm') { try { const permission = await getPermissionLevel({ sock, chat, jid: effectiveSender, message }); if (permission < 3) continue; } catch (error) { logger.debug({ err: error }, 'Não foi possível verificar o modo SOADM.'); continue; } }
      try { await handleAfk(sock, message, effectiveSender, sender, pairingPhone, isGroup, reply, !isAfkToggle); } catch (error) { logger.debug({ err: error }, 'Falha ao processar AFK.'); }
      if (false && isGroup && !message.key.fromMe && !isAfkToggle && isAntiProfanityEnabled(chat)) { try { const moderated = await moderateProfanity({ sock, chat, message, sender: effectiveSender }); if (moderated?.moderated) continue; } catch (error) { logError('❌ ERRO NO ANTI-PALAVRÃO', [`👥 Grupo: ${chat}`, `👤 Usuário: ${displayJid(effectiveSender)}`, `💥 ${error?.message || 'Erro desconhecido'}`]); } }
      if (!text.startsWith(config.bot.prefix) && isTogiActive(chat, effectiveSender)) { try { const answer = await askTogi(chat, effectiveSender, text, userName); if (answer) await reply(answer); } catch (error) { logError('❌ ERRO NA TOGI AI', [`👤 Usuário: ${userName || displayJid(effectiveSender)}`, `👥 Grupo: ${displayChat(chat, isGroup)}`, `💥 ${error?.message || 'Erro desconhecido'}`]); if (error?.name !== 'AbortError') await reply('❌ A Togi AI está indisponível no momento. Tente novamente em instantes.'); } continue; }
      if (!text.startsWith(config.bot.prefix)) continue;
      const body = text.slice(config.bot.prefix.length).trim(); if (!body) continue;
      const words = body.split(/\s+/); let name = words[0]?.toLowerCase() || ''; let args = words.slice(1); let command = commands.get(name);
      const maxParts = Math.min(5, words.length);
      if (!command) for (let size = maxParts; size >= 2; size--) { const candidate = words.slice(0, size).join(' ').toLowerCase(); const found = commands.get(candidate); if (!found) continue; name = candidate; args = words.slice(size); command = found; break; }
      if (!command) { console.log(`⚠️ Comando não encontrado: .${name}`); continue; }
      logInfo('⚙️ COMANDO', [`👤 Usuário: ${userName || displayJid(effectiveSender)}`, `👥 Grupo: ${displayChat(chat, isGroup)}`, `▶️ Executando: .${name}${args.length ? ` ${args.join(' ')}` : ''}`]);
      void reactToCommand(sock, message, command);
      try { await withTimeout(command.execute({ sock, message, sender: effectiveSender, chat, args, text: args.join(' '), rawText: text, commandName: name.toLowerCase(), isGroup, reply, commands, react: async emoji => { try { await withTimeout(sock.sendMessage(chat, { react: { text: emoji, key: message.key } }), 10000, 'Reação'); } catch {} } }), 90000, `Comando .${name}`); console.log(`✅ Comando concluído: .${name}`); } catch (error) { logError('❌ ERRO NO COMANDO', [`👤 Usuário: ${userName || displayJid(effectiveSender)}`, `👥 Grupo: ${displayChat(chat, isGroup)}`, `⚙️ Comando: .${name}`, `💥 ${error?.message || 'Erro desconhecido'}`]); await reply(`❌ Erro ao executar .${name}: ${error?.message || 'erro desconhecido'}`); }
    }
  });
}
startBot().catch(error => logError('❌ FALHA FATAL AO INICIAR O TOGI BOT', [`💥 ${error?.message || 'Erro desconhecido'}`]));
