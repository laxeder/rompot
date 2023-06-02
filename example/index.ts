import Client, { WhatsAppBot, Message, IMessage, DefaultCommandConfig } from "../src";

import { getCommands } from "./commands";

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

client.on("stop", () => {
  console.log(`Cliente parado!`);
});

client.on("reconnecting", () => {
  console.log("Reconectando...");
});

client.on("message", async (message: IMessage) => {
  if (message.chat.type == "pv") {
    console.log(message);
  }

  if (message.selected.includes("poll")) {
    const cmd = client.getCommand("/poll");

    if (!!cmd) cmd.response(message);
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
    await client.send(new Message(update.chat, `Membro @${update.fromUser.id} removeu o admin do @${update.user.id}.`));
  }
});

client.on("error", (err: any) => {
  console.log("Um erro ocorreu:", err);
});

client.setCommands(getCommands());
client.connect("./example/auth");
