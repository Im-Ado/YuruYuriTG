import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";
import { fileFromPath } from 'formdata-node/file-from-path'; // opcional si usas desde archivo
import { readFile } from "fs/promises";

export default function (bot) {
  bot.onText(/^\/catbox$/, async (msg) => {
    const chatId = msg.chat.id;
    const replyId = msg.message_id;

    // Verifica si el usuario respondió a un archivo
    if (!msg.reply_to_message || !(
      msg.reply_to_message.photo ||
      msg.reply_to_message.document ||
      msg.reply_to_message.video
    )) {
      return bot.sendMessage(chatId, "⚠️ Responde a una *imagen*, *video* o *documento* para subirlo a CatBox.moe", {
        reply_to_message_id: replyId
      });
    }

    try {
      let fileId;
      if (msg.reply_to_message.document) fileId = msg.reply_to_message.document.file_id;
      else if (msg.reply_to_message.video) fileId = msg.reply_to_message.video.file_id;
      else if (msg.reply_to_message.photo) {
        const photos = msg.reply_to_message.photo;
        fileId = photos[photos.length - 1].file_id;
      }

      const file = await bot.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
      const buffer = await fetch(fileUrl).then(res => res.buffer());

      // Subir a CatBox
      const link = await catbox(buffer);
      const size = formatBytes(buffer.length);

      // Respuesta estilizada
      const texto = `*乂 C A T B O X - U P L O A D E R 乂*\n\n` +
        `🧩 *Enlace:* ${link}\n` +
        `📦 *Tamaño:* ${size}\n` +
        `🌌 *Expira:* Nunca (probablemente jeje)\n\n` +
        `👻 *Subido por MaycolBot*`;

      bot.sendMessage(chatId, texto, {
        parse_mode: "Markdown",
        reply_to_message_id: replyId
      });

    } catch (error) {
      console.error("❌ Error al subir:", error);
      bot.sendMessage(chatId, `❌ Ocurrió un error al subir el archivo a CatBox:\n\n${error.message}`, {
        reply_to_message_id: replyId
      });
    }
  });
}

// 💫 Función para convertir bytes a formato legible
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / (1024 ** i)).toFixed(2)} ${sizes[i]}`;
}

// 🚀 Función para subir el archivo a CatBox
async function catbox(buffer) {
  const fileType = await fileTypeFromBuffer(buffer);
  const blob = new Blob([buffer], { type: fileType?.mime || 'application/octet-stream' });
  const formData = new FormData();
  const name = crypto.randomBytes(6).toString("hex");

  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, `${name}.${fileType?.ext || 'bin'}`);

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent": "MaycolBotUploader/1.0",
    }
  });

  return await res.text();
}
