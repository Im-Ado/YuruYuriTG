const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

global._registeredPlugins = global._registeredPlugins || {};

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

      const pluginDir = path.resolve(__dirname, '..', 'MayPlugins');
      const allFiles = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'));

      let reloaded = [];

      for (const file of allFiles) {
        const fullPath = path.join(pluginDir, file);

        try {
          // 🔥 Elimina caché
          delete require.cache[require.resolve(fullPath)];

          // 🔥 Remueve handlers anteriores si existen
          if (global._registeredPlugins[file]) {
            for (const { regex, handler } of global._registeredPlugins[file]) {
              bot._textRegexpCallbacks = bot._textRegexpCallbacks.filter(cb => {
                return cb.regexp.toString() !== regex.toString() || cb.callback !== handler;
              });
            }
          }

          const plugin = require(fullPath);
          const newHandlers = [];
          const originalOnText = bot.onText.bind(bot);

          bot.onText = (regex, handler) => {
            newHandlers.push({ regex, handler });
            return originalOnText(regex, handler);
          };

          if (typeof plugin === 'function') {
            plugin(bot);
            reloaded.push(file);
          }

          bot.onText = originalOnText;
          global._registeredPlugins[file] = newHandlers;

        } catch (e) {
          bot.sendMessage(chatId, `⚠️ Error al recargar ${file}:\n${e.message}`);
        }
      }

      bot.sendMessage(chatId, `✅ Bot actualizado sin reiniciar.\nComandos recargados:\n\`\`\`\n${reloaded.join('\n') || 'Ninguno'}\n\`\`\``);
    });
  });
};
