/// <reference types="node" />
import type { Media } from "../types/Message";
import { MessageType } from "../enums/Message";
import { IVideoMessage } from "../interfaces/IMessage";
import { IChat } from "../interfaces/IChat";
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
