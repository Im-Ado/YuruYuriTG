module.exports = (bot) => {
  bot.onText(/^\/evento\s+(@\S+)\s*\|\s*(.+)/, async (msg, match) => {
    const canal = match[1]; // @canal
    const textoEvento = match[2];
    const desdeChat = msg.chat.id;

    if (!textoEvento) {
      return bot.sendMessage(desdeChat, '⚠️ Debes escribir el contenido del evento después del canal. Ejemplo:\n/evento @micanal | Fiesta este sábado 🕺🎉');
    }

    const mensaje = `🎉 *¡Nuevo Evento en el Canal!* 🎉\n\n${textoEvento}`;

    try {
      const canalInfo = await bot.getChat(canal);
      await bot.sendMessage(canalInfo.id, mensaje, {
        parse_mode: 'Markdown'
      });

      // Confirmación donde se usó el comando
      if (desdeChat !== canalInfo.id) {
        bot.sendMessage(desdeChat, `✅ El evento fue publicado en ${canal} con éxito (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤`);
      }

    } catch (error) {
      console.error(error);
      bot.sendMessage(desdeChat, `❌ No pude publicar el evento en ${canal}.\n¿Tengo permisos suficientes? (⁠｡⁠•́︿•̀｡⁠)`);
    }
  });
};
