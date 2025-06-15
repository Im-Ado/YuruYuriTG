module.exports = (bot) => { bot.onText(/^/evento (.+)$/i, async (msg, match) => { if (msg.chat.type !== 'channel') return; const texto = match[1];

const eventoMsg = `🎊 *¡Evento Especial!*

🗓️ Detalles: ${texto} 📢 ¡No faltes, te esperamos! ❤️`;

try {
  await bot.sendMessage(msg.chat.id, eventoMsg, { parse_mode: 'Markdown' });
} catch (e) {
  console.error('[Error Evento]', e);
}

}); };
