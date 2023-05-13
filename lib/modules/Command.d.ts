import { ICommand } from "../interfaces/ICommand";
import { IMessage } from "../interfaces/IMessage";
import { IClient } from "../interfaces/IClient";
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
    get client(): IClient;
    set client(client: IClient);
    execute(message: IMessage): Promise<any>;
    response(message: IMessage): Promise<any>;
    help(message: IMessage): Promise<any>;
}
