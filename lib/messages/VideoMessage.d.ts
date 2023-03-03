/// <reference types="node" />
import { IVideoMessage } from "@interfaces/IMessage";
import IChat from "@interfaces/IChat";
import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";
import { Bot } from "../types/Bot";
export default class VideoMessage extends MediaMessage implements IVideoMessage {
    constructor(chat: IChat, text: string, video: Buffer, mention?: Message, id?: string);
    getVideo(): Promise<Buffer>;
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends IVideoMessage>(bot: Bot, msg: MessageIn): MessageIn & VideoMessage;
}
