import { MessageType } from "../enums/Message";
import { IChat } from "../interfaces/IChat";
import { ILocationMessage } from "../interfaces/IMessage";
import Message from "./Message";
export default class LocationMessage extends Message implements ILocationMessage {
    readonly type = MessageType.Location;
    latitude: number;
    longitude: number;
    constructor(chat: IChat | string, latitude: number, longitude: number, others?: Partial<LocationMessage>);
    /**
     * * Definir localização
     * @param latitude Latitude
     * @param longitude Longitude
     */
    setLocation(latitude: number, longitude: number): void;
}
