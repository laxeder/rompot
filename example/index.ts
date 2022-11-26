import Bot, { WhatsAppBot, logger, Message, Status } from "rompot";

const bot = new Bot(new WhatsAppBot());
bot.build("./example/auth");

bot.addEvent("connection", (update: { action: string; status?: number; login?: any }) => {
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

bot.addEvent("messages", async (message: Message) => {
  // Não responder mensagem enviada pelo Bot
  if (message.fromMe) return;

  // Marcar mensagem como visualizada
  await bot.send(new Status("reading", message.chat, message.id));

  if (message.text == "Hello") {
    bot.send(new Message(message.chat, "Hello world!"));
  }
});
