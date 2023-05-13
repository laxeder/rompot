import { MessageType } from "../enums/Message";
import { IEmptyMessage } from "../interfaces/IMessage";
import Message from "./Message";
export default class EmptyMessage extends Message implements IEmptyMessage {
    readonly type = MessageType.Empty;
    constructor();
}
