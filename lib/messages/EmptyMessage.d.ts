import { IEmptyMessage, MessageType } from "rompot-base";
import Message from "./Message";
export default class EmptyMessage extends Message implements IEmptyMessage {
    readonly type = MessageType.Empty;
    constructor();
}
