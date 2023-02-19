import CommandInterfaces from "../interfaces/CommandInterface";
import Message from "../messages/Message";
import { BotModule } from "../types/Bot";
export default class Command implements CommandInterfaces {
    tags: string[];
    prefix: string;
    name: string;
    description: string;
    categories: string[];
    permissions: string[];
    get bot(): BotModule;
    execute(message: Message): Promise<void>;
    response(message: Message): Promise<void>;
    help(message: Message): Promise<void>;
}
