module.exports = (bot) => { bot.onText(/^/encuesta (.+)$/i, async (msg, match) => { if (msg.chat.type !== 'channel') return; const pregunta = match[1];

try {
  await bot.sendPoll(msg.chat.id, `📊 *Encuesta oficial del canal*

❓ ${pregunta}`, ['Sí', 'No', 'Tal vez'], { is_anonymous: true, allows_multiple_answers: false, parse_mode: 'Markdown' }); } catch (e) { console.error('[Error Encuesta]', e); } }); };
