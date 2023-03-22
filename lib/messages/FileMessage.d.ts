/// <reference types="node" />
/// <reference types="long" />
import MediaMessage from "./MediaMessage";
import Message from "./Message";
import Chat from "../modules/Chat";
import User from "../modules/User";
import { Media } from "../types/Message";
export default class FileMessage extends MediaMessage {
    constructor(chat: Chat | string, text: string, file: Media | Buffer | string, mention?: Message, id?: string, user?: User | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
    /**
     * @returns Obter arquivo
     */
    getFile(): Promise<Buffer>;
}
