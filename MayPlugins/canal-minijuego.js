module.exports = (bot) => {
  bot.onText(/^\/minijuego\s+(@\S+)/, async (msg, match) => {
    const canal = match[1]; // @Canal
    const chatId = msg.chat.id;

    // 🎮 Lista de minijuegos
    const juegos = [
      {
        nombre: "💡 Adivina la Palabra",
        descripcion: "Piensa una palabra secreta y los seguidores deben adivinarla letra por letra en los comentarios. ¿Quién la descubre primero? 🔤"
      },
      {
        nombre: "🎲 Número Secreto",
        descripcion: "He pensado un número entre *1 y 100*, ¿quién lo adivina primero? Escribe en los comentarios tus intentos. 👀"
      },
      {
        nombre: "🧠 Trivia Express",
        descripcion: "¿Quién responde primero esta pregunta? *¿Cuál es la capital de Japón?* 🏯\n(Responde en comentarios)"
      },
      {
        nombre: "🎵 Adivina la Canción",
        descripcion: "Pondré la letra de una canción famosa, ¡adivina cuál es solo leyendo el primer verso! 🎧\n> 'Nunca pensé que doliera el amor así...'"
      },
      {
        nombre: "🕹️ Emoji Challenge",
        descripcion: "¿Puedes describir esta peli solo con emojis? 🎬\nEjemplo: `🧑‍🚀🌕🚀` → *Interestelar*\n¡Comenta tu respuesta!"
      }
    ];

    const randomGame = juegos[Math.floor(Math.random() * juegos.length)];

    const texto = `
╭━━━🌟 *M I N I J U E G O   D E L   D Í A* 🌟━━━╮

🎮 *${randomGame.nombre}*

📜 ${randomGame.descripcion}

🕒 *Participa ya mismo comentando este aviso*

━━━━━━━━━━━━━━━━━━━━
#juegos #diversión #canal #MaycolBot
`.trim();

    try {
      const canalInfo = await bot.getChat(canal);
      await bot.sendMessage(canalInfo.id, texto, {
        parse_mode: 'Markdown'
      });

      // 🎉 Confirmación opcional
      if (chatId !== canalInfo.id) {
        bot.sendMessage(chatId, `✅ El minijuego fue enviado al canal ${canal} (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤`);
      }

    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, `❌ No pude enviar el minijuego a ${canal}.\n¿Tengo permisos suficientes? (⁠｡⁠•́︿•̀｡⁠)`);
    }
  });
};
