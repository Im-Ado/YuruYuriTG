const { loadBot, isActive } = require('../sessionManager');

module.exports = (bot) => {
  bot.onText(/^\/maybot\s+(.+)$/, async (msg, match) => {
    const userToken = match[1];
    const chatId = msg.chat.id;

    try {
      if (isActive(userToken)) {
        bot.sendMessage(chatId, '🤖 Ese bot ya está activo. Reforzando conexión...');
        loadBot(userToken); // Reforzar/reusar
      } else {
        loadBot(userToken);
        bot.sendMessage(chatId, '✅ Bot creado y conectado con éxito (⁠｡⁠･⁠ω⁠･⁠｡⁠)⁠ﾉ⁠♡');
      }
    } catch (e) {
      console.error('❌ Error al conectar el bot:', e.message);
      bot.sendMessage(chatId, `⚠️ Error: ${e.message}`);
    }
  });
};
