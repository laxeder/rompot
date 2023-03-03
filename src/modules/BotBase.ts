import ICommand from "@interfaces/ICommand";
import IBot from "@interfaces/IBot";

import BotModule from "@modules/BotModule";

import WhatsAppBot from "@wa/WhatsAppBot";

export default class BotBase extends BotModule<IBot, ICommand> {
  constructor() {
    super(new WhatsAppBot());
  }
}
