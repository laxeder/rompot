import EventEmitter from "events";

import { CommandControllerEventsMap } from "./Command";

export default class CommandControllerEvent {
  public ev = new EventEmitter();

  on<T extends keyof CommandControllerEventsMap>(eventName: T, listener: (arg: CommandControllerEventsMap[T]) => void) {
    this.ev.on(eventName, listener);
  }

  off<T extends keyof CommandControllerEventsMap>(eventName: T, listener: (arg: CommandControllerEventsMap[T]) => void): void {
    this.ev.off(eventName, listener);
  }

  removeAllListeners<T extends keyof CommandControllerEventsMap>(event: T): void {
    this.ev.removeAllListeners(event);
  }

  emit<T extends keyof CommandControllerEventsMap>(eventName: T, arg: CommandControllerEventsMap[T]): boolean {
    return this.ev.emit(eventName, arg);
  }
}
