import Client, { WhatsAppBot, Message, Command, DefaultCommandConfig, PollMessage, ButtonMessage, ListMessage } from "../src/index";

const client = new Client(new WhatsAppBot(), {
  disableAutoCommand: false,
  disableAutoTyping: false,
  disableAutoRead: false,
  commandConfig: DefaultCommandConfig,
});

client.on("open", (open: { isNewLogin: boolean }) => {
  if (open.isNewLogin) {
    console.log("Nova conexão");
  }

  console.log("Cliente conectado!");
});

client.on("close", () => {
  console.log(`Cliente desligado!`);
});

client.on("qr", (qr: string) => {
  console.log("QR Gerado:", qr);
});

client.on("connecting", () => {
  console.log("Tentando conectar cliente...");
});

client.on("closed", () => {
  console.log(`A conexão desse cliente foi fechada`);
});

client.on("reconnecting", () => {
  console.log("Reconectando...");
});

client.on("message", async (message: Message) => {
  if (message.fromMe) {
    console.log(`Send message to ${message.user.id}`);
  } else {
    console.log(`New message in ${message.chat.id}`);
  }

  if (message.text.toLowerCase() == "poll") {
    const msg = new PollMessage(message.chat, "Enquete");

    msg.addOption("op1", "id1");
    msg.addOption("op2", "id2");
    msg.addOption("op3", "id3");

    await client.send(msg);
  }

  if (message.text.toLowerCase() == "btn") {
    const msg = new ButtonMessage(message.chat, "title");

    msg.addReply("text 1", "id-123");

    await client.send(msg);
  }

  if (message.text.toLowerCase() == "list") {
    const msg = new ListMessage(message.chat, "title", "texto");

    const index = msg.addCategory("category 1");

    msg.addItem(index, "title", "description", "id-123");

    await client.send(msg);
  }
});

client.on("chat", (update) => {
  if (update.action == "add") {
    console.log(`New chat: ${update.chat.id}`);
  }

  if (update.action == "remove") {
    console.log(`Remove chat: ${update.chat.id}`);
  }
});

client.on("user", (update) => {
  if (update.action == "add") {
    console.log(`Number ${update.user.id} joined group ${update.chat.id}`);
  }

  if (update.action == "remove") {
    console.log(`Member group ${update.chat.id} left`);
  }

  if (update.action == "promote") {
    console.log(`Member (${update.user.id}) promoved!`);
  }

  if (update.action == "demote") {
    console.log(`Member (${update.user.id}) demoted!`);
  }
});

client.on("error", (err: any) => {
  console.log("Um erro ocorreu:", err);
});

class HelloCommand extends Command {
  tags: string[] = ["h", "e", "l", "l", "o"];
  reqTags: number = 3;
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

    if (!(await message.chat.IsAdmin(client.id))) {
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

    if (!(await message.chat.IsAdmin(client.id))) {
      message.reply("Eu não tenho permissão para executar esse comando");
      return;
    }

    if (message.mentions.length < 1) {
      message.reply("Vocẽ precisa mencionar alguem para que ela possa ser adicionada");
      return;
    }

    await client.addUserInChat(message.chat, message.mentions[0]);

    await message.chat.send("Usuário adicionado com sucesso!!");
  }
}

const commands = [new HelloCommand(), new DateCommand(), new BanCommand(), new AddCommand()];

client.setCommands(commands);
client.connect("./example/auth");
