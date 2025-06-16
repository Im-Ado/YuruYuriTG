// text2img.js
const axios = require('axios');

module.exports = (bot) => {
  bot.onText(/^\/dalle\s+(.+)/i, async (msg, match) => {
    const chatId = msg.chat.id;
    const prompt = match[1]?.trim();

    if (!prompt) {
      bot.sendMessage(chatId, '📸 Por favor, proporciona una descripción para generar la imagen. (⁠｡⁠•̀⁠ᴗ⁠-⁠)⁠✧');
      return;
    }

    const apiUrl = `https://eliasar-yt-api.vercel.app/api/ai/text2img?prompt=${encodeURIComponent(prompt)}`;

    try {
      bot.sendMessage(chatId, '✨ Generando imagen, espera un momento...');

      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      await bot.sendPhoto(chatId, Buffer.from(response.data), {
        caption: 'Aquí tienes tu imagen generada (⁠｡⁠･⁠ω⁠･⁠｡⁠)⁠ﾉ⁠♡',
      });
    } catch (err) {
      console.error('Error al generar imagen:', err.message);
      bot.sendMessage(chatId, '❌ No se pudo generar la imagen, intenta de nuevo más tarde. (╥﹏╥)');
    }
  });
};
