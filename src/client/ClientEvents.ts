import EventEmitter from "events";

import { ConnectionType } from "./ConnectionType";
import { ChatAction } from "../chat/ChatAction";
import { UserAction } from "../user/UserAction";
import { UserEvent } from "../user/UserEvent";

import Message from "../messages/Message";
import Chat from "../chat/Chat";
import User from "../user/User";

/**
 * Mapeia os eventos que podem ser emitidos pelo cliente.
 */
export type ClientEventsMap = {
  /**
   * Evento de conexão alterada.
   */
  conn: {
    /** O tipo de ação que ocorreu na conexão. */
    action: ConnectionType;
    /** Indica se é um novo login. */
    isNewLogin?: boolean;
    /** Motivo da desconeção */
    reason?: any;
    /** O cliente se desconectou */
    isLogout?: boolean;
    /** O QR code gerado (quando aplicável). */
    qr?: string;
    /** O código de pareamento gerado */
    code?: string;
  };

  /**
   * Evento de cliente conectado.
   */
  open: {
    /** Indica se é um novo login. */
    isNewLogin: boolean;
  };

  /**
   * Evento de cliente reconectando.
   */
  reconnecting: {};

  /**
   * Evento de cliente conectando.
   */
  connecting: {};

  /**
   * Evento de conexão parada.
   */
  stop: {
    /** O cliente se desconectou */
    isLogout: boolean;
  };

  /**
   * Evento de conexão fechada.
   */
  close: {
    /** Motivo da desconeção */
    reason: any;
  };

  /**
   * Evento de QR code gerado.
   */
  qr: string;

  /**
   * Evento de código de autenticação gerado.
   */
  code: string;

  /**
   * Evento de ação do usuário.
   */
  user: {
    /** Ação do usuário. */
    action: UserAction;
    /** Evento do usuário. */
    event: UserEvent;
    /** O chat associado ao evento. */
    chat: Chat;
    /** O usuário relacionado ao evento. */
    user: User;
    /** O usuário que realizou a ação. */
    fromUser: User;
  };

  /**
   * Evento da sala de bate-papo.
   */
  chat: {
    /** Ação relacionada à sala de bate-papo. */
    action: ChatAction;
    /** O chat associado ao evento. */
    chat: { id: string; botId: string } & Partial<Chat>;
  };

  /**
   * Evento de nova mensagem.
   */
  message: Message;

  /**
   * Evento de erro ocorrido.
   */
  error: Error;
};

/**
 * Classe que gerencia eventos emitidos pelo cliente.
 */
export default class ClientEvents {
  protected ev = new EventEmitter();

  /**
   * Registra um ouvinte para um evento específico.
   * @param eventName - O nome do evento a ser ouvido.
   * @param listener - A função a ser executada quando o evento é emitido.
   */
  public on<T extends keyof ClientEventsMap>(eventName: T, listener: (arg: ClientEventsMap[T]) => void) {
    this.ev.on(eventName, listener);
  }

  /**
   * Remove um ouvinte de um evento específico.
   * @param eventName - O nome do evento do qual o ouvinte será removido.
   * @param listener - O ouvinte a ser removido.
   */
  public off<T extends keyof ClientEventsMap>(eventName: T, listener: (arg: ClientEventsMap[T]) => void): void {
    this.ev.off(eventName, listener);
  }

  /**
   * Remove todos os ouvintes de um evento específico.
   * @param event - O nome do evento do qual todos os ouvintes serão removidos.
   */
  public removeAllListeners<T extends keyof ClientEventsMap>(event: T): void {
    this.ev.removeAllListeners(event);
  }

  /**
   * Emite um evento com os dados fornecidos.
   * @param eventName - O nome do evento a ser emitido.
   * @param arg - Os dados do evento a serem transmitidos aos ouvintes.
   * @returns Verdadeiro se houver ouvintes para o evento, caso contrário, falso.
   */
  public emit<T extends keyof ClientEventsMap>(eventName: T, arg: ClientEventsMap[T]): boolean {
    return this.ev.emit(eventName, arg);
  }

  /**
   * Construtor da classe `ClientEvents`.
   * Registra ouvintes internos para eventos padrão de conexão.
   */
  constructor() {
    this.on("close", (update) => {
      this.emit("conn", { action: "close", reason: update.reason });
    });

    this.on("open", (update: { isNewLogin: boolean }) => {
      this.emit("conn", { action: "open", isNewLogin: update.isNewLogin });
    });

    this.on("qr", (qr: string) => {
      this.emit("conn", { action: "qr", qr });
    });

    this.on("code", (code: string) => {
      this.emit("conn", { action: "code", code });
    });

    this.on("stop", (update) => {
      this.emit("conn", { action: "stop", isLogout: !!update?.isLogout });
    });

    this.on("reconnecting", () => {
      this.emit("conn", { action: "reconnecting" });
    });

    this.on("connecting", () => {
      this.emit("conn", { action: "connecting" });
    });
  }
}
