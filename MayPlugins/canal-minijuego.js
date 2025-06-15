module.exports = (bot) => {
  bot.onText(/^\/minijuego$/, async (msg) => {
    if (msg.chat.type !== 'channel') {
      return bot.sendMessage(msg.chat.id, '❌ Este comando solo se puede usar en *canales*. Anda a tu canal favorito para jugar con todos (⁠｡⁠•̀⁠ᴗ⁠-⁠)⁠✧', {
        reply_to_message_id: msg.message_id,
        parse_mode: 'Markdown'
      });
    }

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

    // 🌀 Elegimos uno al azar
    const randomGame = juegos[Math.floor(Math.random() * juegos.length)];

    const texto = `
╭━━━🌟 *M I N I J U E G O   D E L   D Í A* 🌟━━━╮

🎮 *${randomGame.nombre}*

📜 ${randomGame.descripcion}

🕒 *Participa ya mismo comentando este aviso*

━━━━━━━━━━━━━━━━━━━━
#juegos #diversión #canal #MaycolBot
`.trim();

    // 💬 Lo mandamos decorado
    await bot.sendMessage(msg.chat.id, texto, {
      parse_mode: 'Markdown'
    });
  });
};
