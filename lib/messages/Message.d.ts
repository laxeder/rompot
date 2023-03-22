/// <reference types="long" />
import { ClientType } from "../modules/Client";
import User from "../modules/User";
import Chat from "../modules/Chat";
export default class Message {
    #private;
    /** * Sala de bate-papo que foi enviada a mensagem */
    chat: Chat;
    /** * Usuário que mandou a mensagem */
    user: User;
    /** * Texto da mensagem */
    text: string;
    /** * Mensagem mencionada na mensagem */
    mention?: Message | undefined;
    /** * ID da mensagem */
    id: string;
    /** * Mensagem enviada pelo bot */
    fromMe: boolean;
    /** * Opção selecionada */
    selected: string;
    /** * Mensagem mencionada na mensagem */
    mentions: string[];
    /** * Tempo em que a mensagem foi enviada */
    timestamp: Number | Long;
    get client(): ClientType;
    set client(client: ClientType);
    constructor(chat: Chat | string, text: string, mention?: Message, id?: string, user?: User | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
    /**
     * * Adiciona uma reação a mensagem
     * @param reaction Reação
     */
    addReaction(reaction: string): Promise<void>;
    /**
     * * Adiciona animações na reação da mensagem
     * @param reactions Reações em sequência
     * @param interval Intervalo entre cada reação
     * @param maxTimeout Maximo de tempo reagindo
     */
    addAnimatedReaction(reactions: string[], interval?: number, maxTimeout?: number): (reactionStop?: string) => Promise<void>;
    /**
     * * Envia uma mensagem mencionando a mensagem atual
     * @param message Mensagem que terá enviada
     * @param mention Se verdadeiro a mensagem é mencionada
     */
    reply(message: Message | string, mention?: boolean): Promise<Message>;
    /**
     * * Marca mensagem como visualizada
     */
    read(): Promise<void>;
    /**
     * @param message Mensagem que será obtida
     * @returns Retorna a mensagem
     */
    static get<MSG extends Message>(message: MSG | string): MSG | Message;
    /**
     * @param message Mensagem
     * @returns Retorna o ID da mensagem
     */
    static getId(message: Message | string): string;
    /**
     * * Cria uma mensagem com cliente instanciado
     * @param client Cliente
     * @param msg Mensagem
     * @returns
     */
    static Client<MSG extends Message>(client: ClientType, message: MSG): MSG;
}
