/// <reference types="node" />
import type { Media } from "../types/Message";
import { MessageType } from "../enums/Message";
import { IMediaMessage } from "../interfaces/IMessage";
import { IChat } from "../interfaces/IChat";
import Message from "./Message";
export default class MediaMessage extends Message implements IMediaMessage {
    readonly type: MessageType;
    mimetype: string;
    file: Media | Buffer | string;
    isGIF: boolean;
    name: string;
    constructor(chat: IChat | string, text: string, file: Media | Buffer | string, others?: Partial<MediaMessage>);
    /**
     * @returns Obter arquivo
     */
    getStream(): Promise<Buffer>;
}
