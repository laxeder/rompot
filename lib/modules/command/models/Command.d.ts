import { ICommand, ICommandControllerConfig, ICommandKey, ICommandPermission, IMessage } from "rompot-base";
import ClientModule from "../../client/models/ClientModule";
export default class Command extends ClientModule implements ICommand {
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
