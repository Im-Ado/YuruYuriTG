const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const SESSIONS_DIR = path.join(__dirname, 'MaySessions');
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);

const bots = {}; // Memoria RAM

function loadBot(token) {
  if (bots[token]) return bots[token]; // Ya está en RAM

  const bot = new TelegramBot(token, { polling: true });
  bots[token] = bot;

  const sessionPath = path.join(SESSIONS_DIR, `${token}.json`);
  fs.writeFileSync(sessionPath, JSON.stringify({ token, startedAt: Date.now() }, null, 2));

  bot.on('message', (msg) => {
    console.log(`[${token}] ${msg.chat.username || msg.chat.id}: ${msg.text}`);
    bot.sendMessage(msg.chat.id, `🤖 Bot activo. Recibido: "${msg.text}"`);
  });

  bot.on('polling_error', (err) => {
    console.error(`[${token}] Error:`, err.message);
  });

  return bot;
}

function isActive(token) {
  return bots[token] !== undefined;
}

module.exports = {
  loadBot,
  isActive,
};
