/// <reference types="node" />
import { BotEventsMap, IBotEvents } from "rompot-base";
import { EventEmitter } from "events";
export default class BotEvents implements IBotEvents {
    ev: EventEmitter;
    on<T extends keyof BotEventsMap>(eventName: T, listener: (arg: BotEventsMap[T]) => void): void;
    off<T extends keyof BotEventsMap>(eventName: T, listener: (arg: BotEventsMap[T]) => void): void;
    removeAllListeners<T extends keyof BotEventsMap>(event: T): void;
    emit<T extends keyof BotEventsMap>(eventName: T, arg: BotEventsMap[T]): boolean;
}
