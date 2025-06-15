const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Creamos un objeto para rastrear handlers registrados
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
          // Si ya estaba registrado antes, eliminamos su caché
          if (require.cache[require.resolve(fullPath)]) {
            delete require.cache[require.resolve(fullPath)];
          }

          // Si tenía handlers previos, los quitamos
          if (global._registeredPlugins[file]) {
            for (const { regex, handler } of global._registeredPlugins[file]) {
              bot._events.text = (bot._events.text || []).filter(h => h !== handler);
            }
          }

          const plugin = require(fullPath);

          // Capturamos los nuevos handlers
          const newHandlers = [];
          const originalOnText = bot.onText.bind(bot);

          // Monkey patch para capturar qué regex se registra
          bot.onText = (regex, handler) => {
            newHandlers.push({ regex, handler });
            return originalOnText(regex, handler);
          };

          if (typeof plugin === 'function') {
            plugin(bot);
            reloaded.push(file);
          }

          // Restauramos el método original
          bot.onText = originalOnText;

          // Guardamos handlers por archivo
          global._registeredPlugins[file] = newHandlers;

        } catch (e) {
          bot.sendMessage(chatId, `⚠️ Error al recargar ${file}:\n${e.message}`);
        }
      }

      bot.sendMessage(chatId, `✅ Bot actualizado sin reiniciar.\nComandos recargados:\n\`\`\`\n${reloaded.join('\n') || 'Ninguno'}\n\`\`\``);
    });
  });
};
