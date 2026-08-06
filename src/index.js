import 'dotenv/config';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers
} from '@whiskeysockets/baileys';
import P from 'pino';
import fs from 'node:fs/promises';
import config from './config.js';
import { loadCommands } from './core/command-loader.js';
import { ensureUser, ensureGroup } from './database/index.js';
import { getText, getSender, getName } from './utils/message.js';
import { askTogi, isTogiActive } from './services/togi-ai.js';

const logger = P({ level: process.env.LOG_LEVEL || 'info' });
let commands = new Map();
let restarting = false;

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function getMenuReaction(command) {
  const category = String(command?.category || '').toLowerCase();
  const name = String(command?.name || '').toLowerCase();

  if (!name.includes('menu')) return null;

  const reactions = {
    geral: '📋',
    economia: '🪙',
    pets: '🐾',
    quiz: '🧠',
    rpg: '🎮',
    social: '💞',
    grupo: '👥',
    group: '👥',
    moderacao: '🛡️',
    admin: '🛡️',
    sticker: '🎨',
    fig: '🎨',
    diversao: '🎲',
    fun: '🎲',
    ranking: '🏆',
    eventos: '🎁',
    musica: '🎵',
    music: '🎵',
    ia: '🤖',
    vip: '👑'
  };

  return reactions[category] || '📋';
}

async function reactToMenu(sock, message, command) {
  const emoji = getMenuReaction(command);
  if (!emoji) return;

  try {
    await sock.sendMessage(message.key.remoteJid, {
      react: {
        text: emoji,
        key: message.key
      }
    });
  } catch (error) {
    logger.debug({ err: error }, 'Não foi possível reagir ao menu.');
  }
}

async function startBot() {
  restarting = false;

  await fs.mkdir(config.connection.authDir, { recursive: true });
  commands = await loadCommands();

  const { state, saveCreds } = await useMultiFileAuthState(config.connection.authDir);
  const { version } = await fetchLatestBaileysVersion();
  const messageCache = new Map();

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: false,
    emitOwnEvents: true,
    syncFullHistory: false,
    shouldSyncHistoryMessage: () => false,
    getMessage: async (key) => messageCache.get(key.id)?.message || undefined
  });

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
      } catch (error) {
        pairingRequested = false;
        logger.error({ err: error }, '❌ Falha ao gerar o Pairing Code.');
      }
    }

    if (connection === 'open') {
      restarting = false;
      logger.info(`🤖 ${config.bot.name} conectado com ${commands.size} comandos.`);
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      logger.warn(`🔌 Conexão encerrada (${statusCode ?? 'desconhecido'}). Reconectar: ${shouldReconnect}`);
      if (shouldReconnect && !restarting) {
        restarting = true;
        setTimeout(() => startBot().catch(error => {
          restarting = false;
          logger.error({ err: error }, '❌ Falha ao reiniciar o Togi Bot');
        }), 3000);
      }
    }
  });

  if (!state.creds.registered && !pairingPhone) {
    logger.warn('⚠️ PAIRING_PHONE não configurado. Defina PAIRING_PHONE no arquivo .env para gerar o código.');
  } else if (state.creds.registered) {
    logger.info('🔑 Sessão existente encontrada. Pairing Code não será solicitado.');
  }

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const message of messages || []) {
      if (!message?.message) continue;

      messageCache.set(message.key.id, message);
      if (messageCache.size > 200) {
        const firstKey = messageCache.keys().next().value;
        messageCache.delete(firstKey);
      }

      const text = getText(message).trim();
      const sender = getSender(message);
      const chat = message.key.remoteJid;
      const isGroup = chat?.endsWith('@g.us');
      const userName = getName(message);
      const effectiveSender = message.key.fromMe
        ? `${pairingPhone}@s.whatsapp.net`
        : sender;

      ensureUser(effectiveSender, userName);
      if (isGroup) ensureGroup(chat);

      const reply = async (content, options = {}) => {
        const payload = { text: String(content), ...options };
        if (message.key.fromMe) return sock.sendMessage(chat, payload);
        return sock.sendMessage(chat, payload, { quoted: message });
      };

      // Quando o Togi está ativo para este usuário, mensagens normais entram na conversa com a IA.
      if (!text.startsWith(config.bot.prefix) && isTogiActive(effectiveSender)) {
        try {
          await reply(`🤖 ${await askTogi(effectiveSender, text)}`);
        } catch (error) {
          logger.error({ err: error }, 'Erro na Togi AI');
          await reply('❌ A Togi AI está indisponível no momento. Verifique a configuração da GEMINI_API_KEY.');
        }
        continue;
      }

      if (!text.startsWith(config.bot.prefix)) continue;

      const body = text.slice(config.bot.prefix.length).trim();
      if (!body) continue;

      const [name, ...args] = body.split(/\s+/);
      const command = commands.get(name.toLowerCase());
      if (!command) continue;

      await reactToMenu(sock, message, command);

      try {
        await command.execute({
          sock,
          message,
          sender: effectiveSender,
          chat,
          args,
          text,
          isGroup,
          reply
        });
      } catch (error) {
        logger.error({ err: error }, `Erro no comando ${name}`);
        await reply('❌ Ocorreu um erro ao executar esse comando.');
      }
    }
  });
}

startBot().catch(error => {
  logger.error({ err: error }, '❌ Falha fatal ao iniciar o Togi Bot');
  process.exitCode = 1;
});