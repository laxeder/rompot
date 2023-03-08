import { MiscMessageGenerationOptions } from "@adiwajshing/baileys";
import LocationMessage from "../messages/LocationMessage";
import ContactMessage from "../messages/ContactMessage";
import ButtonMessage from "../messages/ButtonMessage";
import MediaMessage from "../messages/MediaMessage";
import ListMessage from "../messages/ListMessage";
import WhatsAppBot from "./WhatsAppBot";
import { IMessage } from "../interfaces/Messages";
export declare class WhatsAppMessage {
    private _message;
    private _wa;
    chat: string;
    message: any;
    options: MiscMessageGenerationOptions;
    constructor(wa: WhatsAppBot, message: IMessage);
    /**
     * * Refatora a mensagem
     * @param message
     */
    refactory(message?: IMessage): Promise<void>;
    /**
     * * Refatora outras informações da mensagem
     * @param message
     * @returns
     */
    refactoryMessage(message: IMessage): Promise<any>;
    /**
     * * Refatora uma mensagem de midia
     * @param message
     */
    refactoryMediaMessage(message: MediaMessage): Promise<void>;
    refactoryLocationMessage(message: LocationMessage): void;
    refactoryContactMessage(message: ContactMessage): void;
    /**
     * * Refatora uma mensagem de botão
     * @param message
     */
    refactoryButtonMessage(message: ButtonMessage): Promise<void>;
    /**
     * * Refatora uma mensagem de lista
     * @param message
     */
    refactoryListMessage(message: ListMessage): void;
}
