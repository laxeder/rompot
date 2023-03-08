/// <reference types="long" />
import { ILocationMessage, IMessage } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";
import Message from "@messages/Message";
export default class LocationMessage extends Message implements ILocationMessage {
    latitude: number;
    longitude: number;
    constructor(chat: IChat | string, latitude: number, longitude: number, mention?: IMessage, id?: string, user?: IUser | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
    setLocation(latitude: number, longitude: number): void;
}
