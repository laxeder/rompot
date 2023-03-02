/// <reference types="node" />
import { ImageMessageInterface } from "../interfaces/MessagesInterfaces";
import ChatInterface from "../interfaces/ChatInterface";
import MediaMessage from "./MediaMessage";
import Message from "./Message";
import { Bot } from "../types/Bot";
export default class ImageMessage extends MediaMessage implements ImageMessageInterface {
    constructor(chat: ChatInterface, text: string, image: Buffer, mention?: Message, id?: string);
    getImage(): Promise<Buffer>;
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends ImageMessageInterface>(bot: Bot, msg: MessageIn): MessageIn & ImageMessage;
}
