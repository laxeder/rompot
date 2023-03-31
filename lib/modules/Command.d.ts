import ICommand from "../interfaces/ICommand";
import Message from "../messages/Message";
import { ClientType } from "../types/Client";
export default class Command implements ICommand {
    #private;
    id: string;
    reqTags: number;
    tags: string[];
    prefix: string;
    name: string;
    description: string;
    categories: string[];
    permissions: string[];
    get client(): ClientType;
    set client(c: ClientType);
    execute(message: Message): Promise<any>;
    response(message: Message): Promise<any>;
    help(message: Message): Promise<any>;
}
