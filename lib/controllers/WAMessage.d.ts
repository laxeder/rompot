import { ButtonMessage } from "../models/ButtonMessage";
import { WhatsAppBot } from "../services/WhatsAppBot";
import { ImageMessage } from "../models/ImageMessage";
import { ListMessage } from "../models/ListMessage";
import { Message } from "../models/Message";
export declare class WhatsAppMessage {
    private _message;
    private _wa;
    chat: string;
    message: any;
    context: any;
    relay: boolean;
    constructor(wa: WhatsAppBot, message: Message | ButtonMessage);
    /**
     * * Refatora a mensagem
     * @param message
     */
    refactory(message: Message | undefined, wa: WhatsAppBot): Promise<void>;
    refactoryMessage(message: Message): Promise<any>;
    /**
     * * Refatora uma mensagem com imagem
     * @param message
     * @param wa
     */
    refactoryImageMessage(message: ImageMessage, wa: WhatsAppBot): Promise<void>;
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
