import { Message } from "./Message";
import { Chat } from "../models/Chat";
export declare class ReactionMessage extends Message {
    constructor(chat: Chat, text: string, idMessage: Message | string);
}
