/// <reference types="node" />
import { IChat, IVideoMessage, Media, MessageType } from "rompot-base";
import { MediaMessage } from "./index";
export default class VideoMessage extends MediaMessage implements IVideoMessage {
    readonly type = MessageType.Video;
    mimetype: string;
    constructor(chat: IChat | string, text: string, file: Media | Buffer | string, others?: Partial<VideoMessage>);
    /**
     * @returns Obter vídeo
     */
    getVideo(): Promise<Buffer>;
}
