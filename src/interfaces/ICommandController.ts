import { ICommand } from "./ICommand";

export interface ICommandController {
  runCommand(command: ICommand): Promise<boolean>;
}
