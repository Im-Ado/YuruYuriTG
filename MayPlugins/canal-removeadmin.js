module.exports = (bot) => {
  bot.onText(/^\/removeadmin\s+(@\S+)\s*\|\s*(@\S+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const canal = match[1];  // @canalobjetivo
    const usuario = match[2]; // @usuarioaquitar

    try {
      // Obtener info del canal
      const canalInfo = await bot.getChat(canal);

      // Obtener ID del usuario a quitar
      const userInfo = await bot.getChatMember(canal, usuario);
      const userId = userInfo.user.id;

      // Quitar permisos de administrador
      await bot.promoteChatMember(canalInfo.id, userId, {
        can_change_info: false,
        can_post_messages: false,
        can_edit_messages: false,
        can_delete_messages: false,
        can_invite_users: false,
        can_restrict_members: false,
        can_pin_messages: false,
        can_promote_members: false,
        is_anonymous: false,
      });

      bot.sendMessage(chatId, `✅ Se removió a ${usuario} como admin del canal ${canal} (⁠｡⁠･⁠ω⁠･⁠｡⁠)⁠ﾉ⁠♡`);
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, `❌ No pude quitar a ${usuario} como admin de ${canal}.\n¿Seguro que tengo permisos suficientes? (⁠╥⁠﹏⁠╥⁠)`);
    }
  });
};
