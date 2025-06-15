const fetch = require('node-fetch');
const crypto = require('crypto');
const { FormData, Blob } = require('formdata-node');
const { fileTypeFromBuffer } = require('file-type');

module.exports = (bot) => {
  bot.onText(/^\/catbox$/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      const fileId = msg.reply_to_message?.document?.file_id || msg.reply_to_message?.photo?.pop()?.file_id || msg.reply_to_message?.video?.file_id;
      if (!fileId) {
        return bot.sendMessage(chatId, `⚠️ Por favor, responde a una imagen, video o archivo para subirlo a CatBox.`, { reply_to_message_id: msg.message_id });
      }

      const fileLink = await bot.getFileLink(fileId);
      const res = await fetch(fileLink.href);
      const buffer = await res.buffer();

      const mimeGuess = (await fileTypeFromBuffer(buffer)) || {};
      const isMedia = /image\/(png|jpe?g|gif)|video\/mp4/.test(mimeGuess.mime || '');
      const catLink = await catbox(buffer);

      const info = `*乂 C A T B O X - U P L O A D E R 乂*\n\n` +
        `*📦 Enlace:* ${catLink}\n` +
        `*📁 Tamaño:* ${formatBytes(buffer.length)}\n` +
        `*⏳ Expiración:* ${isMedia ? 'No expira' : 'Desconocido'}\n\n` +
        `> 💻 *MaycolAIUploader*`;

      await bot.sendMessage(chatId, info, {
        reply_to_message_id: msg.message_id,
        parse_mode: 'Markdown'
      });

    } catch (e) {
      console.error(e);
      bot.sendMessage(chatId, `❌ Hubo un error al subir a CatBox.`, { reply_to_message_id: msg.message_id });
    }
  });
};

// 🧠 Función para subir a CatBox
async function catbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || { ext: 'bin', mime: 'application/octet-stream' };
  const blob = new Blob([content], { type: mime });
  const formData = new FormData();
  const randomBytes = crypto.randomBytes(5).toString("hex");

  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, randomBytes + "." + ext);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"
    }
  });

  return await response.text();
}

// 🔢 Formatear tamaño en bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}
