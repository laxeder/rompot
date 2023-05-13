import { MiscMessageGenerationOptions } from "@whiskeysockets/baileys";
import { IMediaMessage, IMessage } from "../interfaces/IMessage";
import { StickerMessage, LocationMessage, ContactMessage, ButtonMessage, ListMessage, PollMessage, ReactionMessage } from "../messages/index";
import WhatsAppBot from "./WhatsAppBot";
export declare class WhatsAppMessage {
    private _message;
    private _wa;
    chat: string;
    message: any;
    options: MiscMessageGenerationOptions;
    isRelay: boolean;
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
    refactoryMediaMessage(message: IMediaMessage): Promise<void>;
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
