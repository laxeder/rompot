import type { PollAction, PollOption } from "../types/Message";
import { MessageType } from "../enums/Message";
import { IPollUpdateMessage } from "../interfaces/IMessage";
import { IChat } from "../interfaces/IChat";
import { PollMessage } from "./index";
export default class PollUpdateMessage extends PollMessage implements IPollUpdateMessage {
    readonly type = MessageType.PollUpdate;
    action: PollAction;
    constructor(chat: IChat | string, text: string, options?: PollOption[], others?: Partial<PollUpdateMessage>);
}
