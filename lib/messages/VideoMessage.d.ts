/// <reference types="long" />
/// <reference types="node" />
import MediaMessage from "./MediaMessage";
import Message from "./Message";
import Chat from "../modules/Chat";
import User from "../modules/User";
export default class VideoMessage extends MediaMessage {
    constructor(chat: Chat | string, text: string, file: any, mention?: Message, id?: string, user?: User | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
    /**
     * @returns Obter vídeo
     */
    getVideo(): Promise<Buffer>;
}
