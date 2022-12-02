import { Bot, WhatsAppBot, Message, logger, Commands, Command, User, Chat } from "../src/index";

const hello = new Command("hello", "Manda um simples Hello");
hello.setSend("Hello There!");

const date = new Command(["date", "dt", "data"]);
date.setExecute((message: Message) => {
  const bot = message.getBot();
  bot?.send(new Message(message.chat, `Data: ${new Date()}`));
});

const bot = new Bot(new WhatsAppBot());

const commands = new Commands({ hello, date }, bot);
commands.setPrefix("/");

bot.setCommands(commands);
bot.build("./example/auth");

bot.on("connection", (update: { action: string; status: string }) => {
  if (update.action == "open") {
    logger.info("Bot conectado!");
  }

  if (update.action == "close") {
    logger.error(`Bot desligado! Status: ${update.status}`);
  }

  if (update.action == "reconnecting") {
    logger.warn("Reconectando...");
  }
});

bot.on("message", async (message: Message) => {
  console.log(`New message in ${message.chat.id}`);

  console.log(await bot.getChats());
  console.log(await bot.getChat(message.chat.id));
});

bot.on("bot-message", (message: Message) => {
  console.log(`Send message to ${message.user.phone}`);
});

bot.on("chat", (chat: Chat) => {
  console.log(`New chat: ${chat.id}`);
});

bot.on("member", (member: { action: string; user: User; chat: Chat }) => {
  if (member.action == "add") {
    console.log(`Number ${member.user.phone} joined group ${member.chat.id}`);
  }

  if (member.action == "remove") {
    console.log(`Member group ${member.chat.id} left`);
  }
});

bot.on("error", (err: any) => {
  console.log("Um erro ocorreu:", err);
});
