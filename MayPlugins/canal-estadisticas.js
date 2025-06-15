const axios = require('axios');

module.exports = (bot) => {
  bot.onText(/^\/estadisticas$/, async (msg) => {
    if (msg.chat.type !== 'channel') return;

    try {
      const memberCount = await bot.getChatMembersCount(msg.chat.id);
      bot.sendMessage(msg.chat.id, `📈 *Estadísticas del Canal*\n\n👥 *Miembros:* ${memberCount}`, {
        parse_mode: 'Markdown'
      });
    } catch (e) {
      console.error("[Error]", e);
      bot.sendMessage(msg.chat.id, `❌ No se pudo obtener las estadísticas. Puede que falten permisos.`);
    }
  });
};
