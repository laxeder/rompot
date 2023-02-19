/// <reference types="node" />
import EventEmitter from "events";
import Message from "../messages/Message";
import Chat from "../modules/Chat";
import User from "../modules/User";
import { ConnectionType } from "../types/Connection";
import { UserAction } from "../types/User";
import { ChatAction } from "../types/Chat";
export declare type EventsEmitter = {
    /**
     * * Conexão alterada
     * @param action Tipo da conexão
     * @param isNewLogin Se é um novo bot
     */
    conn: {
        action: ConnectionType;
        isNewLogin?: boolean;
        qr?: string;
    };
    /**
     * * Bot conectou
     * @param isNewLogin Se é um novo login
     */
    open: {
        isNewLogin: boolean;
    };
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
    user: {
        action: UserAction;
        chat: Chat;
        user: User;
    };
    /**
     * * Sala de bate-papo alterado
     * @param action ação ocorrida
     * @param chat Sala de bate-papo que foi alterada
     */
    chat: {
        action: ChatAction;
        chat: Chat;
    };
    /** * Nova mensagem */
    message: Message;
    /** * Mensagem enviada pelo bot */
    me: Message;
    /** * Erro ocorrido */
    error: Error;
};
export default class Emmiter {
    events: EventEmitter;
    constructor();
    on<T extends keyof EventsEmitter>(eventName: T, listener: (arg: EventsEmitter[T]) => void): void;
    off<T extends keyof EventsEmitter>(eventName: T, listener: (arg: EventsEmitter[T]) => void): void;
    removeAllListeners<T extends keyof EventsEmitter>(event: T): void;
    /** * Emite um evento */
    emit<T extends keyof EventsEmitter>(eventName: T, arg: EventsEmitter[T]): boolean;
}
