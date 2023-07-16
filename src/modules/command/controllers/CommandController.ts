import { CMDRunType, IClient, ICommand, ICommandController, ICommandControllerConfig, ICommandKey, IMessage } from "rompot-base";

import CommandControllerEvent from "@modules/command/controllers/CommandControllerEvent";
import { DEFAULT_COMMAND_CONTROLLER_CONFIG } from "@modules/command/utils/defaults";

export default class CommandController extends CommandControllerEvent implements ICommandController {
  public client: IClient;

  public config: ICommandControllerConfig;
  public commands: ICommand[] = [];

  constructor(client: IClient, config: Partial<ICommandControllerConfig> = {}) {
    super();
    this.client = client;

    this.config = { ...DEFAULT_COMMAND_CONTROLLER_CONFIG, ...config };
  }

  public setCommands(commands: ICommand[]): void {
    const cmds: ICommand[] = [];

    for (const command of commands) {
      command.client = this.client;

      cmds.push(command);
    }

    this.commands = cmds;
  }

  public getCommands(): ICommand[] {
    return this.commands;
  }

  public addCommand(command: ICommand): void {
    command.client = this.client;

    this.commands.push(command);
  }

  public removeCommand(command: ICommand): boolean {
    const commands: ICommand[] = [];
    const commandKeys = command.keys.map((key) => key.values.join("")).join("");

    for (const cmd of this.commands) {
      const keys = cmd.keys.map((key) => key.values.join("")).join("");

      if (keys == commandKeys) continue;

      commands.push(cmd);
    }

    if (this.commands.length == commands.length) return false;

    this.commands = commands;

    return true;
  }

  public searchCommand(text: string): ICommand | null {
    const commands: { key: ICommandKey; command: ICommand }[] = [];

    for (const command of this.commands) {
      const key = command.onSearch(`${text}`, this.config);

      if (key != null) {
        commands.push({ key, command });
      }
    }

    let commandResult: { key: ICommandKey; command: ICommand } | null = null;

    for (const { key, command } of commands) {
      if (commandResult == null) {
        commandResult = { key, command };
        continue;
      }

      if (key.values.join("").length > commandResult.key.values.join("").length) {
        commandResult = { key, command };
      }
    }

    if (commandResult == null) return null;

    return commandResult.command;
  }

  public async runCommand(command: ICommand, message: IMessage, type: string = CMDRunType.Exec): Promise<any> {
    const permission = await command.checkPerms(message);

    if (permission != null && !permission.isPermited) {
      this.emit("no-allowed", { message, command, permission });
      return;
    }

    if (type == CMDRunType.Reply) {
      return await this.replyCommand(message, command);
    }

    return this.execCommand(message, command);
  }

  public async execCommand(message: IMessage, command: ICommand) {
    return await command.onExec(message);
  }

  public async replyCommand(message: IMessage, command: ICommand) {
    return await command.onReply(message);
  }
}
