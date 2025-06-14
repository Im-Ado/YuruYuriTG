module.exports = (bot) => {
  bot.onText(/♣ Staff ♣/, (msg) => {
    const chatId = msg.chat.id;

    const caption = `👻✨ *MaycolAIUltraMD Staff Oficial* ✨👻

「 *Escuela Kamome* 」ha convocado a sus entes sobrenaturales 📜
y en la cima del Consejo Espiritual se encuentra...

🌙 *Creador:* [SoyMaycol](tg://user?id=${msg.from.id})
📂 *Repositorio:* [Ver en GitHub](https://github.com/SoySapo6/MaycolAIUltraMD-Telegram/)

Invócanos con cariño... o puede que Hanako te jale las patas 😈🚽

_*Por favor no uses exorcistas sin permiso del staff*_

───────⚫─────────────
「🕯️」*Comando sagrado invocado por:* ${msg.from.first_name || "un mortal"}
`;

    bot.sendPhoto(chatId, 'https://files.catbox.moe/8vygls.jpeg', {
      caption,
      parse_mode: 'Markdown',
    });
  });
};
