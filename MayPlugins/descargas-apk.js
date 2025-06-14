const { search, download } = require("aptoide-scraper");

module.exports = (bot) => {
  bot.onText(/^\/(apk|modapk|aptoide)(?: (.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[2];

    if (!text) {
      return bot.sendMessage(chatId, "📲 Por favor, ingresa el nombre de la APK que deseas descargar.");
    }

    bot.sendMessage(chatId, "⏳ Buscando la aplicación, espera un momento...");

    try {
      const searchA = await search(text);
      if (!searchA || searchA.length === 0) {
        return bot.sendMessage(chatId, "❌ No se encontraron resultados para tu búsqueda.");
      }

      const data = await download(searchA[0].id);

      if (!data?.dllink) {
        return bot.sendMessage(chatId, "❌ No se pudo obtener el enlace de descarga.");
      }

      const caption = `*🎮 Aptoide Downloader*\n\n` +
        `📱 *Nombre:* ${data.name}\n` +
        `📦 *Package:* ${data.package}\n` +
        `🕓 *Actualizado:* ${data.lastup}\n` +
        `📦 *Peso:* ${data.size}`;

      if (data.icon) {
        await bot.sendPhoto(chatId, data.icon, {
          caption,
          parse_mode: "Markdown"
        });
      } else {
        await bot.sendMessage(chatId, caption, { parse_mode: "Markdown" });
      }

      const peso = parseFloat(data.size.replace(' MB', '').replace('GB', '')) || 0;
      const isHeavy = data.size.includes("GB") || peso > 999;

      if (isHeavy) {
        return bot.sendMessage(chatId, "⚠️ El archivo es demasiado pesado para enviarlo por aquí.");
      }

      await bot.sendDocument(chatId, data.dllink, {
        filename: `${data.name}.apk`,
        caption: "✅ ¡Aquí tienes tu APK!",
        contentType: "application/vnd.android.package-archive"
      });

    } catch (err) {
      console.error("Error descargando APK:", err);
      bot.sendMessage(chatId, `❌ Hubo un error:\n\n${err.message}`);
    }
  });
};
