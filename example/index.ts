import Client, { WhatsAppBot, Message, Command, CMDRunType, CMDPerms } from "../src";

const client = new Client(new WhatsAppBot(), {
  disableAutoCommand: false,
  disableAutoTyping: false,
  disableAutoRead: false,
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

client.on("stop", () => {
  console.log(`Cliente parado!`);
});

client.on("reconnecting", () => {
  console.log("Reconectando...");
});

client.on("message", async (message: Message) => {
  if (message.chat.type == "pv") {
    console.log(message);
  }

  if (message.selected.includes("poll")) {
    const cmd = client.searchCommand("/poll");

    if (!!cmd) client.runCommand(cmd, message, CMDRunType.Reply);
  }

  if (message.fromMe) {
    console.log(`Send message to ${message.user.id}: "${await client.getChatName(message.chat)}"`);
  } else {
    console.log(`New message in ${message.chat.id}: "${await client.getChatName(message.chat)}"`);
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
  console.log("Um erro ocorreu:", err);
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

  client.connect("./example/auth");
})();
