/// <reference types="node" />
/// <reference types="long" />
import Message from "./Message";
import Chat from "../modules/Chat";
import User from "../modules/User";
import { Media } from "../types/Message";
export default class MediaMessage extends Message {
    /** * Arquivo da mensagem */
    file: Media | Buffer | string;
    /** * O arquivo é um GIF */
    isGIF: boolean;
    constructor(chat: Chat | string, text: string, file: Media | Buffer | string, mention?: Message, id?: string, user?: User | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
    /**
     * @returns Obter arquivo
     */
    getStream(): Promise<Buffer>;
}
