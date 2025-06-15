const yts = require("yt-search");
const { ytv } = require("@soymaycol/maytube");
const fs = require("fs");
const path = require("path");
const https = require("https");

const LIMIT_MB = 100;

// Función para descargar un archivo desde una URL a una ruta local
const downloadToFile = (url, dest) =>
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on("finish", () => {
        file.close(() => resolve(dest));
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });

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

      console.log("URL del video:", api.url);

      // Verificar tamaño del archivo
      let sizemb = 0;
      try {
        const headRes = await fetch(api.url, {
          method: "HEAD",
          headers: { "User-Agent": "Mozilla/5.0" }
        });

        if (headRes.ok) {
          const length = headRes.headers.get("content-length");
          sizemb = length ? parseInt(length) / (1024 * 1024) : 0;
        }
      } catch (e) {
        console.log("Advertencia: no se pudo obtener tamaño del archivo:", e.message);
      }

      if (sizemb > LIMIT_MB && sizemb > 0) {
        return bot.sendMessage(chatId, `🚫 El archivo pesa ${sizemb.toFixed(2)} MB. Límite: ${LIMIT_MB} MB. Usa otro video 🎬`);
      }

      // Sanitizar el nombre del archivo
      const cleanTitle = video.title.replace(/[^\w\s\-_.]/gi, "").substring(0, 50);
      const filePath = path.join(__dirname, `${cleanTitle}.mp4`);

      try {
        await bot.sendMessage(chatId, "⬇️ Descargando video localmente...");
        await downloadToFile(api.url, filePath);

        await bot.sendVideo(chatId, fs.createReadStream(filePath), {
          caption: `🎬 <b>${api.title || video.title}</b>`,
          parse_mode: "HTML",
          supports_streaming: true
        });

        fs.unlink(filePath, () => {}); // Borrar el archivo temporal
      } catch (videoError) {
        console.error("Error enviando video:", videoError);

        await bot.sendMessage(chatId,
          `❌ No se pudo descargar o enviar el video.\n\n🔗 Enlace para descargar manualmente:\n${api.url}`,
          { parse_mode: "HTML" }
        );
      }

    } catch (err) {
      console.error("Error general:", err);

      if (err.message.includes("ETELEGRAM")) {
        bot.sendMessage(chatId, "❌ Error de Telegram: No se pudo procesar el video. El enlace puede estar caducado o no ser compatible.");
      } else if (err.message.includes("timeout")) {
        bot.sendMessage(chatId, "❌ Tiempo de espera agotado. El video puede ser demasiado largo o el servidor no responde.");
      } else if (err.message.includes("403") || err.message.includes("forbidden")) {
        bot.sendMessage(chatId, "❌ Acceso denegado al video. Puede estar restringido geográficamente.");
      } else {
        bot.sendMessage(chatId, `❌ Error: ${err.message}`);
      }
    }
  });
};
