import ICommand from "@interfaces/ICommand";

export const DefaultCommandConfig: CommandConfig = {
  get(command: string, commands: ICommand[], ...args: any[]): ICommand | null {
    var cmdResult: ICommand | null = null;

    for (const cmd of commands) {
      let msg: string = command;
      let isCMD: boolean = true;

      const tags = cmd.tags;

      if (!!cmd.prefix) tags.unshift(cmd.prefix);

      for (const tag of cmd.tags) {
        if (!msg.includes(tag)) {
          isCMD = false;
          break;
        }

        msg.slice(msg.indexOf(tag), tag.length);
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
  get(command: string, commands: ICommand[], ...args: any[]): ICommand | null;
}
