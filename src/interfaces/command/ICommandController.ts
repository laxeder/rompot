import { ICommand } from "@interfaces/command/ICommand";
import { IMessage } from "@interfaces/IMessage";
import { IClient } from "@interfaces/IClient";

import { CommandControllerEvent } from "@utils/Command";

/** Controlador de comandos */
export interface ICommandController extends CommandControllerEvent {
  /** Cliente do controlador */
  client: IClient;
  /** Configuração do controlador */
  config: ICommandControllerConfig;
  /** Comandos */
  commands: ICommand[];

  /** Define os comandos */
  setCommands(commands: ICommand[]): void;

  /** retorna os comandos */
  getCommands(): ICommand[];

  /** Adiciona um comando */
  addCommand(command: ICommand): void;

  /** Remove um comando */
  removeCommand(command: ICommand): boolean;

  /** Busca pelo comando */
  searchCommand(text: string): ICommand | null;

  /** Execução do comando */
  runCommand(command: ICommand, message: IMessage, type?: string): any;

  /** Executa um comando */
  execCommand(message: IMessage, command: ICommand): any;

  /** Resposta ao comando */
  replyCommand(message: IMessage, command: ICommand): any;
}

/** Configuração do controlador de comandos */
export interface ICommandControllerConfig {}
