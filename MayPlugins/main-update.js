const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

module.exports = (bot) => {
  bot.onText(/^\/update$/, async (msg) => {
    const chatId = msg.chat.id;

    // ✅ OJO: Solo admins o dueños
    if (msg.from.id !== 7675783113) {
      return bot.sendMessage(chatId, '❌ Solo el creador puede actualizar el bot.');
    }

    bot.sendMessage(chatId, '🔄 Actualizando bot desde Git...');

    exec('git pull', async (err, stdout, stderr) => {
      if (err) {
        return bot.sendMessage(chatId, `❌ Error al hacer pull:\n${stderr}`);
      }

      const changed = stdout.split('\n').filter(line =>
        line.endsWith('.js') && line.includes('MayPlugins')
      );

      // 🔁 Recargar comandos actualizados
      changed.forEach(file => {
        const fullPath = path.resolve(__dirname, '..', file.trim());

        // Eliminar de la caché
        delete require.cache[require.resolve(fullPath)];

        try {
          const newCommand = require(fullPath);
          if (typeof newCommand === 'function') {
            newCommand(bot); // Reenganchar el comando
          }
        } catch (e) {
          bot.sendMessage(chatId, `⚠️ Error al recargar ${file}:\n${e.message}`);
        }
      });

      bot.sendMessage(chatId, `✅ Bot actualizado!\nArchivos recargados:\n\`\`\`\n${changed.join('\n') || 'Ninguno'}\n\`\`\``);
    });
  });
};
