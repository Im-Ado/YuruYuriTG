module.exports = (bot) => {
  bot.onText(/^\/encuesta\s+(@\S+)\s*\|\s*(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const canal = match[1]; // Canal donde enviar (ej: @miCanal)
    const pregunta = match[2]; // La pregunta de la encuesta

    if (!canal || !pregunta) {
      return bot.sendMessage(chatId, `⚠️ Usa el comando así:\n/encuesta @Canal | ¿Te gusta el bot?\n\n(⁠｡⁠•́⁠‿⁠•̀⁠｡⁠)♡`);
    }

    try {
      await bot.sendPoll(canal, `📊 *Encuesta de la Comunidad*\n\n${pregunta}`, ['Sí', 'No', 'Tal vez'], {
        is_anonymous: false,
        allows_multiple_answers: false,
        parse_mode: 'Markdown'
      });

      bot.sendMessage(chatId, `✅ Encuesta enviada correctamente a ${canal} ⊂(･ω･*⊂)`);

    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, `❌ No pude enviar la encuesta a ${canal}.\nVerifica que el bot sea admin o tenga permisos para enviar encuestas (⁠｡⁠•́︿•̀⁠｡⁠)`);
    }
  });
};
