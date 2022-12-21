import { ChatAction, ConnectionStatus, ConnectionTypes, MemberAction } from "../types/index";
import { Message } from "../messages/Message";
import { Chat } from "../models/Chat";
import { User } from "../models/User";
export declare type EventsMap = {
    conn: {
        action: ConnectionTypes;
        status: ConnectionStatus;
        isNewLogin?: boolean;
        qr?: string;
    };
    open: {
        status: ConnectionStatus;
        isNewLogin: boolean;
    };
    reconnecting: {
        status: ConnectionStatus;
    };
    connecting: {
        status: ConnectionStatus;
    };
    closed: {
        status: ConnectionStatus;
    };
    close: {
        status: ConnectionStatus;
    };
    qr: string;
    member: {
        action: MemberAction;
        chat: Chat;
        member: User;
    };
    chat: {
        action: ChatAction;
        chat: Chat;
    };
    message: Message;
    me: Message;
    error: Error;
};
export declare type Event = keyof EventsMap;
export declare class Emmiter {
    private events;
    constructor();
    on<T extends keyof EventsMap>(eventName: T, listener: (arg: EventsMap[T]) => void): void;
    off<T extends keyof EventsMap>(eventName: T, listener: (arg: EventsMap[T]) => void): void;
    removeAllListeners<T extends keyof EventsMap>(event: T): void;
    emit<T extends keyof EventsMap>(eventName: T, arg: EventsMap[T]): boolean;
}
