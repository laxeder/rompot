/// <reference types="node" />
import { MediaMessageInterface } from "../interfaces/MessagesInterfaces";
import ChatInterface from "../interfaces/ChatInterface";
import Message from "./Message";
import { BotModule } from "../types/Bot";
export default class MediaMessage extends Message implements MediaMessageInterface {
    isGIF: boolean;
    file: any;
    constructor(chat: ChatInterface | string, text: string, file: any, mention?: Message, id?: string);
    getStream(stream?: any): Promise<Buffer>;
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends MediaMessageInterface>(bot: BotModule, msg: MessageIn): MessageIn & MediaMessage;
}
