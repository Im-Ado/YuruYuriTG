const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream");
const { promisify } = require("util");
const streamPipeline = promisify(pipeline);
const fetch = global.fetch; // usar fetch nativo en Node.js 22+

// ...

const videoUrl = api.url;
const response = await fetch(videoUrl, {
  headers: {
    'User-Agent': 'Mozilla/5.0'
  },
  redirect: 'follow'
});

if (!response.ok) throw new Error(`Error al descargar video: ${response.status}`);

const filename = `${cleanTitle}.mp4`;
const filepath = path.resolve(__dirname, "temp", filename);

// Asegúrate de que la carpeta 'temp' exista
fs.mkdirSync(path.dirname(filepath), { recursive: true });

// Descargar el archivo a disco
await streamPipeline(response.body, fs.createWriteStream(filepath));

// Enviar como archivo local
await bot.sendVideo(chatId, filepath, {
  caption: `🎬 *${api.title || video.title}*`,
  parse_mode: "Markdown",
  supports_streaming: true
});

// Borrar el archivo después
fs.unlinkSync(filepath);
