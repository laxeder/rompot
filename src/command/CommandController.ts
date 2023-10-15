import ICommandControllerConfig from "./ICommandControllerConfig";
import { DEFAULT_COMMAND_CONTROLLER_CONFIG } from "./defaults";
import CommandControllerEvent from "./CommandControllerEvent";
import Command, { CMDRunType } from "./Command";
import Message from "../messages/Message";
import CommandKey from "./CommandKey";

export default class CommandController extends CommandControllerEvent {
  /** Configuração do controlador */
  public config: ICommandControllerConfig;
  /** Comandos */
  public commands: Command[] = [];
  /** ID do bot associado ao controlador de comandos */
  public botId: string = "";

  constructor(config: Partial<ICommandControllerConfig> = {}) {
    super();

    this.config = { ...DEFAULT_COMMAND_CONTROLLER_CONFIG, ...config };
  }

  /** Define os comandos
   * @param commands Novos comandos
   * */
  public setCommands(commands: Command[]): void {
    const cmds: Command[] = [];

    for (const command of commands) {
      command.botId = this.botId;

      cmds.push(command);
    }

    this.commands = cmds;
  }

  /** @retuns Retorna os comandos */
  public getCommands(): Command[] {
    return this.commands;
  }

  /** Adiciona um comando
   * @param command Novo comando
   */
  public addCommand(command: Command): void {
    command.botId = this.botId;

    this.commands.push(command);
  }

  /**
   * Remove um comando
   * @param command Comando que será removido
   * */
  public removeCommand(command: Command): boolean {
    const commands: Command[] = [];
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

  /** Busca pelo comando
   * @param text Texto onde será verificado se inclui o comando
   */
  public searchCommand(text: string): Command | null {
    const commands: { key: CommandKey; command: Command }[] = [];

    for (const command of this.commands) {
      const key = command.onSearch(`${text}`, this.config);

      if (key != null) {
        commands.push({ key, command });
      }
    }

    let commandResult: { key: CommandKey; command: Command } | null = null;

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

  /** Execução do comando
   * @param command Comando que será executado
   * @param message Mensagem que chamou o comando
   * @param type Tipo da execução doo comando
   */
  public async runCommand(command: Command, message: Message, type: string = CMDRunType.Exec): Promise<any> {
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

  /** Executa o comando
   * @param message Mensagem que chamou o comando
   * @param command Comando que será executado
   */
  public async execCommand(message: Message, command: Command) {
    return await command.onExec(message);
  }

  /** Resposta ao comando
   * @param message Mensagem que chamou o comando
   * @param command Comando que receberá a resposta
   */
  public async replyCommand(message: Message, command: Command) {
    return await command.onReply(message);
  }
}
