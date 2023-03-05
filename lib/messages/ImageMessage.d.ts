/// <reference types="node" />
import { IImageMessage } from "@interfaces/Messages";
import IChat from "@interfaces/IChat";
import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";
import { Client } from "../types/Client";
export default class ImageMessage extends MediaMessage implements IImageMessage {
    constructor(chat: IChat, text: string, image: Buffer, mention?: Message, id?: string);
    getImage(): Promise<Buffer>;
    /**
     * * Injeta a interface no modulo
     * @param bot Client que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends IImageMessage>(bot: Client, msg: MessageIn): MessageIn & ImageMessage;
}
