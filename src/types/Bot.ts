import CommandInterface from "@interfaces/CommandInterface";
import BotInterface from "@interfaces/BotInterface";

import BotModule from "@modules/BotModule";

export type Bot = BotModule<BotInterface, CommandInterface>;

export type BotStatus = "online" | "offline";
