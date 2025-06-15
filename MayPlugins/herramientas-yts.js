const yts = require('yt-search');

module.exports = (bot) => {
  bot.onText(/^\/(ytsearch|ytbuscar|yts)(?:\s+(.*))?$/i, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[2];

    if (!text) {
      return bot.sendMessage(chatId, `⚠️ Por favor, ingresa una búsqueda de YouTube.`, {
        reply_to_message_id: msg.message_id
      });
    }

    await bot.sendMessage(chatId, `🔍 Buscando en YouTube...`, {
      reply_to_message_id: msg.message_id
    });

    try {
      const results = await yts(text);
      const videos = results.videos.slice(0, 5); // top 5 resultados

      if (videos.length === 0) {
        return bot.sendMessage(chatId, `❌ No se encontraron resultados para: *${text}*`, {
          parse_mode: "Markdown",
          reply_to_message_id: msg.message_id
        });
      }

      const msgResults = videos.map(v => {
        return `✨ *${v.title}*\n👤 ${v.author.name}\n🕒 ${v.timestamp}\n📅 ${v.ago}\n👁️ ${v.views.toLocaleString()} vistas\n🔗 ${v.url}`;
      }).join('\n\n───────────────\n\n');

      // Enviar imagen del primer resultado
      await bot.sendPhoto(chatId, videos[0].thumbnail, {
        caption: `🎬 *Resultados para:* _${text}_\n\n${msgResults}`,
        parse_mode: "Markdown"
      });

    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, `❌ Error al buscar en YouTube.`, {
        reply_to_message_id: msg.message_id
      });
    }
  });
};
