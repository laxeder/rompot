const { WhatsAppBot, Message, logger, Commands, Command, User, Chat } = require("rompot");

const bot = new WhatsAppBot({
  disableAutoCommand: false,
  autoRunBotCommand: true,
  disableAutoRead: true,
  receiveAllMessages: false,
  auth: "./example/auth",
});

bot.on("open", (open) => {
  if (open.isNewLogin) {
    console.log("Nova conexão");
  }

  console.log("Bot conectado!");
});

bot.on("close", () => {
  console.log(`Bot desligado!`);
});

bot.on("qr", (qr) => {
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

bot.on("message", async (message) => {
  console.log(`New message in ${message.chat.id}`);
});

bot.on("me", (message) => {
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

bot.on("error", (err) => {
  console.log("Um erro ocorreu:", err);
});

const hello = new Command("hello", "Manda um simples Hello");
hello.setSend("Hello There!");

const date = new Command(["date", "dt", "data"]);
date.setExecute((message) => {
  const bot = message.getBot();
  bot?.send(new Message(message.chat, `Data: ${new Date()}`));
});

const ban = new Command(["ban", "expulse"]);
ban.setExecute((message) => {
  if (message.chat.type !== "group") {
    return message.reply("Apenas é possível banir membros em grupos");
  }

  if (!message.chat.getMember(message.user)?.isAdmin) {
    return message.reply("Vocẽ não tem permissão para executar esse comando");
  }

  if (!message.chat.getMember(bot.id)?.isAdmin) {
    return message.reply("Eu não tenho permissão para executar esse comando");
  }

  if (message.mentions.length < 1) {
    return message.reply("Vocẽ precisa mencionar alguem para que ela possa ser banida");
  }

  bot.removeMember(message.chat, new User(message.mentions[0] || ""));
});

const add = new Command(["add"]);
add.setExecute((message) => {
  if (message.chat.type !== "group") {
    return message.reply("Apenas é possível adicionar membros em grupos");
  }

  if (!message.chat.getMember(message.user)?.isAdmin) {
    return message.reply("Vocẽ não tem permissão para executar esse comando");
  }

  if (!message.chat.getMember(bot.id)?.isAdmin) {
    return message.reply("Eu não tenho permissão para executar esse comando");
  }

  if (message.mentions.length < 1) {
    return message.reply("Vocẽ precisa mencionar alguem para que ela possa ser adicionada");
  }

  bot.addMember(message.chat, new User(message.mentions[0] || ""));
});

const commands = new Commands({ hello, date, ban, add }, bot);
commands.setPrefix("/");

bot.setCommands(commands);
bot.connect();
