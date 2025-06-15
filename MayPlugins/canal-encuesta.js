module.exports = (bot) => {
  bot.onText(/^\/encuesta(?:\s+(.+))?$/, async (msg, match) => {
    if (msg.chat.type !== 'channel') return;

    const pregunta = match[1];
    if (!pregunta) return;

    bot.sendPoll(msg.chat.id, `📊 *Encuesta de la Comunidad*\n\n${pregunta}`, ['Sí', 'No', 'Tal vez'], {
      is_anonymous: false,
      allows_multiple_answers: false,
      parse_mode: 'Markdown'
    });
  });
};
