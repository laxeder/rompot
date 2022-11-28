import { MediaMessage } from "./MediaMessage";
import { Message } from "./Message";
import { Chat } from "../models/Chat";
export declare class AudioMessage extends MediaMessage {
    constructor(chat: Chat, text: string, audio: any, mention?: Message, id?: string);
}
