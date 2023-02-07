import EventEmitter from "events";

import Message from "@messages/Message";

import Chat from "@modules/Chat";
import User from "@modules/User";

import { ConnectionType } from "../types/Connection";
import { UserAction } from "../types/User";
import { ChatAction } from "../types/Chat";

export type EventsEmitter = {
  /**
   * * Conexão alterada
   * @param action Tipo da conexão
   * @param isNewLogin Se é um novo bot
   */
  conn: { action: ConnectionType; isNewLogin?: boolean; qr?: string };

  /**
   * * Bot conectou
   * @param isNewLogin Se é um novo login
   */
  open: { isNewLogin: boolean };

  /** * Bot reconectando */
  reconnecting: {};

  /** * Bot conectando */
  connecting: {};

  /** * Sessão do bot encerrada */
  closed: {};

  /** * Conexão fechada */
  close: {};

  /** * QR code gerado */
  qr: string;

  /**
   * * Novo usuário
   * @param action Ação ocorrida
   * @param chat Sala de bate-papo que recebeu o novo usuário
   * @param user Usuário
   */
  user: { action: UserAction; chat: Chat; user: User };

  /**
   * * Sala de bate-papo alterado
   * @param action ação ocorrida
   * @param chat Sala de bate-papo que foi alterada
   */
  chat: { action: ChatAction; chat: Chat };

  /** * Nova mensagem */
  message: Message;

  /** * Mensagem enviada pelo bot */
  me: Message;

  /** * Erro ocorrido */
  error: Error;
};

export default class Emmiter {
  public events = new EventEmitter();

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

    this.on("closed", () => {
      this.emit("conn", { action: "closed" });
    });

    this.on("reconnecting", () => {
      this.emit("conn", { action: "reconnecting" });
    });

    this.on("connecting", () => {
      this.emit("conn", { action: "qr" });
    });
  }

  on<T extends keyof EventsEmitter>(eventName: T, listener: (arg: EventsEmitter[T]) => void) {
    this.events.on(eventName, listener);
  }

  off<T extends keyof EventsEmitter>(eventName: T, listener: (arg: EventsEmitter[T]) => void): void {
    this.events.off(eventName, listener);
  }

  removeAllListeners<T extends keyof EventsEmitter>(event: T): void {
    this.events.removeAllListeners(event);
  }

  /** * Emite um evento */
  emit<T extends keyof EventsEmitter>(eventName: T, arg: EventsEmitter[T]): boolean {
    return this.events.emit(eventName, arg);
  }
}
