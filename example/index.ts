import BuildBot, { WhatsAppBot, Message, Command, WAModule, DefaultCommandConfig } from "../lib/index";

const bot: WAModule = BuildBot(new WhatsAppBot(), {
  disableAutoCommand: false,
  disableAutoTyping: false,
  disableAutoRead: true,
  receiveAllMessages: false,
  commandConfig: DefaultCommandConfig,
});

bot.on("open", (open: { status: string; isNewLogin: boolean }) => {
  if (open.isNewLogin) {
    console.log("Nova conexão");
  }

  console.log("Client conectado!");
});

bot.on("close", () => {
  console.log(`Client desligado!`);
});

bot.on("qr", (qr: string) => {
  console.log("QR Gerado:", qr);
});

bot.on("conn", (update) => {
  if (update.action == "connecting") {
    console.log("Tentando conectar bot...");
  }

  if (update.action == "closed") {
    console.log(`A conexão desse bot foi fechada`);
  }

  if (update.action == "reconnecting") {
    console.log("Reconectando...");
  }
});

bot.on("message", async (message: Message) => {
  console.log(`New message in ${message.chat.id}`);
});

bot.on("me", (message: Message) => {
  console.log(`Send message to ${message.user.id}`);
});

bot.on("chat", (update) => {
  if (update.action == "add") {
    console.log(`New chat: ${update.chat.id}`);
  }

  if (update.action == "remove") {
    console.log(`Remove chat: ${update.chat.id}`);
  }
});

bot.on("member", (update) => {
  if (update.action == "add") {
    console.log(`Number ${update.member.id} joined group ${update.chat.id}`);
  }

  if (update.action == "remove") {
    console.log(`Member group ${update.chat.id} left`);
  }

  if (update.action == "promote") {
    console.log(`Member (${update.member.id}) promoved!`);
  }

  if (update.action == "demote") {
    console.log(`Member (${update.member.id}) demoted!`);
  }
});

bot.on("error", (err: any) => {
  console.log("Um erro ocorreu:", err);
});

class HelloCommand extends Command {
  tags: string[] = ["hello"];
  prefix: string = "/";
  name: string = "Olá!";
  description: string = "Reply hello";
  categories: string[] = ["dev"];

  public async execute(message: Message): Promise<void> {
    await message.reply(`Hello World`);
  }
}

class DateCommand extends Command {
  tags: string[] = ["date"];
  prefix: string = "/";
  name: string = "Data";
  description: string = "Send now date";
  categories: string[] = ["info"];

  public async execute(message: Message): Promise<void> {
    await message.reply(`Data: ${new Date()}`);
  }
}

class BanCommand extends Command {
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

    if (!(await message.chat.IsAdmin(bot.id))) {
      await message.reply("Eu não tenho permissão para executar esse comando");
      return;
    }

    if (message.mentions.length < 1) {
      await message.reply("Vocẽ precisa mencionar alguem para que ela possa ser banida");
      return;
    }

    await bot.removeUserInChat(message.chat, message.mentions[0]);

    await message.chat.send("Usuário removido com sucesso!!");
  }
}

class AddCommand extends Command {
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

    if (!(await message.chat.IsAdmin(bot.id))) {
      message.reply("Eu não tenho permissão para executar esse comando");
      return;
    }

    if (message.mentions.length < 1) {
      message.reply("Vocẽ precisa mencionar alguem para que ela possa ser adicionada");
      return;
    }

    await bot.addUserInChat(message.chat, message.mentions[0]);

    await message.chat.send("Usuário adicionado com sucesso!!");
  }
}

const commands = [new HelloCommand(), new DateCommand(), new BanCommand(), new AddCommand()];

bot.setCommands(commands);
bot.connect();
