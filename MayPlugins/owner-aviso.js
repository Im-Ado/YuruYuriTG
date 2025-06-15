module.exports = (bot) => {
  const OWNER_ID = 7675783113; // Tu ID de Telegram
  const CHANNEL_ID = '@soymaycol'; // Canal donde se enviará el aviso

  bot.onText(/^\/aviso(?:\s+)?([\s\S]*)/i, async (msg, match) => {
    const userId = msg.from.id;

    if (userId !== OWNER_ID) {
      return bot.sendMessage(msg.chat.id, '🚫 Este comando es exclusivo para el owner uwu.', {
        reply_to_message_id: msg.message_id
      });
    }

    const contenido = match[1]?.trim();
    if (!contenido) {
      return bot.sendMessage(msg.chat.id, '❗ Escribe el mensaje del aviso después del comando. Ejemplo:\n\n`/aviso Se viene actualización épica!`', {
        reply_to_message_id: msg.message_id,
        parse_mode: 'Markdown'
      });
    }

    const decorado = `
╔══════════════════════╗
         *🌟 A V I S O - O F I C I A L 🌟*
╚══════════════════════╝

📝 *Mensaje:*
> ${contenido}

🕘 *Publicado:* ${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}

⚙️ *Enviado por:* MaycolBot™ (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤

━━━━━━━━━━━━━━━━━━━━━━━
#anuncio #maycolbot #info
`.trim();

    try {
      await bot.sendMessage(CHANNEL_ID, decorado, {
        parse_mode: 'Markdown'
      });

      await bot.sendMessage(msg.chat.id, '✅ ¡Aviso enviado con éxito al canal!', {
        reply_to_message_id: msg.message_id
      });
    } catch (err) {
      console.error('[Error enviando aviso]', err);
      await bot.sendMessage(msg.chat.id, '❌ Ocurrió un error al enviar el aviso al canal.', {
        reply_to_message_id: msg.message_id
      });
    }
  });
};
