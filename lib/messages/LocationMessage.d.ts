/// <reference types="long" />
import Message from "./Message";
import Chat from "../modules/Chat";
import User from "../modules/User";
export default class LocationMessage extends Message {
    /** * Latitude */
    latitude: number;
    /** * Longitude */
    longitude: number;
    constructor(chat: Chat | string, latitude: number, longitude: number, mention?: Message, id?: string, user?: User | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
    /**
     * * Definir localização
     * @param latitude Latitude
     * @param longitude Longitude
     */
    setLocation(latitude: number, longitude: number): void;
}
