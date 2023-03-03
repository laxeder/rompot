/// <reference types="node" />
import { IAudioMessage } from "@interfaces/IMessage";
import IChat from "@interfaces/IChat";
import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";
import { Bot } from "../types/Bot";
export default class AudioMessage extends MediaMessage implements IAudioMessage {
    constructor(chat: IChat, audio: Buffer, mention?: Message, id?: string);
    getAudio(): Promise<Buffer>;
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends IAudioMessage>(bot: Bot, msg: MessageIn): MessageIn & AudioMessage;
}
