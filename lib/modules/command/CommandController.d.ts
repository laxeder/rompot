import { ICommand, ICommandController, ICommandControllerConfig } from "../../interfaces/command";
import { IMessage } from "../../interfaces/IMessage";
import { IClient } from "../../interfaces/IClient";
import { CommandControllerEvent } from "../../utils/Command";
export declare class CommandController extends CommandControllerEvent implements ICommandController {
    client: IClient;
    config: ICommandControllerConfig;
    commands: ICommand[];
    constructor(client: IClient, config?: Partial<ICommandControllerConfig>);
    setCommands(commands: ICommand[]): void;
    getCommands(): ICommand[];
    addCommand(command: ICommand): void;
    removeCommand(command: ICommand): boolean;
    searchCommand(text: string): ICommand | null;
    runCommand(command: ICommand, message: IMessage, type?: string): Promise<any>;
    execCommand(message: IMessage, command: ICommand): Promise<any>;
    replyCommand(message: IMessage, command: ICommand): Promise<any>;
}
export declare const DEFAULT_COMMAND_CONTROLLER_CONFIG: ICommandControllerConfig;
