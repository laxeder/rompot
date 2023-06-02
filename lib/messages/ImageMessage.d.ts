/// <reference types="node" />
import type { Media } from "../types/Message";
import { MessageType } from "../enums/Message";
import { IImageMessage } from "../interfaces/IMessage";
import { IChat } from "../interfaces/IChat";
import MediaMessage from "./MediaMessage";
export default class ImageMessage extends MediaMessage implements IImageMessage {
    readonly type = MessageType.Image;
    mimetype: string;
    constructor(chat: IChat | string, text: string, file: Media | Buffer | string, others?: Partial<ImageMessage>);
    /**
     * @returns Obter imagem
     */
    getImage(): Promise<Buffer>;
}
