import BotInterface from "@interfaces/BotInterface";
import BotControl from "@interfaces/BotControl";

export type BotModule = BotControl & BotInterface;

export type BotStatus = "online" | "offline";
