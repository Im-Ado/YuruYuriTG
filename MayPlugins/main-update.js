const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = (bot) => {
  bot.onText(/^\/update$/, async (msg) => {
    const chatId = msg.chat.id;

    if (msg.from.id !== 7675783113) {
      return bot.sendMessage(chatId, '❌ Solo el creador puede actualizar el bot.');
    }

    bot.sendMessage(chatId, '🔄 Haciendo `git pull`...');

    exec('git pull', async (err, stdout, stderr) => {
      if (err) {
        return bot.sendMessage(chatId, `❌ Error en git pull:\n${stderr}`);
      }

      const changed = stdout.split('\n').filter(line =>
        line.includes('MayPlugins') &&
        !line.startsWith(' delete') &&  // 💣 Ignorar borrados
        line.trim().endsWith('.js')
      ).map(line => line.trim().split(' ').pop());

      let reloaded = [];

      changed.forEach(file => {
        const fullPath = path.resolve(__dirname, '..', file);

        // Verifica si el archivo todavía existe
        if (fs.existsSync(fullPath)) {
          delete require.cache[require.resolve(fullPath)];

          try {
            const cmd = require(fullPath);
            if (typeof cmd === 'function') {
              cmd(bot);
              reloaded.push(file);
            }
          } catch (e) {
            bot.sendMessage(chatId, `⚠️ Error al recargar ${file}:\n${e.message}`);
          }
        }
      });

      bot.sendMessage(chatId, `✅ Bot actualizado.\nComandos recargados:\n\`\`\`\n${reloaded.join('\n') || 'Ninguno'}\n\`\`\``);
    });
  });
};
