import ICommandControllerConfig from "./ICommandControllerConfig";
import { readRecursiveDir } from "../utils/Generic";
import CommandPermission from "./CommandPermission";
import Message from "../messages/Message";
import CommandKey from "./CommandKey";
import { CMDPerm } from "./perms";

/** Permissões do comando */
export declare enum CMDPerms {
  /** Permitido apenas ser executado no pv */
  ChatPv = "chat-pv",
  /** Permitido apenas ser executado em grupos */
  ChatGroup = "chat-group",
  /** Permitido apenas se o usuário for admin do chat */
  UserChatAdmin = "chat-admin",
  /** Permitido apenas se o usuário for líder do chat */
  UserChatLeader = "chat-leader",
  /** Permitido apenas se o bot for admin do chat */
  BotChatAdmin = "bot-chat-admin",
  /** Permitido apenas se o  bot for líder do chat */
  BotChatLeader = "bot-chat-leader",
}

export type CommandControllerEventsMap = {
  /** Permissão negada */
  ["no-allowed"]: {
    message: Message;
    command: Command;
    permission: CommandPermission;
  };
};

export default class Command {
  /** Chaves do comando */
  public keys: CommandKey[] = [];
  /** Permissões necessárias do comando */
  public permissions: string[] = [];
  /** ID do bot associado ao comando */
  public botId: string = "";
  /** ID do client associado ao comando */
  public clientId: string = "";

  /** Verifica se o comando pode ser executado
   * @param message Mensagem que está executando o comando
   */
  public async checkPerms(message: Message): Promise<CommandPermission | null> {
    const permissions: CommandPermission[] = [];

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

  /** Quando o comando está sendo procurado
   * @param text Texto que será verificado se incluí o comando
   * @param config Configuração do controlador de comando
   */
  public onSearch(text: string, config: ICommandControllerConfig): CommandKey | null {
    return CommandKey.search(text, config, ...this.keys);
  }

  /** Quando o comando é lido */
  public onRead(): any {}

  /** Configuração do comando
   * @param message Mensagem que está executando o comando
   */
  public onConfig(): any {}

  /** Execução do comando
   * @param message Mensagem que está executando o comando
   */
  public onExec(message: Message): any {}

  /** Respota ao comando
   * @param message Mensagem que está executando o comando
   */
  public onReply(message: Message): any {}

  public static async readCommands(dir: string): Promise<Command[]> {
    const commands: Command[] = [];

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

              if (Command.isValid(data)) {
                await data.onRead();

                commands.push(data);
              } else {
                //@ts-ignore
                const cmd = new data();

                if (Command.isValid(cmd)) {
                  await cmd.onRead();

                  commands.push(cmd);
                }
              }
            } catch (err) {}
          })
        );
      } catch (err) {}
    });

    return commands;
  }

  /**
   * Verifica se um objeto é uma instância válida de Command.
   * @param message - O objeto a ser verificado.
   * @returns Verdadeiro se o objeto for uma instância válida de Command, caso contrário, falso.
   */
  public static isValid(command: any): command is Command {
    return typeof command === "object" && Object.keys(new Command()).every((key) => command?.hasOwnProperty(key));
  }
}
