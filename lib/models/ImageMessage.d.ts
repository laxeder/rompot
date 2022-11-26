/// <reference types="node" />
import { Message } from "./Message";
import { Chat } from "./Chat";
export declare class ImageMessage extends Message {
    image: Buffer | string;
    constructor(chat: Chat, text: string, image: Buffer | string, mention?: Message, id?: string);
    setImage(image: Buffer | string): void;
    getImage(): string | Buffer;
}
