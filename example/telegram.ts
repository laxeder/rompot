import dotenv from "dotenv";

import Client, { Message, Command, CMDRunType, CMDPerms, EmptyMessage } from "../src";
import TelegramAuth from "../src/telegram/TelegramAuth";
import TelegramBot from "../src/telegram/TelegramBot";

dotenv.config();

const client = new Client(new TelegramBot(), {
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

client.on("close", (update) => {
  console.info(`Cliente desconectou! Motivo: ${update.reason}`);
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

client.on("stop", (update) => {
  if (update.isLogout) {
    console.info(`Cliente desligado!`);
  } else {
    console.info(`Cliente parado!`);
  }
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
    await client.send(new Message(update.chat, `@${update.user.nickname} entrou no grupo.`));
  }

  if (update.action == "leave") {
    await client.send(new Message(update.chat, `@${update.user.nickname} saiu do grupo...`));
  }

  if (update.action == "add") {
    await client.send(new Message(update.chat, `Membro @${update.fromUser.nickname} adicionou o @${update.user.nickname} ao grupo!`));
  }

  if (update.action == "remove") {
    if (update.user.id == client.bot.id) {
      console.info(`Bot foi removido do grupo "${update.chat.name}" pelo membro "${update.user.name}"`);
    } else {
      await client.send(new Message(update.chat, `Membro @${update.fromUser.nickname} removeu o @${update.user.nickname} do grupo.`));
    }
  }

  if (update.action == "promote") {
    await client.send(new Message(update.chat, `Membro @${update.fromUser.nickname} promoveu o @${update.user.nickname} para admin!`));
  }

  if (update.action == "demote") {
    await client.send(new Message(update.chat, `Membro @${update.fromUser.nickname} removeu o admin do @${update.user.nickname}.`));
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

  client.connect(new TelegramAuth(process.env.TELEGRAM_BOT_TOKEN || "", "./example/sessions/telegram"));
})();
