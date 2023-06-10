import { ICommand } from "@interfaces/ICommand";
import { ICommandController } from "@interfaces/ICommandController";

export default class CommandController implements ICommandController {
  public async runCommand(command: ICommand): Promise<boolean> {
    return true;
  }
}
