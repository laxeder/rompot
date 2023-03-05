/// <reference types="node" />
import { IAudioMessage } from "@interfaces/Messages";
import IChat from "@interfaces/IChat";
import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";
import { Client } from "../types/Client";
export default class AudioMessage extends MediaMessage implements IAudioMessage {
    constructor(chat: IChat, audio: Buffer, mention?: Message, id?: string);
    getAudio(): Promise<Buffer>;
    /**
     * * Injeta a interface no modulo
     * @param bot Client que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends IAudioMessage>(bot: Client, msg: MessageIn): MessageIn & AudioMessage;
}
