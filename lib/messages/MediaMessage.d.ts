/// <reference types="node" />
import { IMediaMessage } from "@interfaces/Messages";
import IChat from "@interfaces/IChat";
import Message from "@messages/Message";
import { Client } from "../types/Client";
export default class MediaMessage extends Message implements IMediaMessage {
    isGIF: boolean;
    file: any;
    constructor(chat: IChat | string, text: string, file: any, mention?: Message, id?: string);
    getStream(stream?: any): Promise<Buffer>;
    /**
     * * Injeta a interface no modulo
     * @param bot Client que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends IMediaMessage>(bot: Client, msg: MessageIn): MessageIn & MediaMessage;
}
