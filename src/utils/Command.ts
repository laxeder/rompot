import EventEmitter from "events";

import { ICommand, ICommandPermission } from "@interfaces/command";
import { IMessage } from "@interfaces/IMessage";

export type CommandControllerEventsMap = {
  /**
   * * Permissão negada
   * @param message Mensagem que chamou o comando
   * @param command Comando que negou a permissão
   * @param permission Permissão que foi negada
   */
  ["no-allowed"]: { message: IMessage; command: ICommand; permission: ICommandPermission };
};

export class CommandControllerEvent {
  public events = new EventEmitter();

  on<T extends keyof CommandControllerEventsMap>(eventName: T, listener: (arg: CommandControllerEventsMap[T]) => void) {
    this.events.on(eventName, listener);
  }

  off<T extends keyof CommandControllerEventsMap>(eventName: T, listener: (arg: CommandControllerEventsMap[T]) => void): void {
    this.events.off(eventName, listener);
  }

  removeAllListeners<T extends keyof CommandControllerEventsMap>(event: T): void {
    this.events.removeAllListeners(event);
  }

  emit<T extends keyof CommandControllerEventsMap>(eventName: T, arg: CommandControllerEventsMap[T]): boolean {
    return this.events.emit(eventName, arg);
  }
}
