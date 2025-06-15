const axios = require('axios');

module.exports = (bot) => {
  bot.onText(/^\/estadisticas(?:\s+(@\S+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const canal = match[1]; // @canal, si se proporciona

    const objetivo = canal || msg.chat.username
      ? `@${msg.chat.username}`
      : msg.chat.id;

    try {
      const info = await bot.getChat(objetivo);
      const miembros = await bot.getChatMembersCount(info.id);

      bot.sendMessage(chatId, `📈 *Estadísticas del Canal*\n\n🏷 *Nombre:* ${info.title || info.username}\n👥 *Miembros:* ${miembros}`, {
        parse_mode: 'Markdown'
      });
    } catch (e) {
      console.error("[Error]", e);
      bot.sendMessage(chatId, `❌ No pude obtener las estadísticas del canal ${canal || ''}.\n¿Seguro que existo ahí como admin? (⁠｡⁠•́︿•̀｡⁠)`);
    }
  });
};
