const { WhatsAppBot, Message, logger, Commands, Command, User, Chat } = require("rompot");

const bot = new WhatsAppBot({
  disableAutoCommand: false,
  autoRunBotCommand: true,
  disableAutoRead: true,
  receiveAllMessages: false,
});

bot.on("connection", (update) => {
  if (update.action == "connecting") {
    logger.info("Tentando conectar bot...");
  }

  if (update.action == "new") {
    logger.info("Nova conexão");
  }

  if (update.action == "open") {
    logger.info("Bot conectado!");
  }

  if (update.action == "close") {
    logger.error(`Bot desligado! Status: ${update.status}`);
  }

  if (update.action == "closed") {
    logger.error(`A conexão desse bot foi fechada`);
  }

  if (update.action == "reconnecting") {
    logger.warn("Reconectando...");
  }
});

bot.on("message", async (message) => {
  logger.info(`New message in ${message.chat.id}`);
});

bot.on("bot-message", (message) => {
  logger.info(`Send message to ${message.user.phone}`);
});

bot.on("chat", (chat) => {
  logger.info(`New chat: ${chat.id}`);
});

bot.on("member", (member) => {
  if (member.action == "add") {
    logger.info(`Number ${member.user.phone} joined group ${member.chat.id}`);
  }

  if (member.action == "remove") {
    logger.info(`Member group ${member.chat.id} left`);
  }
});

bot.on("error", (err) => {
  logger.error("Um erro ocorreu:", err);
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
bot.connect("./example/auth");
