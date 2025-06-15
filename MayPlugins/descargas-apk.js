const { search, download } = require('aptoide-scraper');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const crypto = require("crypto");
const { FormData, Blob } = require("formdata-node");
const fileType = require("file-type");

const emoji = '📦';
const emoji2 = '🚫';
const rwait = '🕒';
const done = '✅';
const error = '❌';
const fkontak = {}; // Puedes personalizar si usas algún contacto fake
const dev = 'SoyMaycol';

module.exports = (bot) => {
  bot.onText(/^\/(apk|modapk|aptoide) (.+)/i, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[2];

    if (!text) {
      return bot.sendMessage(chatId, `${emoji} Por favor, ingresa el nombre de la APK que deseas buscar.`);
    }

    try {
      await bot.sendMessage(chatId, `${rwait} Buscando tu aplicación...`);

      const searchA = await search(text);
      const data5 = await download(searchA[0].id);

      let txt = `*乂  APTOIDE - DESCARGAS* 乂\n\n`;
      txt += `☁️ *Nombre* : ${data5.name}\n`;
      txt += `🔖 *Package* : ${data5.package}\n`;
      txt += `🚩 *Update* : ${data5.lastup}\n`;
      txt += `⚖ *Peso* :  ${data5.size}`;

      await bot.sendPhoto(chatId, data5.icon, { caption: txt });

      if (data5.size.includes('GB') || parseFloat(data5.size.replace(' MB', '')) > 999) {
        await bot.sendMessage(chatId, `${emoji2} El archivo es muy pesado. Subiéndolo a CatBox...`);
      }

      const res = await fetch(data5.dllink);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const url = await subirACatbox(buffer);
      await bot.sendMessage(chatId, `${done} APK subida a CatBox:\n🔗 ${url}`);
    } catch (err) {
      console.error(err);
      await bot.sendMessage(chatId, `${error} Ocurrió un fallo inesperado al descargar la APK.`);
    }
  });
};

// 🐱‍👤 Subida a CatBox sin errores
async function subirACatbox(content) {
  const { ext, mime } = (await fileType.fileTypeFromBuffer(content)) || {
    ext: 'apk',
    mime: 'application/vnd.android.package-archive',
  };

  const blob = new Blob([content], { type: mime });
  const formData = new FormData();
  const randomName = crypto.randomBytes(5).toString("hex");

  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, `${randomName}.${ext}`);

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  return await res.text();
}
