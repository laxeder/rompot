import { MessageUpsertType, proto, WAMessage, WAMessageContent } from "@whiskeysockets/baileys";
import { IMessage } from "rompot-base";
import WhatsAppBot from "./WhatsAppBot";
export declare class WhatsAppConvertMessage {
    private type?;
    private message;
    private convertedMessage;
    private user;
    private chat;
    private mention?;
    private wa;
    constructor(wa: WhatsAppBot, message: WAMessage, type?: MessageUpsertType);
    /**
     * * Define a mensagem a ser convertida
     * @param message
     * @param type
     */
    set(message?: WAMessage, type?: MessageUpsertType): void;
    /**
     * * Retorna a mensagem convertida
     */
    get(): Promise<IMessage>;
    /**
     * * Converte a mensagem
     * @param message
     * @param type
     */
    convertMessage(message: WAMessage, type?: MessageUpsertType): Promise<void>;
    /**
     * * Converte o conteudo da mensagem
     * @param messageContent
     * @returns
     */
    convertContentMessage(messageContent: WAMessageContent | undefined | null): Promise<void>;
    /**
     * * Converte o contexto da mensagem
     * @param context
     * @returns
     */
    convertContextMessage(context: proto.ContextInfo): Promise<void>;
    /**
     * * Converte mensagem de conversa
     * @param content
     */
    convertConversationMessage(content: proto.IMessage["conversation"]): void;
    /**
     * * Converte mensagem de texto
     * @param content
     */
    convertExtendedTextMessage(content: proto.IMessage["extendedTextMessage"]): void;
    /**
     * * Converte mensagem de protocolo
     * @param content
     */
    convertProtocolMessage(content: proto.IMessage["protocolMessage"]): Promise<void>;
    /**
     * * Converte mensagem de localização
     * @param content
     */
    convertLocationMessage(content: any): void;
    /**
     * * Converte mensagem com contatos
     * @param content
     */
    convertContactMessage(content: any): void;
    /**
     * * Converte mensagem de midia
     * @param content
     * @param contentType
     */
    convertMediaMessage(content: any, contentType: keyof proto.IMessage): Promise<void>;
    /**
     * * Converte uma mensagem de reação
     * @param content
     */
    convertReactionMessage(content: any): void;
    /**
     * * Converte uma mensagem editada
     * @param content
     */
    convertEditedMessage(content: any): Promise<void>;
    /**
     * * Converte uma mensagem de enquete
     * @param content
     */
    convertPollCreationMessage(content: proto.Message.PollCreationMessage): void;
    /**
     * * Converte uma mensagem de enquete atualizada
     * @param content
     */
    convertPollUpdateMessage(content: proto.Message.PollUpdateMessage): Promise<void>;
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
