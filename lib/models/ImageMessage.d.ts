/// <reference types="node" />
import { Message } from "./Message";
import { Chat } from "./Chat";
export declare class ImageMessage extends Message {
    image: Buffer | string;
    constructor(chat: Chat, text: string, image: Buffer | string, mention?: Message, id?: string);
    /**
     * * Define a imagem da mensagem
     * @param image
     */
    setImage(image: Buffer | string): void;
    /**
     * * Obtem a imagem da mensagem
     * @returns
     */
    getImage(): string | Buffer;
}
