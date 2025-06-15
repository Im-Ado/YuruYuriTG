const yts = require("yt-search");
const { ytv } = require("@soymaycol/maytube");
const fetch = require("node-fetch");

const LIMIT_MB = 100;

module.exports = (bot) => {
  bot.onText(/^\/playvideo (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];

    if (!text) return bot.sendMessage(chatId, "🎥 Ingresa un nombre o URL de YouTube.");

    bot.sendMessage(chatId, "🔍 Buscando en YouTube...");

    try {
      const res = await yts(text);
      const video = res?.all?.[0];

      if (!video) return bot.sendMessage(chatId, "❌ No se encontró ningún video.");

      const info = `📺 *「 ${video.title} 」*\n👤 Canal: ${video.author?.name || "Desconocido"}\n⏱️ Duración: ${video.duration?.timestamp || "?"}\n👀 Vistas: ${video.views || "?"}\n\n⏳ Descargando video...`;

      if (video.thumbnail) {
        await bot.sendPhoto(chatId, video.thumbnail, { caption: info, parse_mode: "Markdown" });
      } else {
        await bot.sendMessage(chatId, info, { parse_mode: "Markdown" });
      }

      const api = await ytv(video.url);
      if (!api?.url) throw new Error("No se pudo obtener el video.");

      // Comprobar tamaño
      let sizemb = 0;
      try {
        const res = await fetch(api.url, { method: "HEAD" });
        const length = res.headers.get("content-length");
        sizemb = length ? parseInt(length) / (1024 * 1024) : 0;
      } catch (e) {
        console.log("No se pudo verificar el tamaño:", e.message);
      }

      if (sizemb > LIMIT_MB && sizemb > 0) {
        return bot.sendMessage(chatId, `🚫 El archivo pesa ${sizemb.toFixed(2)} MB. Límite: ${LIMIT_MB} MB. Usa otro video 🎬`);
      }

      const doc = sizemb >= LIMIT_MB && sizemb > 0;

      await bot.sendVideo(chatId, api.url, {
        filename: `${video.title.replace(/[^\w\s]/gi, "")}.mp4`,
        caption: `🎬 *${api.title || video.title}*`,
        parse_mode: "HTML"
      });

    } catch (err) {
      console.error("Error:", err);
      bot.sendMessage(chatId, `❌ Error:\n${err.message}`);
    }
  });
};
