import Command from "@modules/Command";

export const DefaultCommandConfig: CommandConfig = {
  get(command: string, commands: Command[], ...args: any[]): Command | null {
    var cmdResult: Command | null = null;

    const replaceTag = (tag: string, msg: string) => msg.replace(msg.slice(msg.indexOf(tag), tag.length), "");

    for (const cmd of commands) {
      let msg: string = command;

      if (!!cmd.prefix) {
        if (!msg.includes(cmd.prefix)) continue;

        msg = replaceTag(cmd.prefix, msg);
      }

      let isCMD: boolean = true;

      for (const index in cmd.tags) {
        const tag = cmd.tags[index];

        if (!msg.includes(tag)) {
          if (cmd.reqTags <= 0 || cmd.reqTags > Number(index)) {
            isCMD = false;
          }

          break;
        }

        msg = replaceTag(tag, msg);
      }

      if (isCMD) {
        cmdResult = cmd;
        break;
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
