module.exports = (bot) => { bot.onText(/^/estadisticas$/, async (msg) => { if (msg.chat.type !== 'channel') return;

try {
  const memberCount = await bot.getChatMembersCount(msg.chat.id);

  const texto = `📈 *Estadísticas del Canal*

👥 Miembros totales: ${memberCount} 📊 Actividad: próximamente...

✨ Gracias por ser parte de este canal.`;

await bot.sendMessage(msg.chat.id, texto, { parse_mode: 'Markdown' });
} catch (e) {
  console.error('[Error Estadísticas]', e);
}

}); };
