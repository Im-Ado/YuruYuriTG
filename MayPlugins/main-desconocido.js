const knownCommands = new Set();

module.exports = (bot) => {
  // Captura todos los comandos válidos al cargar plugins
  bot.onText(/^\/(\w+)/, (msg, match) => {
    knownCommands.add(match[1]); // ejemplo: 'start', 'ping', etc.
  });

  // Detecta comandos desconocidos
  bot.on('message', (msg) => {
    const text = msg.text;

    if (!text || !text.startsWith('/')) return;

    const command = text.slice(1).split(' ')[0];

    // Si no está en los comandos registrados, se asume como desconocido
    if (!knownCommands.has(command)) {
      bot.sendMessage(msg.chat.id, `❌ Comando no reconocido: \`/${command}\`\nUsa /help para ver los comandos disponibles 🧠`, {
        parse_mode: 'Markdown'
      });
    }
  });
};
