import Client, { WhatsAppBot, Message, DefaultCommandConfig } from "../src/index";

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

client.setCommands(getCommands());
client.connect("./example/auth");
