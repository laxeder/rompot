/// <reference types="node" />
import { VideoMessageInterface } from "../interfaces/MessagesInterfaces";
import ChatInterface from "../interfaces/ChatInterface";
import MediaMessage from "./MediaMessage";
import Message from "./Message";
import { BotModule } from "../types/Bot";
export default class VideoMessage extends MediaMessage implements VideoMessageInterface {
    constructor(chat: ChatInterface, text: string, video: Buffer, mention?: Message, id?: string);
    getVideo(): Promise<Buffer>;
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends VideoMessageInterface>(bot: BotModule, msg: MessageIn): MessageIn & VideoMessage;
}
