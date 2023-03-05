import ICommand from "@interfaces/ICommand";
import IBot from "@interfaces/IBot";
import BotModule from "@modules/BotModule";
export declare type Client = BotModule<IBot, ICommand>;
export declare type BotStatus = "online" | "offline";
