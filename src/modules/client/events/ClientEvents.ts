import { ClientEventsMap, IClientEvents } from "rompot-base";
import EventEmitter from "events";

export default class ClientEvents implements IClientEvents {
  public ev = new EventEmitter();

  on<T extends keyof ClientEventsMap>(eventName: T, listener: (arg: ClientEventsMap[T]) => void) {
    this.ev.on(eventName, listener);
  }

  off<T extends keyof ClientEventsMap>(eventName: T, listener: (arg: ClientEventsMap[T]) => void): void {
    this.ev.off(eventName, listener);
  }

  removeAllListeners<T extends keyof ClientEventsMap>(event: T): void {
    this.ev.removeAllListeners(event);
  }

  emit<T extends keyof ClientEventsMap>(eventName: T, arg: ClientEventsMap[T]): boolean {
    return this.ev.emit(eventName, arg);
  }

  constructor() {
    this.on("close", () => {
      this.emit("conn", { action: "close" });
    });

    this.on("open", (update: { isNewLogin: boolean }) => {
      this.emit("conn", { action: "open", isNewLogin: update.isNewLogin });
    });

    this.on("qr", (qr: string) => {
      this.emit("conn", { action: "qr", qr });
    });

    this.on("stop", () => {
      this.emit("conn", { action: "stop" });
    });

    this.on("reconnecting", () => {
      this.emit("conn", { action: "reconnecting" });
    });

    this.on("connecting", () => {
      this.emit("conn", { action: "connecting" });
    });
  }
}
