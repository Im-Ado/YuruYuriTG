module.exports = (bot) => {
  bot.onText(/^\/join(?:\s+(.+))?$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const link = match[1]?.trim();

    if (!link) {
      return bot.sendMessage(chatId, "🔗 Por favor, envíame el enlace de invitación del grupo.\n\nEjemplo:\n`/join https://t.me/+abcDEF12345`", { parse_mode: "Markdown" });
    }

    try {
      const result = await bot.joinChat(link);
      await bot.sendMessage(chatId, `✅ Me he unido a *${result.title}* correctamente!`, {
        parse_mode: "Markdown"
      });
    } catch (e) {
      console.error("❌ Error al unirse al grupo:", e.message);
      bot.sendMessage(chatId, `❌ No pude unirme al grupo. Verifica que el enlace esté correcto o que no esté expirado.\n\n*Error:* ${e.message}`, {
        parse_mode: "Markdown"
      });
    }
  });
};
