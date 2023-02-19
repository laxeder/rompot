/// <reference types="node" />
import { AudioMessageInterface, ImageMessageInterface } from "../interfaces/MessagesInterfaces";
import ChatInterface from "../interfaces/ChatInterface";
import MediaMessage from "./MediaMessage";
import Message from "./Message";
import { BotModule } from "../types/Bot";
export default class AudioMessage extends MediaMessage implements ImageMessageInterface {
    constructor(chat: ChatInterface, text: string, audio: Buffer, mention?: Message, id?: string);
    getAudio(): Promise<Buffer>;
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends AudioMessageInterface>(bot: BotModule, msg: MessageIn): MessageIn & AudioMessage;
}
