/// <reference types="long" />
import { IMessage, IMessageModule } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";
import { ClientType } from "@modules/Client";
import User from "@modules/User";
import Chat from "@modules/Chat";
export default class Message implements IMessage, IMessageModule {
    chat: Chat;
    text: string;
    mention?: Message | undefined;
    id: string;
    user: User;
    fromMe: boolean;
    selected: string;
    mentions: string[];
    timestamp: Number | Long;
    client: ClientType;
    constructor(chat: IChat | string, text: string, mention?: IMessage, id?: string, user?: IUser | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
    addReaction(reaction: string): Promise<void>;
    reply(message: IMessage | string, mention?: boolean): Promise<Message>;
    read(): Promise<void>;
}
