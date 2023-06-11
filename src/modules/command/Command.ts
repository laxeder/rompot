import { ICommand, ICommandControllerConfig, ICommandPermission } from "@interfaces/command";
import { ICommandKey } from "@interfaces/command";
import { IMessage } from "@interfaces/IMessage";
import { IClient } from "@interfaces/IClient";

import { CMDPerm, CommandPermission } from "@modules/command/CommandPermission";
import { CommandKey } from "@modules/command/CommandKey";
import { ClientBase } from "@modules/ClientBase";

import { readRecursiveDir } from "@utils/Generic";
import { isCommand } from "@utils/Verify";

export class Command implements ICommand {
  public client: IClient = ClientBase();
  public keys: ICommandKey[] = [];
  public permissions: string[] = [];

  public async checkPerms(message: IMessage): Promise<ICommandPermission | null> {
    const permissions: ICommandPermission[] = [];

    await Promise.all(
      this.permissions.map(async (permission) => {
        const perm = CMDPerm(permission);

        if (!(await CommandPermission.check(message, perm))) {
          perm.isPermited = false;

          permissions.push(perm);
        }
      })
    );

    if (permissions.length > 0) return permissions[0];

    return null;
  }

  public onSearch(text: string, config: ICommandControllerConfig): ICommandKey | null {
    return CommandKey.search(text, config, ...this.keys);
  }

  public onRead(): any {}

  public onConfig(): any {}

  public onExec(message: IMessage): any {}

  public onReply(message: IMessage): any {}

  public static async readCommands(dir: string): Promise<ICommand[]> {
    const commands: ICommand[] = [];

    await readRecursiveDir(dir, async (filepath, filename, ext) => {
      try {
        if (ext != ".ts" && ext != ".js") return;

        const content = require(filepath);

        if (!!!content) return;
        if (typeof content != "object") return;

        const keys = Object.keys(content);

        await Promise.all(
          keys.map(async (key) => {
            try {
              const data = content[key];

              if (!!!data) return;

              if (isCommand(data)) {
                await data.onRead();

                commands.push(data);
                return;
              }

              const cmd = new data();

              if (isCommand(cmd)) {
                await cmd.onRead();

                commands.push(cmd);
              }
            } catch (err) {}
          })
        );
      } catch (err) {}
    });

    return commands;
  }
}
