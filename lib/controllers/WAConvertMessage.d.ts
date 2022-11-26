import { MessageUpsertType, proto, WAMessage, WAMessageContent } from "@adiwajshing/baileys";
import { Message } from "../models/Message";
export declare class WhatsAppConvertMessage {
    private _type?;
    private _message;
    private _convertedMessage;
    private _user;
    private _chat;
    private _mention?;
    constructor(message: WAMessage, type?: MessageUpsertType);
    /**
     * * Define a mensagem a ser convertida
     * @param message
     * @param type
     */
    set(message?: WAMessage, type?: MessageUpsertType): void;
    /**
     * * Retorna a mensagem convertida
     */
    get(): Message;
    /**
     * * Converte a mensagem
     * @param message
     * @param type
     */
    convertMessage(message: WAMessage, type?: MessageUpsertType): void;
    /**
     * * Converte o conteudo da mensagem
     * @param messageContent
     * @returns
     */
    convertContentMessage(messageContent: WAMessageContent | undefined | null): void;
    /**
     * * Converte o contexto da mensagem
     * @param context
     * @returns
     */
    convertContextMessage(context: proto.ContextInfo): void;
    /**
     * * Converte uma mensagem de botão
     * @param content
     * @returns
     */
    convertButtonMessage(content: WAMessageContent): void;
    /**
     * * Converte uma mensagem de lista
     * @param content
     * @returns
     */
    convertListMessage(content: WAMessageContent): void;
}
