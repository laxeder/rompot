import { CMDKeyExact, CMDPerms, Command, IMessage } from "../../src";

export class RemoveUserInChatCommand extends Command {
  public onRead() {
    this.keys = [CMDKeyExact("ban")];
    this.permissions = [CMDPerms.ChatGroup, CMDPerms.UserChatAdmin, CMDPerms.BotChatAdmin];
  }

  public async onExec(message: IMessage) {
    const userId = message.mentions[0] || !!message.mention ? message.mention.user.id : message.text.replace(/\D+/g, "");

    if (!!!userId) {
      await message.reply("Vocẽ precisa mencionar alguem para que ela possa ser banida");
      return;
    }

    await this.client.removeUserInChat(message.chat, userId);

    await message.chat.send("Usuário removido com sucesso!!");
  }
}
