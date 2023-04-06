import { Command, Message } from "../../src";

export class RemoveUserInChatCommand extends Command {
  tags: string[] = ["ban"];
  prefix: string = "/";
  name: string = "Ban User";
  description: string = "Ban user in chat";
  categories: string[] = ["admin", "group"];
  permissions: string[] = ["chat-admin"];

  public async execute(message: Message): Promise<void> {
    if (message.chat.type !== "group") {
      await message.reply("Apenas é possível banir membros em grupos");
      return;
    }

    if (!(await message.chat.IsAdmin(message.user))) {
      await message.reply("Vocẽ não tem permissão para executar esse comando");
      return;
    }

    if (!(await message.chat.IsAdmin(this.client.id))) {
      await message.reply("Eu não tenho permissão para executar esse comando");
      return;
    }

    if (message.mentions.length < 1) {
      await message.reply("Vocẽ precisa mencionar alguem para que ela possa ser banida");
      return;
    }

    await message.chat.removeUser(message.mentions[0]);

    await message.chat.send("Usuário removido com sucesso!!");
  }
}
