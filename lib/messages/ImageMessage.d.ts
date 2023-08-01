/// <reference types="node" />
import { IChat, IImageMessage, Media, MessageType } from "rompot-base";
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
