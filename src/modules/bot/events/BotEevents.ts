import { BotEventsMap, IBotEvents } from "rompot-base";
import { EventEmitter } from "events";

export default class BotEvents implements IBotEvents {
  public ev = new EventEmitter();

  on<T extends keyof BotEventsMap>(eventName: T, listener: (arg: BotEventsMap[T]) => void) {
    this.ev.on(eventName, listener);
  }

  off<T extends keyof BotEventsMap>(eventName: T, listener: (arg: BotEventsMap[T]) => void): void {
    this.ev.off(eventName, listener);
  }

  removeAllListeners<T extends keyof BotEventsMap>(event: T): void {
    this.ev.removeAllListeners(event);
  }

  emit<T extends keyof BotEventsMap>(eventName: T, arg: BotEventsMap[T]): boolean {
    return this.ev.emit(eventName, arg);
  }
}
