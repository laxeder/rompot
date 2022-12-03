import { Message } from "./Message";
import { Chat } from "../models/Chat";
export declare class LocationMessage extends Message {
    latitude: number;
    longitude: number;
    constructor(chat: Chat, latitude: number, longitude: number, mention?: Message, id?: string);
    /**
     * * Define a latitude e longitude da localização
     * @param latitude
     * @param longitude
     */
    setLocation(latitude: number, longitude: number): void;
    /**
     * * Define a latitude
     * @param longitude
     */
    setLongitude(longitude: number): void;
    /**
     * * Define a longitude
     * @param latitude
     */
    setLatitude(latitude: number): void;
    /**
     * * Retorna a longitude
     * @returns
     */
    getLongitude(): number;
    /**
     * * retorna a latitude
     * @returns
     */
    getLatitude(): number;
}
