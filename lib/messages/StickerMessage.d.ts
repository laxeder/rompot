/// <reference types="node" />
import type { Media } from "../types/Message";
import { Categories } from "@laxeder/wa-sticker/dist";
import { MessageType } from "../enums/Message";
import { IStickerMessage } from "../interfaces/IMessage";
import { IChat } from "../interfaces/IChat";
import { MediaMessage } from "./index";
export default class StickerMessage extends MediaMessage implements IStickerMessage {
    readonly type = MessageType.Sticker;
    mimetype: string;
    categories: Categories[];
    stickerId: string;
    author: string;
    pack: string;
    constructor(chat: IChat | string, file: Media | Buffer | string, others?: Partial<StickerMessage>);
    /**
     * @returns Obter figurinha
     */
    getSticker(): Promise<Buffer>;
}
