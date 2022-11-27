const { Bot, WhatsAppBot, logger, Message, Commands } = require("rompot");
const commands = require("./commands");

const bot = new Bot(new WhatsAppBot());
bot.setCommands(new Commands(commands, bot));
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
});

bot.on("message", async (message) => {
  // Não responder mensagem enviada pelo Bot
  if (message.fromMe) return;

  // Marcar mensagem como visualizada
  await message.read();

  // Obtem o comando digitado na mensagem e o executa
  const command = bot.commands.get(message.text);

  if (command) {
    command.execute(message);
  }
});

bot.on("member", (member) => {
  // Novo membro de um grupo
  if (member.action == "add") {
    const msg = new Message(member.chat, `Bem vindo ao grupo @${member.user.phone}`);

    // Menciona uma pessoa na mensagem
    msg.addMentions(member.user.id);

    // Envia a mensagem criada
    bot.send(msg);
  }

  // Member saiu de um grupo
  if (member.action == "remove") {
    //...
  }
});

bot.on("error", (err) => {
  logger.error(`Um erro ocorreu: ${err}`);
});
