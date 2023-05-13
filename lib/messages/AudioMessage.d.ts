/// <reference types="node" />
import type { Media } from "../types/Message";
import { MessageType } from "../enums/Message";
import { IAudioMessage } from "../interfaces/IMessage";
import { IChat } from "../interfaces/IChat";
import MediaMessage from "./MediaMessage";
export default class AudioMessage extends MediaMessage implements IAudioMessage {
    readonly type = MessageType.Audio;
    mimetype: string;
    constructor(chat: IChat | string, file: Media | Buffer | string, others?: Partial<AudioMessage>);
    /**
     * @returns Obter audio
     */
    getAudio(): Promise<Buffer>;
}
