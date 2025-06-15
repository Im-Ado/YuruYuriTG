const yts = require("yt-search");
const { ytv } = require("@soymaycol/maytube");
const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream");
const { promisify } = require("util");

const streamPipeline = promisify(pipeline);
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

      // Obtener la URL de descarga
      const api = await ytv(video.url);
      if (!api?.url) throw new Error("No se pudo obtener el video.");

      console.log("URL del video:", api.url);

      // Verificar tamaño con HEAD
      let sizemb = 0;
      let isValidUrl = false;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const headRes = await fetch(api.url, {
          method: "HEAD",
          headers: {
            'User-Agent': 'Mozilla/5.0'
          },
          signal: controller.signal,
          redirect: "follow"
        });

        clearTimeout(timeout);

        if (headRes.ok) {
          isValidUrl = true;
          const length = headRes.headers.get("content-length");
          sizemb = length ? parseInt(length) / (1024 * 1024) : 0;
        }
      } catch (e) {
        console.log("Error al verificar URL:", e.message);
      }

      if (!isValidUrl) {
        return bot.sendMessage(chatId, "❌ La URL del video no es válida o no está disponible. Intenta con otro video.");
      }

      if (sizemb > LIMIT_MB && sizemb > 0) {
        return bot.sendMessage(chatId, `🚫 El archivo pesa ${sizemb.toFixed(2)} MB. Límite: ${LIMIT_MB} MB. Usa otro video 🎬`);
      }

      // Descargar y enviar video localmente
      const cleanTitle = video.title.replace(/[^\w\s\-_.]/gi, "").substring(0, 50);
      const filename = `${cleanTitle}.mp4`;
      const filepath = path.resolve(__dirname, "temp", filename);

      // Crear carpeta si no existe
      fs.mkdirSync(path.dirname(filepath), { recursive: true });

      // Descargar el video
      const response = await fetch(api.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        },
        redirect: 'follow'
      });

      if (!response.ok) throw new Error(`Error al descargar video: ${response.status}`);

      await streamPipeline(response.body, fs.createWriteStream(filepath));

      // Enviar a Telegram
      await bot.sendVideo(chatId, filepath, {
        caption: `🎬 *${api.title || video.title}*`,
        parse_mode: "Markdown",
        supports_streaming: true
      });

      // Borrar después
      fs.unlinkSync(filepath);

    } catch (err) {
      console.error("Error general:", err);

      if (err.message.includes("ETELEGRAM")) {
        bot.sendMessage(chatId, "❌ Error de Telegram: No se pudo procesar el video. Puede estar dañado o no accesible.");
      } else if (err.message.includes("timeout")) {
        bot.sendMessage(chatId, "❌ Tiempo de espera agotado. El servidor del video no respondió.");
      } else if (err.message.includes("403") || err.message.includes("forbidden")) {
        bot.sendMessage(chatId, "❌ Acceso denegado al video. Puede estar restringido geográficamente.");
      } else {
        bot.sendMessage(chatId, `❌ Error: ${err.message}`);
      }
    }
  });
};
