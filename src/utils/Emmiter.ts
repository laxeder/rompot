import EventEmitter from "events";

import { ChatAction, ConnectionStatus, ConnectionTypes, MemberAction } from "../types/index";
import { Message } from "@messages/Message";
import { Chat } from "@modules/Chat";
import { User } from "@modules/User";

export type EventsMap = {
  conn: { action: ConnectionTypes; status: ConnectionStatus; isNewLogin?: boolean; qr?: string };
  open: { status: ConnectionStatus; isNewLogin: boolean };
  reconnecting: { status: ConnectionStatus };
  connecting: { status: ConnectionStatus };
  closed: { status: ConnectionStatus };
  close: { status: ConnectionStatus };
  qr: string;
  member: { action: MemberAction; chat: Chat; member: User };
  chat: { action: ChatAction; chat: Chat };
  message: Message;
  me: Message;
  error: Error;
};

export type Event = keyof EventsMap;

export class Emmiter {
  public events = new EventEmitter();

  constructor() {
    this.on("close", (update: { status: ConnectionStatus }) => {
      this.emit("conn", { action: "close", status: update.status });
    });

    this.on("open", (update: { status: ConnectionStatus; isNewLogin: boolean }) => {
      this.emit("conn", { action: "open", status: update.status, isNewLogin: update.isNewLogin });
    });

    this.on("qr", (qr: string) => {
      this.emit("conn", { action: "qr", status: "offline", qr });
    });

    this.on("closed", (update: { status: ConnectionStatus }) => {
      this.emit("conn", { action: "closed", status: update.status });
    });

    this.on("reconnecting", (update: { status: ConnectionStatus }) => {
      this.emit("conn", { action: "reconnecting", status: update.status });
    });

    this.on("connecting", (update: { status: ConnectionStatus }) => {
      this.emit("conn", { action: "qr", status: update.status });
    });
  }

  on<T extends keyof EventsMap>(eventName: T, listener: (arg: EventsMap[T]) => void) {
    this.events.on(eventName, listener);
  }

  off<T extends keyof EventsMap>(eventName: T, listener: (arg: EventsMap[T]) => void): void {
    this.events.off(eventName, listener);
  }

  removeAllListeners<T extends keyof EventsMap>(event: T): void {
    this.events.removeAllListeners(event);
  }

  emit<T extends keyof EventsMap>(eventName: T, arg: EventsMap[T]): boolean {
    return this.events.emit(eventName, arg);
  }
}
