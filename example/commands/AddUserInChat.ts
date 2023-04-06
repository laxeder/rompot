import { Command, Message } from "../../src";

export class AddUserInChatCommand extends Command {
  tags: string[] = ["add"];
  prefix: string = "/";
  name: string = "Add User";
  description: string = "Add user in chat";
  categories: string[] = ["admin", "group"];
  permissions: string[] = ["chat-admin"];

  public async execute(message: Message): Promise<void> {
    if (message.chat.type !== "group") {
      message.reply("Apenas é possível adicionar membros em grupos");
      return;
    }

    if (!(await message.chat.IsAdmin(message.user))) {
      message.reply("Vocẽ não tem permissão para executar esse comando");
      return;
    }

    if (!(await message.chat.IsAdmin(this.client.id))) {
      message.reply("Eu não tenho permissão para executar esse comando");
      return;
    }

    if (message.mentions.length < 1) {
      message.reply("Vocẽ precisa mencionar alguem para que ela possa ser adicionada");
      return;
    }

    await this.client.addUserInChat(message.chat, message.mentions[0]);

    await message.chat.send("Usuário adicionado com sucesso!!");
  }
}
