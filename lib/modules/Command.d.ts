import ICommand from "@interfaces/ICommand";
import Message from "@messages/Message";
import { Client } from "../types/Client";
export default class Command implements ICommand {
    tags: string[];
    prefix: string;
    name: string;
    description: string;
    categories: string[];
    permissions: string[];
    get bot(): Client;
    execute(message: Message): Promise<void>;
    response(message: Message): Promise<void>;
    help(message: Message): Promise<void>;
}
