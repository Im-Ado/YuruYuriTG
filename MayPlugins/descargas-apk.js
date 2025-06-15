import { search, download } from 'aptoide-scraper';
import fetch from "node-fetch";
import { fileTypeFromBuffer } from "file-type";
import { FormData, Blob } from "formdata-node";
import crypto from "crypto";

const limitMB = 50;

export default async function(bot) {
  bot.onText(/^\/(apk|modapk|aptoide) (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[2];

    try {
      await bot.sendMessage(chatId, "🔍 Buscando en Aptoide...");
      const searchA = await search(text);
      const data = await download(searchA[0].id);

      let caption = `*乂  APTOIDE - DESCARGAS* 乂\n\n`;
      caption += `☁️ *Nombre* : ${data.name}\n`;
      caption += `🔖 *Package* : ${data.package}\n`;
      caption += `🚩 *Actualizado:* ${data.lastup}\n`;
      caption += `⚖ *Tamaño:* ${data.size}`;

      await bot.sendPhoto(chatId, data.icon, { caption });

      // Convertimos tamaño a MB
      const sizeMB = parseFloat(data.size.replace(" MB", "").replace(",", "."));
      if (data.size.includes('GB') || sizeMB > limitMB) {
        const buffer = await fetch(data.dllink).then(res => res.arrayBuffer());
        const link = await subirACatbox(Buffer.from(buffer));

        return bot.sendMessage(chatId, `📦 El archivo era muy pesado para Telegram, así que lo subí a CatBox:\n\n🔗 ${link}`);
      }

      await bot.sendDocument(chatId, data.dllink, {
        caption: `📦 *${data.name}.apk*`,
        filename: `${data.name}.apk`,
      });

    } catch (e) {
      console.error("❌ Error:", e);
      bot.sendMessage(chatId, `❌ Ocurrió un error al buscar o enviar la APK.\n${e.message || e}`);
    }
  });
}

// Función para subir a CatBox
async function subirACatbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
  const blob = new Blob([content.toArrayBuffer()], { type: mime });
  const form = new FormData();
  const name = crypto.randomBytes(5).toString("hex");

  form.append("reqtype", "fileupload");
  form.append("fileToUpload", blob, name + "." + ext);

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form,
    headers: {
      "User-Agent": "Mozilla/5.0 (MaycolBot)",
    },
  });

  return await res.text();
}
