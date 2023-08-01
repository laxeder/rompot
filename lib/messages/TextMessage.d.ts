import { IChat, ITextMessage, MessageType } from "rompot-base";
import Message from "./Message";
export default class TextMessage extends Message implements ITextMessage {
    readonly type: MessageType.Text;
    constructor(chat: IChat | string, text: string, others?: Partial<ITextMessage>);
}
