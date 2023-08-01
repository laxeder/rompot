/// <reference types="node" />
import { ClientEventsMap, IClientEvents } from "rompot-base";
import EventEmitter from "events";
export default class ClientEvents implements IClientEvents {
    ev: EventEmitter;
    on<T extends keyof ClientEventsMap>(eventName: T, listener: (arg: ClientEventsMap[T]) => void): void;
    off<T extends keyof ClientEventsMap>(eventName: T, listener: (arg: ClientEventsMap[T]) => void): void;
    removeAllListeners<T extends keyof ClientEventsMap>(event: T): void;
    emit<T extends keyof ClientEventsMap>(eventName: T, arg: ClientEventsMap[T]): boolean;
    constructor();
}
