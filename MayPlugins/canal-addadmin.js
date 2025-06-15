module.exports = (bot) => {
  bot.onText(/^\/addadmin$/, async (msg) => {
    if (msg.chat.type !== 'channel') {
      return bot.sendMessage(msg.chat.id, '🚫 Este comando solo funciona dentro de *canales*.', {
        reply_to_message_id: msg.message_id,
        parse_mode: 'Markdown'
      });
    }

    const reply = msg.reply_to_message;
    if (!reply) {
      return bot.sendMessage(msg.chat.id, '⚠️ Responde al mensaje del usuario que quieras hacer admin (⁠◕⁠︿⁠◕⁠)', {
        reply_to_message_id: msg.message_id
      });
    }

    const userId = reply.from.id;

    try {
      await bot.promoteChatMember(msg.chat.id, userId, {
        can_post_messages: true,
        can_edit_messages: true,
        can_delete_messages: true,
        can_invite_users: true,
        can_change_info: true,
        can_pin_messages: true
      });

      await bot.sendMessage(msg.chat.id, `🎉 El usuario [${reply.from.first_name}](tg://user?id=${userId}) ha sido promovido a *Administrador*. ¡Felicidades! (⁠｡⁠>⁠﹏⁠<⁠｡⁠)✨`, {
        parse_mode: 'Markdown',
        reply_to_message_id: msg.message_id
      });

    } catch (err) {
      console.error('[AddAdmin Error]', err);

      const errorMsg = err.response?.body?.description || err.message;

      if (errorMsg.includes("not enough rights") || errorMsg.includes("can't promote chat member")) {
        return bot.sendMessage(msg.chat.id, `❌ *No tengo permisos suficientes para hacer esto.*\nDame permisos de administrador para poder añadir admins. (⁠っ⁠-⁠ ‿⁠-⁠)⁠っ`, {
          parse_mode: 'Markdown',
          reply_to_message_id: msg.message_id
        });
      }

      bot.sendMessage(msg.chat.id, `⚠️ Hubo un error inesperado: \`${errorMsg}\``, {
        parse_mode: 'Markdown',
        reply_to_message_id: msg.message_id
      });
    }
  });
};
