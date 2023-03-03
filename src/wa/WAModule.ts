import ICommand from "@interfaces/ICommand";

import BotModule from "@modules/BotModule";

import WhatsAppBot from "@wa/WhatsAppBot";

export type WAModule = BotModule<WhatsAppBot, ICommand>;
