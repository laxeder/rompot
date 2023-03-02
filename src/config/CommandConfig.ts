import CommandInterface from "@interfaces/CommandInterface";
import Command from "@modules/Command";

import { Commands } from "../types/Command";

export const DefaultCommandConfig: CommandConfig = {
  prefix: "",
  get(command: string, commands: Commands): CommandInterface | null {
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
  get(command: string, commands: Commands): Command | null;
}
