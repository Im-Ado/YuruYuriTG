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

      // Siempre escanea TODOS los comandos de la carpeta MayPlugins
      const pluginDir = path.resolve(__dirname, '..', 'MayPlugins');
      const allFiles = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'));

      let reloaded = [];

      for (const file of allFiles) {
        const fullPath = path.join(pluginDir, file);

        try {
          delete require.cache[require.resolve(fullPath)];
          const plugin = require(fullPath);

          if (typeof plugin === 'function') {
            plugin(bot);
            reloaded.push(file);
          }
        } catch (e) {
          bot.sendMessage(chatId, `⚠️ Error al recargar ${file}:\n${e.message}`);
        }
      }

      bot.sendMessage(chatId, `✅ Bot actualizado.\nComandos recargados:\n\`\`\`\n${reloaded.join('\n') || 'Ninguno'}\n\`\`\``);
    });
  });
};
