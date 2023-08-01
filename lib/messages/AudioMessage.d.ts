/// <reference types="node" />
import { IAudioMessage, IChat, Media, MessageType } from "rompot-base";
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
