const fs = require('fs');
const path = require('path');

module.exports = (bot) => {
  bot.onText(/♥ Menú Completo ♥/, async (msg) => {
    const chatId = msg.chat.id;
    const pluginsPath = path.join(__dirname);
    const categorias = {};

    fs.readdirSync(pluginsPath).forEach(file => {
      if (!file.endsWith('.js') || file === 'menucompleto.js') return;

      const fileName = file.replace('.js', '');
      const [tag, comando] = fileName.split('-');

      if (!tag || !comando) return;

      if (!categorias[tag]) categorias[tag] = [];
      categorias[tag].push(`/${comando}`);
    });

    if (Object.keys(categorias).length === 0) {
      return bot.sendMessage(chatId, '💀 No encontré ni un comando... Hanako está decepcionado...');
    }

    let lista = '';
    for (const tag in categorias) {
      lista += `\n🌸 *${tag.toUpperCase()}*\n`;
      lista += categorias[tag].map(cmd => `✦ ✧ ⛧ ${cmd} ⛧ ✧ ✦`).join('\n') + '\n';
    }

    const decorado = `
╔════════════════════════╗
   🌸 *𝕄𝕖𝕟𝕦́ 𝕄𝕒𝕝𝕕𝕚𝕥𝕠 𝕕𝕖 YuruYuri* 👻
╚════════════════════════╝

*SoyMaycol & Wirk*

${lista}

☁️𓂃 ࣪˖ 💮 𝒮𝒾 𝓃ℴ 𝓊𝓈𝒶𝓈 𝓑𝓸𝓽 𝓬𝓞𝓷 𝓒𝓤𝓘𝓓𝓐𝓓𝓞...  
˗ˏˋ 𝐻𝒶𝓃𝒶𝓀ℴ 𝓅𝒹𝑒𝓇𝒾𝒶 𝒶𝓅𝒶𝓇𝑒𝒸ℯ𝓇 ˎˊ˗

❀ ༘⋆*ೃ˚ Te amoo!
`;

    await bot.sendPhoto(chatId, 'https://files.catbox.moe/f4ncyq.jpg', {
      caption: decorado,
      parse_mode: 'HTML'
    });
  });
};
