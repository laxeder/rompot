import BotInterface from "../interfaces/BotInterface";
import BotControl from "../interfaces/BotControl";
export declare type BotModule = BotControl & BotInterface;
export declare type BotStatus = "online" | "offline";
