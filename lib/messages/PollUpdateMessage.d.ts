import { IChat, IPollUpdateMessage, MessageType, PollAction, PollOption } from "rompot-base";
import { PollMessage } from "./index";
export default class PollUpdateMessage extends PollMessage implements IPollUpdateMessage {
    readonly type = MessageType.PollUpdate;
    action: PollAction;
    constructor(chat: IChat | string, text: string, options?: PollOption[], others?: Partial<PollUpdateMessage>);
}
