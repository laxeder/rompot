import Command from "@modules/Command";

import { replaceCommandTag } from "@utils/Generic";

export const DefaultCommandConfig: CommandConfig = {
  get(command: string, commands: Command[], ...args: any[]): Command | null {
    let cmdResult: Command | null = null;

    for (const cmd of commands) {
      let msg: string = command;

      if (!!cmd.prefix) {
        const newMsg = replaceCommandTag(cmd.prefix, msg);

        if (msg == newMsg) continue;

        msg = newMsg;
      }

      let isCMD: boolean = false;

      for (const index in cmd.tags) {
        const tag = cmd.tags[index];
        const newMsg = replaceCommandTag(tag, msg);

        if (msg == newMsg) {
          if (cmd.reqTags <= 0 || cmd.reqTags > Number(index)) {
            isCMD = false;
          }

          break;
        }

        isCMD = true;

        msg = newMsg;
      }

      if (isCMD) {
        if (!!cmdResult && cmdResult.tags > cmd.tags) continue;

        cmdResult = cmd;
      }
    }

    return cmdResult;
  },
};

export default interface CommandConfig {
  /**
   * @param command Comando que será procurado
   * @param commands Lista de comandos
   * @param args Argumentos para encontrar comando
   * @returns Retorna o comando
   */
  get(command: string, commands: Command[], ...args: any[]): Command | null;
}
