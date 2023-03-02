import CommandInterface from "@interfaces/CommandInterface";

import BotModule from "@modules/BotModule";

import WhatsAppBot from "@wa/WhatsAppBot";

export type WAModule = BotModule<WhatsAppBot, CommandInterface>;
