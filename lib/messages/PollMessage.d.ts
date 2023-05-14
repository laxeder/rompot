import type { PollAction, PollOption } from "../types/Message";
import { MessageType } from "../enums/Message";
import { IPollMessage } from "../interfaces/IMessage";
import { IChat } from "../interfaces/IChat";
import Message from "./Message";
export default class PollMessage extends Message implements IPollMessage {
    readonly type: MessageType.Poll | MessageType.PollUpdate;
    votes: {
        [user: string]: string[];
    };
    secretKey: Uint8Array;
    options: PollOption[];
    action: PollAction;
    constructor(chat: IChat | string, text: string, options?: PollOption[], others?: Partial<PollMessage>);
    addOption(name: string, id?: string): void;
    removeOption(option: PollOption): void;
    getUserVotes(user: string): string[];
    setUserVotes(user: string, hashVotes: string[]): void;
    /** * Transforma um objeto em PollMessage */
    static fromJSON(message: any): PollMessage;
}
