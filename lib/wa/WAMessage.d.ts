import { MiscMessageGenerationOptions } from "@adiwajshing/baileys";
import ReactionMessage from "../messages/ReactionMessage";
import LocationMessage from "../messages/LocationMessage";
import ContactMessage from "../messages/ContactMessage";
import StickerMessage from "../messages/StickerMessage";
import ButtonMessage from "../messages/ButtonMessage";
import MediaMessage from "../messages/MediaMessage";
import ListMessage from "../messages/ListMessage";
import PollMessage from "../messages/PollMessage";
import Message from "../messages/Message";
import WhatsAppBot from "./WhatsAppBot";
export declare class WhatsAppMessage {
    private _message;
    private _wa;
    chat: string;
    message: any;
    options: MiscMessageGenerationOptions;
    isRelay: boolean;
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
    refatoryStickerMessage(message: StickerMessage): Promise<void>;
    refactoryLocationMessage(message: LocationMessage): void;
    refactoryContactMessage(message: ContactMessage): void;
    /**
     * * Refatora uma mensagem de reação
     * @param message
     */
    refactoryReactionMessage(message: ReactionMessage): void;
    /**
     * * Refatora uma mensagem de enquete
     * @param message
     */
    refactoryPollMessage(message: PollMessage): void;
    /**
     * * Refatora uma mensagem de botão
     * @param message
     */
    refactoryButtonMessage(message: ButtonMessage): void;
    /**
     * * Refatora uma mensagem de lista
     * @param message
     */
    refactoryListMessage(message: ListMessage): void;
}
