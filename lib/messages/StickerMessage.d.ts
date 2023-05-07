/// <reference types="node" />
/// <reference types="long" />
import { Categories } from "@laxeder/wa-sticker/dist";
import MediaMessage from "./MediaMessage";
import Message from "./Message";
import Chat from "../modules/Chat";
import User from "../modules/User";
import { Media } from "../types/Message";
export default class StickerMessage extends MediaMessage {
    /** * Criador da figurinha */
    author: string;
    /** * Pacote da figurinha */
    pack: string;
    /** * Categoria da figurinha */
    categories: Categories[];
    /** * ID da figurinha */
    stickerId: string;
    mimetype: string;
    constructor(chat: Chat | string, file: Media | Buffer | string, mention?: Message, id?: string, user?: User | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
    /**
     * @returns Obter figurinha
     */
    getSticker(): Promise<Buffer>;
}
