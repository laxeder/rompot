/// <reference types="node" />
/// <reference types="long" />
import { IMediaMessage, IMessage } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";
import Message from "@messages/Message";
export default class MediaMessage extends Message implements IMediaMessage {
    file: any | Buffer;
    isGIF: boolean;
    constructor(chat: IChat | string, text: string, file: any, mention?: IMessage, id?: string, user?: IUser | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
    getStream(stream?: any): any;
}
