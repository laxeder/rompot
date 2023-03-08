import ICommand from "../interfaces/ICommand";
import Message from "../messages/Message";
import { ClientType } from "./Client";
export default class Command implements ICommand {
    #private;
    tags: string[];
    prefix: string;
    name: string;
    description: string;
    categories: string[];
    permissions: string[];
    get client(): ClientType;
    set client(c: ClientType);
    execute(message: Message): Promise<void>;
    response(message: Message): Promise<void>;
    help(message: Message): Promise<void>;
}
