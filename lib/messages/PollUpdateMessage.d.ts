/// <reference types="long" />
import Message from "./Message";
import PollMessage from "./PollMessage";
import User from "../modules/User";
import Chat from "../modules/Chat";
import { PollOption } from "../types/Message";
export default class PollUpdateMessage extends PollMessage {
    /** * ação */
    action?: "add" | "remove" | "create";
    constructor(chat: Chat | string, text: string, options?: PollOption[], mention?: Message, id?: string, user?: User | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
}
