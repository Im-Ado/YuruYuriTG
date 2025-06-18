const moment = require('moment-timezone');

module.exports = (bot) => {
  bot.onText(/^\/start$/, async (msg) => {
    const chatId = msg.chat.id;
    const nombre = msg.from.first_name;

    // 🕓 Hora Perú para saludo dinámico
    const hora = moment().tz('America/Lima').hour();
    let saludo;
    if (hora >= 5 && hora < 12) saludo = '🌅 ¡Buenos días';
    else if (hora >= 12 && hora < 18) saludo = '🌞 ¡Buenas tardes';
    else saludo = '🌙 ¡Buenas noches';

    // 🖼 Imagen de bienvenida
    const imagen = 'https://files.catbox.moe/syrs1e.jpg';

    // 💬 Mensaje con full estilo Hanako-kun
    const mensaje = `
╔══════════════════════════════╗
   ${saludo}, *${nombre}* ✨
╚══════════════════════════════╝

(⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤ Bienvenid@ a *YuruYuri* 😍
Un bot con magia kawaii~

╭───────────────╮
┃ 🧠 Creador: *SoyMaycol & Wirk*
┃ 🎮 Bot: *YuruYuri*
┃ 🗨️ MayBot's: ¡Disponible!
╰───────────────╯

✦ Usa los botones para comenzar tu aventura~
`;

    // 🧸 Teclado con comandos que se escriben
    const teclado = {
      reply_markup: {
        keyboard: [
          [{ text: "♥ Menú Completo ♥" }],
          [{ text: "♣ Staff ♣" }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      },
      parse_mode: "Markdown"
    };

    // 📸 Enviar imagen con el caption y el teclado
    await bot.sendPhoto(chatId, imagen, {
      caption: mensaje,
      ...teclado
    });
  });
};
