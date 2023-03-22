/// <reference types="node" />
/// <reference types="long" />
import MediaMessage from "./MediaMessage";
import Message from "./Message";
import Chat from "../modules/Chat";
import User from "../modules/User";
import { Categories } from "wa-sticker-formatter/dist";
import { Media } from "../types/Message";
export default class StickerMessage extends MediaMessage {
    /** * Criador da figurinha */
    author: string;
    /** * Pacote da figurinha */
    pack: string;
    /** * Categoria da figurinha */
    categories: Categories[];
    constructor(chat: Chat | string, file: Media | Buffer | string, mention?: Message, id?: string, user?: User | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
    /**
     * @returns Obter figurinha
     */
    getSticker(): Promise<Buffer>;
}
