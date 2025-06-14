const fs = require('fs');
const path = require('path');

module.exports = (bot) => {
  bot.onText(/^\/menucompleto$/, async (msg) => {
    const chatId = msg.chat.id;
    const pluginsPath = path.join(__dirname);
    const comandos = new Set();

    // Leer todos los comandos registrados
    fs.readdirSync(pluginsPath).forEach(file => {
      if (!file.endsWith('.js') || file === 'menucompleto.js') return;

      const code = fs.readFileSync(path.join(pluginsPath, file), 'utf-8');
      const matches = [...code.matchAll(/bot\.onText\s*\/\^\s*\\\/(\w+)[^)]*/g)];

      for (const match of matches) {
        comandos.add(`/${match[1]}`);
      }
    });

    if (comandos.size === 0) {
      return bot.sendMessage(chatId, '💀 No encontré ni un comando... Hanako está decepcionado...');
    }

    const lista = [...comandos].sort().map(cmd => `✦ ✧ ⛧ ${cmd} ⛧ ✧ ✦`).join('\n');

    // Texto decorado estilo Hanako-kun 👻
    const decorado = `
╔════════════════════════╗
   🌸 *𝕄𝕖𝕟𝕦́ 𝕄𝕒𝕝𝕕𝕚𝕥𝕠 𝕕𝕖 𝕄𝕒𝕪𝕓𝕠𝕥* 👻
╚════════════════════════╝

🚽 *Inodoro No. 7 dice:*  
_“Estos son los conjuros que puedes invocar...”_

${lista}

☁️𓂃 ࣪˖ 💮 𝒮𝒾 𝓃ℴ 𝓊𝓈𝒶𝓈 𝓑𝓸𝓽 𝓬𝓞𝓷 𝓒𝓤𝓘𝓓𝓐𝓓𝓞...  
˗ˏˋ 𝐻𝒶𝓃𝒶𝓀ℴ 𝓅𝒹𝑒𝓇𝒾𝒶 𝒶𝓅𝒶𝓇𝑒𝒸ℯ𝓇 ˎˊ˗

❀ ༘⋆*ೃ˚ Hanako te bendice con papel higiénico 🌸🧻
`;

    // Enviar imagen + menú
    await bot.sendPhoto(chatId, 'https://files.catbox.moe/vy4bx1.jpeg', {
      caption: decorado,
      parse_mode: 'Markdown'
    });
  });
};
