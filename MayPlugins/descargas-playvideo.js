const yts = require("yt-search");
const { ytv } = require("@soymaycol/maytube");
const fetch = require("node-fetch");
const crypto = require("crypto");
const { Blob } = require("formdata-node");
const { fileTypeFromBuffer } = require("file-type");
const { FormData } = require("formdata-node");

const LIMIT_MB = 100;

module.exports = (bot) => {
  bot.onText(/^\/playvideo (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];

    if (!text) return bot.sendMessage(chatId, "🎥 Ingresa un nombre o URL de YouTube.");

    await bot.sendMessage(chatId, "🔍 Buscando en YouTube...");

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

      // Verificar tamaño
      let sizeMB = 0;
      let buffer = null;

      try {
        const res = await fetch(api.url);
        buffer = await res.buffer();
        sizeMB = buffer.length / (1024 * 1024);
      } catch (e) {
        console.log("⚠️ No se pudo calcular el tamaño, se intentará igual.");
      }

      // Si pesa demasiado o da error, subir a CatBox
      if (sizeMB > LIMIT_MB) {
        const catboxUrl = await subirACatbox(buffer);
        return bot.sendMessage(chatId, `📦 El video es muy pesado (${sizeMB.toFixed(2)} MB), así que lo subí a CatBox:\n\n🔗 ${catboxUrl}`);
      }

      await bot.sendVideo(chatId, api.url, {
        caption: `🎬 *${api.title || video.title}*`,
        parse_mode: "Markdown",
        filename: `${video.title.replace(/[^\w\s]/gi, "")}.mp4`
      });

    } catch (err) {
      console.error("❌ Error general:", err);
      bot.sendMessage(chatId, `❌ Error al procesar el video:\n${err.message || err}`);
    }
  });
};

// Función para subir a CatBox
async function subirACatbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
  const blob = new Blob([content.toArrayBuffer()], { type: mime });
  const formData = new FormData();
  const randomName = crypto.randomBytes(5).toString("hex");

  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, randomName + "." + ext);

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent": "MaycolBotUploader/1.0"
    }
  });

  return await res.text();
}
