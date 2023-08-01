import { ICommand, ICommandController, ICommandControllerConfig, IMessage } from "rompot-base";
import CommandControllerEvent from "../../command/controllers/CommandControllerEvent";
export default class CommandController extends CommandControllerEvent implements ICommandController {
    config: ICommandControllerConfig;
    commands: ICommand[];
    constructor(config?: Partial<ICommandControllerConfig>);
    setCommands(commands: ICommand[]): void;
    getCommands(): ICommand[];
    addCommand(command: ICommand): void;
    removeCommand(command: ICommand): boolean;
    searchCommand(text: string): ICommand | null;
    runCommand(command: ICommand, message: IMessage, type?: string): Promise<any>;
    execCommand(message: IMessage, command: ICommand): Promise<any>;
    replyCommand(message: IMessage, command: ICommand): Promise<any>;
}
