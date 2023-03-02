import CommandInterface from "../interfaces/CommandInterface";
import BotInterface from "../interfaces/BotInterface";
import BotModule from "../modules/BotModule";
export declare type Bot = BotModule<BotInterface, CommandInterface>;
export declare type BotStatus = "online" | "offline";
