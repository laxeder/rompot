import TelegramBotAPI from "node-telegram-bot-api";

import TelegramToRompotConverter from "./TelegramToRompotConverter";
import TelegramBot from "./TelegramBot";

export default class TelegramEvents {
  public telegram: TelegramBot;

  constructor(telegram: TelegramBot) {
    this.telegram = telegram;
  }

  public configAll() {
    this.configMessage();
  }

  public configMessage() {
    const receievMessage = async (msg: TelegramBotAPI.Message) => {
      const converter = new TelegramToRompotConverter(msg);

      const rompotMessage = await converter.convert(true);

      this.telegram.emit("message", rompotMessage);
    };

    this.telegram.bot.on("message", receievMessage);
    this.telegram.bot.on("edited_message", receievMessage);
  }
}
