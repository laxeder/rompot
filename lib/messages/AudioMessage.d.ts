/// <reference types="long" />
/// <reference types="node" />
import MediaMessage from "./MediaMessage";
import Message from "./Message";
import Chat from "../modules/Chat";
import User from "../modules/User";
export default class AudioMessage extends MediaMessage {
    constructor(chat: Chat | string, file: any, mention?: Message, id?: string, user?: User | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
    /**
     * @returns Obter audio
     */
    getAudio(): Promise<Buffer>;
}
