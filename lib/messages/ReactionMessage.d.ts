import { MessageType } from "../enums/Message";
import { IMessage, IReactionMessage } from "../interfaces/IMessage";
import { IChat } from "../interfaces/IChat";
import Message from "./Message";
export default class ReactionMessage extends Message implements IReactionMessage {
    readonly type = MessageType.Reaction;
    constructor(chat: IChat | string, reaction: string, receive: IMessage | string, others?: Partial<ReactionMessage>);
}
