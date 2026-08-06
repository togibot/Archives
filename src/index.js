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

const logger = P({ level: process.env.LOG_LEVEL || 'info' });
let commands = new Map();
let restarting = false;

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

async function startBot() {
  restarting = false;

  await fs.mkdir(config.connection.authDir, { recursive: true });
  commands = await loadCommands();

  const { state, saveCreds } = await useMultiFileAuthState(config.connection.authDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
    // WEB_BROWSER-compatible identity avoids recent WhatsApp Web/Desktop
    // fingerprint rejections during fresh pairing sessions.
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: false
  });

  sock.ev.on('creds.update', saveCreds);

  const pairingPhone = normalizePhone(config.connection.pairingPhone);
  let pairingRequested = false;

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    // requestPairingCode must not be called immediately on the initial
    // "connecting" event: the socket may not have completed its WebSocket
    // handshake yet, which causes 428 "Connection Closed".
    // Baileys exposes a QR/ref update once the socket is ready for pairing.
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

      logger.warn(
        `🔌 Conexão encerrada (${statusCode ?? 'desconhecido'}). Reconectar: ${shouldReconnect}`
      );

      if (shouldReconnect && !restarting) {
        restarting = true;
        setTimeout(() => {
          startBot().catch(error => {
            restarting = false;
            logger.error({ err: error }, '❌ Falha ao reiniciar o Togi Bot');
          });
        }, 3000);
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
      if (!message?.message || message.key.fromMe) continue;

      const text = getText(message).trim();
      if (!text.startsWith(config.bot.prefix)) continue;

      const body = text.slice(config.bot.prefix.length).trim();
      if (!body) continue;

      const [name, ...args] = body.split(/\s+/);
      const command = commands.get(name.toLowerCase());
      if (!command) continue;

      const sender = getSender(message);
      const chat = message.key.remoteJid;
      const isGroup = chat?.endsWith('@g.us');
      const userName = getName(message);

      ensureUser(sender, userName);
      if (isGroup) ensureGroup(chat);

      const reply = (content, options = {}) =>
        sock.sendMessage(
          chat,
          { text: String(content), ...options },
          { quoted: message }
        );

      try {
        await command.execute({
          sock,
          message,
          sender,
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
