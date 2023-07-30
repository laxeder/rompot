import { ICommand, ICommandControllerConfig, ICommandKey, ICommandPermission, IMessage } from "rompot-base";

import CommandPermission from "@modules/command/models/CommandPermission";
import CommandKey from "@modules/command/models/CommandKey";
import { CMDPerm } from "@modules/command/utils/perms";
import { ClientModule } from "@modules/client";

import { readRecursiveDir } from "@utils/Generic";
import { isCommand } from "@utils/Verify";

export default class Command extends ClientModule implements ICommand {
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

              //@ts-ignore
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
