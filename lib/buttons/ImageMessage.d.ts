import { MediaMessage } from "./MediaMessage";
import { Message } from "./Message";
import { Chat } from "../models/Chat";
export declare class ImageMessage extends MediaMessage {
    constructor(chat: Chat, text: string, image: any, mention?: Message, id?: string);
}
