import Command from "@modules/Command";

import { Commands, CommandsSystem } from "../types/Command";

export const defaultCommandConfig: CommandConfig = {
  prefix: "",
  get(command: string, commands: CommandsSystem): Command | null {
    const cmds = command.split(/\s+/g);

    const cmd = commands[cmds.shift() || ""];

    if (!!cmd) {
      if (typeof cmd == "string") return this.get(cmds.join(" "), commands);
      if (cmd instanceof Command) return cmd;
    }

    return null;
  },
};

export default interface CommandConfig {
  /** Prefixo dos comandos */
  prefix: string;

  /**
   * @param command Comando que será procurado
   * @param commands Lista de comandos
   * @returns Retorna o comando
   */
  get(command: string, commands: CommandsSystem): Command | null;
}
