/// <reference types="long" />
import { IAudioMessage, IMessage } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";
import MediaMessage from "@messages/MediaMessage";
export default class AudioMessage extends MediaMessage implements IAudioMessage {
    constructor(chat: IChat | string, file: any, mention?: IMessage, id?: string, user?: IUser | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
    getAudio(): any;
}
