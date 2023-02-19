import { ConnectionConfig } from "../config/ConnectionConfig";
import BotInterface from "../interfaces/BotInterface";
import BotControl from "../interfaces/BotControl";
export declare function BuildBot<Bot extends BotInterface>(bot: Bot, config?: ConnectionConfig): BotControl & Bot;
