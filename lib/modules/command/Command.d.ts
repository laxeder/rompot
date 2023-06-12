import { ICommand, ICommandControllerConfig, ICommandPermission } from "../../interfaces/command";
import { ICommandKey } from "../../interfaces/command";
import { IMessage } from "../../interfaces/IMessage";
import { IClient } from "../../interfaces/IClient";
export declare class Command implements ICommand {
    client: IClient;
    keys: ICommandKey[];
    permissions: string[];
    checkPerms(message: IMessage): Promise<ICommandPermission | null>;
    onSearch(text: string, config: ICommandControllerConfig): ICommandKey | null;
    onRead(): any;
    onConfig(): any;
    onExec(message: IMessage): any;
    onReply(message: IMessage): any;
    static readCommands(dir: string): Promise<ICommand[]>;
}
