import Command from "@modules/Command";

import { replaceCommandTag } from "@utils/Generic";

export const DefaultCommandConfig: CommandConfig = {
  get(command: string, commands: Command[], ...args: any[]): Command | null {
    var cmdResult: Command | null = null;

    for (const cmd of commands) {
      let msg: string = command;

      const textLow = msg.toLowerCase();

      if (!!cmd.prefix) {
        if (!textLow.includes(cmd.prefix.toLowerCase())) continue;

        msg = replaceCommandTag(cmd.prefix, msg);
      }

      let isCMD: boolean = true;

      for (const index in cmd.tags) {
        const tag = cmd.tags[index];

        if (!textLow.includes(tag.toLowerCase())) {
          if (cmd.reqTags <= 0 || cmd.reqTags > Number(index)) {
            isCMD = false;
          }

          break;
        }

        msg = replaceCommandTag(tag, msg);
      }

      if (isCMD) {
        cmdResult = cmd;
        break;
      }
    }

    if (!!cmdResult) return cmdResult;

    return null;
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
