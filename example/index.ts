import Client, { WhatsAppBot, Message, Command, CMDRunType, CMDPerms, EmptyMessage, MultiFileAuthState } from "../src";

const client = new Client(new WhatsAppBot(), {
  disableAutoCommand: false,
  disableAutoTyping: false,
  disableAutoRead: false,
});

client.on("open", (open: { isNewLogin: boolean }) => {
  if (open.isNewLogin) {
    console.info("Nova conexão");
  }

  console.info("Cliente conectado!");
});

client.on("close", () => {
  console.info(`Cliente desligado!`);
});

client.on("qr", (qr: string) => {
  console.info("QR Gerado:", qr);
});

client.on("code", (code: string) => {
  console.info("Código de pareamento gerado:", code);
});

client.on("connecting", () => {
  console.info("Tentando conectar cliente...");
});

client.on("stop", () => {
  console.info(`Cliente parado!`);
});

client.on("reconnecting", () => {
  console.info("Reconectando...");
});

client.on("message", async (message: Message) => {
  if (EmptyMessage.isValid(message)) return;
  if (message.isOld) return;

  console.info(`RECEIVE MESSAGE [${message.chat.id}]`, message.id);

  if (message.isDeleted) {
    console.info(` - Message deleted!`);
  } else if (message.isUpdate) {
    console.info(` - Message update:`, message.status);
  } else if (message.isEdited) {
    console.info(` - Message edited:`, message.id, message.text);
  } else if (message.isOld) {
    console.info(` - Message old:`, message.id, message.text);
  } else {
    console.info(message);
  }

  if (message.selected.includes("poll")) {
    const cmd = client.searchCommand("/poll");

    if (!!cmd) client.runCommand(cmd, message, CMDRunType.Reply);
  }
});

client.on("chat", (update) => {
  if (update.action == "add") {
    console.info(`New chat: ${update.chat.id}`);
  }
  if (update.action == "remove") {
    console.info(`Remove chat: ${update.chat.id}`);
  }
  if (update.action == "update") {
    console.info("Chat update:", update.chat);
  }
});

client.on("user", async (update) => {
  if (update.action == "join") {
    // await client.send(new Message(update.chat, `@${update.user.id} entrou no grupo.`));
  }

  if (update.action == "leave") {
    // await client.send(new Message(update.chat, `@${update.user.id} saiu do grupo...`));
  }

  if (update.action == "add") {
    // await client.send(new Message(update.chat, `Membro @${update.fromUser.id} adicionou o @${update.user.id} ao grupo!`));
  }

  if (update.action == "remove") {
    // await client.send(new Message(update.chat, `Membro @${update.fromUser.id} removeu o @${update.user.id} do grupo.`));
  }

  if (update.action == "promote") {
    // await client.send(new Message(update.chat, `Membro @${update.fromUser.id} promoveu o @${update.user.id} para admin!`));
  }

  if (update.action == "demote") {
    // await client.send(new Message(update.chat, `Membro @${update.fromUser.id} removeu o admin do @${update.user.id}.`));
  }
});

client.on("error", (err: any) => {
  console.info("Um erro ocorreu:", err);
});

(async () => {
  const commands = await Command.readCommands(`${__dirname}/commands`);

  client.setCommands(commands);

  client.commandController.config.prefix = "/";
  client.commandController.config.lowerCase = true;

  client.commandController.on("no-allowed", async ({ message, command, permission }) => {
    if (permission.id == CMDPerms.BotChatAdmin) {
      await message.reply("Eu preciso de permissão de admin para executar esse comando!");
    }

    if (permission.id == CMDPerms.UserChatAdmin) {
      await message.reply("Somente admins podem usar esse comando!");
    }

    if (permission.id == CMDPerms.ChatGroup) {
      await message.chat.send("Somente grupos podem usar esse comando!");
    }
  });

  //? Ao inserir o número do bot é ativado o pareamento por código
  const botPhoneNumber = "";

  await client.connect(new MultiFileAuthState("./example/auth", botPhoneNumber));
})();
