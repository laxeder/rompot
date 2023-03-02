import CommandInterface from "@interfaces/CommandInterface";
import BotInterface from "@interfaces/BotInterface";

import BotModule from "@modules/BotModule";

import WhatsAppBot from "@wa/WhatsAppBot";

export default class BotBase extends BotModule<BotInterface, CommandInterface> {
  constructor() {
    super(new WhatsAppBot());
  }
}
