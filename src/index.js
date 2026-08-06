import 'dotenv/config';
import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import P from 'pino';
import qrcode from 'qrcode-terminal';
import fs from 'node:fs/promises';
import config from './config.js';
import { loadCommands } from './core/command-loader.js';
import { ensureUser, ensureGroup } from './database/index.js';
import { getText, getSender, getName } from './utils/message.js';

const logger = P({ level: process.env.LOG_LEVEL || 'info' });
let commands = new Map();
let reconnecting = false;

async function startBot() {
  await fs.mkdir(config.connection.authDir, { recursive: true });
  commands = await loadCommands();

  const { state, saveCreds } = await useMultiFileAuthState(config.connection.authDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: ['Togi Bot', 'Chrome', '1.0.0'],
    markOnlineOnConnect: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) qrcode.generate(qr, { small: true });

    if (connection === 'open') {
      reconnecting = false;
      logger.info(`🤖 ${config.bot.name} conectado com ${commands.size} comandos.`);

      if (config.connection.pairingPhone && !sock.authState?.creds?.registered) {
        try {
          const phone = config.connection.pairingPhone.replace(/[^0-9]/g, '');
          const code = await sock.requestPairingCode(phone);
          logger.info(`🔐 Pairing Code: ${code}`);
        } catch (error) {
          logger.error(error, 'Falha ao gerar Pairing Code');
        }
      }
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      logger.warn(`Conexão encerrada (${statusCode ?? 'desconhecido'}). Reconectar: ${shouldReconnect}`);
      if (shouldReconnect && !reconnecting) {
        reconnecting = true;
        setTimeout(() => startBot().catch(error => logger.error(error)), 3000);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const message = messages?.[0];
    if (!message?.message || message.key.fromMe) return;

    const text = getText(message).trim();
    if (!text.startsWith(config.bot.prefix)) return;

    const body = text.slice(config.bot.prefix.length).trim();
    const [name, ...args] = body.split(/\s+/);
    const command = commands.get(name.toLowerCase());
    if (!command) return;

    const sender = getSender(message);
    const chat = message.key.remoteJid;
    const isGroup = chat?.endsWith('@g.us');
    const userName = getName(message);

    ensureUser(sender, userName);
    if (isGroup) ensureGroup(chat);

    const reply = content => sock.sendMessage(chat, { text: String(content) }, { quoted: message });

    try {
      await command.execute({ sock, message, sender, chat, args, text, isGroup, reply });
    } catch (error) {
      logger.error(error, `Erro no comando ${name}`);
      await reply('❌ Ocorreu um erro ao executar esse comando.');
    }
  });
}

startBot().catch(error => {
  logger.error(error, 'Falha fatal ao iniciar o Togi Bot');
  process.exitCode = 1;
});
