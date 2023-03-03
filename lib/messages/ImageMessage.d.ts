/// <reference types="node" />
import { IImageMessage } from "@interfaces/IMessage";
import IChat from "@interfaces/IChat";
import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";
import { Bot } from "../types/Bot";
export default class ImageMessage extends MediaMessage implements IImageMessage {
    constructor(chat: IChat, text: string, image: Buffer, mention?: Message, id?: string);
    getImage(): Promise<Buffer>;
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends IImageMessage>(bot: Bot, msg: MessageIn): MessageIn & ImageMessage;
}
