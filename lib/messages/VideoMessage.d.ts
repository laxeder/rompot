import { MediaMessage } from "./MediaMessage";
import { Message } from "./Message";
import { Chat } from "../models/Chat";
export declare class VideoMessage extends MediaMessage {
    constructor(chat: Chat, text: string, video: any, mention?: Message, id?: string);
}
