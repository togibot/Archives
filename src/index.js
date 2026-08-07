import 'dotenv/config';
import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers } from '@whiskeysockets/baileys';
import P from 'pino';
import fs from 'node:fs/promises';
import config from './config.js';
import { loadCommands } from './core/command-loader.js';
import { ensureUser, ensureGroup } from './database/index.js';
import { getText, getSender, getName } from './utils/message.js';
import { askTogi, isTogiActive } from './services/togi-ai.js';
import { getAfk, clearAfk } from './services/afk-store.js';
import { getCommandReaction } from './config/reactions.js';
import { getMenuImageUrl } from './config/menu-images.js';

const logger = P({ level: process.env.LOG_LEVEL || 'info' });
let commands = new Map();
let restarting = false;

function normalizePhone(value) { return String(value || '').replace(/\D/g, ''); }

async function reactToCommand(sock, message, command) {
  const emoji = getCommandReaction(command);
  if (!emoji) return;
  try { await sock.sendMessage(message.key.remoteJid, { react: { text: emoji, key: message.key } }); }
  catch (error) { logger.debug({ err: error }, 'Não foi possível reagir ao comando.'); }
}

function getMentionedJids(message) {
  const context = message?.message?.extendedTextMessage?.contextInfo;
  return Array.isArray(context?.mentionedJid) ? context.mentionedJid : [];
}

function formatAfkDuration(since) {
  const elapsedMs = Math.max(0, Date.now() - since);
  const minutes = Math.floor(elapsedMs / 60000);
  if (minutes < 1) return 'menos de 1 minuto';
  if (minutes === 1) return '1 minuto';
  if (minutes < 60) return `${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return hours === 1 ? '1 hora' : `${hours} horas`;
  return `${hours}h ${remaining}min`;
}

function getAfkKeys({ effectiveSender, sender, pairingPhone, sock }) {
  const keys = [effectiveSender, sender, sock?.user?.id, pairingPhone ? `${pairingPhone}@s.whatsapp.net` : ''].filter(Boolean);
  return [...new Set(keys)];
}

function findAfkEntry(keys) {
  for (const key of keys) {
    const entry = getAfk(key);
    if (entry) return { key, entry };
  }
  return null;
}

async function handleAfk(sock, message, effectiveSender, sender, pairingPhone, isGroup, reply, autoDisable = true) {
  if (autoDisable && !message.key.fromMe) {
    const ownAfk = findAfkEntry(getAfkKeys({ effectiveSender, sender, pairingPhone, sock }));
    if (ownAfk) {
      clearAfk(ownAfk.key);
      await reply(`👋 @${effectiveSender.split('@')[0]} saiu do AFK!\n⏱️ Tempo ausente: ${formatAfkDuration(ownAfk.entry.since)}\n📝 Motivo: ${ownAfk.entry.reason}`, { mentions: [effectiveSender] });
    }
  }

  if (!isGroup) return;
  const mentioned = [...new Set(getMentionedJids(message))];
  if (!mentioned.length) return;
  const notices = [];
  const mentions = [];
  for (const jid of mentioned) {
    const entry = getAfk(jid);
    if (!entry) continue;
    notices.push(`💤 @${jid.split('@')[0]} está AFK.\n📝 Motivo: ${entry.reason}\n⏱️ Ausente há ${formatAfkDuration(entry.since)}`);
    mentions.push(jid);
  }
  if (notices.length) await reply(`╭━━━〔 💤 𝐀𝐅𝐊 〕━━━╮\n${notices.join('\n\n')}\n╰━━━━━━━━━━━━━━━━━━╯`, { mentions });
}

function isMenuCommand(name) {
  const normalized = String(name || '').toLowerCase();
  return normalized === 'menu' || normalized === 'help' || normalized === 'ajuda' || normalized === 'm' || normalized.startsWith('menu');
}

async function sendMenuReply(sock, chat, message, imageUrl, content, options = {}) {
  const payload = { image: { url: imageUrl }, caption: String(content), ...options };
  if (message.key.fromMe) return sock.sendMessage(chat, payload);
  return sock.sendMessage(chat, payload, { quoted: message });
}

async function startBot() {
  restarting = false;
  await fs.mkdir(config.connection.authDir, { recursive: true });
  commands = await loadCommands();
  const { state, saveCreds } = await useMultiFileAuthState(config.connection.authDir);
  const { version } = await fetchLatestBaileysVersion();
  const messageCache = new Map();
  const sock = makeWASocket({ version, auth: state, logger, printQRInTerminal: false, browser: Browsers.ubuntu('Chrome'), markOnlineOnConnect: false, emitOwnEvents: true, syncFullHistory: false, shouldSyncHistoryMessage: () => false, getMessage: async (key) => messageCache.get(key.id)?.message || undefined });
  sock.ev.on('creds.update', saveCreds);
  const pairingPhone = normalizePhone(config.connection.pairingPhone);
  let pairingRequested = false;

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (!state.creds.registered && pairingPhone && !pairingRequested && qr) {
      pairingRequested = true;
      try {
        const code = await sock.requestPairingCode(pairingPhone);
        logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        logger.info(`🔐 TOGI BOT — PAIRING CODE: ${code}`);
        logger.info(`📱 Número: +${pairingPhone}`);
        logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        logger.info(`No WhatsApp, abra Dispositivos conectados e use a opção de conectar por código.`);
      } catch (error) { pairingRequested = false; logger.error({ err: error }, '❌ Falha ao gerar o Pairing Code.'); }
    }
    if (connection === 'open') { restarting = false; logger.info(`🤖 ${config.bot.name} conectado com ${commands.size} comandos.`); }
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      logger.warn(`🔌 Conexão encerrada (${statusCode ?? 'desconhecido'}). Reconectar: ${shouldReconnect}`);
      if (shouldReconnect && !restarting) {
        restarting = true;
        setTimeout(() => startBot().catch(error => { restarting = false; logger.error({ err: error }, '❌ Falha ao reiniciar o Togi Bot'); }), 3000);
      }
    }
  });

  if (!state.creds.registered && !pairingPhone) logger.warn('⚠️ PAIRING_PHONE não configurado. Defina PAIRING_PHONE no arquivo .env para gerar o código.');
  else if (state.creds.registered) logger.info('🔑 Sessão existente encontrada. Pairing Code não será solicitado.');

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const message of messages || []) {
      if (!message?.message) continue;
      messageCache.set(message.key.id, message);
      if (messageCache.size > 200) { const firstKey = messageCache.keys().next().value; messageCache.delete(firstKey); }
      const text = getText(message).trim();
      const sender = getSender(message);
      const chat = message.key.remoteJid;
      const isGroup = chat?.endsWith('@g.us');
      const userName = getName(message);
      const effectiveSender = message.key.fromMe ? `${pairingPhone}@s.whatsapp.net` : sender;
      ensureUser(effectiveSender, userName);
      if (isGroup) ensureGroup(chat);
      const reply = async (content, options = {}) => {
        const payload = { text: String(content), ...options };
        if (message.key.fromMe) return sock.sendMessage(chat, payload);
        return sock.sendMessage(chat, payload, { quoted: message });
      };

      let parsedCommandName = '';
      if (text.startsWith(config.bot.prefix)) {
        const body = text.slice(config.bot.prefix.length).trim();
        parsedCommandName = body.split(/\s+/)[0]?.toLowerCase() || '';
      }
      const isAfkToggle = parsedCommandName === 'afk' || parsedCommandName === 'ausente';
      try {
        await handleAfk(sock, message, effectiveSender, sender, pairingPhone, isGroup, reply, !isAfkToggle);
      } catch (error) { logger.debug({ err: error }, 'Falha ao processar AFK.'); }

      if (!text.startsWith(config.bot.prefix) && isTogiActive(effectiveSender)) {
        try {
          const answer = await askTogi(effectiveSender, text);
          if (answer) await reply(`🤖 ${answer}`);
        }
        catch (error) { logger.error({ err: error }, 'Erro na Togi AI'); await reply('❌ A Togi AI está indisponível no momento. Verifique a configuração da GEMINI_API_KEY.'); }
        continue;
      }
      if (!text.startsWith(config.bot.prefix)) continue;
      const body = text.slice(config.bot.prefix.length).trim();
      if (!body) continue;
      const [name, ...args] = body.split(/\s+/);
      const command = commands.get(name.toLowerCase());
      if (!command) continue;
      await reactToCommand(sock, message, command);
      try {
        const menuImageUrl = isMenuCommand(name) ? await getMenuImageUrl(name) : null;
        const commandReply = menuImageUrl ? (content, options = {}) => sendMenuReply(sock, chat, message, menuImageUrl, content, options) : reply;
        await command.execute({ sock, message, sender: effectiveSender, chat, args, text: args.join(' '), rawText: text, commandName: name.toLowerCase(), isGroup, reply: commandReply, react: async (emoji) => { try { await sock.sendMessage(chat, { react: { text: emoji, key: message.key } }); } catch {} } });
      } catch (error) { logger.error({ err: error, command: name }, `Erro no comando ${name}`); await reply(`❌ Erro ao executar .${name}: ${error?.message || 'erro desconhecido'}`); }
    }
  });
}

startBot().catch(error => logger.error({ err: error }, '❌ Falha fatal ao iniciar o Togi Bot'));
