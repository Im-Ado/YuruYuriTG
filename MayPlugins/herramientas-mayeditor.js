const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const videosMap = {
  '1': './videos/video1.mp4',
  '2': './videos/video2.mp4',
  '3': './videos/video3.mp4',
  '4': './videos/video4.mp4',
  '5': './videos/video5.mp4',
  '6': './videos/video6.mp4',
  '7': './videos/video7.mp4',
  '8': './videos/video8.mp4',
  '9': './videos/video9.mp4',
  '10': './videos/video10.mp4'
};

const usuarios = {}; // En vez de global.db, un simple objeto local

module.exports = (bot) => {
  bot.onText(/^\/mayeditor\s+(\d+)/i, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;
    const type = match[1];

    if (!videosMap[type]) {
      return bot.sendMessage(chatId, '✧ Usa /mayeditor <1-10>\nSolo hay del 1 al 10 UwU');
    }

    const inputVideoPath = videosMap[type];
    const today = new Date().toDateString();

    if (!usuarios[userId]) usuarios[userId] = { date: today, count: 0 };
    if (usuarios[userId].date !== today) {
      usuarios[userId].date = today;
      usuarios[userId].count = 0;
    }

    if (usuarios[userId].count >= 15) {
      return bot.sendMessage(chatId, '✨ Ya hiciste 15 hechizos mágicos hoy. Vuelve mañana 🌙');
    }

    usuarios[userId].count++;
    const tempDir = './temp';
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const profileUrl = msg.from.photo ? msg.from.photo : `https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg`;
    const profilePath = path.join(tempDir, `pf_${userId}.jpg`);
    const outputPath = path.join(tempDir, `vid_${userId}_${Date.now()}.mp4`);

    const progressMsg = await bot.sendMessage(chatId, `🎥 Procesando video mágico tipo ${type}...\n▱▱▱▱▱▱▱▱▱▱ 0%`);

    const updateProgress = async (percent) => {
      const bars = Math.floor(percent / 10);
      const barString = '▰'.repeat(bars) + '▱'.repeat(10 - bars);
      await bot.editMessageText(`🎥 Procesando video mágico tipo ${type}...\n${barString} ${percent}%`, {
        chat_id: chatId,
        message_id: progressMsg.message_id
      });
    };

    try {
      const profileResp = await fetch(profileUrl);
      const arrayBuffer = await profileResp.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(profilePath, buffer);

      await updateProgress(15);

      const info = await new Promise((res, rej) => {
        ffmpeg.ffprobe(inputVideoPath, (err, meta) => err ? rej(err) : res(meta));
      });

      const videoStream = info.streams.find(s => s.codec_type === 'video');
      const { width, height } = videoStream;

      await updateProgress(25);

      await new Promise((resolve, reject) => {
        ffmpeg(inputVideoPath)
          .input(profilePath)
          .complexFilter([
            '[0:v]colorkey=0xba00ff:0.3:0.2[ckout]',
            `[1:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black[scaled_profile]`,
            '[scaled_profile][ckout]overlay=0:0:format=auto[final]'
          ])
          .outputOptions([
            '-map', '[final]',
            '-map', '0:a?',
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '20',
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart',
            '-r', videoStream.r_frame_rate || '30'
          ])
          .output(outputPath)
          .on('progress', async progress => {
            if (progress.percent) {
              const percent = Math.min(25 + (progress.percent * 0.7), 95);
              await updateProgress(Math.round(percent));
            }
          })
          .on('end', async () => {
            await updateProgress(100);
            resolve();
          })
          .on('error', reject)
          .run();
      });

      const videoBuffer = fs.readFileSync(outputPath);

      const caption = `
✧･ﾟ: ✧ 𝑀𝒶𝑔𝒾𝒸 𝒱𝒾𝒹𝑒𝑜 ✧:･ﾟ✧
🔮 Hechizo visual tipo ${type} para @${username || 'desconocido'}
📏 Resolución: ${width}x${height}
🪄 Usos restantes hoy: ${15 - usuarios[userId].count}/15
✨ Hecho por Maycol (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤
`.trim();

      await bot.sendVideo(chatId, videoBuffer, { caption });

      // Limpieza
      fs.unlinkSync(profilePath);
      fs.unlinkSync(outputPath);
    } catch (err) {
      console.error('❌ Error:', err.message);
      usuarios[userId].count--;
      bot.sendMessage(chatId, `⚠️ Error procesando el video: ${err.message}`);
    }
  });
};
