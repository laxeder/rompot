import ICommand from "@interfaces/ICommand";
import IBot from "@interfaces/IBot";

import BotModule from "@modules/BotModule";

export type Bot = BotModule<IBot, ICommand>;

export type BotStatus = "online" | "offline";
