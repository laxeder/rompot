import type { UserAction, UserEvent } from "../types/User";
import type { ConnectionType } from "../types/Connection";
import type { ChatAction } from "../types/Chat";

import EventEmitter from "events";

import { IMessage } from "@interfaces/IMessage";

import User from "@modules/User";
import Chat from "@modules/Chat";

export type EventsMap = {
  /**
   * * Conexão alterada
   * @param action Tipo da conexão
   * @param isNewLogin Se é um novo bot
   */
  conn: { action: ConnectionType; isNewLogin?: boolean; qr?: string };

  /**
   * * Client conectou
   * @param isNewLogin Se é um novo login
   */
  open: { isNewLogin: boolean };

  /** * Client reconectando */
  reconnecting: {};

  /** * Client conectando */
  connecting: {};

  /** * Sessão do bot encerrada */
  closed: {};

  /** * Conexão fechada */
  close: {};

  /** * QR code gerado */
  qr: string;

  /**
   * * Novo usuário
   * @param action Ação feita pelo usuário
   * @param event Evento ocorrido na sala de bate-papo
   * @param chat Sala de bate-papo que recebeu o evento
   * @param user Usuário que sofreu a ação
   * @param fromUser Usuário que executou a ação
   */
  user: { action: UserAction; event: UserEvent; chat: Chat; user: User; fromUser: User };

  /**
   * * Sala de bate-papo alterado
   * @param action ação ocorrida
   * @param chat Sala de bate-papo que foi alterada
   */
  chat: { action: ChatAction; chat: Chat };

  /** * Nova mensagem */
  message: IMessage;

  /** * Erro ocorrido */
  error: Error;
};

export class BotEvents {
  public events = new EventEmitter();

  on<T extends keyof EventsMap>(eventName: T, listener: (arg: EventsMap[T]) => void) {
    this.events.on(eventName, listener);
  }

  off<T extends keyof EventsMap>(eventName: T, listener: (arg: EventsMap[T]) => void): void {
    this.events.off(eventName, listener);
  }

  removeAllListeners<T extends keyof EventsMap>(event: T): void {
    this.events.removeAllListeners(event);
  }

  /** * Emite um evento */
  emit<T extends keyof EventsMap>(eventName: T, arg: EventsMap[T]): boolean {
    return this.events.emit(eventName, arg);
  }
}

export class ClientEvents extends BotEvents {
  constructor() {
    super();
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
      this.emit("conn", { action: "connecting" });
    });
  }
}
