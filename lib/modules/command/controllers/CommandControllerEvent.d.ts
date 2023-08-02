/// <reference types="node" />
import { CommandControllerEventsMap, ICommandControllerEvent } from "rompot-base";
import EventEmitter from "events";
import ClientModule from "../../client/models/ClientModule";
export default class CommandControllerEvent extends ClientModule implements ICommandControllerEvent {
    ev: EventEmitter;
    on<T extends keyof CommandControllerEventsMap>(eventName: T, listener: (arg: CommandControllerEventsMap[T]) => void): void;
    off<T extends keyof CommandControllerEventsMap>(eventName: T, listener: (arg: CommandControllerEventsMap[T]) => void): void;
    removeAllListeners<T extends keyof CommandControllerEventsMap>(event: T): void;
    emit<T extends keyof CommandControllerEventsMap>(eventName: T, arg: CommandControllerEventsMap[T]): boolean;
}
