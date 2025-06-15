const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const crypto = require('crypto');
const { FormData, Blob } = require('formdata-node');
const { fileTypeFromBuffer } = require('file-type');

module.exports = (bot) => {
  bot.onText(/^\/catbox$/, async (msg) => {
    const chatId = msg.chat.id;
    const reply = msg.reply_to_message;

    if (!reply) {
      return bot.sendMessage(chatId, `⚠️ Por favor, responde a una imagen, video o archivo para subirlo a CatBox.`, {
        reply_to_message_id: msg.message_id
      });
    }

    try {
      // Obtener el file_id de distintos tipos de media
      const fileId =
        reply.document?.file_id ||
        reply.photo?.at(-1)?.file_id ||
        reply.video?.file_id;

      if (!fileId) {
        return bot.sendMessage(chatId, `❌ No se detectó un archivo válido para subir.`, {
          reply_to_message_id: msg.message_id
        });
      }

      // Obtener el enlace directo del archivo
      const fileLink = await bot.getFileLink(fileId);
      const fileUrl = typeof fileLink === 'string' ? fileLink : fileLink?.href;

      if (!fileUrl) {
        throw new Error("❌ No se pudo obtener el enlace del archivo.");
      }

      const res = await fetch(fileUrl);
      const buffer = await res.buffer();

      // Detectar tipo de archivo
      const type = await fileTypeFromBuffer(buffer);
      if (!type) throw new Error("❌ No se pudo detectar el tipo del archivo.");

      const isMedia = /image\/(png|jpe?g|gif)|video\/mp4/.test(type.mime);
      const catLink = await subirACatbox(buffer, type);

      const info = `*乂 C A T B O X - U P L O A D E R 乂*\n\n` +
        `*📦 Enlace:* ${catLink}\n` +
        `*📁 Tamaño:* ${formatBytes(buffer.length)}\n` +
        `*⏳ Expiración:* ${isMedia ? 'No expira' : 'Desconocido'}\n\n` +
        `> 💻 *MaycolUploaderBot* (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤`;

      await bot.sendMessage(chatId, info, {
        reply_to_message_id: msg.message_id,
        parse_mode: 'Markdown'
      });

    } catch (e) {
      console.error('[CatBox Error]', e);
      bot.sendMessage(chatId, `❌ Hubo un error al subir a CatBox.`, {
        reply_to_message_id: msg.message_id
      });
    }
  });
};

// 🧠 Subir buffer a CatBox
async function subirACatbox(content, type) {
  const { ext, mime } = type;
  const blob = new Blob([content], { type: mime });
  const formData = new FormData();
  const nombre = crypto.randomBytes(6).toString("hex");

  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, `${nombre}.${ext}`);

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  return await res.text();
}

// 🧮 Convertir bytes a KB/MB/etc.
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / (1024 ** i)).toFixed(2)} ${sizes[i]}`;
                                }
