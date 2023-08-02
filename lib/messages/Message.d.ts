import { IChat, IMessage, IUser, MessageType } from "rompot-base";
import ClientModule from "../modules/client/models/ClientModule";
export default class Message extends ClientModule implements IMessage {
    readonly type: MessageType;
    chat: IChat;
    user: IUser;
    mention?: IMessage;
    id: string;
    text: string;
    selected: string;
    fromMe: boolean;
    apiSend: boolean;
    isDeleted: boolean;
    isEdited: boolean;
    mentions: string[];
    timestamp: Number;
    constructor(chat: IChat | string, text: string, others?: Partial<Message>);
    addReaction(reaction: string): Promise<void>;
    removeReaction(): Promise<void>;
    addAnimatedReaction(reactions: string[], interval?: number, maxTimeout?: number): (reactionStop?: string) => Promise<void>;
    reply(message: Message | string, mention?: boolean): Promise<IMessage>;
    read(): Promise<void>;
}
