/// <reference types="node" />
import EventEmitter from "events";
import { ICommand, ICommandPermission } from "../interfaces/command";
import { IMessage } from "../interfaces/IMessage";
export declare type CommandControllerEventsMap = {
    /**
     * * Permissão negada
     * @param message Mensagem que chamou o comando
     * @param command Comando que negou a permissão
     * @param permission Permissão que foi negada
     */
    ["no-allowed"]: {
        message: IMessage;
        command: ICommand;
        permission: ICommandPermission;
    };
};
export declare class CommandControllerEvent {
    events: EventEmitter;
    on<T extends keyof CommandControllerEventsMap>(eventName: T, listener: (arg: CommandControllerEventsMap[T]) => void): void;
    off<T extends keyof CommandControllerEventsMap>(eventName: T, listener: (arg: CommandControllerEventsMap[T]) => void): void;
    removeAllListeners<T extends keyof CommandControllerEventsMap>(event: T): void;
    emit<T extends keyof CommandControllerEventsMap>(eventName: T, arg: CommandControllerEventsMap[T]): boolean;
}
