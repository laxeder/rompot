const { Bot, WhatsAppBot, Message, logger, Commands, Command } = require("rompot");

const hello = new Command("hello", "Manda um simples Hello");
hello.setSend("Hello There!");

const date = new Command(["date", "dt", "data"]);
date.setExecute((message) => {
  const bot = message.getBot();
  bot?.send(new Message(message.chat, `Data: ${new Date()}`));
});

const bot = new Bot(new WhatsAppBot());

const commands = new Commands({ hello, date }, bot);
commands.setPrefix("/");

bot.setCommands(commands);
bot.build("./example/auth");

bot.on("connection", (update) => {
  if (update.action == "open") {
    logger.info("Bot conectado!");
  }

  if (update.action == "close") {
    logger.error(`Bot desligado! Status: ${update.status}`);
  }

  if (update.action == "reconnecting") {
    logger.warn("Reconectando...");
  }

  if (update.login) {
    logger.info("New session");
  }
});

bot.on("message", async (message) => {
  console.log(`New message in ${message.chat.id}`);
});

bot.on("bot-message", (message) => {
  console.log(`Send message to ${message.user.phone}`);
});

bot.on("chat", (chat) => {
  console.log(`New chat: ${chat.id}`);
});

bot.on("member", (member) => {
  if (member.action == "add") {
    console.log(`Number ${member.user.phone} joined group ${member.chat.id}`);
  }

  if (member.action == "remove") {
    console.log(`Member group ${member.chat.id} left`);
  }
});

bot.on("error", (err) => {
  console.log("Um erro ocorreu:", err);
});
