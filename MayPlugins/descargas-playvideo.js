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

      // Obtener información del video
      const api = await ytv(video.url);
      if (!api?.url) throw new Error("No se pudo obtener el video.");

      console.log("URL del video:", api.url); // Para debugging

      // Validar que la URL sea accesible
      let sizemb = 0;
      let isValidUrl = false;
      
      try {
        const res = await fetch(api.url, { 
          method: "HEAD",
          timeout: 10000, // 10 segundos de timeout
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (res.ok) {
          isValidUrl = true;
          const length = res.headers.get("content-length");
          sizemb = length ? parseInt(length) / (1024 * 1024) : 0;
        }
      } catch (e) {
        console.log("Error al verificar URL:", e.message);
        isValidUrl = false;
      }

      if (!isValidUrl) {
        return bot.sendMessage(chatId, "❌ La URL del video no es válida o no está disponible. Intenta con otro video.");
      }

      if (sizemb > LIMIT_MB && sizemb > 0) {
        return bot.sendMessage(chatId, `🚫 El archivo pesa ${sizemb.toFixed(2)} MB. Límite: ${LIMIT_MB} MB. Usa otro video 🎬`);
      }

      // Sanitizar el nombre del archivo
      const cleanTitle = video.title.replace(/[^\w\s\-_.]/gi, "").substring(0, 50);
      
      // Intentar enviar el video con opciones adicionales
      try {
        await bot.sendVideo(chatId, api.url, {
          caption: `🎬 *${api.title || video.title}*`,
          parse_mode: "HTML",
          filename: `${cleanTitle}.mp4`,
          supports_streaming: true
        });
      } catch (videoError) {
        console.error("Error enviando video:", videoError);
        
        // Alternativa: enviar como documento
        try {
          await bot.sendDocument(chatId, api.url, {
            caption: `🎬 *${api.title || video.title}*\n\n📁 Enviado como archivo debido a restricciones`,
            parse_mode: "HTML",
            filename: `${cleanTitle}.mp4`
          });
        } catch (docError) {
          console.error("Error enviando documento:", docError);
          
          // Última alternativa: enviar solo el enlace
          await bot.sendMessage(chatId, 
            `❌ No se pudo enviar el video directamente.\n\n🔗 Enlace del video:\n${api.url}\n\n💡 Puedes descargar manualmente desde este enlace.`,
            { parse_mode: "HTML" }
          );
        }
      }

    } catch (err) {
      console.error("Error general:", err);
      
      // Mensajes de error más específicos
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
