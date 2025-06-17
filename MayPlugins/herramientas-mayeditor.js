const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfprobePath('/usr/bin/ffprobe');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const videosMap = {
    '1': './videos/lv_7507655713968164149_20250607160908.mp4',
    '2': './videos/lv_7463895997605743933_20250607164555.mp4',
    '3': './videos/lv_7404392617884028176_20250607165541.mp4',
    '4': './videos/lv_7403812168765852946_20250607173804.mp4',
    '5': './videos/lv_7495448057157340469_20250607164932.mp4',
    '6': './videos/lv_7497686403254373693_20250607170616.mp4',
    '7': './videos/lv_7507655713968164149_20250607160908.mp4',
    '8': './videos/lv_7478259089345187125_20250608202445.mp4',
    '9': './videos/lv_7504712502689746229_20250608202734.mp4',
    '10': './videos/lv_7307348459189800197_20250609084922.mp4'
}

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

    const profilePath = path.join(tempDir, `pf_${userId}.jpg`);
    const outputPath = path.join(tempDir, `vid_${userId}_${Date.now()}.mp4`);

    const progressMsg = await bot.sendMessage(chatId, `🎥 Procesando video mágico tipo ${type}...\n▱▱▱▱▱▱▱▱▱▱ 0%`);
    
    // Obtener foto de perfil del usuario
    let profileUrl = `https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg`; // URL por defecto
    
    try {
      const profilePhotos = await bot.getUserProfilePhotos(userId, { limit: 1 });
      if (profilePhotos.total_count > 0) {
        const fileId = profilePhotos.photos[0][0].file_id; // Tomar la foto más pequeña
        const file = await bot.getFile(fileId);
        profileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
      }
    } catch (error) {
      console.log('No se pudo obtener la foto de perfil, usando imagen por defecto');
    }
    
    // Variable para evitar actualizaciones duplicadas
    let lastProgress = -1;
    const minProgressDiff = 5; // Actualizar solo si hay una diferencia mínima de 5%

    const updateProgress = async (percent) => {
      // Evitar actualizaciones duplicadas o muy frecuentes
      if (Math.abs(percent - lastProgress) < minProgressDiff) {
        return;
      }
      
      const bars = Math.floor(percent / 10);
      const barString = '▰'.repeat(bars) + '▱'.repeat(10 - bars);
      const newText = `🎥 Procesando video mágico tipo ${type}...\n${barString} ${percent}%`;
      
      try {
        await bot.editMessageText(newText, {
          chat_id: chatId,
          message_id: progressMsg.message_id
        });
        lastProgress = percent;
      } catch (error) {
        // Ignorar errores de "mensaje no modificado"
        if (!error.message.includes('message is not modified')) {
          console.error('Error actualizando progreso:', error.message);
        }
      }
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
        let lastReportedPercent = 25;
        
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
              const roundedPercent = Math.round(percent);
              
              // Solo actualizar si hay una diferencia significativa
              if (roundedPercent - lastReportedPercent >= minProgressDiff) {
                await updateProgress(roundedPercent);
                lastReportedPercent = roundedPercent;
              }
            }
          })
          .on('end', async () => {
            await updateProgress(100);
            resolve();
          })
          .on('error', reject)
          .run();
      });

      // Actualizar mensaje final
      try {
        await bot.editMessageText(`✅ Video procesado exitosamente!`, {
          chat_id: chatId,
          message_id: progressMsg.message_id
        });
      } catch (error) {
        // Ignorar si no se puede actualizar el mensaje
        console.log('No se pudo actualizar mensaje final');
      }

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
      
      // Eliminar mensaje de progreso después de enviar el video
      try {
        await bot.deleteMessage(chatId, progressMsg.message_id);
      } catch (error) {
        // Ignorar si no se puede eliminar
      }

    } catch (err) {
      console.error('❌ Error:', err.message);
      usuarios[userId].count--;
      
      // Actualizar mensaje de error
      try {
        await bot.editMessageText(`⚠️ Error procesando el video: ${err.message}`, {
          chat_id: chatId,
          message_id: progressMsg.message_id
        });
      } catch (error) {
        // Si no se puede editar, enviar nuevo mensaje
        bot.sendMessage(chatId, `⚠️ Error procesando el video: ${err.message}`);
      }
      
      // Limpiar archivos temporales en caso de error
      try {
        if (fs.existsSync(profilePath)) fs.unlinkSync(profilePath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      } catch (cleanupError) {
        console.error('Error limpiando archivos:', cleanupError.message);
      }
    }
  });
};
