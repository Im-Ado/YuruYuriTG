module.exports = (bot) => {
  bot.onText(/✧ STAFF ✧/, (msg) => {
    const chatId = msg.chat.id;

    const caption = `✦ *YuruYuri Staff Oficial*

> ✦ Creador: » [SoyMaycol, Wirk](tg://user?id=${msg.from.id})
> ✦ Repositorio: » [Ver en GitHub](https://github.com/Im-Ado/YuruYuriTG/)
> 🜸 Invocado por: » *${msg.from.first_name || "un mortal"}*

> ⚠️ _No uses exorcistas sin permiso del staff_`;

    bot.sendPhoto(chatId, 'https://files.catbox.moe/8vygls.jpeg', {
      caption,
      parse_mode: 'Markdown',
    });
  });
};
