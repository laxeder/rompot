/// <reference types="long" />
import { IImageMessage, IMessage } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";
import MediaMessage from "@messages/MediaMessage";
export default class ImageMessage extends MediaMessage implements IImageMessage {
    constructor(chat: IChat | string, text: string, file: any, mention?: IMessage, id?: string, user?: IUser | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
    getImage(): any;
}
