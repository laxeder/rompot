/// <reference types="node" />
import { IMediaMessage } from "@interfaces/IMessage";
import IChat from "@interfaces/IChat";
import Message from "@messages/Message";
import { Bot } from "../types/Bot";
export default class MediaMessage extends Message implements IMediaMessage {
    isGIF: boolean;
    file: any;
    constructor(chat: IChat | string, text: string, file: any, mention?: Message, id?: string);
    getStream(stream?: any): Promise<Buffer>;
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends IMediaMessage>(bot: Bot, msg: MessageIn): MessageIn & MediaMessage;
}
