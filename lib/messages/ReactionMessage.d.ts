import { IChat, IMessage, IReactionMessage, MessageType } from "rompot-base";
import Message from "./Message";
export default class ReactionMessage extends Message implements IReactionMessage {
    readonly type = MessageType.Reaction;
    constructor(chat: IChat | string, reaction: string, receive: IMessage | string, others?: Partial<ReactionMessage>);
}
