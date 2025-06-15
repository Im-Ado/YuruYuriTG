module.exports = (bot) => {
  bot.onText(/^\/evento(?:\s+(.+))?$/, async (msg, match) => {
    if (msg.chat.type !== 'channel') return;

    const contenido = match[1];
    if (!contenido) return;

    bot.sendMessage(msg.chat.id, `🎉 *¡Nuevo Evento en el Canal!* 🎉\n\n${contenido}`, {
      parse_mode: 'Markdown'
    });
  });
};
