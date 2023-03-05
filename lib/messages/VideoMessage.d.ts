/// <reference types="node" />
import { IVideoMessage } from "@interfaces/Messages";
import IChat from "@interfaces/IChat";
import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";
import { Client } from "../types/Client";
export default class VideoMessage extends MediaMessage implements IVideoMessage {
    constructor(chat: IChat, text: string, video: Buffer, mention?: Message, id?: string);
    getVideo(): Promise<Buffer>;
    /**
     * * Injeta a interface no modulo
     * @param bot Client que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends IVideoMessage>(bot: Client, msg: MessageIn): MessageIn & VideoMessage;
}
