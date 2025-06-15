module.exports = (bot) => {
  bot.onText(/^\/removeadmin$/, async (msg) => {
    if (msg.chat.type !== 'channel') {
      return bot.sendMessage(msg.chat.id, '🚫 Este comando solo se puede usar en *canales*.', {
        reply_to_message_id: msg.message_id,
        parse_mode: 'Markdown'
      });
    }

    const reply = msg.reply_to_message;
    if (!reply) {
      return bot.sendMessage(msg.chat.id, '❗ Responde al mensaje del admin que quieras quitarle los permisos. (⁠˘⁠･⁠_⁠･⁠˘⁠)', {
        reply_to_message_id: msg.message_id
      });
    }

    const userId = reply.from.id;

    try {
      await bot.promoteChatMember(msg.chat.id, userId, {
        can_post_messages: false,
        can_edit_messages: false,
        can_delete_messages: false,
        can_invite_users: false,
        can_change_info: false,
        can_pin_messages: false,
        is_anonymous: false,
        can_manage_chat: false,
        can_manage_video_chats: false,
        can_promote_members: false
      });

      await bot.sendMessage(msg.chat.id, `⚠️ El usuario [${reply.from.first_name}](tg://user?id=${userId}) ya no es admin del canal. (⁠｡⁠•́︿•̀｡⁠)`, {
        parse_mode: 'Markdown',
        reply_to_message_id: msg.message_id
      });

    } catch (err) {
      console.error('[RemoveAdmin Error]', err);

      const errorMsg = err.response?.body?.description || err.message;

      if (errorMsg.includes("not enough rights") || errorMsg.includes("can't promote chat member")) {
        return bot.sendMessage(msg.chat.id, `❌ *No tengo permisos suficientes para quitar admins.*\nNecesito ser administrador del canal (⁠ᗒ⁠ᗩ⁠ᗕ⁠)`, {
          parse_mode: 'Markdown',
          reply_to_message_id: msg.message_id
        });
      }

      bot.sendMessage(msg.chat.id, `⚠️ Error inesperado:\n\`${errorMsg}\``, {
        parse_mode: 'Markdown',
        reply_to_message_id: msg.message_id
      });
    }
  });
};
