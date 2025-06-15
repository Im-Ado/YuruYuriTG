module.exports = (bot) => {
  bot.onText(/^\/playaudio (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];

    if (!text) return bot.sendMessage(chatId, "🎵 Ingresa un nombre o URL de YouTube.");
    
    bot.sendMessage(chatId, "🔍 Buscando en YouTube...");

    try {
      // Importaciones dinámicas para evitar error de módulos ES
      const { default: yts } = await import("yt-search");
      const { yta } = await import("@soymaycol/maytube");

      const res = await yts(text);
      const video = res?.all?.[0];

      if (!video) return bot.sendMessage(chatId, "❌ No se encontró ningún video.");

      const info = `🎧 *「 ${video.title} 」*\n👤 Canal: ${video.author?.name || "Desconocido"}\n⏱️ Duración: ${video.duration?.timestamp || "?"}\n👀 Vistas: ${video.views || "?"}\n\n⏳ Descargando audio...`;

      if (video.thumbnail) {
        await bot.sendPhoto(chatId, video.thumbnail, { caption: info, parse_mode: "Markdown" });
      } else {
        await bot.sendMessage(chatId, info, { parse_mode: "Markdown" });
      }

      const api = await yta(video.url);
      if (!api?.result?.download) throw new Error("No se pudo obtener el enlace de audio.");

      await bot.sendAudio(chatId, api.result.download, {
        filename: `${video.title.replace(/[^\w\s]/gi, "")}.mp3`,
        caption: `🎶 *${api.result.title || video.title}*`,
        parse_mode: "Markdown"
      });

    } catch (err) {
      console.error("Error:", err);
      bot.sendMessage(chatId, `❌ Error:\n${err.message}`);
    }
  });
};
