import { LocationMessage } from "../buttons/LocationMessage";
import { ContactMessage } from "../buttons/ContactMessage";
import { ButtonMessage } from "../buttons/ButtonMessage";
import { MediaMessage } from "../buttons/MediaMessage";
import { WhatsAppBot } from "../services/WhatsAppBot";
import { ListMessage } from "../buttons/ListMessage";
import { Message } from "../buttons/Message";
export declare class WhatsAppMessage {
    private _message;
    private _wa;
    chat: string;
    message: any;
    context: any;
    constructor(wa: WhatsAppBot, message: Message);
    /**
     * * Refatora a mensagem
     * @param message
     */
    refactory(message?: Message): Promise<void>;
    /**
     * * Refatora outras informações da mensagem
     * @param message
     * @returns
     */
    refactoryMessage(message: Message): Promise<any>;
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
