import { MiscMessageGenerationOptions } from "@whiskeysockets/baileys";
import { IButtonMessage, IContactMessage, IListMessage, ILocationMessage, IMediaMessage, IMessage, IPollMessage, IReactionMessage, IStickerMessage } from "rompot-base";
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
    refatoryStickerMessage(message: IStickerMessage): Promise<void>;
    refactoryLocationMessage(message: ILocationMessage): void;
    refactoryContactMessage(message: IContactMessage): void;
    /**
     * * Refatora uma mensagem de reação
     * @param message
     */
    refactoryReactionMessage(message: IReactionMessage): void;
    /**
     * * Refatora uma mensagem de enquete
     * @param message
     */
    refactoryPollMessage(message: IPollMessage): void;
    /**
     * * Refatora uma mensagem de botão
     * @param message
     */
    refactoryButtonMessage(message: IButtonMessage): void;
    /**
     * * Refatora uma mensagem de lista
     * @param message
     */
    refactoryListMessage(message: IListMessage): void;
}
