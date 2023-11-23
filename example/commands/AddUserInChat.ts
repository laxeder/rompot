import Client, { CMDKeyExact, CMDPerms, Command, Message } from "../../src";

export class AddUserInChatCommand extends Command {
  public onRead() {
    this.keys = [CMDKeyExact("add")];
    this.permissions = [CMDPerms.ChatGroup, CMDPerms.UserChatAdmin, CMDPerms.BotChatAdmin];
  }

  public async onExec(message: Message) {
    const userId = message.mentions[0] || message.mention ? message.mention?.user.id : message.text.replace(/\D+/g, "");

    if (!userId) {
      message.reply("Vocẽ precisa mencionar alguem para que ela possa ser adicionada");
      return;
    }

    await Client.getClient(this.clientId).addUserInChat(message.chat, userId);

    await message.chat.send("Usuário adicionado com sucesso!!");
  }
}
